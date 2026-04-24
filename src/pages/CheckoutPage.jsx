import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ChevronLeft, Package, MapPin, Check, Plus, Tag,
  ChevronRight, Truck, Edit2, Trash2, Star, X, CreditCard,
  Wallet, Smartphone, Ticket, Coins, Sparkles,
} from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import useOrderStore, { calcCouponDiscount, calcShipping, COUPONS, FREE_SHIPPING_THRESHOLD } from '../store/useOrderStore';
import useRewardsStore from '../store/useRewardsStore';
import useThemeStore from '../store/useThemeStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import PaymentModal from '../components/Payment/PaymentModal';

// 支付方式简图（仅作为初始默认值，真正选择在 PaymentModal 中）
const PAY_METHODS = [
  { id: 'alipay', icon: Wallet, nameKey: 'checkout.alipay', color: '#1677FF' },
  { id: 'wechat', icon: Smartphone, nameKey: 'checkout.wechat', color: '#07C160' },
  { id: 'card', icon: CreditCard, nameKey: 'checkout.card', color: '#8b5cf6' },
];

// 收货地址表单弹窗
function AddressFormModal({ initial, onSave, onClose, t, isLight }) {
  const [form, setForm] = useState(initial || {
    name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false,
  });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.province.trim() || !form.detail.trim()) {
      toast.error(t('checkout.addrRequired') || '请填写完整地址信息');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl animate-fadeIn ${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#15151e] border-white/[0.08]'}`}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {initial ? (t('checkout.editAddr') || '编辑地址') : (t('checkout.newAddr') || '新增地址')}
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-text-muted"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('checkout.addrName') || '收货人姓名'}
              className={`px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t('checkout.addrPhone') || '手机号'}
              className={`px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.province} onChange={(e) => set('province', e.target.value)} placeholder={t('checkout.addrProvince') || '省'}
              className={`px-3 py-2.5 rounded-xl text-sm outline-none border ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
            <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder={t('checkout.addrCity') || '市'}
              className={`px-3 py-2.5 rounded-xl text-sm outline-none border ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
            <input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder={t('checkout.addrDistrict') || '区/县'}
              className={`px-3 py-2.5 rounded-xl text-sm outline-none border ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
          </div>
          <textarea value={form.detail} onChange={(e) => set('detail', e.target.value)} placeholder={t('checkout.addrDetail') || '详细地址（街道、门牌号等）'} rows={2}
            className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border resize-none ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`} />
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} className="accent-primary" />
            <span className={isLight ? 'text-gray-700' : 'text-text-secondary'}>{t('checkout.setDefault') || '设为默认地址'}</span>
          </label>
        </div>

        <div className={`flex gap-3 px-5 py-4 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <button type="button" onClick={onClose}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium border ${isLight ? 'border-black/[0.08] text-gray-700 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}>
            {t('checkout.cancel') || '取消'}
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-full font-bold text-sm">
            {t('checkout.save') || '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('checkout.title'));
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const { cart, getCartTotal, clearCart } = useCartStore();
  const {
    addresses, addAddress, updateAddress, removeAddress, setDefaultAddress, getDefaultAddress,
    createPendingOrder, markPaid, cancelOrder, sweepExpired,
  } = useOrderStore();

  // 清理过期订单
  useEffect(() => { sweepExpired(); }, [sweepExpired]);

  // 奖励系统（rewards 券 + 积分）
  const myCoupons = useRewardsStore((s) => s.myCoupons);
  const userPoints = useRewardsStore((s) => s.points);
  const rewardsCalcDiscount = useRewardsStore((s) => s.calcDiscount);
  const consumeRewardCoupon = useRewardsStore((s) => s.useCoupon);
  const spendPoints = useRewardsStore((s) => s.spendPoints);

  // 选中的地址 / 支付方式 / 优惠券 / 备注
  const [selectedAddrId, setSelectedAddrId] = useState(() => (getDefaultAddress()?.id) || null);
  const [payMethod, setPayMethod] = useState('alipay');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // rewards 券（用户券包中选择）
  const [selectedRewardCouponId, setSelectedRewardCouponId] = useState(null);
  // 积分抵扣（1 积分 = ¥0.01，上限订单 30%）
  const [pointsToUse, setPointsToUse] = useState(0);
  const [remark, setRemark] = useState('');

  // 地址弹窗
  const [addrModal, setAddrModal] = useState(null); // null | {mode:'new'|'edit', initial?}

  // 订单 / 支付弹窗
  const [pendingOrder, setPendingOrder] = useState(null);

  // 金额计算
  const subtotal = getCartTotal();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const baseShipping = calcShipping(subtotal);

  // --- 本地优惠码折扣 ---
  const couponCalc = useMemo(() => calcCouponDiscount(appliedCoupon, subtotal), [appliedCoupon, subtotal]);
  const localDiscount = couponCalc.valid ? couponCalc.discount : 0;

  // --- rewards 券折扣 ---
  const selectedRewardCoupon = useMemo(
    () => myCoupons.find((mc) => mc.id === selectedRewardCouponId && mc.status === 'unused'),
    [myCoupons, selectedRewardCouponId],
  );
  const rewardCouponData = selectedRewardCoupon?.coupon || selectedRewardCoupon?.coupons;
  const rewardDiscount = useMemo(() => {
    if (!rewardCouponData) return 0;
    return rewardsCalcDiscount(rewardCouponData, subtotal);
  }, [rewardCouponData, subtotal, rewardsCalcDiscount]);
  const isFreeShip = rewardCouponData?.type === 'shipping';
  const shipping = isFreeShip ? 0 : baseShipping;

  // --- 积分抵扣（1 积分 = ¥0.01，最多抵扣订单 30%） ---
  const subTotalAfterCoupons = Math.max(0, subtotal - localDiscount - rewardDiscount);
  const maxPointsAllowed = Math.min(userPoints, Math.floor(subTotalAfterCoupons * 30)); // 30% × 100 = 30
  const validPointsToUse = Math.min(pointsToUse, maxPointsAllowed);
  const pointsDiscount = validPointsToUse * 0.01;

  // 总折扣 = 本地券 + rewards 券 + 积分抵扣
  const discount = localDiscount + rewardDiscount + pointsDiscount;
  const total = Math.max(0, subtotal + shipping - discount);

  // 积分滑条超限自动回落
  useEffect(() => {
    if (pointsToUse > maxPointsAllowed) setPointsToUse(maxPointsAllowed);
  }, [maxPointsAllowed, pointsToUse]);

  // 同步选中地址
  useEffect(() => {
    if (!selectedAddrId && addresses[0]) setSelectedAddrId((getDefaultAddress() || addresses[0]).id);
    if (selectedAddrId && !addresses.find((a) => a.id === selectedAddrId)) setSelectedAddrId(addresses[0]?.id || null);
  }, [addresses, selectedAddrId, getDefaultAddress]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddrId) || null;

  // 应用优惠券
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const result = calcCouponDiscount(code, subtotal);
    if (!result.valid) {
      if (result.error === 'minNotMet') {
        toast.error(t('checkout.couponMinNotMet', { min: result.coupon.min }) || `未达到使用门槛 ¥${result.coupon.min}`);
      } else {
        toast.error(t('checkout.couponInvalid') || '优惠券代码无效');
      }
      return;
    }
    setAppliedCoupon(code);
    toast.success(t('checkout.couponApplied', { desc: result.coupon.desc }) || `已应用：${result.coupon.desc}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.success(t('checkout.couponRemoved') || '已移除优惠券');
  };

  // 提交订单 → 打开 PaymentModal
  const handleSubmit = () => {
    if (!user) {
      toast.error(t('checkout.loginFirst'));
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error(t('checkout.emptyCart'));
      return;
    }
    if (!selectedAddress) {
      toast.error(t('checkout.addrRequired2') || '请先添加并选择收货地址');
      return;
    }

    const order = createPendingOrder({
      items: cart,
      address: selectedAddress,
      couponCode: appliedCoupon,
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod: payMethod,
      remark,
    });
    // 额外挂载 rewards 元信息（在 store 外部追加）
    order._rewards = {
      userCouponId: selectedRewardCoupon?.id || null,
      rewardDiscount,
      pointsUsed: validPointsToUse,
      pointsDiscount,
    };
    setPendingOrder(order);
  };

  // 支付成功 → 消费券 & 扣积分 → 跳转
  const handlePaid = async (channel) => {
    if (!pendingOrder) return;
    markPaid(pendingOrder.id, channel);
    clearCart();
    const orderId = pendingOrder.id;
    const rewardsMeta = pendingOrder._rewards || {};
    // 标记 rewards 券使用
    if (rewardsMeta.userCouponId) {
      await consumeRewardCoupon(rewardsMeta.userCouponId, orderId);
    }
    // 扣减积分
    if (rewardsMeta.pointsUsed > 0) {
      await spendPoints(
        rewardsMeta.pointsUsed,
        'order_discount',
        `${t('checkout.pointsDeductDesc') || '订单积分抵扣'} · ${orderId}`,
        orderId,
      );
    }
    setPendingOrder(null);
    toast.success(t('checkout.paySuccess'));
    navigate(`/checkout/success?id=${orderId}`, { replace: true });
  };

  // 关闭支付弹窗 → 取消订单
  const handlePayClose = () => {
    if (pendingOrder) cancelOrder(pendingOrder.id, t('checkout.userClosed') || '用户关闭支付');
    setPendingOrder(null);
    toast(t('checkout.payCancelled') || '支付已取消，订单已关闭', { icon: '⚠️' });
  };

  // 购物车为空
  if (cart.length === 0 && !pendingOrder) {
    return (
      <div className="smart-container pt-10 pb-16 flex-1 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <Package size={56} className="mx-auto mb-4 text-text-muted opacity-30" />
          <h2 className="text-xl font-bold text-text-primary mb-2">{t('checkout.emptyTitle')}</h2>
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
      {/* 返回 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
        <ChevronLeft size={16} /> {t('checkout.back')}
      </button>

      <h1 className="text-2xl md:text-3xl font-black text-text-primary mb-8">{t('checkout.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧主内容 */}
        <div className="flex-1 space-y-4">
          {/* ===== 收货地址 ===== */}
          <section className={`rounded-2xl border overflow-hidden ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> {t('checkout.address')}
              </h2>
              <button
                onClick={() => setAddrModal({ mode: 'new' })}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-bold"
              >
                <Plus size={12} /> {t('checkout.newAddr') || '新增地址'}
              </button>
            </header>

            {addresses.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin size={36} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="text-sm text-text-muted mb-4">{t('checkout.noAddress') || '还没有收货地址'}</p>
                <button
                  onClick={() => setAddrModal({ mode: 'new' })}
                  className="px-5 py-2 bg-primary text-black rounded-full text-sm font-bold hover:bg-primary-hover"
                >
                  {t('checkout.addFirstAddr') || '添加第一个地址'}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {addresses.map((addr) => {
                  const active = addr.id === selectedAddrId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddrId(addr.id)}
                      className={`group relative flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${active ? (isLight ? 'bg-primary/[0.04]' : 'bg-primary/[0.06]') : isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'}`}
                    >
                      {/* 选中指示 */}
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-primary bg-primary' : 'border-text-muted/40'}`}>
                        {active && <Check size={12} className="text-black" strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-text-primary">{addr.name}</span>
                          <span className="text-xs text-text-muted">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold">
                              <Star size={8} fill="currentColor" /> {t('checkout.default') || '默认'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {addr.province} {addr.city} {addr.district} {addr.detail}
                        </p>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!addr.isDefault && (
                          <button onClick={(e) => { e.stopPropagation(); setDefaultAddress(addr.id); toast.success(t('checkout.setDefaultOk') || '已设为默认'); }}
                            className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-text-muted hover:text-primary" title={t('checkout.setDefault') || '设为默认'}>
                            <Star size={13} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setAddrModal({ mode: 'edit', initial: addr }); }}
                          className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-text-muted hover:text-primary">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm(t('checkout.deleteAddrConfirm') || '删除此地址？')) { removeAddress(addr.id); toast.success(t('checkout.addrDeleted') || '已删除'); } }}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ===== 商品清单 ===== */}
          <section className={`rounded-2xl border overflow-hidden ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <header className="px-5 py-4 border-b border-white/[0.04]">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Package size={16} className="text-primary" /> {t('checkout.orderItems')} <span className="text-sm text-text-muted">({itemCount})</span>
              </h2>
            </header>
            <div className="divide-y divide-white/[0.04]">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">¥{item.price} × {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">¥{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {/* 运费提示 */}
            <div className={`px-5 py-3 border-t border-white/[0.04] flex items-center gap-2 text-xs ${shipping === 0 ? 'text-primary' : 'text-text-muted'}`}>
              <Truck size={13} />
              {shipping === 0
                ? (t('checkout.freeShippingHit') || `已享免邮（订单满 ¥${FREE_SHIPPING_THRESHOLD}）`)
                : (t('checkout.needMoreForFree', { amount: (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2) }) || `再购 ¥${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} 即可免邮`)
              }
            </div>
          </section>

          {/* ===== 优惠券 ===== */}
          <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-3">
              <Tag size={16} className="text-primary" /> {t('checkout.coupon') || '优惠券'}
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/[0.08] border border-primary/20">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Tag size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary">{appliedCoupon}</p>
                  <p className="text-[11px] text-text-muted">{COUPONS[appliedCoupon]?.desc} · {t('checkout.save', { amount: discount.toFixed(2) }) || `已减 ¥${discount.toFixed(2)}`}</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:text-red-300 font-bold">
                  {t('checkout.remove') || '移除'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder={t('checkout.couponPH') || '输入优惠券代码（如 WELCOME10）'}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm outline-none border font-mono uppercase ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`}
                  />
                  <button onClick={handleApplyCoupon}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-xl font-bold text-sm">
                    {t('checkout.apply') || '使用'}
                  </button>
                </div>
                {/* 推荐码 */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.values(COUPONS).filter((c) => subtotal >= c.min).slice(0, 3).map((c) => (
                    <button key={c.code} onClick={() => { setCouponInput(c.code); setTimeout(() => setAppliedCoupon(c.code), 0); toast.success(t('checkout.couponApplied', { desc: c.desc }) || `已应用：${c.desc}`); }}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 font-bold">
                      {c.code} · {c.desc}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ===== 我的券包（rewards） ===== */}
          <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Ticket size={16} className="text-primary" /> {t('checkout.rewardCoupons') || '我的券包'}
                <span className="text-[10px] font-normal text-text-muted">
                  ({myCoupons.filter((c) => c.status === 'unused').length} {t('coupons.unusedCount') || '张可用'})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => navigate('/coupons')}
                className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-0.5"
              >
                {t('checkout.moreCoupons') || '更多'} <ChevronRight size={12} />
              </button>
            </header>

            {myCoupons.length === 0 ? (
              <div className="py-4 text-center text-xs text-text-muted">
                {t('checkout.noRewardCoupon') || '暂无优惠券，前往领取更多'}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
                {/* 不使用券 */}
                <button
                  type="button"
                  onClick={() => setSelectedRewardCouponId(null)}
                  className={`shrink-0 w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center text-[11px] font-bold transition-all ${!selectedRewardCouponId ? 'border-primary bg-primary/10 text-primary' : isLight ? 'border-black/[0.08] text-gray-600 hover:border-black/[0.15]' : 'border-white/[0.08] text-text-muted hover:border-white/[0.15]'}`}
                >
                  <X size={14} className="mb-0.5" />
                  {t('checkout.noCoupon') || '不使用券'}
                </button>
                {myCoupons
                  .filter((c) => c.status === 'unused')
                  .map((mc) => {
                    const c = mc.coupon || mc.coupons || {};
                    const active = selectedRewardCouponId === mc.id;
                    const usable = subtotal >= (c.min_amount || 0);
                    const disabled = !usable;
                    return (
                      <button
                        key={mc.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedRewardCouponId(active ? null : mc.id)}
                        className={`shrink-0 w-52 h-20 rounded-xl border-2 relative overflow-hidden px-3 py-2 text-left transition-all
                          ${active
                            ? 'border-primary bg-gradient-to-br from-primary/20 to-emerald-400/10 shadow-[0_0_15px_rgba(29,185,84,0.15)]'
                            : disabled
                              ? isLight ? 'border-black/[0.05] bg-black/[0.02] opacity-50' : 'border-white/[0.05] bg-white/[0.02] opacity-50'
                              : isLight ? 'border-black/[0.08] bg-white hover:border-primary/50' : 'border-white/[0.08] bg-white/[0.03] hover:border-primary/50'}`}
                      >
                        {/* 左侧价格 */}
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            {c.type === 'fixed' && (
                              <span className="text-lg font-black text-primary">¥{c.value}</span>
                            )}
                            {c.type === 'percent' && (
                              <span className="text-lg font-black text-primary">{c.value}<span className="text-xs">%</span></span>
                            )}
                            {c.type === 'shipping' && (
                              <span className="text-xs font-black text-blue-400 uppercase">{t('coupons.freeShip') || '免邮'}</span>
                            )}
                          </div>
                          {active && <Check size={14} className="text-primary" />}
                        </div>
                        <p className="text-[11px] font-semibold text-text-primary truncate">{c.title}</p>
                        <p className="text-[9px] text-text-muted mt-0.5 truncate">
                          {c.min_amount > 0 && `${t('coupons.minAmount') || '满'}¥${c.min_amount}`}
                          {disabled && ` · ${t('checkout.couponNotUsable') || '不满足条件'}`}
                        </p>
                      </button>
                    );
                  })}
              </div>
            )}
          </section>

          {/* ===== 积分抵扣 ===== */}
          {userPoints > 0 && subTotalAfterCoupons > 0 && (
            <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Coins size={16} className="text-yellow-400" /> {t('checkout.usePoints') || '积分抵扣'}
                  <span className="text-[10px] font-normal text-text-muted">
                    ({t('checkout.pointsRate') || '100 积分 = ¥1'})
                  </span>
                </h2>
                <span className="text-[11px] text-text-muted">
                  {t('checkout.available') || '可用'}: <b className="text-yellow-400">{userPoints}</b>
                </span>
              </header>

              <div className="flex items-center gap-3">
                {/* 滑条 */}
                <input
                  type="range"
                  min={0}
                  max={maxPointsAllowed}
                  step={10}
                  value={validPointsToUse}
                  onChange={(e) => setPointsToUse(Number(e.target.value))}
                  className="flex-1 accent-primary h-2"
                  disabled={maxPointsAllowed === 0}
                />
                {/* 输入数字 */}
                <input
                  type="number"
                  min={0}
                  max={maxPointsAllowed}
                  step={10}
                  value={validPointsToUse}
                  onChange={(e) => setPointsToUse(Math.max(0, Math.min(maxPointsAllowed, Number(e.target.value) || 0)))}
                  className={`w-20 px-2 py-1.5 rounded-lg text-xs text-center border outline-none font-bold ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`}
                />
                <button
                  type="button"
                  onClick={() => setPointsToUse(maxPointsAllowed)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-primary/15 text-primary hover:bg-primary/25"
                >
                  {t('checkout.useMax') || '用满'}
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-text-muted flex items-center gap-1">
                  <Sparkles size={11} className="text-yellow-400" />
                  {t('checkout.pointsCap', { n: maxPointsAllowed }) || `本单最多可用 ${maxPointsAllowed} 积分`}
                </span>
                {pointsDiscount > 0 && (
                  <span className="text-primary font-bold">
                    -¥{pointsDiscount.toFixed(2)}
                  </span>
                )}
              </div>
            </section>
          )}

          {/* ===== 支付方式 ===== */}
          <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" /> {t('checkout.payMethodLabel')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {PAY_METHODS.map((m) => {
                const Icon = m.icon;
                const active = payMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`relative flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${active ? 'border-transparent shadow-sm' : isLight ? 'border-black/[0.06] hover:border-black/[0.12]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
                    style={active ? { background: `${m.color}12`, borderColor: m.color } : {}}
                  >
                    <Icon size={22} style={{ color: active ? m.color : undefined }} className={!active ? 'text-text-muted' : ''} />
                    <span className="text-xs font-bold" style={{ color: active ? m.color : undefined }}>{t(m.nameKey)}</span>
                    {active && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: m.color }}>
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ===== 订单备注 ===== */}
          <section className={`rounded-2xl border p-5 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-base font-bold text-text-primary mb-3">{t('checkout.remark') || '订单备注（选填）'}</h2>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder={t('checkout.remarkPH') || '如有特殊要求请在此说明'}
              className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border resize-none ${isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'}`}
            />
            <p className="text-[10px] text-text-muted text-right mt-1">{remark.length}/200</p>
          </section>
        </div>

        {/* ===== 右侧订单摘要 ===== */}
        <aside className="lg:w-80 shrink-0">
          <div className={`lg:sticky lg:top-24 rounded-2xl border p-6 ${isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <h2 className="text-base font-bold text-text-primary mb-5">{t('checkout.summary')}</h2>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('checkout.subtotal')} ({itemCount})</span>
                <span className="text-text-primary font-medium">¥{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('checkout.shipping')}</span>
                <span className={shipping === 0 ? 'text-primary font-bold' : 'text-text-primary'}>
                  {shipping === 0 ? t('checkout.free') : `¥${shipping.toFixed(2)}`}
                </span>
              </div>
              {localDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t('checkout.discount')} <span className="text-[10px] text-primary ml-1">({appliedCoupon})</span></span>
                  <span className="text-red-400 font-medium">-¥{localDiscount.toFixed(2)}</span>
                </div>
              )}
              {rewardDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    <Ticket size={11} className="text-primary" /> {t('checkout.rewardCouponLabel') || '券包折扣'}
                  </span>
                  <span className="text-red-400 font-medium">-¥{rewardDiscount.toFixed(2)}</span>
                </div>
              )}
              {isFreeShip && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    <Truck size={11} className="text-blue-400" /> {t('coupons.freeShip') || '免邮'}
                  </span>
                  <span className="text-blue-400 font-medium">-¥{baseShipping.toFixed(2)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1">
                    <Coins size={11} className="text-yellow-400" /> {t('checkout.pointsDeduct') || '积分抵扣'} ({validPointsToUse})
                  </span>
                  <span className="text-red-400 font-medium">-¥{pointsDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-text-primary">{t('checkout.totalAmount')}</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary leading-none">¥{total.toFixed(2)}</div>
                  {discount > 0 && <div className="text-[10px] text-text-muted mt-0.5">{t('checkout.youSave') || '已省'} ¥{discount.toFixed(2)}</div>}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedAddress || cart.length === 0}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-[15px] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield size={16} /> {t('checkout.payNow')} ¥{total.toFixed(2)}
            </button>

            {selectedAddress ? (
              <div className="mt-3 text-[11px] text-text-muted flex items-start gap-1.5">
                <MapPin size={11} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {t('checkout.shipTo') || '寄送至'}：{selectedAddress.name} {selectedAddress.phone} · {selectedAddress.province}{selectedAddress.city}{selectedAddress.district}{selectedAddress.detail}
                </span>
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-red-400 flex items-center gap-1.5">
                <ChevronRight size={11} /> {t('checkout.addrRequired2') || '请先添加并选择收货地址'}
              </p>
            )}

            <p className="text-[11px] text-text-muted text-center mt-3 flex items-center justify-center gap-1">
              <Shield size={10} /> {t('checkout.secureNotice')}
            </p>
          </div>
        </aside>
      </div>

      {/* 地址弹窗 */}
      {addrModal && (
        <AddressFormModal
          initial={addrModal.initial}
          t={t}
          isLight={isLight}
          onClose={() => setAddrModal(null)}
          onSave={(data) => {
            if (addrModal.mode === 'edit') {
              updateAddress(addrModal.initial.id, data);
              toast.success(t('checkout.addrSaved') || '地址已更新');
            } else {
              addAddress(data);
              toast.success(t('checkout.addrAdded') || '地址已添加');
            }
            setAddrModal(null);
          }}
        />
      )}

      {/* 支付弹窗 */}
      {pendingOrder && (
        <PaymentModal order={pendingOrder} onPaid={handlePaid} onClose={handlePayClose} />
      )}
    </div>
  );
}
