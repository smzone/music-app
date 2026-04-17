import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, QrCode, Shield, ChevronLeft, Package, MapPin, Check, Loader2, Wallet } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 支付方式配置
const paymentMethods = [
  { id: 'alipay', icon: Wallet, nameKey: 'checkout.alipay', color: 'text-blue-500', bg: 'bg-blue-500/10', desc: '支付宝快捷支付' },
  { id: 'wechat', icon: Smartphone, nameKey: 'checkout.wechat', color: 'text-green-500', bg: 'bg-green-500/10', desc: '微信扫码支付' },
  { id: 'card', icon: CreditCard, nameKey: 'checkout.card', color: 'text-purple-500', bg: 'bg-purple-500/10', desc: '银行卡在线支付' },
  { id: 'qrcode', icon: QrCode, nameKey: 'checkout.qrcode', color: 'text-orange-500', bg: 'bg-orange-500/10', desc: '聚合码支付' },
];

export default function CheckoutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('checkout.title'));
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, getCartTotal, createOrder } = useCartStore();
  const [payMethod, setPayMethod] = useState('alipay');
  const [address, setAddress] = useState('');
  const [paying, setPaying] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const total = getCartTotal();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  // 提交支付
  const handlePay = async () => {
    if (!user) { toast.error(t('checkout.loginFirst')); navigate('/login'); return; }
    if (cart.length === 0) { toast.error(t('checkout.emptyCart')); return; }
    setPaying(true);
    // 模拟支付延迟
    await new Promise((r) => setTimeout(r, 1500));
    const order = createOrder(payMethod, address);
    setPaying(false);
    setOrderResult(order);
    toast.success(t('checkout.paySuccess'));
  };

  // 支付成功页
  if (orderResult) {
    return (
      <div className="smart-container pt-10 pb-16 flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg text-center animate-fadeIn">
          <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t('checkout.successTitle')}</h1>
          <p className="text-text-secondary mb-6">{t('checkout.successDesc')}</p>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-muted">{t('checkout.orderId')}</span>
              <span className="text-sm font-mono text-white">{orderResult.id}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-muted">{t('checkout.payMethodLabel')}</span>
              <span className="text-sm text-white">{t(`checkout.${orderResult.paymentMethod}`)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-muted">{t('checkout.itemsCount')}</span>
              <span className="text-sm text-white">{orderResult.items.reduce((s, i) => s + i.qty, 0)} {t('checkout.pieces')}</span>
            </div>
            <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-white">{t('checkout.totalPaid')}</span>
              <span className="text-2xl font-black text-primary">¥{orderResult.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/orders')} className="flex-1 py-3 border border-white/[0.08] text-text-secondary rounded-full hover:text-white hover:border-white/[0.15] transition-colors text-sm font-medium">
              {t('checkout.viewOrders')}
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-sm">
              {t('checkout.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 购物车为空
  if (cart.length === 0) {
    return (
      <div className="smart-container pt-10 pb-16 flex-1 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <Package size={56} className="mx-auto mb-4 text-text-muted opacity-30" />
          <h2 className="text-xl font-bold text-white mb-2">{t('checkout.emptyTitle')}</h2>
          <p className="text-text-muted mb-6">{t('checkout.emptyDesc')}</p>
          <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">
            {t('checkout.goShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      {/* 返回按钮 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors mb-6">
        <ChevronLeft size={16} /> {t('checkout.back')}
      </button>

      <h1 className="text-2xl font-black text-white mb-8">{t('checkout.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧：商品列表 + 收货地址 + 支付方式 */}
        <div className="flex-1 space-y-6">
          {/* 商品列表 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package size={16} className="text-primary" /> {t('checkout.orderItems')} ({itemCount})
              </h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">x{item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">¥{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 收货地址 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-primary" /> {t('checkout.address')}
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder={t('checkout.addressPH')}
              className="w-full bg-white/[0.04] text-white px-4 py-3 rounded-xl outline-none border border-white/[0.06] focus:border-primary text-sm placeholder:text-text-muted resize-none transition-colors"
            />
          </div>

          {/* 支付方式 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-primary" /> {t('checkout.payMethodLabel')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((m) => {
                const Icon = m.icon;
                const active = payMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      active
                        ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(29,185,84,0.1)]'
                        : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={m.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t(m.nameKey)}</p>
                      <p className="text-[11px] text-text-muted">{m.desc}</p>
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} className="text-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：订单摘要 */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-base font-bold text-white mb-5">{t('checkout.summary')}</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('checkout.subtotal')}</span>
                <span className="text-white">¥{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('checkout.shipping')}</span>
                <span className="text-primary font-medium">{t('checkout.free')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('checkout.discount')}</span>
                <span className="text-red-400">-¥0.00</span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-white">{t('checkout.totalAmount')}</span>
                <span className="text-2xl font-black text-primary">¥{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-[15px] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <><Loader2 size={18} className="animate-spin" /> {t('checkout.processing')}</>
              ) : (
                <><Shield size={16} /> {t('checkout.payNow')} ¥{total.toFixed(2)}</>
              )}
            </button>

            <p className="text-[11px] text-text-muted text-center mt-3 flex items-center justify-center gap-1">
              <Shield size={10} /> {t('checkout.secureNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
