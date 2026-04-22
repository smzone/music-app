import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package, ChevronLeft, Clock, CreditCard, ShoppingBag, Check, Truck,
  ChevronDown, ChevronUp, X as XIcon, RefreshCw, Copy, MapPin, PackageCheck,
  Ban, AlertCircle, Sparkles, Search, FileText, ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useOrderStore from '../store/useOrderStore';
import useThemeStore from '../store/useThemeStore';
import PaymentModal from '../components/Payment/PaymentModal';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 订单状态视觉映射
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

// 顶部筛选 tabs
const FILTERS = [
  { id: 'all', labelKey: 'orders.filterAll' },
  { id: 'pending', labelKey: 'orders.filterPending' },
  { id: 'paid', labelKey: 'orders.filterPaid' },
  { id: 'shipping', labelKey: 'orders.filterShipping' },
  { id: 'completed', labelKey: 'orders.filterCompleted' },
  { id: 'cancelled', labelKey: 'orders.filterCancelled' },
];

// pending 订单倒计时 mm:ss
function usePendingCountdown(expiresAt) {
  const [ms, setMs] = useState(() => expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setMs(new Date(expiresAt).getTime() - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return ms;
}

function Countdown({ expiresAt, t }) {
  const ms = usePendingCountdown(expiresAt);
  if (ms <= 0) return <span className="text-red-400">{t('orders.expiring') || '即将关闭'}</span>;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return (
    <span className="font-mono font-bold text-yellow-400">
      {String(m).padStart(2, '0')}:{String(ss).padStart(2, '0')}
    </span>
  );
}

// 物流轨迹
function TraceTimeline({ trace, isLight }) {
  if (!trace || trace.length === 0) return null;
  return (
    <div className="relative pl-5">
      <div className={`absolute left-[7px] top-2 bottom-2 w-px ${isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]'}`} />
      {trace.slice().reverse().map((ev, i) => {
        const isLatest = i === 0;
        return (
          <div key={i} className="relative pb-3 last:pb-0">
            <div
              className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 ${isLatest ? 'bg-primary border-primary shadow-[0_0_8px_rgba(29,185,84,0.5)]' : isLight ? 'bg-white border-gray-400' : 'bg-[#15151e] border-white/30'}`}
            />
            <div className="text-[10px] text-text-muted">{new Date(ev.time).toLocaleString()}</div>
            <div className={`text-sm ${isLatest ? 'text-primary font-bold' : 'text-text-primary font-medium'}`}>{ev.title}</div>
            {ev.desc && <div className="text-xs text-text-muted">{ev.desc}</div>}
          </div>
        );
      })}
    </div>
  );
}

// 高亮匹配的搜索关键词
function highlight(text, q) {
  if (!q) return text;
  const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-primary rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// 单个订单卡片
function OrderCard({ order, t, isLight, onPay, onCancel, onConfirm, onBuyAgain, searchQ = '' }) {
  const [expanded, setExpanded] = useState(false);
  const st = statusMap[order.status] || statusMap.paid;
  const StatusIcon = st.icon;
  const canPay = order.status === 'pending';
  const canCancel = ['pending', 'paid'].includes(order.status);
  const canConfirm = order.status === 'shipping';
  const canBuyAgain = ['completed', 'cancelled', 'expired'].includes(order.status);

  const copyOrderId = () => {
    navigator.clipboard?.writeText(order.id);
    toast.success(t('orders.copied') || '订单号已复制');
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isLight ? 'border-black/[0.06] bg-white hover:border-black/[0.12]' : 'border-white/[0.06] bg-white/[0.02] hover:border-primary/20'}`}>
      {/* 头部：订单号 + 状态 */}
      <div className={`flex flex-wrap items-center gap-3 px-5 py-3.5 border-b ${isLight ? 'border-black/[0.04] bg-gray-50/50' : 'border-white/[0.04] bg-white/[0.01]'}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-muted">{t('orders.orderId') || '订单号'}:</span>
          <Link to={`/orders/${order.id}`} className="text-xs text-text-primary font-mono hover:text-primary transition-colors">
            {highlight(order.id, searchQ)}
          </Link>
          <button onClick={copyOrderId} className="w-6 h-6 rounded hover:bg-white/[0.06] flex items-center justify-center text-text-muted hover:text-primary" title={t('orders.copyId') || '复制'}>
            <Copy size={11} />
          </button>
        </div>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Clock size={11} /> {new Date(order.createdAt).toLocaleString()}
        </span>
        <span className={`ml-auto flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${st.color}`}>
          <StatusIcon size={11} /> {t(st.key)}
        </span>
      </div>

      {/* pending 倒计时 */}
      {order.status === 'pending' && (
        <div className="px-5 py-2 bg-yellow-500/[0.06] border-b border-yellow-500/10 flex items-center justify-between text-xs">
          <span className="text-text-muted flex items-center gap-1.5">
            <Clock size={12} className="text-yellow-400" />
            {t('orders.payWithin') || '请在'} <Countdown expiresAt={order.expiresAt} t={t} /> {t('orders.beforeExpire') || '内完成支付，否则订单将自动关闭'}
          </span>
        </div>
      )}

      {/* 商品列表 */}
      <Link to={`/orders/${order.id}`} className={`block divide-y ${isLight ? 'divide-black/[0.04]' : 'divide-white/[0.03]'}`}>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.01] transition-colors">
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{highlight(item.name, searchQ)}</p>
              <p className="text-xs text-text-muted">x{item.qty} · ¥{item.price}</p>
            </div>
            <span className="text-sm font-semibold text-text-primary shrink-0">¥{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </Link>

      {/* 底部信息 + 操作 */}
      <div className={`flex flex-wrap items-center gap-3 px-5 py-3.5 border-t ${isLight ? 'border-black/[0.04] bg-gray-50/50' : 'border-white/[0.04] bg-white/[0.01]'}`}>
        {order.paymentMethod && (
          <span className="text-xs text-text-muted flex items-center gap-1">
            <CreditCard size={11} /> {t(`checkout.${order.paymentMethod}`)}
          </span>
        )}

        {order.address && (
          <span className="text-xs text-text-muted flex items-center gap-1 truncate max-w-[200px]" title={`${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`}>
            <MapPin size={11} /> {order.address.name} · {order.address.province}
          </span>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-text-muted">{t('orders.total')}</span>
          <span className="text-lg font-black text-primary">¥{order.total.toFixed(2)}</span>
          {order.discount > 0 && <span className="text-[10px] text-red-400">(-¥{order.discount.toFixed(2)})</span>}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={`flex flex-wrap gap-2 px-5 py-3 border-t ${isLight ? 'border-black/[0.04]' : 'border-white/[0.04]'}`}>
        <button onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${isLight ? 'border-black/[0.08] text-gray-600 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? (t('orders.collapse') || '收起') : (t('orders.viewTrace') || '查看物流')}
        </button>

        <Link to={`/orders/${order.id}`}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${isLight ? 'border-black/[0.08] text-gray-600 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-secondary hover:border-primary hover:text-primary'}`}>
          <FileText size={12} /> {t('orders.detail') || '详情'} <ChevronRight size={10} />
        </Link>

        <div className="flex gap-2 ml-auto">
          {canBuyAgain && (
            <button onClick={() => onBuyAgain(order)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${isLight ? 'border-black/[0.08] text-gray-700 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-secondary hover:border-primary hover:text-primary'}`}>
              <RefreshCw size={12} /> {t('orders.buyAgain') || '再次购买'}
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(order)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              <XIcon size={12} /> {t('orders.cancel') || '取消订单'}
            </button>
          )}
          {canConfirm && (
            <button onClick={() => onConfirm(order)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 font-bold transition-colors">
              <PackageCheck size={12} /> {t('orders.confirmReceive') || '确认收货'}
            </button>
          )}
          {canPay && (
            <button onClick={() => onPay(order)}
              className="flex items-center gap-1 text-xs px-4 py-1.5 rounded-full bg-primary text-black hover:bg-primary-hover font-bold transition-colors shadow-[0_0_15px_rgba(29,185,84,0.2)]">
              <CreditCard size={12} /> {t('orders.payNow') || '立即支付'}
            </button>
          )}
        </div>
      </div>

      {/* 展开：物流轨迹 */}
      {expanded && order.trace && (
        <div className={`px-5 py-4 border-t ${isLight ? 'border-black/[0.04] bg-gray-50/30' : 'border-white/[0.04] bg-white/[0.01]'}`}>
          {order.trackingNo && (
            <div className="mb-3 flex items-center gap-2 text-xs">
              <Truck size={12} className="text-primary" />
              <span className="text-text-muted">{t('orders.trackingNo') || '快递单号'}:</span>
              <span className="font-mono text-text-primary">{order.trackingNo}</span>
              <button onClick={() => { navigator.clipboard?.writeText(order.trackingNo); toast.success(t('orders.copied')); }}
                className="w-5 h-5 rounded hover:bg-white/[0.06] flex items-center justify-center text-text-muted hover:text-primary">
                <Copy size={10} />
              </button>
            </div>
          )}
          <TraceTimeline trace={order.trace} isLight={isLight} />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('orders.title'));
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const { addToCart } = useCartStore();
  const { orders, cancelOrder, confirmReceive, markPaid, sweepExpired, getOrder } = useOrderStore();

  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [payingOrder, setPayingOrder] = useState(null);

  // 清理过期订单
  useEffect(() => { sweepExpired(); }, [sweepExpired]);

  // 处理 paid=1 query 成功弹窗
  useEffect(() => {
    if (searchParams.get('paid') === '1') {
      const id = searchParams.get('id');
      if (id) {
        const o = getOrder(id);
        if (o) toast.success(t('orders.paidOk', { id }) || `订单 ${id} 支付成功`);
      }
      // 清理 query
      const next = new URLSearchParams(searchParams);
      next.delete('paid');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选 + 搜索（订单号 / 商品名 / 快递单号）
  const filtered = useMemo(() => {
    let list = orders;
    if (filter === 'shipping') list = list.filter((o) => ['shipping', 'delivered'].includes(o.status));
    else if (filter === 'cancelled') list = list.filter((o) => ['cancelled', 'expired'].includes(o.status));
    else if (filter !== 'all') list = list.filter((o) => o.status === filter);

    const q = searchQ.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        (o.trackingNo && o.trackingNo.toLowerCase().includes(q)) ||
        o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, filter, searchQ]);

  // 各状态数量（用于 tab 角标）
  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    shipping: orders.filter((o) => ['shipping', 'delivered'].includes(o.status)).length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => ['cancelled', 'expired'].includes(o.status)).length,
  }), [orders]);

  // 操作：取消
  const handleCancel = (order) => {
    if (!window.confirm(t('orders.cancelConfirm') || '确定取消这笔订单吗？')) return;
    cancelOrder(order.id, t('orders.userCancelled') || '用户主动取消');
    toast.success(t('orders.cancelOk') || '订单已取消');
  };

  // 操作：再次支付
  const handlePay = (order) => setPayingOrder(order);

  // 操作：确认收货
  const handleConfirm = (order) => {
    if (!window.confirm(t('orders.confirmReceiveConfirm') || '确认已收到商品？')) return;
    confirmReceive(order.id);
    toast.success(t('orders.receiveOk') || '已确认收货，感谢您的购买');
  };

  // 操作：再次购买（商品加回购物车）
  const handleBuyAgain = (order) => {
    order.items.forEach((item) => addToCart({ id: item.id, name: item.name, image: item.image, price: item.price }));
    toast.success(t('orders.addedToCart') || '商品已加入购物车');
    navigate('/shop');
  };

  // 支付成功
  const handlePaid = (channel) => {
    if (!payingOrder) return;
    markPaid(payingOrder.id, channel);
    setPayingOrder(null);
    toast.success(t('checkout.paySuccess'));
  };

  // 空状态
  if (orders.length === 0) {
    return (
      <div className="smart-container pt-8 pb-16 animate-fadeIn">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
          <ChevronLeft size={16} /> {t('orders.back')}
        </button>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <ShoppingBag size={56} className="mx-auto mb-4 text-text-muted opacity-30" />
            <h2 className="text-lg font-bold text-text-primary mb-2">{t('orders.empty')}</h2>
            <p className="text-text-muted mb-6">{t('orders.emptyDesc')}</p>
            <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-sm">
              {t('orders.goShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
        <ChevronLeft size={16} /> {t('orders.back')}
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-text-primary flex items-center gap-2.5">
          <Package size={24} className="text-primary" /> {t('orders.title')}
          <span className="text-sm text-text-muted font-normal">({orders.length})</span>
        </h1>

        {counts.pending > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 animate-pulse">
            <Sparkles size={12} />
            {t('orders.pendingAlert', { count: counts.pending }) || `${counts.pending} 笔待支付`}
          </div>
        )}
      </div>

      {/* 搜索框 */}
      <div className={`relative mb-4 rounded-xl border transition-colors ${isLight ? 'border-black/[0.08] bg-white focus-within:border-primary' : 'border-white/[0.08] bg-white/[0.02] focus-within:border-primary'}`}>
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={t('orders.searchPH') || '搜索订单号、商品名、快递单号'}
          className={`w-full pl-10 pr-10 py-2.5 bg-transparent outline-none text-sm ${isLight ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-text-muted'}`}
        />
        {searchQ && (
          <button onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary">
            <XIcon size={12} />
          </button>
        )}
      </div>

      {/* 筛选 tabs */}
      <div className={`flex gap-1 overflow-x-auto mb-6 p-1 rounded-xl scrollbar-none ${isLight ? 'bg-black/[0.04]' : 'bg-white/[0.04]'}`}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const n = counts[f.id] || 0;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                active
                  ? 'bg-primary text-black shadow-sm'
                  : isLight ? 'text-gray-600 hover:bg-black/[0.04]' : 'text-text-secondary hover:bg-white/[0.04]'
              }`}
            >
              {t(f.labelKey)}
              {n > 0 && (
                <span className={`text-[10px] px-1.5 py-0 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-text-muted'}`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 订单列表 */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-sm text-text-muted">{t('orders.noneInFilter') || '当前分类暂无订单'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              isLight={isLight}
              searchQ={searchQ}
              onPay={handlePay}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              onBuyAgain={handleBuyAgain}
            />
          ))}
        </div>
      )}

      {/* 再次支付弹窗 */}
      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          onPaid={handlePaid}
          onClose={() => { setPayingOrder(null); toast(t('orders.payCancel') || '支付已取消', { icon: '⚠️' }); }}
        />
      )}
    </div>
  );
}
