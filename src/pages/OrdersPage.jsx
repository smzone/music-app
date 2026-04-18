import { useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, Clock, CreditCard, ShoppingBag, Check } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

const statusMap = {
  paid: { key: 'orders.statusPaid', color: 'bg-green-500/15 text-green-400', icon: Check },
  pending: { key: 'orders.statusPending', color: 'bg-yellow-500/15 text-yellow-400', icon: Clock },
  shipped: { key: 'orders.statusShipped', color: 'bg-blue-500/15 text-blue-400', icon: Package },
};

export default function OrdersPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('orders.title'));
  const navigate = useNavigate();
  const orders = useCartStore((s) => s.orders);

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
        <ChevronLeft size={16} /> {t('orders.back')}
      </button>

      <h1 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-2.5">
        <Package size={22} className="text-primary" /> {t('orders.title')}
      </h1>

      {orders.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusMap[order.status] || statusMap.paid;
            const StatusIcon = st.icon;
            return (
              <div key={order.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-primary/20 transition-all">
                {/* 订单头部 */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted font-mono">{order.id}</span>
                    <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={11} /> {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${st.color}`}>
                    <StatusIcon size={11} /> {t(st.key)}
                  </span>
                </div>

                {/* 商品列表 */}
                <div className="divide-y divide-white/[0.03]">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                        <p className="text-xs text-text-muted">x{item.qty} · ¥{item.price}</p>
                      </div>
                      <span className="text-sm font-semibold text-text-primary shrink-0">¥{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* 订单底部 */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.04] bg-white/[0.01]">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <CreditCard size={11} /> {t(`checkout.${order.paymentMethod}`)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{t('orders.total')}</span>
                    <span className="text-lg font-black text-primary">¥{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
