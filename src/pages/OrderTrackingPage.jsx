import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package, Truck, MapPin, Clock, CheckCircle2, CircleDashed, Navigation,
  ArrowLeft, ChevronRight, Phone, Home, Warehouse, Plane, Box,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import useOrderStore from '../store/useOrderStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';

// ============================================================================
// OrderTrackingPage /orders/:id/track
//   • 物流时间线（基于订单状态自动生成）
//   • 当前进度条 + 预计送达
//   • 虚拟轨迹（发货地 → 中转 → 收货地）
// ============================================================================
export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  useDocumentTitle(t('tracking.title') || '物流追踪');
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-text-muted mb-4">{t('tracking.notFound') || '订单不存在'}</p>
          <Link to="/orders" className="text-primary hover:text-primary-hover text-sm font-bold">
            {t('tracking.backToOrders') || '返回我的订单'}
          </Link>
        </div>
      </MainLayout>
    );
  }

  // 构造时间线节点（每秒触发的 nowTick 使其刷新活跃态）
  void nowTick;
  const timeline = buildTimeline(order, t);
  const currentIndex = timeline.findIndex((n) => !n.done);
  const activeIndex = currentIndex === -1 ? timeline.length - 1 : Math.max(0, currentIndex - 1);
  const progress = Math.min(100, ((activeIndex + (currentIndex === -1 ? 1 : 0.5)) / timeline.length) * 100);

  // 估计送达
  const etaMs = getETA(order);
  const etaStr = etaMs > 0
    ? `${Math.ceil(etaMs / 86400000)} ${t('tracking.daysLater') || '天后'}`
    : order.status === 'completed' || order.status === 'delivered'
      ? (t('tracking.arrived') || '已送达')
      : (t('tracking.pending') || '待发货');

  const cardBg = isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.08]';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full border ${isLight ? 'bg-white border-black/[0.06] text-gray-700 hover:text-primary' : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-primary'} transition-colors`}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className={`text-xl font-black tracking-tight ${textMain}`}>
              {t('tracking.title') || '物流追踪'}
            </h1>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              {t('tracking.orderNo') || '订单号'}: {order.id}
            </p>
          </div>
        </div>

        {/* 进度概览 */}
        <div className={`relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-primary/15 via-emerald-400/10 to-bg border border-primary/20`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck size={18} className="text-primary" />
                <span className="text-xs uppercase tracking-widest font-bold text-primary">
                  {t(`orders.status.${order.status}`) || order.status}
                </span>
              </div>
              <p className={`text-lg font-bold ${textMain}`}>
                {timeline[activeIndex]?.title || '---'}
              </p>
              <p className={`text-xs mt-1 ${textSub}`}>
                {timeline[activeIndex]?.description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-primary">
                <Navigation size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{t('tracking.eta') || '预计送达'}</span>
              </div>
              <p className={`text-2xl font-black mt-1 ${textMain}`}>{etaStr}</p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-5">
            <div className={`relative h-2 rounded-full overflow-hidden ${isLight ? 'bg-black/5' : 'bg-white/10'}`}>
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-semibold text-text-muted">
              <span>{t('tracking.stepOrder') || '下单'}</span>
              <span>{t('tracking.stepPaid') || '付款'}</span>
              <span>{t('tracking.stepShipping') || '发货'}</span>
              <span>{t('tracking.stepDelivered') || '送达'}</span>
              <span>{t('tracking.stepCompleted') || '完成'}</span>
            </div>
          </div>
        </div>

        {/* 发货 / 收货 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RouteCard
            isLight={isLight}
            icon={Warehouse}
            title={t('tracking.fromWarehouse') || '发货仓库'}
            name={t('tracking.warehouseName') || 'Music Store 中央仓'}
            address={t('tracking.warehouseAddr') || '广东省 深圳市 南山区 科技园'}
            phone="400-888-8888"
            iconColor="text-blue-400"
          />
          <RouteCard
            isLight={isLight}
            icon={Home}
            title={t('tracking.toAddress') || '收货地址'}
            name={order.address?.name || '-'}
            address={`${order.address?.province || ''} ${order.address?.city || ''} ${order.address?.district || ''} ${order.address?.detail || ''}`}
            phone={order.address?.phone}
            iconColor="text-primary"
          />
        </div>

        {/* 时间线 */}
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          <h3 className={`text-sm font-bold mb-4 flex items-center gap-1.5 ${textMain}`}>
            <Clock size={14} className="text-primary" />
            {t('tracking.timelineTitle') || '物流轨迹'}
          </h3>
          <div className="relative">
            {/* 竖线 */}
            <div className={`absolute left-[15px] top-2 bottom-2 w-0.5 ${isLight ? 'bg-black/5' : 'bg-white/10'}`} />

            <div className="space-y-5">
              {timeline.slice().reverse().map((node, idx) => {
                const realIdx = timeline.length - 1 - idx;
                const isActive = realIdx === activeIndex && node.done;
                const Icon = node.icon;
                return (
                  <div key={node.key} className="relative flex gap-4 pl-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors
                      ${node.done
                        ? isActive ? 'bg-gradient-to-br from-primary to-emerald-400 text-black shadow-lg shadow-primary/30 ring-4 ring-primary/20' : 'bg-primary/20 text-primary'
                        : isLight ? 'bg-gray-100 text-gray-400' : 'bg-white/[0.05] text-text-muted'}`}
                    >
                      {node.done ? <Icon size={14} /> : <CircleDashed size={14} />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <p className={`text-sm font-bold ${node.done ? textMain : textMuted}`}>{node.title}</p>
                        {node.time && (
                          <span className={`text-[10px] ${textMuted}`}>{formatTime(node.time)}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${textSub}`}>{node.description}</p>
                      {isActive && node.live && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          {t('tracking.live') || '进行中'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 返回订单详情 */}
        <Link
          to={`/orders/${order.id}`}
          className={`flex items-center justify-between w-full px-5 py-3 rounded-full border hover:border-primary hover:text-primary transition-colors text-sm font-bold ${cardBg} ${textSub}`}
        >
          <span className="flex items-center gap-2"><Box size={14} /> {t('tracking.viewDetail') || '查看订单详情'}</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </MainLayout>
  );
}

// ============================================================================
// 辅助函数：构造时间线
// ============================================================================
function buildTimeline(order, t) {
  const n = [];
  const status = order.status;
  const T = (k) => typeof t === 'function' ? t(k) : null;

  // 1. 下单
  n.push({
    key: 'created', icon: Package,
    title: T('tracking.node.created') || '订单已提交',
    description: T('tracking.node.createdDesc') || '您已提交订单，等待支付',
    time: order.createdAt, done: true,
  });

  // 2. 付款
  const paidDone = ['paid','shipping','delivered','completed'].includes(status);
  n.push({
    key: 'paid', icon: CheckCircle2,
    title: T('tracking.node.paid') || '支付成功',
    description: T('tracking.node.paidDesc') || '已完成付款，等待商家发货',
    time: order.paidAt, done: paidDone, live: status === 'paid',
  });

  // 3. 出库
  const shippingDone = ['shipping','delivered','completed'].includes(status);
  n.push({
    key: 'shipped', icon: Warehouse,
    title: T('tracking.node.shipped') || '商品已出库',
    description: T('tracking.node.shippedDesc') || '订单已从仓库发出',
    time: order.shippedAt, done: shippingDone,
  });

  // 4. 运输中
  const transitDone = ['shipping','delivered','completed'].includes(status);
  n.push({
    key: 'transit', icon: Plane,
    title: T('tracking.node.transit') || '运输途中',
    description: T('tracking.node.transitDesc') || '商品正在配送中，请耐心等待',
    time: order.shippedAt ? order.shippedAt + 3600_000 : null,
    done: transitDone, live: status === 'shipping',
  });

  // 5. 送达
  const deliveredDone = ['delivered','completed'].includes(status);
  n.push({
    key: 'delivered', icon: MapPin,
    title: T('tracking.node.delivered') || '已送达',
    description: T('tracking.node.deliveredDesc') || '包裹已送达，请查收',
    time: order.deliveredAt, done: deliveredDone, live: status === 'delivered',
  });

  // 6. 完成
  const completedDone = status === 'completed';
  n.push({
    key: 'completed', icon: CheckCircle2,
    title: T('tracking.node.completed') || '交易完成',
    description: T('tracking.node.completedDesc') || '感谢您的购买，欢迎再次光临',
    time: order.completedAt, done: completedDone,
  });

  return n;
}

// 预计送达剩余时间（毫秒）
function getETA(order) {
  if (['completed','delivered'].includes(order.status)) return 0;
  const base = order.shippedAt || order.paidAt || order.createdAt || Date.now();
  const eta = base + 3 * 86400000; // 3 天
  return Math.max(0, eta - Date.now());
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// 路由卡片
// ============================================================================
function RouteCard({ isLight, icon: Icon, title, name, address, phone, iconColor }) {
  return (
    <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.08]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLight ? 'bg-gray-100' : 'bg-white/[0.05]'}`}>
          <Icon size={14} className={iconColor} />
        </div>
        <span className={`text-xs uppercase font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{title}</span>
      </div>
      <p className={`text-sm font-bold mb-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{name}</p>
      <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{address}</p>
      {phone && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>
          <Phone size={10} /> {phone}
        </p>
      )}
    </div>
  );
}
