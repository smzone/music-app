import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Video, MessageSquare, ShoppingBag, Radio, Crown, ArrowRight, Heart, Eye, Clock, Sparkles, Headphones, Users, TrendingUp, Target } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 博客文章模拟数据
const blogPosts = [
  { id: 1, title: '我的音乐创作之旅：从零到发布第一首歌', excerpt: '回顾这一年的音乐创作历程，从最初对音乐一无所知，到终于发布了属于自己的第一首原创歌曲...', date: '2025-03-20', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop', likes: 128, views: 2340 },
  { id: 2, title: '如何用免费工具制作高质量的音乐视频', excerpt: '分享一些我常用的免费视频制作工具和技巧，帮助独立音乐人低成本制作出专业级的MV...', date: '2025-03-15', cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop', likes: 95, views: 1850 },
  { id: 3, title: '最近在听什么？三月歌单推荐', excerpt: '每月一期的歌单推荐，这个月精选了10首让我单曲循环的好歌，涵盖电子、民谣、摇滚...', date: '2025-03-10', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop', likes: 203, views: 3120 },
];

// 板块入口
const sectionKeys = [
  { to: '/music', icon: Music, labelKey: 'home.sections.music', descKey: 'home.sections.musicDesc', color: 'from-green-500/20 to-green-900/20', iconColor: 'text-green-400' },
  { to: '/videos', icon: Video, labelKey: 'home.sections.videos', descKey: 'home.sections.videosDesc', color: 'from-red-500/20 to-red-900/20', iconColor: 'text-red-400' },
  { to: '/forum', icon: MessageSquare, labelKey: 'home.sections.forum', descKey: 'home.sections.forumDesc', color: 'from-blue-500/20 to-blue-900/20', iconColor: 'text-blue-400' },
  { to: '/shop', icon: ShoppingBag, labelKey: 'home.sections.shop', descKey: 'home.sections.shopDesc', color: 'from-orange-500/20 to-orange-900/20', iconColor: 'text-orange-400' },
  { to: '/live', icon: Radio, labelKey: 'home.sections.live', descKey: 'home.sections.liveDesc', color: 'from-purple-500/20 to-purple-900/20', iconColor: 'text-purple-400' },
  { to: '/membership', icon: Crown, labelKey: 'home.sections.membership', descKey: 'home.sections.membershipDesc', color: 'from-yellow-500/20 to-yellow-900/20', iconColor: 'text-yellow-400' },
  { to: '/tasks', icon: Target, labelKey: 'home.sections.tasks', descKey: 'home.sections.tasksDesc', color: 'from-amber-500/20 to-orange-900/20', iconColor: 'text-amber-400' },
];

// 粒子组件
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4,
    tx: (Math.random() - 0.5) * 200,
    ty: -(Math.random() * 150 + 50),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-primary/60"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size,
            '--tx': `${p.tx}px`, '--ty': `${p.ty}px`,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }} />
      ))}
    </div>
  );
}

// 数据统计动画
function AnimatedCounter({ target, label, icon: Icon }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center group">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl glass-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} className="text-primary" />
      </div>
      <p className="text-3xl font-black text-white mb-1">{count.toLocaleString()}+</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('home.title'));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
      });
    };
    const el = heroRef.current;
    if (el) el.addEventListener('mousemove', handleMouse);
    return () => { if (el) el.removeEventListener('mousemove', handleMouse); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ===== HERO — Windsurf 科技感风格 ===== */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* 动态渐变光球 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-gradient-to-br from-primary/30 to-cyan-500/10 animate-glow"
            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }} />
          <div className="absolute w-[500px] h-[500px] top-1/3 right-0 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/10 animate-glow"
            style={{ animationDelay: '2s', transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }} />
          <div className="absolute w-[400px] h-[400px] bottom-0 left-1/3 rounded-full bg-gradient-to-br from-blue-500/15 to-primary/10 animate-glow"
            style={{ animationDelay: '4s', transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }} />
        </div>

        {/* 网格线背景 */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* 粒子 */}
        <Particles />

        {/* 主内容 */}
        <div className="relative z-10 smart-container-md text-center">
          {/* 标签行 */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fadeIn">
            <span className="px-4 py-1.5 glass-strong rounded-full text-xs font-medium text-primary flex items-center gap-1.5">
              <Sparkles size={12} /> {t('home.tagIndependent')}
            </span>
            <span className="px-4 py-1.5 glass-strong rounded-full text-xs font-medium text-purple-400">{t('home.tagCreator')}</span>
            <span className="px-4 py-1.5 glass-strong rounded-full text-xs font-medium text-cyan-400">{t('home.tagDigital')}</span>
          </div>

          {/* 大标题 */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-6 tracking-tight">
            <span className="block text-white">{t('home.heroTitle1')}</span>
            <span className="block text-gradient">{t('home.heroTitle2')}</span>
          </h1>

          {/* 副标题 */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
            {t('home.heroDesc')}
            <br className="hidden md:block" />
            {t('home.heroDesc2')}
          </p>

          {/* CTA 按钮 */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/music"
              className="group relative px-8 py-4 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-[0_0_40px_rgba(29,185,84,0.3)] flex items-center gap-2">
              <Headphones size={18} /> {t('home.listenNow')}
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30 group-hover:opacity-0" />
            </Link>
            <Link to="/videos"
              className="px-8 py-4 glass-strong hover:bg-white/10 text-white font-semibold rounded-full text-[15px] transition-all flex items-center gap-2">
              {t('home.exploreMore')} <ArrowRight size={16} />
            </Link>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-4 gap-6 max-w-lg mx-auto">
            <AnimatedCounter target={12} label={t('home.originalSongs')} icon={Music} />
            <AnimatedCounter target={50} label={t('home.videoWorks')} icon={Video} />
            <AnimatedCounter target={10000} label={t('home.followers')} icon={Users} />
            <AnimatedCounter target={500000} label={t('home.totalPlays')} icon={TrendingUp} />
          </div>
        </div>

        {/* 底部渐变波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 1440 120" fill="none" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,100 1440,80 L1440,120 L0,120 Z" fill="#0a0a0f" />
            <path d="M0,80 C360,40 720,100 1080,60 C1260,40 1380,50 1440,60 L1440,120 L0,120 Z" fill="#0a0a0f" fillOpacity="0.5" />
          </svg>
        </div>
      </section>

      {/* ===== 板块入口网格 ===== */}
      <section className="relative smart-container py-20">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 glass-strong rounded-full text-xs font-medium text-primary mb-4">{t('home.navLabel')}</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{t('home.exploreWorld')}</h2>
          <p className="text-text-secondary max-w-lg mx-auto text-base">{t('home.exploreWorldDesc')}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {sectionKeys.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.to} to={s.to}
                className="group relative rounded-2xl p-6 lg:p-8 border border-white/[0.06] bg-white/[0.02] hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(29,185,84,0.12)] overflow-hidden">
                {/* 悬浮渐变背景 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent group-hover:from-primary/5 transition-all duration-500" />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon size={24} className={s.iconColor} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{t(s.labelKey)}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">{t(s.descKey)}</p>
                  <div className="flex items-center gap-1.5 text-sm text-text-muted group-hover:text-primary transition-colors">
                    <span className="font-medium">{t('home.enter')}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== 最新动态 ===== */}
      <section className="smart-container py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 glass-strong rounded-full text-xs font-medium text-primary mb-3">{t('home.blogTitle')}</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">{t('home.latestUpdates')}</h2>
            <p className="text-text-muted mt-2">{t('home.latestUpdatesDesc')}</p>
          </div>
          <Link to="/forum" className="flex items-center gap-1.5 px-5 py-2.5 glass-strong rounded-full text-sm text-primary hover:bg-primary/10 font-medium transition-all">
            {t('home.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article key={post.id} className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={post.cover} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-[11px] text-white/70">
                  <span className="flex items-center gap-1"><Clock size={11} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {post.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Heart size={11} /> {post.likes}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-white line-clamp-2 mb-2.5 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-text-muted group-hover:text-primary transition-colors">
                  <span className="font-medium">{t('home.readMore')}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="relative smart-container py-16">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-purple-600/20 to-cyan-500/25 animate-gradient" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />
          <div className="absolute inset-0 bg-[#0a0a0f]/40 backdrop-blur-sm" />
          <div className="relative px-8 lg:px-16 py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Crown size={32} className="text-yellow-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-text-secondary max-w-lg mx-auto mb-10 text-base leading-relaxed">{t('home.ctaDesc')}</p>
            <Link to="/membership"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-full text-base transition-all hover:shadow-[0_0_50px_rgba(234,179,8,0.3)] hover:-translate-y-0.5">
              <Crown size={18} /> {t('home.joinMember')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 页脚 ===== */}
      <footer className="border-t border-white/[0.04] mt-8 pt-16 pb-10 px-4">
        <div className="smart-container">
          {/* 上部：Logo + 导航 + 社交 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* 品牌 */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"><span className="text-black font-black text-lg">M</span></div>
                <span className="font-bold text-white text-lg tracking-tight">MySpace</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">{t('home.footer.brand')}</p>
            </div>
            {/* 快速导航 */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">{t('home.footer.explore')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {[{ to: '/music', labelKey: 'home.sections.music' }, { to: '/videos', labelKey: 'home.sections.videos' }, { to: '/forum', labelKey: 'home.sections.forum' }, { to: '/shop', labelKey: 'home.sections.shop' }, { to: '/live', labelKey: 'home.sections.live' }, { to: '/membership', labelKey: 'home.sections.membership' }].map((item) => (
                  <Link key={item.to} to={item.to} className="text-sm text-text-muted hover:text-primary transition-colors py-1">{t(item.labelKey)}</Link>
                ))}
              </div>
            </div>
            {/* 联系方式 */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">{t('home.footer.contact')}</h4>
              <div className="space-y-2 text-sm text-text-muted">
                <p>{t('home.footer.emailLabel')}</p>
                <p>{t('home.footer.wechat')}</p>
                <p>{t('home.footer.weibo')}</p>
              </div>
            </div>
          </div>
          {/* 分隔线 + 版权 */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-text-muted">© {new Date().getFullYear()} MySpace. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] text-text-muted">
              <span className="hover:text-white cursor-pointer transition-colors">{t('home.footer.privacy')}</span>
              <span className="hover:text-white cursor-pointer transition-colors">{t('home.footer.terms')}</span>
              <span className="hover:text-white cursor-pointer transition-colors">{t('home.footer.help')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
