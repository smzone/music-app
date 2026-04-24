import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Ticket, Gift, Clock, Coins, CheckCircle2, XCircle, Sparkles, ArrowRight, AlertCircle,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import useRewardsStore from '../store/useRewardsStore';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';

// ============================================================================
// CouponsCenterPage /coupons
//   • 领取中心：展示所有可领券（含积分兑换）
//   • 我的券包：Tab 分类 [全部 / 未使用 / 已使用 / 已过期]
//   • 到期提醒：3 天内到期高亮
// ============================================================================
export default function CouponsCenterPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('coupons.title') || '优惠券');
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const {
    availableCoupons, myCoupons, points, syncAll, claimCoupon,
  } = useRewardsStore();

  const [tab, setTab] = useState('claim'); // claim | mine
  const [mineFilter, setMineFilter] = useState('unused'); // all | unused | used | expired
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    if (user) syncAll();
    // eslint-disable-next-line
  }, [user?.id]);

  // 自动处理过期状态（读时计算）
  const myCouponsNormalized = useMemo(() => {
    const now = Date.now();
    return myCoupons.map((mc) => {
      const c = mc.coupon || {};
      const endTime = c.end_at ? new Date(c.end_at).getTime() : Infinity;
      if (mc.status === 'unused' && endTime < now) return { ...mc, status: 'expired' };
      return mc;
    });
  }, [myCoupons]);

  const counts = useMemo(() => ({
    all: myCouponsNormalized.length,
    unused: myCouponsNormalized.filter((c) => c.status === 'unused').length,
    used: myCouponsNormalized.filter((c) => c.status === 'used').length,
    expired: myCouponsNormalized.filter((c) => c.status === 'expired').length,
  }), [myCouponsNormalized]);

  const filteredMine = useMemo(() => {
    if (mineFilter === 'all') return myCouponsNormalized;
    return myCouponsNormalized.filter((c) => c.status === mineFilter);
  }, [myCouponsNormalized, mineFilter]);

  const handleClaim = async (coupon) => {
    if (!user) {
      toast.error(t('coupons.loginRequired') || '请先登录');
      return;
    }
    setClaiming(coupon.id);
    const { error } = await claimCoupon(coupon);
    setClaiming(null);
    if (error) {
      toast.error(error.message || (t('coupons.claimFailed') || '领取失败'));
      return;
    }
    if (coupon.points_cost > 0) {
      toast.success(t('coupons.exchangeOk', { points: coupon.points_cost }) || `已消耗 ${coupon.points_cost} 积分兑换成功`);
    } else {
      toast.success(t('coupons.claimOk') || '领取成功');
    }
  };

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 顶部 */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${textMain}`}>
              {t('coupons.title') || '优惠券中心'}
            </h1>
            <p className={`text-sm mt-1 ${textSub}`}>
              {t('coupons.subtitle') || '领取优惠券，享受购物折扣'}
            </p>
          </div>

          {/* 积分 + 签到快捷 */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.04] border-white/[0.08]'}`}>
              <Coins size={16} className="text-yellow-400" />
              <span className={`text-sm font-bold ${textMain}`}>{points}</span>
              <span className={`text-xs ${textMuted}`}>{t('coupons.points') || '积分'}</span>
            </div>
            <Link
              to="/checkin"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-emerald-400 text-black text-sm font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-primary/20 transition-shadow"
            >
              <Sparkles size={14} />
              {t('coupons.goCheckin') || '签到赚积分'}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Tab */}
        <div className={`inline-flex rounded-full border p-1 gap-1 ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.04] border-white/[0.08]'}`}>
          {[
            { key: 'claim', label: t('coupons.tabClaim') || '领取中心', icon: Gift },
            { key: 'mine', label: `${t('coupons.tabMine') || '我的券包'} (${counts.unused})`, icon: Ticket },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors
                ${tab === key ? 'bg-primary text-black' : `${textMuted} hover:text-primary`}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* 领取中心 */}
        {tab === 'claim' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCoupons.length === 0 ? (
              <div className={`col-span-full rounded-2xl border p-12 text-center ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                <Gift size={36} className={`mx-auto mb-2 opacity-30 ${textMuted}`} />
                <p className={textMuted}>{t('coupons.emptyAvail') || '暂无可领取的优惠券'}</p>
              </div>
            ) : availableCoupons.map((c) => (
              <CouponCard
                key={c.id}
                coupon={c}
                isLight={isLight}
                t={t}
                userPoints={points}
                claimed={myCouponsNormalized.filter((mc) => (mc.coupon_id || mc.coupon?.id) === c.id).length}
                onClaim={() => handleClaim(c)}
                claiming={claiming === c.id}
              />
            ))}
          </div>
        )}

        {/* 我的券包 */}
        {tab === 'mine' && (
          <>
            {/* 子过滤 */}
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { key: 'unused', label: t('coupons.filterUnused') || '未使用', count: counts.unused },
                { key: 'used', label: t('coupons.filterUsed') || '已使用', count: counts.used },
                { key: 'expired', label: t('coupons.filterExpired') || '已过期', count: counts.expired },
                { key: 'all', label: t('coupons.filterAll') || '全部', count: counts.all },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setMineFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    ${mineFilter === f.key ? 'bg-primary/15 text-primary' : `${textMuted} hover:text-primary`}`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMine.length === 0 ? (
                <div className={`col-span-full rounded-2xl border p-12 text-center ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <Ticket size={36} className={`mx-auto mb-2 opacity-30 ${textMuted}`} />
                  <p className={textMuted}>{t('coupons.emptyMine') || '暂无优惠券'}</p>
                </div>
              ) : filteredMine.map((mc) => (
                <MyCouponCard
                  key={mc.id}
                  userCoupon={mc}
                  isLight={isLight}
                  t={t}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

// ============================================================================
// 可领取优惠券卡片
// ============================================================================
function CouponCard({ coupon, isLight, t, userPoints, claimed, onClaim, claiming }) {
  const limitReached = claimed >= (coupon.per_user_limit || 1);
  const needPoints = coupon.points_cost > 0;
  const notEnoughPoints = needPoints && userPoints < coupon.points_cost;
  const stockLeft = (coupon.total_quantity || 0) - (coupon.claimed_count || 0);
  const daysLeft = Math.max(0, Math.ceil((new Date(coupon.end_at) - Date.now()) / 86400000));

  const formatValue = () => {
    if (coupon.type === 'percent') return `${coupon.value}% OFF`;
    if (coupon.type === 'shipping') return t('coupons.freeShip') || '免邮';
    return `¥${coupon.value}`;
  };

  const typeColor = {
    fixed: 'from-primary to-emerald-400',
    percent: 'from-purple-500 to-pink-500',
    shipping: 'from-blue-500 to-cyan-400',
  }[coupon.type] || 'from-primary to-emerald-400';

  return (
    <div className={`relative rounded-2xl overflow-hidden border group hover:shadow-lg transition-shadow ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.08]'}`}>
      {/* 装饰缺口 */}
      <div className={`absolute left-[calc(40%-8px)] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${isLight ? 'bg-gray-50' : 'bg-bg'}`} />
      <div className={`absolute left-[calc(40%-8px)] top-0 w-4 h-4 rounded-full ${isLight ? 'bg-gray-50' : 'bg-bg'}`} style={{ transform: 'translate(0, -50%)' }} />
      <div className={`absolute left-[calc(40%-8px)] bottom-0 w-4 h-4 rounded-full ${isLight ? 'bg-gray-50' : 'bg-bg'}`} style={{ transform: 'translate(0, 50%)' }} />

      <div className="flex">
        {/* 左：金额 */}
        <div className={`w-[40%] bg-gradient-to-br ${typeColor} text-black p-5 flex flex-col items-center justify-center relative`}>
          <div className="text-3xl font-black tracking-tight">{formatValue()}</div>
          <div className="text-[11px] font-bold opacity-80 mt-1">
            {coupon.type === 'shipping'
              ? (t('coupons.free') || '免邮')
              : `${t('coupons.minAmount') || '满'} ¥${coupon.min_amount}`}
          </div>
          {coupon.max_discount && (
            <div className="text-[10px] opacity-70 mt-0.5">
              {t('coupons.maxDiscount') || '最高抵扣'} ¥{coupon.max_discount}
            </div>
          )}
        </div>

        {/* 右：详情 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className={`text-sm font-bold mb-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{coupon.title}</h3>
            <p className={`text-[11px] mb-1 ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{coupon.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] flex items-center gap-0.5 ${daysLeft <= 3 ? 'text-red-400 font-bold' : isLight ? 'text-gray-500' : 'text-text-muted'}`}>
                <Clock size={9} /> {daysLeft}{t('coupons.daysLeft') || '天内到期'}
              </span>
              {stockLeft < 100 && stockLeft > 0 && (
                <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                  <AlertCircle size={9} /> {t('coupons.stockLeft', { n: stockLeft }) || `仅剩 ${stockLeft} 张`}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={claiming || limitReached || notEnoughPoints || stockLeft <= 0}
            onClick={onClaim}
            className={`mt-3 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1
              ${(claiming || limitReached || notEnoughPoints || stockLeft <= 0)
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : needPoints
                  ? 'bg-yellow-400/20 text-yellow-600 hover:bg-yellow-400/30 dark:text-yellow-400'
                  : 'bg-primary text-black hover:bg-primary-hover'}`}
          >
            {claiming ? (t('coupons.claiming') || '领取中...') :
              limitReached ? (t('coupons.claimed') || '已领取') :
              stockLeft <= 0 ? (t('coupons.soldOut') || '已抢完') :
              needPoints ? (
                <>
                  <Coins size={11} /> {notEnoughPoints ? (t('coupons.needMorePoints') || '积分不足') : `${coupon.points_cost} ${t('coupons.points') || '积分'}`}
                </>
              ) : (t('coupons.claim') || '立即领取')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 我的券包卡片
// ============================================================================
function MyCouponCard({ userCoupon, isLight, t }) {
  const c = userCoupon.coupon || {};
  const status = userCoupon.status;
  const daysLeft = c.end_at ? Math.max(0, Math.ceil((new Date(c.end_at) - Date.now()) / 86400000)) : 0;
  const dim = status !== 'unused';

  const formatValue = () => {
    if (c.type === 'percent') return `${c.value}% OFF`;
    if (c.type === 'shipping') return t('coupons.freeShip') || '免邮';
    return `¥${c.value}`;
  };

  const statusCfg = {
    unused: { label: t('coupons.statusUnused') || '未使用', color: 'text-primary', icon: CheckCircle2 },
    used:   { label: t('coupons.statusUsed') || '已使用',   color: 'text-gray-400', icon: CheckCircle2 },
    expired:{ label: t('coupons.statusExpired') || '已过期', color: 'text-red-400', icon: XCircle },
  }[status] || {};
  const StatusIcon = statusCfg.icon || CheckCircle2;

  return (
    <div className={`relative rounded-2xl overflow-hidden border flex ${dim ? 'opacity-50 grayscale' : ''} ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.08]'}`}>
      <div className={`w-[40%] bg-gradient-to-br from-primary/80 to-emerald-400/80 text-black p-4 flex flex-col items-center justify-center`}>
        <div className="text-2xl font-black tracking-tight">{formatValue()}</div>
        <div className="text-[10px] font-bold opacity-80 mt-0.5">
          {c.type === 'shipping' ? '' : `${t('coupons.minAmount') || '满'} ¥${c.min_amount}`}
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className={`text-sm font-bold mb-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{c.title}</h3>
          <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{c.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-text-muted'} flex items-center gap-0.5`}>
            <Clock size={9} /> {daysLeft}{t('coupons.daysLeft') || '天内到期'}
          </span>
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${statusCfg.color}`}>
            <StatusIcon size={10} /> {statusCfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}
