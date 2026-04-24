import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchCoupons, fetchMyCoupons, claimCoupon, markCouponUsed,
  fetchUserPoints, fetchPointsLogs, insertPointsLog,
  fetchCheckins, insertCheckin,
} from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

// ============================================================================
// useRewardsStore — 优惠券 / 积分 / 签到 统一 store
//   - 本地优先（降级模式）+ Supabase 双向同步
//   - 持久化：券包、积分余额、签到历史、流水缓存
// ============================================================================

// 读取当前登录用户 ID（与 useAuthStore persist key 一致）
function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('myspace-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id || null;
  } catch { return null; }
}

const todayStr = () => new Date().toISOString().slice(0, 10);

// 默认演示券（未配置 Supabase 时使用）
const DEFAULT_COUPONS = [
  {
    id: 'mock-newuser10',
    code: 'NEWUSER10',
    title: '新人专享 10 元券',
    description: '全场满 50 元可用',
    type: 'fixed', value: 10, min_amount: 50, points_cost: 0,
    total_quantity: 10000, claimed_count: 0, per_user_limit: 1,
    is_active: true, end_at: new Date(Date.now() + 86400000 * 30).toISOString(),
  },
  {
    id: 'mock-save15pct',
    code: 'SAVE15PCT',
    title: '满 200 享 85 折',
    description: '最高抵扣 50 元',
    type: 'percent', value: 15, min_amount: 200, max_discount: 50, points_cost: 0,
    total_quantity: 3000, claimed_count: 0, per_user_limit: 1,
    is_active: true, end_at: new Date(Date.now() + 86400000 * 15).toISOString(),
  },
  {
    id: 'mock-freeship',
    code: 'FREESHIP',
    title: '全场免邮券',
    description: '无门槛免邮',
    type: 'shipping', value: 0, min_amount: 0, points_cost: 0,
    total_quantity: 20000, claimed_count: 0, per_user_limit: 3,
    is_active: true, end_at: new Date(Date.now() + 86400000 * 60).toISOString(),
  },
  {
    id: 'mock-pts100_15',
    code: 'PTS100_15',
    title: '100 积分兑 15 元券',
    description: '消耗 100 积分',
    type: 'fixed', value: 15, min_amount: 80, points_cost: 100,
    total_quantity: 2000, claimed_count: 0, per_user_limit: 10,
    is_active: true, end_at: new Date(Date.now() + 86400000 * 120).toISOString(),
  },
];

const useRewardsStore = create(persist((set, get) => ({
  // ---------------- 优惠券 ----------------
  availableCoupons: [],    // 可领取的优惠券模板
  myCoupons: [],           // 我的优惠券（含嵌套 coupon）
  couponsLoading: false,

  // ---------------- 积分 ----------------
  points: 0,              // 当前积分余额
  totalEarned: 0,
  totalSpent: 0,
  pointsLogs: [],

  // ---------------- 签到 ----------------
  checkins: [],            // 签到记录 [{ checkin_date, streak, points }]
  currentStreak: 0,

  syncing: false,
  lastSyncedAt: null,

  // =====================================================================
  // 同步：登录后拉取全部数据
  // =====================================================================
  syncAll: async () => {
    const userId = getCurrentUserId();
    if (!userId || !isSupabaseConfigured) {
      // 降级模式：仅加载默认券
      set({ availableCoupons: DEFAULT_COUPONS });
      return;
    }
    set({ syncing: true });
    try {
      const [coupons, myC, pts, logs, chk] = await Promise.all([
        fetchCoupons(),
        fetchMyCoupons(userId),
        fetchUserPoints(userId),
        fetchPointsLogs(userId, 50),
        fetchCheckins(userId, 45),
      ]);
      const currentStreak = chk[0] && chk[0].checkin_date === todayStr() ? chk[0].streak : 0;
      set({
        availableCoupons: coupons.length ? coupons : DEFAULT_COUPONS,
        myCoupons: myC,
        points: pts?.balance || 0,
        totalEarned: pts?.total_earned || 0,
        totalSpent: pts?.total_spent || 0,
        pointsLogs: logs,
        checkins: chk,
        currentStreak,
        syncing: false,
        lastSyncedAt: Date.now(),
      });
    } catch (e) {
      console.error('[rewards] syncAll failed', e);
      set({ syncing: false });
    }
  },

  // 清除远端数据（退出登录时）
  resetRemoteLocal: () => set({
    myCoupons: [], points: 0, totalEarned: 0, totalSpent: 0,
    pointsLogs: [], checkins: [], currentStreak: 0,
  }),

  // =====================================================================
  // 优惠券操作
  // =====================================================================

  // 领取优惠券
  claimCoupon: async (coupon) => {
    const userId = getCurrentUserId();
    const state = get();

    // 积分兑换券：扣除积分
    if (coupon.points_cost > 0) {
      if (state.points < coupon.points_cost) {
        return { error: { message: '积分不足' } };
      }
    }

    // 每用户上限校验
    const alreadyClaimed = state.myCoupons.filter((mc) => (mc.coupon_id || mc.coupon?.id) === coupon.id).length;
    if (alreadyClaimed >= (coupon.per_user_limit || 1)) {
      return { error: { message: '已达领取上限' } };
    }

    // 本地模拟
    if (!isSupabaseConfigured || !userId) {
      const uc = {
        id: `local-${Date.now()}`,
        user_id: userId,
        coupon_id: coupon.id,
        coupon,
        status: 'unused',
        claimed_at: new Date().toISOString(),
      };
      const next = {
        myCoupons: [uc, ...state.myCoupons],
        points: coupon.points_cost > 0 ? state.points - coupon.points_cost : state.points,
      };
      if (coupon.points_cost > 0) {
        const log = {
          id: `local-log-${Date.now()}`,
          delta: -coupon.points_cost,
          reason: 'coupon_exchange',
          description: `兑换优惠券：${coupon.title}`,
          created_at: new Date().toISOString(),
        };
        next.pointsLogs = [log, ...state.pointsLogs];
        next.totalSpent = state.totalSpent + coupon.points_cost;
      }
      set(next);
      return { data: uc };
    }

    // 远端
    if (coupon.points_cost > 0) {
      // 先扣积分流水
      const { error: pErr } = await insertPointsLog(
        userId, -coupon.points_cost, 'coupon_exchange',
        `兑换优惠券：${coupon.title}`, coupon.id,
      );
      if (pErr) return { error: pErr };
      // 乐观更新积分
      set({ points: state.points - coupon.points_cost, totalSpent: state.totalSpent + coupon.points_cost });
    }
    const { data, error } = await claimCoupon(userId, coupon.id);
    if (error) return { error };
    set({ myCoupons: [data, ...get().myCoupons] });
    return { data };
  },

  // 使用优惠券（下单时调用）
  useCoupon: async (userCouponId, orderId) => {
    const state = get();
    set({
      myCoupons: state.myCoupons.map((mc) =>
        mc.id === userCouponId ? { ...mc, status: 'used', order_id: orderId, used_at: new Date().toISOString() } : mc,
      ),
    });
    if (isSupabaseConfigured) {
      markCouponUsed(userCouponId, orderId).catch((e) => console.error('[rewards] useCoupon', e));
    }
  },

  // 计算某张券的折扣金额
  calcDiscount: (coupon, subtotal) => {
    if (!coupon || subtotal < (coupon.min_amount || 0)) return 0;
    if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal);
    if (coupon.type === 'percent') {
      const raw = subtotal * (coupon.value / 100);
      return coupon.max_discount ? Math.min(raw, coupon.max_discount) : raw;
    }
    return 0; // shipping 另行处理
  },

  // =====================================================================
  // 积分操作
  // =====================================================================

  // 本地扣积分（用于积分抵扣现金）
  spendPoints: async (delta, reason, description, refId) => {
    const userId = getCurrentUserId();
    const state = get();
    if (state.points < delta) return { error: { message: '积分不足' } };

    // 本地乐观更新
    const log = {
      id: `local-log-${Date.now()}`,
      delta: -delta,
      reason, description, ref_id: refId,
      created_at: new Date().toISOString(),
    };
    set({
      points: state.points - delta,
      totalSpent: state.totalSpent + delta,
      pointsLogs: [log, ...state.pointsLogs],
    });

    if (isSupabaseConfigured && userId) {
      insertPointsLog(userId, -delta, reason, description, refId).catch(() => {});
    }
    return { ok: true };
  },

  // 奖励积分（本地）
  addPoints: async (delta, reason, description, refId) => {
    const userId = getCurrentUserId();
    const state = get();
    const log = {
      id: `local-log-${Date.now()}`,
      delta,
      reason, description, ref_id: refId,
      created_at: new Date().toISOString(),
    };
    set({
      points: state.points + delta,
      totalEarned: state.totalEarned + delta,
      pointsLogs: [log, ...state.pointsLogs],
    });
    if (isSupabaseConfigured && userId) {
      insertPointsLog(userId, delta, reason, description, refId).catch(() => {});
    }
  },

  // =====================================================================
  // 签到操作
  // =====================================================================

  // 判断今日是否已签到
  hasCheckedInToday: () => {
    const state = get();
    return state.checkins.some((c) => c.checkin_date === todayStr());
  },

  // 签到（返回 { ok, streak, points }）
  doCheckin: async () => {
    const state = get();
    const today = todayStr();
    if (state.checkins.some((c) => c.checkin_date === today)) {
      return { error: { message: '今日已签到' } };
    }

    // 计算连签
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const prev = state.checkins.find((c) => c.checkin_date === yesterday);
    const streak = prev ? prev.streak + 1 : 1;
    // 阶梯奖励：每 7 天额外 +10
    const basePoints = 5;
    const bonus = streak % 7 === 0 ? 10 : 0;
    const points = basePoints + bonus;

    const record = {
      id: `local-chk-${today}`,
      checkin_date: today,
      streak, points,
      created_at: new Date().toISOString(),
    };

    // 本地乐观更新
    set({
      checkins: [record, ...state.checkins],
      currentStreak: streak,
      points: state.points + points,
      totalEarned: state.totalEarned + points,
      pointsLogs: [
        { id: `local-log-chk-${today}`, delta: points, reason: 'checkin', description: '每日签到', ref_id: today, created_at: new Date().toISOString() },
        ...state.pointsLogs,
      ],
    });

    // 远端
    const userId = getCurrentUserId();
    if (isSupabaseConfigured && userId) {
      insertCheckin(userId, today, streak, points).catch((e) => console.error('[rewards] checkin', e));
    }

    return { ok: true, streak, points, bonus };
  },
}), {
  name: 'music-app-rewards',
  partialize: (s) => ({
    availableCoupons: s.availableCoupons,
    myCoupons: s.myCoupons,
    points: s.points,
    totalEarned: s.totalEarned,
    totalSpent: s.totalSpent,
    pointsLogs: s.pointsLogs,
    checkins: s.checkins,
    currentStreak: s.currentStreak,
  }),
}));

export default useRewardsStore;
