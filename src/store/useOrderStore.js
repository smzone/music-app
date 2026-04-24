import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  createOrder as createOrderRemote,
  fetchUserOrders,
  updateOrderStatus,
  upsertProductReview,
} from '../lib/supabaseService';

// -------------- Supabase 同步辅助 --------------

// 获取当前用户 ID（避免循环依赖 useAuthStore，直接读 persist）
function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('myspace-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id || null;
  } catch {
    return null;
  }
}

// 异步推送到远端（失败仅打日志，不影响本地）
function pushRemote(fn) {
  if (!isSupabaseConfigured) return;
  const uid = getCurrentUserId();
  if (!uid) return;
  Promise.resolve(fn(uid)).catch((e) => console.error('[orders] Supabase 同步失败:', e));
}

// Supabase 状态 → 本地状态
function mapRemoteToLocalStatus(s) {
  const m = {
    pending: 'pending',
    paid: 'paid',
    shipped: 'shipping',
    delivered: 'delivered',
    completed: 'completed',
    cancelled: 'cancelled',
    refunded: 'refunded',
    refunding: 'refunding',
  };
  return m[s] || s;
}

// ============================================================================
// 订单 + 地址 + 优惠券 统一 Store
// 订单状态机：
//   pending  - 待付款（15 分钟内未付款会被标记 expired）
//   paying   - 支付中（临时态，PaymentModal 展示）
//   paid     - 已付款（商家未发货）
//   shipping - 已发货（物流中）
//   delivered- 已送达
//   completed- 已完成（用户确认收货）
//   cancelled- 已取消
//   refunded - 已退款
//   expired  - 已超时取消
// ============================================================================

// 预设优惠券（实际项目应由后端校验）
export const COUPONS = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, min: 0, desc: '新人 9 折' },
  SAVE20: { code: 'SAVE20', type: 'amount', value: 20, min: 100, desc: '满 100 减 20' },
  SAVE50: { code: 'SAVE50', type: 'amount', value: 50, min: 300, desc: '满 300 减 50' },
  VIP30: { code: 'VIP30', type: 'percent', value: 30, min: 200, desc: 'VIP 专享 7 折' },
};

// 免邮门槛
export const FREE_SHIPPING_THRESHOLD = 99;
// 运费
export const SHIPPING_FEE = 12;
// 订单支付超时（毫秒）
export const ORDER_EXPIRE_MS = 15 * 60 * 1000;
// 模拟：支付后多久自动发货（演示用 20 秒）
export const AUTO_SHIP_MS = 20 * 1000;
// 模拟：发货后多久自动送达（演示用 30 秒）
export const AUTO_DELIVER_MS = 30 * 1000;

// 生成 22 位订单号：yyyymmddhhmmss + 6 位随机
const genOrderId = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  return `${ts}${rand}`;
};

// 校验并计算优惠券优惠金额
export function calcCouponDiscount(code, subtotal) {
  if (!code) return { valid: false, discount: 0, coupon: null };
  const coupon = COUPONS[String(code).toUpperCase().trim()];
  if (!coupon) return { valid: false, discount: 0, coupon: null, error: 'invalid' };
  if (subtotal < coupon.min) return { valid: false, discount: 0, coupon, error: 'minNotMet' };
  const discount = coupon.type === 'percent'
    ? Math.round((subtotal * coupon.value) / 100 * 100) / 100
    : coupon.value;
  return { valid: true, discount: Math.min(discount, subtotal), coupon };
}

// 计算运费
export function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// 生成物流轨迹（模拟）
function seedTrace(status, createdAt) {
  const t0 = new Date(createdAt).getTime();
  const evt = (offset, title, desc) => ({ time: new Date(t0 + offset).toISOString(), title, desc });
  const events = [evt(0, '订单创建', '订单已提交，等待付款')];
  if (['paid', 'shipping', 'delivered', 'completed'].includes(status)) {
    events.push(evt(60_000, '支付成功', '商家正在备货'));
  }
  if (['shipping', 'delivered', 'completed'].includes(status)) {
    events.push(evt(3600_000, '已发货', '快递单号：SF' + Math.floor(Math.random() * 1e10)));
    events.push(evt(7200_000, '运输中', '包裹已到达本地派送中心'));
  }
  if (['delivered', 'completed'].includes(status)) {
    events.push(evt(10800_000, '已送达', '快递已投递至指定地址，请注意查收'));
  }
  if (status === 'completed') {
    events.push(evt(12000_000, '订单完成', '感谢您的购买'));
  }
  return events;
}

const useOrderStore = create(persist((set, get) => ({
  // ============ 地址簿 ============
  addresses: [
    // 预置一条示例地址
    {
      id: 'addr-default',
      name: '默认收货人',
      phone: '138****0000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园 XX 路 XX 号',
      isDefault: true,
    },
  ],

  addAddress: (addr) => set((s) => {
    const id = `addr-${Date.now()}`;
    const isFirst = s.addresses.length === 0;
    const next = [
      ...s.addresses.map((a) => addr.isDefault ? { ...a, isDefault: false } : a),
      { ...addr, id, isDefault: isFirst || !!addr.isDefault },
    ];
    return { addresses: next };
  }),

  updateAddress: (id, patch) => set((s) => ({
    addresses: s.addresses.map((a) => {
      if (a.id === id) return { ...a, ...patch };
      // 设为默认时其他取消默认
      if (patch.isDefault) return { ...a, isDefault: false };
      return a;
    }),
  })),

  removeAddress: (id) => set((s) => {
    const next = s.addresses.filter((a) => a.id !== id);
    // 删的是默认地址 → 把第一个升为默认
    if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
    return { addresses: next };
  }),

  setDefaultAddress: (id) => set((s) => ({
    addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
  })),

  getDefaultAddress: () => get().addresses.find((a) => a.isDefault) || get().addresses[0] || null,

  // ============ 订单 ============
  orders: [],

  // 创建 pending 订单（未付款）
  createPendingOrder: ({ items, address, couponCode, subtotal, discount, shipping, total, paymentMethod, remark }) => {
    const id = genOrderId();
    const createdAt = new Date().toISOString();
    const order = {
      id,
      items: items.map((i) => ({ id: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty })),
      address,
      couponCode: couponCode || null,
      subtotal,
      discount: discount || 0,
      shipping: shipping || 0,
      total,
      paymentMethod: paymentMethod || null,
      remark: remark || '',
      status: 'pending',
      createdAt,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + ORDER_EXPIRE_MS).toISOString(),
      trace: [{ time: createdAt, title: '订单创建', desc: '订单已提交，等待付款' }],
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  // 标记已付款（支付成功回调）
  markPaid: (orderId, paymentMethod) => {
    const now = new Date().toISOString();
    let updated = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        updated = {
          ...o,
          status: 'paid',
          paidAt: now,
          paymentMethod: paymentMethod || o.paymentMethod,
          trace: [...o.trace, { time: now, title: '支付成功', desc: `使用${paymentMethod || o.paymentMethod}支付` }],
        };
        return updated;
      }),
    }));
    // 付款后写入 Supabase（创建远端订单）
    if (updated && !updated.remoteId) {
      pushRemote(async (uid) => {
        const { data, error } = await createOrderRemote(uid, {
          orderNo: updated.id,
          subtotal: updated.subtotal,
          shippingFee: updated.shipping,
          discount: updated.discount,
          total: updated.total,
          status: 'paid',
          address: updated.address,
          paymentMethod: updated.paymentMethod,
          paidAt: updated.paidAt,
          note: updated.remark,
        }, updated.items);
        if (error) { console.error('[orders] 远端创建失败:', error); return; }
        // 回写 remoteId
        set((s) => ({ orders: s.orders.map((o) => o.id === orderId ? { ...o, remoteId: data.id } : o) }));
      });
    }
  },

  // 取消订单（pending/paid 可取消）
  cancelOrder: (orderId, reason = '用户取消') => {
    const now = new Date().toISOString();
    let target = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (!['pending', 'paid'].includes(o.status) || o.id !== orderId) return o;
        target = { ...o, status: 'cancelled', cancelledAt: now, cancelReason: reason, trace: [...o.trace, { time: now, title: '订单取消', desc: reason }] };
        return target;
      }),
    }));
    if (target?.remoteId) {
      pushRemote(() => updateOrderStatus(target.remoteId, { status: 'cancelled' }));
    }
  },

  // 模拟商家发货
  shipOrder: (orderId) => {
    const now = new Date().toISOString();
    const trackingNo = 'SF' + Math.floor(Math.random() * 1e10);
    set((s) => ({
      orders: s.orders.map((o) => o.status === 'paid' && o.id === orderId ? {
        ...o,
        status: 'shipping',
        shippedAt: now,
        trackingNo,
        trace: [...o.trace, { time: now, title: '已发货', desc: `快递单号：${trackingNo}` }],
      } : o),
    }));
  },

  // 确认收货
  confirmReceive: (orderId) => {
    const now = new Date().toISOString();
    let target = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.status !== 'shipping' || o.id !== orderId) return o;
        target = { ...o, status: 'completed', deliveredAt: now, completedAt: now, trace: [...o.trace, { time: now, title: '确认收货', desc: '订单已完成' }] };
        return target;
      }),
    }));
    if (target?.remoteId) {
      pushRemote(() => updateOrderStatus(target.remoteId, { status: 'completed' }));
    }
  },

  // 清扫过期订单（每次打开订单页或 checkout 时调用）
  sweepExpired: () => {
    const now = Date.now();
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.status === 'pending' && o.expiresAt && now > new Date(o.expiresAt).getTime()) {
          return {
            ...o,
            status: 'expired',
            cancelledAt: new Date().toISOString(),
            trace: [...o.trace, { time: new Date().toISOString(), title: '订单已超时', desc: '未在 15 分钟内完成支付，订单自动关闭' }],
          };
        }
        return o;
      }),
    }));
  },

  // 自动推进发货/送达状态（演示用，App 根部每 5s 轮询）
  autoAdvance: () => {
    const now = Date.now();
    set((s) => ({
      orders: s.orders.map((o) => {
        // paid 超过 AUTO_SHIP_MS → shipping
        if (o.status === 'paid' && o.paidAt && now - new Date(o.paidAt).getTime() > AUTO_SHIP_MS) {
          const trackingNo = 'SF' + Math.floor(Math.random() * 1e10);
          const shippedAt = new Date().toISOString();
          return {
            ...o,
            status: 'shipping',
            shippedAt,
            trackingNo,
            trace: [...o.trace, { time: shippedAt, title: '已发货', desc: `快递单号：${trackingNo}` }],
          };
        }
        // shipping 超过 AUTO_DELIVER_MS → delivered
        if (o.status === 'shipping' && o.shippedAt && now - new Date(o.shippedAt).getTime() > AUTO_DELIVER_MS) {
          const deliveredAt = new Date().toISOString();
          return {
            ...o,
            status: 'delivered',
            deliveredAt,
            trace: [...o.trace, { time: deliveredAt, title: '已送达', desc: '快递已投递至指定地址，请注意查收' }],
          };
        }
        return o;
      }),
    }));
  },

  // 申请退款（paid/shipping/delivered/completed 可申请）
  requestRefund: (orderId, reason) => {
    const now = new Date().toISOString();
    let target = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (!['paid', 'shipping', 'delivered', 'completed'].includes(o.status) || o.id !== orderId) return o;
        target = { ...o, status: 'refunded', refundedAt: now, refundReason: reason || '用户申请退款', trace: [...o.trace, { time: now, title: '退款成功', desc: `原因：${reason || '用户申请退款'}` }] };
        return target;
      }),
    }));
    if (target?.remoteId) {
      pushRemote(() => updateOrderStatus(target.remoteId, { status: 'refunded' }));
    }
  },

  // 获取单个订单
  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),

  // 添加/更新商品评价（completed 订单可评价）
  addReview: (orderId, productId, { rating, content }) => {
    const now = new Date().toISOString();
    set((s) => ({
      orders: s.orders.map((o) => o.id === orderId ? {
        ...o,
        reviews: {
          ...(o.reviews || {}),
          [productId]: { rating, content, createdAt: now },
        },
      } : o),
    }));
  },

  // 批量评价（一次性提交订单下所有商品）
  submitOrderReviews: (orderId, reviewsMap) => {
    const now = new Date().toISOString();
    const reviews = Object.fromEntries(
      Object.entries(reviewsMap).map(([pid, r]) => [pid, { ...r, createdAt: now }])
    );
    let target = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        target = { ...o, reviews: { ...(o.reviews || {}), ...reviews }, reviewedAt: now, trace: [...o.trace, { time: now, title: '商品已评价', desc: `提交 ${Object.keys(reviews).length} 条评价` }] };
        return target;
      }),
    }));
    // 逐条上传评价到远端
    if (target?.remoteId) {
      pushRemote(async (uid) => {
        for (const [pid, r] of Object.entries(reviews)) {
          await upsertProductReview(uid, target.remoteId, pid, r);
        }
      });
    }
  },

  // 管理员：手动发货（跳过自动发货计时）
  adminShipOrder: (orderId, trackingNo) => {
    const now = new Date().toISOString();
    const tn = trackingNo || 'SF' + Math.floor(Math.random() * 1e10);
    let target = null;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.status !== 'paid' || o.id !== orderId) return o;
        target = { ...o, status: 'shipping', shippedAt: now, trackingNo: tn, trace: [...o.trace, { time: now, title: '已发货（管理员）', desc: `快递单号：${tn}` }] };
        return target;
      }),
    }));
    if (target?.remoteId) {
      pushRemote(() => updateOrderStatus(target.remoteId, { status: 'shipped', tracking_no: tn }));
    }
  },

  // 获取所有订单的评价汇总（按商品ID聚合）：用于 ShopPage 商品卡片显示评分
  getReviewsByProduct: () => {
    const map = {};
    get().orders.forEach((o) => {
      if (!o.reviews) return;
      Object.entries(o.reviews).forEach(([pid, r]) => {
        if (!map[pid]) map[pid] = [];
        map[pid].push(r);
      });
    });
    // 计算平均分与数量
    const result = {};
    Object.entries(map).forEach(([pid, list]) => {
      const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
      result[pid] = { avg, count: list.length, list };
    });
    return result;
  },

  // 已支付订单总金额统计
  getTotalSpent: () => get().orders
    .filter((o) => ['paid', 'shipping', 'delivered', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0),

  // 同步状态
  syncing: false,
  lastSyncedAt: null,

  // 从 Supabase 拉取订单并合并本地（以 order_no 为主键）
  syncFromSupabase: async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    set({ syncing: true });
    try {
      const remote = await fetchUserOrders(userId);
      const localMap = new Map(get().orders.map((o) => [o.id, o]));
      // 远端订单规范化
      const remoteOrders = (remote || []).map((r) => {
        const local = localMap.get(r.order_no);
        // 合并评价
        const reviewsMap = {};
        (r.reviews || []).forEach((rv) => {
          reviewsMap[rv.product_id] = {
            rating: rv.rating,
            content: rv.content,
            tags: rv.tags || [],
            createdAt: rv.created_at,
          };
        });
        return {
          id: r.order_no,
          remoteId: r.id,
          items: (r.items || []).map((it) => ({
            id: it.product_id,
            name: it.product_name,
            image: it.product_image,
            price: Number(it.unit_price),
            qty: it.quantity,
          })),
          address: r.address_snapshot || {},
          couponCode: null,
          subtotal: Number(r.subtotal),
          discount: Number(r.discount),
          shipping: Number(r.shipping_fee),
          total: Number(r.total),
          paymentMethod: r.payment_method,
          remark: r.note || '',
          status: mapRemoteToLocalStatus(r.status),
          createdAt: r.created_at,
          paidAt: r.paid_at,
          shippedAt: r.shipped_at,
          deliveredAt: r.delivered_at,
          completedAt: r.completed_at,
          cancelledAt: r.cancelled_at,
          refundedAt: r.refunded_at,
          trackingNo: r.tracking_no,
          trace: local?.trace || [{ time: r.created_at, title: '订单创建', desc: '订单已提交' }],
          reviews: Object.keys(reviewsMap).length ? reviewsMap : (local?.reviews || undefined),
        };
      });
      // 合并：远端优先，本地独有（如未同步的 pending 订单）保留
      const remoteIds = new Set(remoteOrders.map((o) => o.id));
      const localOnly = get().orders.filter((o) => !remoteIds.has(o.id));
      const merged = [...remoteOrders, ...localOnly].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      set({ orders: merged, syncing: false, lastSyncedAt: new Date().toISOString() });
    } catch (e) {
      console.error('[orders] 同步失败:', e);
      set({ syncing: false });
    }
  },

  // 退出登录时清理本地缓存中的远端订单
  resetRemoteLocal: () => set((s) => ({
    orders: s.orders.filter((o) => !o.remoteId),
    syncing: false,
    lastSyncedAt: null,
  })),
}), {
  name: 'music-app-orders',
  storage: createJSONStorage(() => localStorage),
  version: 1,
}));

// 导出 seedTrace 供测试/mock 使用
export { seedTrace };

export default useOrderStore;
