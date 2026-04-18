import { useState } from 'react';
import { Crown, Check, Zap, Shield, Video, MessageSquare, ShoppingBag, Sparkles, ChevronDown, Star, Users, Headphones } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

const plans = [
  {
    id: 'free', nameKey: 'membership.plan.free.name', price: 0, descKey: 'membership.plan.free.desc',
    gradient: 'from-gray-800/50 to-gray-900/50', borderColor: 'border-white/[0.06]', btnClass: 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]',
    badgeKey: '', badgeColor: '',
    featureKeys: [
      { key: 'membership.feat.browsePublic', included: true }, { key: 'membership.feat.normalQuality', included: true },
      { key: 'membership.feat.forumRead', included: true }, { key: 'membership.feat.freeVideos', included: true },
      { key: 'membership.feat.lossless', included: false }, { key: 'membership.feat.vipVideos', included: false },
      { key: 'membership.feat.shopDiscount', included: false }, { key: 'membership.feat.liveGifts', included: false },
      { key: 'membership.feat.noAds', included: false },
    ],
  },
  {
    id: 'vip', nameKey: 'membership.plan.vip.name', price: 19.9, descKey: 'membership.plan.vip.desc',
    gradient: 'from-primary/10 via-emerald-900/10 to-primary/5', borderColor: 'border-primary/40', btnClass: 'bg-primary hover:bg-primary-hover text-black',
    badgeKey: 'membership.plan.vip.badge', badgeColor: 'bg-primary text-black',
    featureKeys: [
      { key: 'membership.feat.browsePublic', included: true }, { key: 'membership.feat.losslessPlay', included: true },
      { key: 'membership.feat.forumPost', included: true }, { key: 'membership.feat.allVideos', included: true },
      { key: 'membership.feat.vipVideos', included: true }, { key: 'membership.feat.shop90', included: true },
      { key: 'membership.feat.liveGifts', included: true }, { key: 'membership.feat.noAds', included: true },
      { key: 'membership.feat.vipSupport', included: false },
    ],
  },
  {
    id: 'svip', nameKey: 'membership.plan.svip.name', price: 49.9, descKey: 'membership.plan.svip.desc',
    gradient: 'from-yellow-500/10 via-amber-900/10 to-orange-500/5', borderColor: 'border-yellow-500/40', btnClass: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black',
    badgeKey: 'membership.plan.svip.badge', badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black',
    featureKeys: [
      { key: 'membership.feat.allVip', included: true }, { key: 'membership.feat.exclusiveTracks', included: true },
      { key: 'membership.feat.forumBadge', included: true }, { key: 'membership.feat.earlyAccess4k', included: true },
      { key: 'membership.feat.shop80', included: true }, { key: 'membership.feat.liveCollab', included: true },
      { key: 'membership.feat.offlineEvents', included: true }, { key: 'membership.feat.noAllAds', included: true },
      { key: 'membership.feat.dedicatedSupport', included: true },
    ],
  },
];

const benefitItems = [
  { icon: Headphones, titleKey: 'membership.benefit.lossless', descKey: 'membership.benefit.losslessDesc', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Video, titleKey: 'membership.benefit.vipVideo', descKey: 'membership.benefit.vipVideoDesc', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: MessageSquare, titleKey: 'membership.benefit.forum', descKey: 'membership.benefit.forumDesc', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: ShoppingBag, titleKey: 'membership.benefit.shop', descKey: 'membership.benefit.shopDesc', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Zap, titleKey: 'membership.benefit.live', descKey: 'membership.benefit.liveDesc', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Shield, titleKey: 'membership.benefit.noAds', descKey: 'membership.benefit.noAdsDesc', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const statsItems = [
  { value: '10,000+', labelKey: 'membership.stat.members', icon: Users },
  { value: '4.9', labelKey: 'membership.stat.rating', icon: Star },
  { value: '99.9%', labelKey: 'membership.stat.renewal', icon: Sparkles },
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
    toast.success(t('membership.comingSoon', { name: t(plan.nameKey) }));
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
          <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">{t('membership.heading')}</h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">{t('membership.desc')}</p>

          {/* 数据统计 */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {statsItems.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon size={16} className="text-yellow-400" />
                  <span className="text-text-primary font-bold">{s.value}</span>
                  <span className="text-text-muted text-sm">{t(s.labelKey)}</span>
                </div>
              );
            })}
          </div>

          {/* 计费周期切换 */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-white/[0.04] border border-white/[0.06] rounded-full">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'text-text-secondary hover:text-text-primary'}`}>
              {t('membership.monthly')}
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'text-text-secondary hover:text-text-primary'}`}>
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

              {plan.badgeKey && (
                <span className={`absolute -top-3 right-6 px-4 py-1 text-xs font-bold rounded-full ${plan.badgeColor} shadow-lg`}>
                  {t(plan.badgeKey)}
                </span>
              )}

              <h3 className="text-xl font-bold text-text-primary mb-1">{t(plan.nameKey)}</h3>
              <p className="text-sm text-text-muted mb-5">{t(plan.descKey)}</p>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-text-primary">{t('membership.free')}</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-base text-text-muted">¥</span>
                    <span className="text-5xl font-black text-text-primary tracking-tight">{displayPrice}</span>
                    <span className="text-sm text-text-muted">{displayPeriod}</span>
                  </div>
                )}
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-text-muted mt-1.5">{t('membership.yearlySaving', { monthly: (plan.price * 0.8).toFixed(1), save: (plan.price * 12 * 0.2).toFixed(0) })}</p>
                )}
              </div>

              <button onClick={() => handleSubscribe(plan)}
                className={`w-full py-3.5 rounded-full font-bold text-[15px] transition-all mb-7 ${plan.btnClass} ${isPopular ? 'shadow-[0_0_25px_rgba(29,185,84,0.2)]' : ''}`}>
                {plan.id === 'free' ? t('membership.currentPlan') : t('membership.subscribe')}
              </button>

              <div className="space-y-3">
                {plan.featureKeys.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    {f.included ? (
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/[0.04] shrink-0" />
                    )}
                    <span className={f.included ? 'text-text-secondary' : 'text-text-muted/50'}>{t(f.key)}</span>
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
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">{t('membership.benefitsTag')}</span>
          <h2 className="text-3xl font-black text-text-primary">{t('membership.benefitsTitle')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {benefitItems.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="group rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={b.color} />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">{t(b.titleKey)}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t(b.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="smart-container-sm">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">{t('membership.faqTag')}</span>
          <h2 className="text-3xl font-black text-text-primary">{t('membership.faqTitle')}</h2>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all text-left overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <h3 className="text-[15px] font-semibold text-text-primary">{t(`membership.faq.${i}.q`)}</h3>
                <ChevronDown size={16} className={`text-text-muted shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </div>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-text-muted leading-relaxed">{t(`membership.faq.${i}.a`)}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
