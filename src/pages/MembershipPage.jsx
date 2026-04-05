import { useState } from 'react';
import { Crown, Check, Zap, Shield, Video, MessageSquare, ShoppingBag, Sparkles, ChevronDown, Star, Users, Headphones } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

const plans = [
  {
    id: 'free', name: '免费用户', price: 0, period: '', desc: '基础功能体验',
    gradient: 'from-gray-800/50 to-gray-900/50', borderColor: 'border-white/[0.06]', btnClass: 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]',
    badge: '', badgeColor: '',
    features: [
      { text: '浏览所有公开内容', included: true }, { text: '在线播放普通音质', included: true },
      { text: '论坛浏览和评论', included: true }, { text: '观看免费视频', included: true },
      { text: '高品质/无损音乐', included: false }, { text: 'VIP 专属视频', included: false },
      { text: '商城专属折扣', included: false }, { text: '直播专属礼物', included: false },
      { text: '去除广告', included: false },
    ],
  },
  {
    id: 'vip', name: 'VIP 会员', price: 19.9, period: '/月', desc: '畅享高品质内容',
    gradient: 'from-primary/10 via-emerald-900/10 to-primary/5', borderColor: 'border-primary/40', btnClass: 'bg-primary hover:bg-primary-hover text-black',
    badge: '热门', badgeColor: 'bg-primary text-black',
    features: [
      { text: '浏览所有公开内容', included: true }, { text: '高品质/无损音乐播放', included: true },
      { text: '论坛发帖 + 置顶特权', included: true }, { text: '观看全部视频（含VIP）', included: true },
      { text: 'VIP 专属视频', included: true }, { text: '商城 9 折优惠', included: true },
      { text: '直播专属礼物', included: true }, { text: '去除广告', included: true },
      { text: '专属客服通道', included: false },
    ],
  },
  {
    id: 'svip', name: '超级VIP', price: 49.9, period: '/月', desc: '全部权益 + 专属服务',
    gradient: 'from-yellow-500/10 via-amber-900/10 to-orange-500/5', borderColor: 'border-yellow-500/40', btnClass: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black',
    badge: '尊享', badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black',
    features: [
      { text: '包含 VIP 全部权益', included: true }, { text: '无损音质 + 独家曲目', included: true },
      { text: '论坛专属标识 + 精华权限', included: true }, { text: '视频提前看 + 4K画质', included: true },
      { text: '商城 8 折 + 专属商品', included: true }, { text: '直播连麦特权', included: true },
      { text: '线下活动优先参与', included: true }, { text: '去除所有广告', included: true },
      { text: '1对1 专属客服', included: true },
    ],
  },
];

const benefits = [
  { icon: Headphones, title: '无损音乐', desc: '享受 FLAC 无损音质，聆听每一个细节', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Video, title: 'VIP 视频', desc: '解锁全部教程、幕后花絮等独家内容', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: MessageSquare, title: '论坛特权', desc: '专属标识、置顶帖子、精华权限', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: ShoppingBag, title: '商城折扣', desc: '专属优惠价格，优先购买限量商品', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Zap, title: '直播互动', desc: '专属礼物、连麦特权、优先互动', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Shield, title: '无广告', desc: '纯净体验，无任何广告干扰', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const stats = [
  { value: '10,000+', label: '会员用户', icon: Users },
  { value: '4.9', label: '用户评分', icon: Star },
  { value: '99.9%', label: '续费率', icon: Sparkles },
];

export default function MembershipPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('membership.title'));
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuthStore();

  const handleSubscribe = (plan) => {
    if (!user) { toast.error(t('membership.loginFirst')); return; }
    if (plan.id === 'free') { toast(t('membership.alreadyFree')); return; }
    toast.success(t('membership.comingSoon', { name: plan.name }));
  };

  return (
    <div className="smart-container pt-8 pb-16">
      {/* ===== Hero 头部 ===== */}
      <div className="relative text-center mb-16 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_60%)]" />
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <Crown size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{t('membership.heading')}</h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">{t('membership.desc')}</p>

          {/* 数据统计 */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon size={16} className="text-yellow-400" />
                  <span className="text-white font-bold">{s.value}</span>
                  <span className="text-text-muted text-sm">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* 计费周期切换 */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-white/[0.04] border border-white/[0.06] rounded-full">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'text-text-secondary hover:text-white'}`}>
              {t('membership.monthly')}
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'text-text-secondary hover:text-white'}`}>
              {t('membership.yearly')} <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">{t('membership.yearlyDiscount')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== 套餐卡片 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {plans.map((plan) => {
          const displayPrice = billingCycle === 'yearly' && plan.price > 0
            ? (plan.price * 12 * 0.8).toFixed(0) : plan.price;
          const displayPeriod = plan.price === 0 ? '' : billingCycle === 'yearly' ? t('membership.perYear') : t('membership.perMonth');
          const isPopular = plan.id === 'vip';

          return (
            <div key={plan.id}
              className={`relative rounded-2xl p-7 border-2 ${plan.borderColor} bg-gradient-to-b ${plan.gradient} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${isPopular ? 'lg:scale-[1.05] z-10' : ''}`}>
              {/* 发光效果 */}
              {isPopular && <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 to-transparent blur-sm -z-10" />}

              {plan.badge && (
                <span className={`absolute -top-3 right-6 px-4 py-1 text-xs font-bold rounded-full ${plan.badgeColor} shadow-lg`}>
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-text-muted mb-5">{plan.desc}</p>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-white">免费</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-base text-text-muted">¥</span>
                    <span className="text-5xl font-black text-white tracking-tight">{displayPrice}</span>
                    <span className="text-sm text-text-muted">{displayPeriod}</span>
                  </div>
                )}
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-text-muted mt-1.5">约 ¥{(plan.price * 0.8).toFixed(1)}/月，比月付节省 ¥{(plan.price * 12 * 0.2).toFixed(0)}</p>
                )}
              </div>

              <button onClick={() => handleSubscribe(plan)}
                className={`w-full py-3.5 rounded-full font-bold text-[15px] transition-all mb-7 ${plan.btnClass} ${isPopular ? 'shadow-[0_0_25px_rgba(29,185,84,0.2)]' : ''}`}>
                {plan.id === 'free' ? '当前方案' : '立即订阅'}
              </button>

              <div className="space-y-3">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    {f.included ? (
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/[0.04] shrink-0" />
                    )}
                    <span className={f.included ? 'text-text-secondary' : 'text-text-muted/50'}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 权益详情 ===== */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">权益一览</span>
          <h2 className="text-3xl font-black text-white">会员专属权益</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="group rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={b.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="smart-container-sm">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">帮助</span>
          <h2 className="text-3xl font-black text-white">常见问题</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: '如何开通会员？', a: '选择合适的套餐，点击"立即订阅"，支持微信/支付宝/银行卡支付。' },
            { q: '会员可以随时取消吗？', a: '可以。取消后当前周期内仍可享受会员权益，到期后自动降为免费用户。' },
            { q: '年付有什么优惠？', a: '年付相比月付可节省20%，是性价比最高的选择。' },
            { q: '支持哪些支付方式？', a: '支持微信支付、支付宝、银行卡等主流支付方式。' },
            { q: 'VIP 和超级VIP 有什么区别？', a: '超级VIP 包含 VIP 的全部权益，额外提供无损音质独家曲目、视频提前看4K画质、商城8折专属商品、直播连麦特权、线下活动优先参与和1对1专属客服。' },
          ].map((item, i) => (
            <button key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all text-left overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <h3 className="text-[15px] font-semibold text-white">{item.q}</h3>
                <ChevronDown size={16} className={`text-text-muted shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </div>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
