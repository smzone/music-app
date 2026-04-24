import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package, Search, Truck, ShieldCheck, Eye, X as XIcon,
  CheckCircle2, Clock, RefreshCw, AlertTriangle, DollarSign, Users, Cloud, Loader2,
} from 'lucide-react';
import useOrderStore from '../../store/useOrderStore';
import useThemeStore from '../../store/useThemeStore';
import { isSupabaseConfigured } from '../../lib/supabase';

// 状态筛选
const STATUS_TABS = [
  { key: 'all', labelKey: 'adminOrders.all' },
  { key: 'pending', labelKey: 'adminOrders.pending' },
  { key: 'paid', labelKey: 'adminOrders.paid' },
  { key: 'shipping', labelKey: 'adminOrders.shipping' },
  { key: 'delivered', labelKey: 'adminOrders.delivered' },
  { key: 'completed', labelKey: 'adminOrders.completed' },
  { key: 'refunded', labelKey: 'adminOrders.refunded' },
  { key: 'cancelled', labelKey: 'adminOrders.cancelled' },
  { key: 'expired', labelKey: 'adminOrders.expired' },
];

const STATUS_STYLE = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  paid: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipping: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  refunded: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  expired: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function OrdersManagePage() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const orders = useOrderStore((s) => s.orders);
  const adminShipOrder = useOrderStore((s) => s.adminShipOrder);
  const requestRefund = useOrderStore((s) => s.requestRefund);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const syncAllFromSupabase = useOrderStore((s) => s.syncAllFromSupabase);
  const syncing = useOrderStore((s) => s.syncing);
  const lastSyncedAt = useOrderStore((s) => s.lastSyncedAt);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [shipModal, setShipModal] = useState(null); // 订单
  const [trackingInput, setTrackingInput] = useState('');
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // 统计
  const stats = useMemo(() => {
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const totalRevenue = orders
      .filter((o) => ['paid', 'shipping', 'delivered', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);
    const customers = new Set(orders.map((o) => o.address?.phone).filter(Boolean)).size;
    return {
      total: orders.length,
      pending: byStatus.pending || 0,
      paid: byStatus.paid || 0,
      shipping: byStatus.shipping || 0,
      refunded: byStatus.refunded || 0,
      revenue: totalRevenue,
      customers,
    };
  }, [orders]);

  // 筛选 + 搜索
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => filter === 'all' || o.status === filter)
      .filter((o) => {
        if (!q) return true;
        if (o.id.toLowerCase().includes(q)) return true;
        if (o.address?.name?.toLowerCase().includes(q)) return true;
        if (o.address?.phone?.includes(q)) return true;
        if (o.items.some((it) => it.name.toLowerCase().includes(q))) return true;
        return false;
      });
  }, [orders, filter, search]);

  const openShipModal = (o) => {
    setShipModal(o);
    setTrackingInput('');
  };
  const handleShip = () => {
    if (!shipModal) return;
    adminShipOrder(shipModal.id, trackingInput.trim() || null);
    toast.success(t('adminOrders.shipOk') || '已发货');
    setShipModal(null);
  };

  const openRefundModal = (o) => {
    setRefundModal(o);
    setRefundReason('');
  };
  const handleRefund = () => {
    if (!refundModal) return;
    if (!refundReason.trim()) {
      toast.error(t('adminOrders.refundReasonRequired') || '请填写退款原因');
      return;
    }
    requestRefund(refundModal.id, `[管理员] ${refundReason.trim()}`);
    toast.success(t('adminOrders.refundOk') || '已退款');
    setRefundModal(null);
  };

  const handleCancel = (o) => {
    if (!window.confirm(t('adminOrders.confirmCancel') || '确认取消该订单？')) return;
    cancelOrder(o.id, '[管理员] 手动取消');
    toast.success(t('adminOrders.cancelOk') || '已取消');
  };

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : '-';

  const cardBg = isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 头部 */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>
            {t('adminOrders.title') || '订单管理'}
          </h1>
          <p className={`text-sm ${textSub}`}>
            {t('adminOrders.subtitle') || '查看和管理所有订单，支持手动发货、退款审批'}
          </p>
        </div>
        {isSupabaseConfigured && (
          <div className="flex items-center gap-2">
            {lastSyncedAt && (
              <span className={`text-[11px] ${textMuted}`}>
                {t('adminOrders.lastSynced') || '最近同步'}: {new Date(lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={async () => {
                const res = await syncAllFromSupabase();
                if (res?.error) toast.error(res.error);
                else toast.success((t('adminOrders.syncOk') || '已同步远端订单') + `：${res?.count ?? 0}`);
              }}
              disabled={syncing}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition-colors ${syncing ? 'bg-white/5 text-text-muted cursor-not-allowed' : 'bg-primary text-black hover:bg-primary-hover'}`}
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
              {syncing ? (t('adminOrders.syncing') || '同步中...') : (t('adminOrders.syncRemote') || '同步远端订单')}
            </button>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard isLight={isLight} icon={Package} color="text-primary" label={t('adminOrders.totalOrders') || '总订单'} value={stats.total} />
        <StatCard isLight={isLight} icon={DollarSign} color="text-emerald-400" label={t('adminOrders.totalRevenue') || '总营收'} value={`¥${stats.revenue.toFixed(2)}`} />
        <StatCard isLight={isLight} icon={Users} color="text-blue-400" label={t('adminOrders.customers') || '客户数'} value={stats.customers} />
        <StatCard isLight={isLight} icon={Truck} color="text-cyan-400" label={t('adminOrders.pendingShip') || '待发货'} value={stats.paid} />
      </div>

      {/* 筛选 + 搜索 */}
      <div className={`rounded-2xl border p-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminOrders.searchPlaceholder') || '搜索订单号 / 客户姓名 / 电话 / 商品名称'}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none border transition-colors ${isLight ? 'bg-gray-50 border-black/[0.08] focus:border-primary text-gray-900' : 'bg-white/[0.03] border-white/[0.08] focus:border-primary text-white'}`}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                filter === tab.key
                  ? 'bg-primary text-black border-primary'
                  : isLight ? 'border-black/[0.08] text-gray-600 hover:border-primary' : 'border-white/[0.08] text-text-muted hover:border-primary hover:text-white'
              }`}
            >
              {t(tab.labelKey)}
              {tab.key !== 'all' && stats[tab.key] !== undefined && (
                <span className="ml-1 opacity-60">({orders.filter((o) => o.status === tab.key).length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 订单列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
            <Package size={40} className={`mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm ${textSub}`}>{t('adminOrders.empty') || '暂无符合条件的订单'}</p>
          </div>
        ) : filtered.map((o) => (
          <div key={o.id} className={`rounded-2xl border p-4 transition-all hover:shadow-lg ${cardBg}`}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-dashed border-white/[0.06]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-sm font-mono ${textSub}`}>#{o.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${STATUS_STYLE[o.status] || ''}`}>
                  {t(`adminOrders.${o.status}`) || o.status}
                </span>
                <span className={`text-xs ${textMuted}`}>
                  <Clock size={11} className="inline mr-1" />{fmtDate(o.createdAt)}
                </span>
              </div>
              <div className={`text-base font-bold ${textMain}`}>¥{o.total.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
              {/* 商品预览 */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {o.items.slice(0, 4).map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className={`text-xs ${textSub} max-w-[140px] truncate`}>{it.name}</span>
                      <span className={`text-xs ${textMuted}`}>×{it.qty}</span>
                    </div>
                  ))}
                  {o.items.length > 4 && (
                    <span className={`text-xs ${textMuted}`}>+{o.items.length - 4}</span>
                  )}
                </div>
              </div>
              {/* 收货信息 */}
              <div className="text-xs space-y-0.5">
                <p className={textMain}><span className={textMuted}>{t('adminOrders.receiver') || '收货人'}: </span>{o.address?.name} {o.address?.phone}</p>
                <p className={textSub}>{o.address?.province}{o.address?.city}{o.address?.district}{o.address?.detail}</p>
                {o.trackingNo && (
                  <p className={textMuted}><Truck size={11} className="inline mr-1" />{o.trackingNo}</p>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/orders/${o.id}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${isLight ? 'border-black/[0.08] text-gray-700 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-secondary hover:border-primary hover:text-primary'}`}>
                <Eye size={12} /> {t('adminOrders.view') || '查看详情'}
              </Link>

              {o.status === 'paid' && (
                <button onClick={() => openShipModal(o)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 flex items-center gap-1.5">
                  <Truck size={12} /> {t('adminOrders.ship') || '手动发货'}
                </button>
              )}

              {['pending', 'paid'].includes(o.status) && (
                <button onClick={() => handleCancel(o)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-500/30 text-gray-400 hover:bg-gray-500/10 flex items-center gap-1.5">
                  <XIcon size={12} /> {t('adminOrders.cancel') || '取消订单'}
                </button>
              )}

              {['paid', 'shipping', 'delivered', 'completed'].includes(o.status) && (
                <button onClick={() => openRefundModal(o)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> {t('adminOrders.refund') || '批准退款'}
                </button>
              )}

              {o.status === 'refunded' && o.refundReason && (
                <span className={`ml-auto text-xs ${textMuted} flex items-center gap-1`}>
                  <AlertTriangle size={11} /> {o.refundReason}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 发货弹窗 */}
      {shipModal && (
        <Modal onClose={() => setShipModal(null)} isLight={isLight}
          title={t('adminOrders.shipTitle') || '手动发货'}
          icon={Truck} iconColor="text-cyan-400">
          <p className={`text-sm mb-1 ${textSub}`}>{t('adminOrders.orderId') || '订单号'}: <span className="font-mono">#{shipModal.id}</span></p>
          <p className={`text-sm mb-4 ${textSub}`}>{t('adminOrders.receiver') || '收货人'}: {shipModal.address?.name} {shipModal.address?.phone}</p>
          <label className={`text-xs font-bold mb-1.5 block ${textMain}`}>
            {t('adminOrders.trackingNo') || '快递单号'} <span className={textMuted}>({t('adminOrders.optional') || '可选，留空自动生成'})</span>
          </label>
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="SF1234567890"
            className={`w-full px-3 py-2 rounded-lg text-sm outline-none border mb-4 ${isLight ? 'bg-gray-50 border-black/[0.08] focus:border-primary' : 'bg-white/[0.03] border-white/[0.08] focus:border-primary text-white'}`}
          />
          <div className="flex gap-2">
            <button onClick={() => setShipModal(null)}
              className={`flex-1 py-2 rounded-full text-sm font-medium border ${isLight ? 'border-black/[0.08] text-gray-700 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}>
              {t('common.cancel') || '取消'}
            </button>
            <button onClick={handleShip}
              className="flex-1 py-2 rounded-full text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} /> {t('adminOrders.confirmShip') || '确认发货'}
            </button>
          </div>
        </Modal>
      )}

      {/* 退款弹窗 */}
      {refundModal && (
        <Modal onClose={() => setRefundModal(null)} isLight={isLight}
          title={t('adminOrders.refundTitle') || '批准退款'}
          icon={ShieldCheck} iconColor="text-orange-400">
          <p className={`text-sm mb-1 ${textSub}`}>{t('adminOrders.orderId') || '订单号'}: <span className="font-mono">#{refundModal.id}</span></p>
          <p className={`text-sm mb-4 ${textSub}`}>{t('adminOrders.refundAmount') || '退款金额'}: <span className={`font-bold ${textMain}`}>¥{refundModal.total.toFixed(2)}</span></p>
          <label className={`text-xs font-bold mb-1.5 block ${textMain}`}>{t('adminOrders.refundReason') || '退款说明'}*</label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            placeholder={t('adminOrders.refundPlaceholder') || '请说明退款原因，会同步给客户...'}
            className={`w-full px-3 py-2 rounded-lg text-sm outline-none border mb-4 resize-none ${isLight ? 'bg-gray-50 border-black/[0.08] focus:border-primary' : 'bg-white/[0.03] border-white/[0.08] focus:border-primary text-white'}`}
          />
          <div className="flex gap-2">
            <button onClick={() => setRefundModal(null)}
              className={`flex-1 py-2 rounded-full text-sm font-medium border ${isLight ? 'border-black/[0.08] text-gray-700 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}>
              {t('common.cancel') || '取消'}
            </button>
            <button onClick={handleRefund}
              className="flex-1 py-2 rounded-full text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-1.5">
              <RefreshCw size={14} /> {t('adminOrders.confirmRefund') || '确认退款'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// 统计卡片
function StatCard({ icon: Icon, color, label, value, isLight }) {
  return (
    <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{label}</span>
      </div>
      <div className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{value}</div>
    </div>
  );
}

// 通用弹窗
function Modal({ onClose, isLight, title, icon: Icon, iconColor, children }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl animate-fadeIn ${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#15151e] border-white/[0.08]'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <Icon size={18} className={iconColor} /> {title}
          </h3>
          <button onClick={onClose} className={isLight ? 'text-gray-500 hover:text-gray-900' : 'text-text-muted hover:text-white'}>
            <XIcon size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
