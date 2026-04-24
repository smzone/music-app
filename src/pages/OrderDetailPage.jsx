import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Package, ChevronLeft, Clock, CreditCard, Check, Truck, X as XIcon, RefreshCw, Copy,
  MapPin, PackageCheck, Ban, AlertCircle, ShieldCheck, FileText, Star, MessageSquare,
} from 'lucide-react';
import useOrderStore from '../store/useOrderStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import PaymentModal from '../components/Payment/PaymentModal';
import ReviewModal from '../components/Payment/ReviewModal';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 状态视觉
const statusMap = {
  pending:   { key: 'orders.statusPending',   color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',   icon: Clock },
  paid:      { key: 'orders.statusPaid',      color: 'bg-green-500/15 text-green-400 border-green-500/20',     icon: Check },
  shipping:  { key: 'orders.statusShipping',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',        icon: Truck },
  delivered: { key: 'orders.statusDelivered', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',  icon: PackageCheck },
  completed: { key: 'orders.statusCompleted', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: Check },
  cancelled: { key: 'orders.statusCancelled', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20',        icon: Ban },
  expired:   { key: 'orders.statusExpired',   color: 'bg-red-500/15 text-red-400 border-red-500/20',           icon: AlertCircle },
  refunded:  { key: 'orders.statusRefunded',  color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',  icon: RefreshCw },
};

// 状态进度条：5 步骤
const STEPS = [
  { key: 'create',   labelKey: 'orderDetail.stepCreate',   statuses: ['pending', 'paid', 'shipping', 'delivered', 'completed', 'cancelled', 'expired', 'refunded'] },
  { key: 'pay',      labelKey: 'orderDetail.stepPay',      statuses: ['paid', 'shipping', 'delivered', 'completed', 'refunded'] },
  { key: 'ship',     labelKey: 'orderDetail.stepShip',     statuses: ['shipping', 'delivered', 'completed'] },
  { key: 'deliver',  labelKey: 'orderDetail.stepDeliver',  statuses: ['delivered', 'completed'] },
  { key: 'complete', labelKey: 'orderDetail.stepComplete', statuses: ['completed'] },
];

// mm:ss 倒计时
function useCountdown(target) {
  const [ms, setMs] = useState(() => target ? new Date(target).getTime() - Date.now() : 0);
  useEffect(() => {
    if (!target) return;
    const tick = () => setMs(new Date(target).getTime() - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);
  return ms;
}

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const { markPaid, cancelOrder, confirmReceive, requestRefund, submitOrderReviews } = useOrderStore();
  const { addToCart } = useCartStore();
  // 订阅 orders 以便子状态变化时重渲染
  const orders = useOrderStore((s) => s.orders);
  const order = orders.find((o) => o.id === id);

  useDocumentTitle(order ? `${t('orderDetail.title')} ${order.id}` : t('orderDetail.title'));

  const [payingOrder, setPayingOrder] = useState(null);
  const [refundModal, setRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [reviewModal, setReviewModal] = useState(false);

  const countdownMs = useCountdown(order?.status === 'pending' ? order?.expiresAt : null);

  if (!order) {
    return (
      <div className="smart-container pt-8 pb-16">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6">
          <ChevronLeft size={16} /> {t('orderDetail.back')}
        </button>
        <div className="py-20 text-center">
          <AlertCircle size={48} className="mx-auto mb-3 text-text-muted opacity-40" />
          <h2 className="text-lg font-bold text-text-primary mb-2">{t('orderDetail.notFound') || '订单不存在'}</h2>
          <p className="text-sm text-text-muted mb-5">{t('orderDetail.notFoundDesc') || '该订单可能已被删除或您无权查看'}</p>
          <button onClick={() => navigate('/orders')} className="px-6 py-2.5 bg-primary text-black rounded-full text-sm font-bold">
            {t('orderDetail.backToList') || '返回订单列表'}
          </button>
        </div>
      </div>
    );
  }

  const st = statusMap[order.status] || statusMap.paid;
  const StatusIcon = st.icon;
  const canPay = order.status === 'pending';
  const canCancel = ['pending', 'paid'].includes(order.status);
  const canConfirm = ['shipping', 'delivered'].includes(order.status);
  const canRefund = ['paid', 'shipping', 'delivered', 'completed'].includes(order.status);
  const canBuyAgain = true;
  // 可评价：completed 订单，且未全部评价完
  const reviewedCount = Object.keys(order.reviews || {}).length;
  const canReview = order.status === 'completed' && reviewedCount < order.items.length;
  const alreadyReviewed = order.status === 'completed' && reviewedCount >= order.items.length && reviewedCount > 0;

  // 当前激活步骤 index
  const activeStep = ['refunded', 'cancelled', 'expired'].includes(order.status)
    ? -1
    : STEPS.findIndex((s) => s.statuses.includes(order.status));

  const copyOrderId = () => {
    navigator.clipboard?.writeText(order.id);
    toast.success(t('orders.copied') || '已复制');
  };

  const handleCancel = () => {
    if (!window.confirm(t('orders.cancelConfirm') || '确定取消这笔订单吗？')) return;
    cancelOrder(order.id, t('orders.userCancelled') || '用户主动取消');
    toast.success(t('orders.cancelOk') || '订单已取消');
  };

  const handleConfirm = () => {
    if (!window.confirm(t('orders.confirmReceiveConfirm') || '确认已收到商品？')) return;
    confirmReceive(order.id);
    toast.success(t('orders.receiveOk') || '已确认收货，感谢您的购买');
  };

  const handleBuyAgain = () => {
    order.items.forEach((item) => addToCart({ id: item.id, name: item.name, image: item.image, price: item.price }));
    toast.success(t('orders.addedToCart'));
    navigate('/shop');
  };

  const handleRefund = () => {
    if (!refundReason.trim()) {
      toast.error(t('orderDetail.refundReasonRequired') || '请填写退款原因');
      return;
    }
    requestRefund(order.id, refundReason.trim());
    setRefundModal(false);
    setRefundReason('');
    toast.success(t('orderDetail.refundOk') || '退款申请已提交');
  };

  // 提交评价
  const handleSubmitReviews = (reviewsMap) => {
    submitOrderReviews(order.id, reviewsMap);
    setReviewModal(false);
    toast.success(t('review.submitOk') || '评价已提交，感谢您的反馈！');
  };

  const handlePaid = (channel) => {
    markPaid(order.id, channel);
    setPayingOrder(null);
    toast.success(t('checkout.paySuccess'));
  };

  // 倒计时显示 mm:ss
  const fmtCountdown = () => {
    const s = Math.max(0, Math.floor(countdownMs / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      {/* 返回 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
        <ChevronLeft size={16} /> {t('orderDetail.back')}
      </button>

      {/* 顶部状态卡 */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 mb-6 ${
          isLight ? 'border-black/[0.06] bg-gradient-to-br from-white to-gray-50' : 'border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]'
        }`}
      >
        {/* 装饰背景 */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: st.color.match(/text-\w+-\d+/)?.[0]?.replace('text-', 'rgb(')?.replace(/-\d+/, '') || '#1DB954' }} />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${st.color}`}>
              <StatusIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${st.color}`}>
                  {t(st.key)}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-text-primary mb-1">
                {t('orderDetail.title') || '订单详情'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="font-mono">{order.id}</span>
                <button onClick={copyOrderId} className="w-5 h-5 rounded hover:bg-white/[0.06] flex items-center justify-center hover:text-primary" title={t('orders.copyId')}>
                  <Copy size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* pending 倒计时 */}
          {order.status === 'pending' && countdownMs > 0 && (
            <div className={`rounded-xl px-4 py-3 border ${isLight ? 'border-yellow-500/30 bg-yellow-500/[0.05]' : 'border-yellow-500/30 bg-yellow-500/[0.08]'}`}>
              <p className="text-[11px] text-text-muted mb-0.5">{t('orderDetail.payCountdown') || '支付剩余时间'}</p>
              <p className="text-xl font-mono font-black text-yellow-400">{fmtCountdown()}</p>
            </div>
          )}
        </div>

        {/* 进度条 */}
        {activeStep >= 0 && (
          <div className="relative mt-6 pt-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const done = idx <= activeStep;
                const current = idx === activeStep;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        done
                          ? 'bg-primary text-black shadow-[0_0_12px_rgba(29,185,84,0.4)]'
                          : isLight ? 'bg-black/[0.06] text-gray-400' : 'bg-white/[0.06] text-text-muted'
                      } ${current ? 'scale-110 ring-2 ring-primary/40' : ''}`}
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] text-center ${done ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
                      {t(step.labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* 连接线 */}
            <div className={`absolute top-[22px] left-[5%] right-[5%] h-[2px] ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`}>
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 退款/取消/过期状态的提示 */}
        {['refunded', 'cancelled', 'expired'].includes(order.status) && (
          <div className={`mt-5 p-3 rounded-xl text-xs ${isLight ? 'bg-black/[0.04]' : 'bg-white/[0.04]'}`}>
            {order.status === 'refunded' && (
              <div className="flex items-start gap-2 text-orange-400">
                <RefreshCw size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-0.5">{t('orderDetail.refundDone') || '已退款'}</p>
                  {order.refundReason && <p className="text-text-muted">{t('orderDetail.refundReason') || '原因'}: {order.refundReason}</p>}
                  {order.refundedAt && <p className="text-text-muted mt-0.5">{new Date(order.refundedAt).toLocaleString()}</p>}
                </div>
              </div>
            )}
            {order.status === 'cancelled' && (
              <div className="flex items-start gap-2 text-gray-400">
                <Ban size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-0.5">{t('orderDetail.cancelled') || '订单已取消'}</p>
                  {order.cancelReason && <p>{order.cancelReason}</p>}
                </div>
              </div>
            )}
            {order.status === 'expired' && (
              <div className="flex items-start gap-2 text-red-400">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-0.5">{t('orderDetail.expired') || '订单已超时'}</p>
                  <p className="text-text-muted">{t('orderDetail.expiredDesc') || '未在规定时间内完成支付'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：商品 + 物流 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 商品列表 */}
          <section className={`rounded-2xl border overflow-hidden ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <header className="px-5 py-3.5 border-b border-white/[0.04]">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Package size={15} className="text-primary" /> {t('checkout.orderItems')} · {order.items.length}
              </h2>
            </header>
            <div className="divide-y divide-white/[0.04]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">¥{item.price} × {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">¥{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 物流追踪入口（付款后可见） */}
          {['paid','shipping','delivered','completed'].includes(order.status) && (
            <Link
              to={`/orders/${order.id}/track`}
              className={`flex items-center justify-between w-full px-5 py-3 rounded-2xl border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group ${isLight ? 'border-black/[0.06] bg-gradient-to-r from-white to-primary/5' : 'border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-primary/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                  <Truck size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {t('orderDetail.viewTracking') || '查看物流追踪'}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {t('orderDetail.trackingHint') || '实时时间线 · 预计送达 · 虚拟轨迹'}
                  </p>
                </div>
              </div>
              <span className="text-primary text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {/* 物流轨迹 */}
          {order.trace && order.trace.length > 0 && (
            <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                <Truck size={15} className="text-primary" /> {t('orderDetail.trace') || '订单轨迹'}
              </h2>
              {order.trackingNo && (
                <div className="mb-4 flex items-center gap-2 text-xs">
                  <span className="text-text-muted">{t('orders.trackingNo')}:</span>
                  <span className="font-mono text-text-primary">{order.trackingNo}</span>
                  <button onClick={() => { navigator.clipboard?.writeText(order.trackingNo); toast.success(t('orders.copied')); }}
                    className="w-5 h-5 rounded hover:bg-white/[0.06] flex items-center justify-center hover:text-primary">
                    <Copy size={10} />
                  </button>
                </div>
              )}
              <div className="relative pl-5">
                <div className={`absolute left-[7px] top-2 bottom-2 w-px ${isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]'}`} />
                {order.trace.slice().reverse().map((ev, i) => {
                  const isLatest = i === 0;
                  return (
                    <div key={i} className="relative pb-4 last:pb-0">
                      <div className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 ${isLatest ? 'bg-primary border-primary shadow-[0_0_10px_rgba(29,185,84,0.5)]' : isLight ? 'bg-white border-gray-400' : 'bg-[#15151e] border-white/30'}`} />
                      <div className="text-[10px] text-text-muted">{new Date(ev.time).toLocaleString()}</div>
                      <div className={`text-sm ${isLatest ? 'text-primary font-bold' : 'text-text-primary font-medium'}`}>{ev.title}</div>
                      {ev.desc && <div className="text-xs text-text-muted mt-0.5">{ev.desc}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* 右：金额 + 地址 + 操作 */}
        <div className="space-y-4">
          {/* 金额明细 */}
          <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
              <FileText size={14} className="text-primary" /> {t('orderDetail.priceBreakdown') || '金额明细'}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">{t('checkout.subtotal')}</span>
                <span className="text-text-primary">¥{(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('checkout.shipping')}</span>
                <span className={order.shipping === 0 ? 'text-primary font-bold' : 'text-text-primary'}>
                  {order.shipping === 0 ? t('checkout.free') : `¥${order.shipping.toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('checkout.discount')} {order.couponCode && <span className="text-[10px] text-primary">({order.couponCode})</span>}</span>
                  <span className="text-red-400">-¥{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className={`flex justify-between items-center pt-3 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
                <span className="font-bold text-text-primary">{t('orders.total')}</span>
                <span className="text-xl font-black text-primary">¥{order.total.toFixed(2)}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex items-center gap-1 text-[11px] text-text-muted pt-2">
                  <CreditCard size={11} /> {t(`checkout.${order.paymentMethod}`)}
                  {order.paidAt && <span className="ml-auto">{new Date(order.paidAt).toLocaleString()}</span>}
                </div>
              )}
            </div>
          </section>

          {/* 收货地址 */}
          {order.address && (
            <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-primary" /> {t('checkout.address')}
              </h2>
              <div className="text-sm">
                <p className="font-semibold text-text-primary">{order.address.name} · {order.address.phone}</p>
                <p className="text-text-muted mt-1 leading-relaxed">
                  {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                </p>
              </div>
              {order.remark && (
                <div className={`mt-3 pt-3 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
                  <p className="text-[10px] text-text-muted mb-1">{t('checkout.remark')}:</p>
                  <p className="text-xs text-text-secondary">{order.remark}</p>
                </div>
              )}
            </section>
          )}

          {/* 操作按钮 */}
          <section className={`rounded-2xl border p-5 space-y-2 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-sm font-bold text-text-primary mb-3">{t('orderDetail.actions') || '订单操作'}</h2>

            {canPay && (
              <button onClick={() => setPayingOrder(order)}
                className="w-full py-2.5 bg-primary text-black rounded-full text-sm font-bold hover:bg-primary-hover flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(29,185,84,0.2)]">
                <CreditCard size={14} /> {t('orders.payNow')} ¥{order.total.toFixed(2)}
              </button>
            )}

            {canConfirm && (
              <button onClick={handleConfirm}
                className="w-full py-2.5 bg-primary/15 text-primary rounded-full text-sm font-bold hover:bg-primary/25 flex items-center justify-center gap-2">
                <PackageCheck size={14} /> {t('orders.confirmReceive')}
              </button>
            )}

            {canReview && (
              <button onClick={() => setReviewModal(true)}
                className="w-full py-2.5 bg-yellow-500/15 text-yellow-400 rounded-full text-sm font-bold hover:bg-yellow-500/25 flex items-center justify-center gap-2">
                <Star size={14} fill="currentColor" /> {t('review.cta') || '评价商品'} ({reviewedCount}/{order.items.length})
              </button>
            )}

            {alreadyReviewed && (
              <button onClick={() => setReviewModal(true)}
                className={`w-full py-2.5 rounded-full text-sm font-medium border flex items-center justify-center gap-2 ${isLight ? 'border-black/[0.08] text-gray-700 hover:border-yellow-400 hover:text-yellow-400' : 'border-white/[0.08] text-text-secondary hover:border-yellow-400 hover:text-yellow-400'}`}>
                <MessageSquare size={14} /> {t('review.viewEdit') || '查看/修改评价'}
              </button>
            )}

            {canBuyAgain && (
              <button onClick={handleBuyAgain}
                className={`w-full py-2.5 rounded-full text-sm font-medium border flex items-center justify-center gap-2 ${isLight ? 'border-black/[0.08] text-gray-700 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-secondary hover:border-primary hover:text-primary'}`}>
                <RefreshCw size={14} /> {t('orders.buyAgain')}
              </button>
            )}

            {canRefund && order.status !== 'refunded' && (
              <button onClick={() => setRefundModal(true)}
                className={`w-full py-2.5 rounded-full text-sm font-medium border flex items-center justify-center gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10`}>
                <ShieldCheck size={14} /> {t('orderDetail.requestRefund') || '申请退款'}
              </button>
            )}

            {canCancel && (
              <button onClick={handleCancel}
                className="w-full py-2.5 rounded-full text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2">
                <Ban size={14} /> {t('orders.cancel')}
              </button>
            )}
          </section>
        </div>
      </div>

      {/* 支付弹窗 */}
      {payingOrder && (
        <PaymentModal order={payingOrder} onPaid={handlePaid} onClose={() => { setPayingOrder(null); toast(t('orders.payCancel'), { icon: '⚠️' }); }} />
      )}

      {/* 评价弹窗 */}
      {reviewModal && (
        <ReviewModal order={order} onSubmit={handleSubmitReviews} onClose={() => setReviewModal(false)} />
      )}

      {/* 退款弹窗 */}
      {refundModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setRefundModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-2xl border shadow-2xl animate-fadeIn ${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#15151e] border-white/[0.08]'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                <ShieldCheck size={18} className="text-orange-400" /> {t('orderDetail.requestRefund') || '申请退款'}
              </h3>
              <button onClick={() => setRefundModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-text-muted">
                <XIcon size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-xs text-text-muted">
                {t('orderDetail.refundAmount') || '退款金额'}: <span className="text-primary font-bold">¥{order.total.toFixed(2)}</span>
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">{t('orderDetail.refundReason') || '退款原因'}</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder={t('orderDetail.refundReasonPH') || '请简要说明退款原因'}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border resize-none ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`}
                />
                {/* 快速选项 */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    t('orderDetail.reason1') || '我不想要了',
                    t('orderDetail.reason2') || '商品质量问题',
                    t('orderDetail.reason3') || '发货太慢',
                    t('orderDetail.reason4') || '拍错了',
                  ].map((r) => (
                    <button key={r} onClick={() => setRefundReason(r)}
                      className="text-[10px] px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-text-muted hover:text-text-primary transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex gap-3 px-5 py-4 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <button onClick={() => setRefundModal(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium border ${isLight ? 'border-black/[0.08] text-gray-700 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}>
                {t('checkout.cancel')}
              </button>
              <button onClick={handleRefund}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-sm flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} /> {t('orderDetail.submitRefund') || '提交退款'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
