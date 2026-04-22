import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Package, ChevronRight, ShoppingBag, FileText, MapPin, CreditCard, Sparkles } from 'lucide-react';
import useOrderStore from '../store/useOrderStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 支付成功页 — /checkout/success?id=xxx
export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('checkout.successTitle'));
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('id');

  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const orders = useOrderStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  // 如果没找到订单，跳回订单列表
  useEffect(() => {
    if (!orderId) {
      navigate('/orders', { replace: true });
    }
  }, [orderId, navigate]);

  if (!order) {
    return (
      <div className="smart-container pt-16 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
          <p className="text-sm text-text-muted mb-4">{t('checkout.successNoOrder') || '未找到订单信息'}</p>
          <button onClick={() => navigate('/orders')} className="px-6 py-2.5 bg-primary text-black rounded-full text-sm font-bold">
            {t('orderDetail.backToList') || '返回订单列表'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      <div className="max-w-2xl mx-auto">
        {/* 成功大卡片 */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-8 text-center mb-6 ${
            isLight
              ? 'border-primary/20 bg-gradient-to-br from-primary/[0.04] via-white to-emerald-500/[0.04]'
              : 'border-primary/20 bg-gradient-to-br from-primary/[0.08] via-white/[0.02] to-emerald-500/[0.06]'
          }`}
        >
          {/* 装饰圆 */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            {/* 成功图标 */}
            <div className="w-20 h-20 mx-auto rounded-full bg-primary flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(29,185,84,0.4)]">
              <Check size={44} className="text-black" strokeWidth={3} />
            </div>

            <h1 className={`text-2xl md:text-3xl font-black mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {t('checkout.successTitle')}
            </h1>
            <p className="text-sm text-text-muted mb-6 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-primary" />
              {t('checkout.successDesc')}
            </p>

            {/* 订单信息行 */}
            <div className={`flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl mb-5 ${isLight ? 'bg-white border border-black/[0.04]' : 'bg-white/[0.04] border border-white/[0.04]'}`}>
              <div className="text-left">
                <p className="text-[11px] text-text-muted mb-0.5">{t('checkout.orderId')}</p>
                <p className="text-xs font-mono text-text-primary">{order.id}</p>
              </div>
              <div className={`w-px h-8 ${isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]'}`} />
              <div className="text-left">
                <p className="text-[11px] text-text-muted mb-0.5">{t('checkout.totalPaid')}</p>
                <p className="text-lg font-black text-primary">¥{order.total.toFixed(2)}</p>
              </div>
              {order.paymentMethod && (
                <>
                  <div className={`w-px h-8 ${isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]'}`} />
                  <div className="text-left flex items-center gap-1.5 text-xs text-text-secondary">
                    <CreditCard size={12} />
                    {t(`checkout.${order.paymentMethod}`)}
                  </div>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-sm transition-all hover:shadow-[0_0_25px_rgba(29,185,84,0.3)]"
              >
                <FileText size={14} /> {t('checkout.viewOrder') || '查看订单详情'}
                <ChevronRight size={14} />
              </Link>
              <button
                onClick={() => navigate('/shop')}
                className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-medium border transition-all ${
                  isLight ? 'border-black/[0.08] text-gray-700 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                <ShoppingBag size={14} /> {t('checkout.continueShopping')}
              </button>
            </div>
          </div>
        </div>

        {/* 订单摘要 */}
        <div className={`rounded-2xl border overflow-hidden ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
          <header className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Package size={15} className="text-primary" /> {t('checkout.orderItems')} · {order.items.length}
            </h2>
            <Link to={`/orders/${order.id}`} className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-0.5">
              {t('checkout.viewDetail') || '查看详情'} <ChevronRight size={12} />
            </Link>
          </header>
          <div className="divide-y divide-white/[0.04]">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/[0.06]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">× {item.qty}</p>
                </div>
                <span className="text-sm font-bold text-text-primary">¥{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="px-5 py-2 text-center text-xs text-text-muted">
                {t('checkout.moreItems', { count: order.items.length - 3 }) || `等 ${order.items.length} 件商品`}
              </div>
            )}
          </div>

          {order.address && (
            <div className={`px-5 py-3 border-t ${isLight ? 'border-black/[0.04] bg-gray-50/50' : 'border-white/[0.04] bg-white/[0.01]'}`}>
              <div className="flex items-start gap-2 text-xs">
                <MapPin size={12} className="text-text-muted mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary">{order.address.name} · {order.address.phone}</p>
                  <p className="text-text-muted mt-0.5 truncate">{order.address.province} {order.address.city} {order.address.district} {order.address.detail}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 温馨提示 */}
        <p className="text-center text-[11px] text-text-muted mt-6">
          {t('checkout.successHint') || '商家将在 1-3 个工作日内为您发货，请耐心等待 💚'}
        </p>
      </div>
    </div>
  );
}
