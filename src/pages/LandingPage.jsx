import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, Share2, ChevronDown, Music, Headphones, Award, Users, ArrowRight, Sparkles } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import useSongStore from '../store/useSongStore';
import useAuthStore from '../store/useAuthStore';
import { getAverageRating, formatDuration } from '../data/songs';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';

// Hero 区域 — 沉浸式科技感
function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* 多层动态渐变 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-gradient-to-br from-primary/25 to-cyan-500/10 blur-3xl animate-glow" />
        <div className="absolute w-[500px] h-[500px] top-1/3 right-0 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/10 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute w-[400px] h-[400px] bottom-0 left-1/3 rounded-full bg-gradient-to-br from-blue-500/15 to-primary/10 blur-3xl animate-glow" style={{ animationDelay: '4s' }} />
      </div>
      {/* 网格线 */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 text-center smart-container-md animate-fadeIn">
        {/* 标签 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm rounded-full text-xs font-medium text-primary flex items-center gap-1.5">
            <Sparkles size={12} /> {t('landing.tagIndependent')}
          </span>
          <span className="px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm rounded-full text-xs font-medium text-purple-400">{t('landing.tagCreator')}</span>
        </div>

        {/* 头像 */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-[0_0_40px_rgba(29,185,84,0.15)] border-2 border-primary/30">
          <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face" alt="艺术家头像" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-[1.1] tracking-tight">
          {t('landing.heroTitle')}<span className="text-gradient">{t('landing.heroTitleHighlight')}</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('landing.heroDesc')}<br className="hidden md:block" />
          {t('landing.heroDesc2')}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="#music"
            className="group relative px-8 py-4 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-[0_0_40px_rgba(29,185,84,0.3)] flex items-center gap-2">
            <Headphones size={18} /> {t('landing.listenMusic')}
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30 group-hover:opacity-0" />
          </a>
          <a href="#about"
            className="px-8 py-4 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-semibold rounded-full text-[15px] transition-all flex items-center gap-2">
            {t('landing.learnMore')} <ArrowRight size={15} />
          </a>
        </div>

        <div className="mt-20 animate-bounce">
          <ChevronDown size={24} className="mx-auto text-text-muted" />
        </div>
      </div>

      {/* 底部渐变波浪 */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 1440 120" fill="none" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,100 1440,80 L1440,120 L0,120 Z" fill="#0a0a0f" />
        </svg>
      </div>
    </section>
  );
}

// 统计数据 — 卡片化
function StatsSection() {
  const { t } = useTranslation();
  const stats = [
    { icon: Music, value: '10+', labelKey: 'landing.stats.songs', color: 'from-green-500/20 to-green-900/10' },
    { icon: Headphones, value: '500K+', labelKey: 'landing.stats.plays', color: 'from-blue-500/20 to-blue-900/10' },
    { icon: Award, value: '4.8', labelKey: 'landing.stats.rating', color: 'from-yellow-500/20 to-yellow-900/10' },
    { icon: Users, value: '10K+', labelKey: 'landing.stats.fans', color: 'from-purple-500/20 to-purple-900/10' },
  ];

  return (
    <section className="py-20 bg-[#0a0a0f]">
      <div className="smart-container grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="text-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Icon size={22} className="text-primary" />
              </div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-sm text-text-muted mt-1">{t(stat.labelKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// 关于我 — 增强视觉
function AboutSection() {
  const { t } = useTranslation();
  const aboutGenres = ['electronic', 'pop', 'synthwave', 'folk', 'rock'];
  return (
    <section id="about" className="py-24 px-6 bg-[#0a0a0f]">
      <div className="smart-container grid md:grid-cols-2 gap-14 items-center">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-3xl blur-xl" />
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=700&fit=crop"
            alt={t('landing.aboutTag')}
            className="relative rounded-3xl w-full object-cover aspect-[4/5] border border-white/[0.06]"
          />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.2)]">
            <Music size={32} className="text-black" />
          </div>
        </div>
        <div>
          <span className="inline-block px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-xs font-medium text-primary mb-4">{t('landing.aboutTag')}</span>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight">
            {t('landing.aboutTitle')}<span className="text-gradient">{t('landing.aboutTitleHighlight')}</span>
          </h2>
          <p className="text-text-muted text-base leading-relaxed mb-5">
            {t('landing.aboutP1')}
          </p>
          <p className="text-text-muted text-base leading-relaxed mb-8">
            {t('landing.aboutP2')}
          </p>
          <div className="flex gap-2 flex-wrap">
            {aboutGenres.map((g) => (
              <span key={g} className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-text-muted hover:text-primary hover:border-primary/20 transition-all cursor-pointer">{t(`music.genre.${g}`)}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 精选歌曲卡片（Landing 专用）
function FeaturedSongCard({ song, index }) {
  const { t } = useTranslation();
  const { playSong, playlist, currentIndex, isPlaying, togglePlay } = usePlayerStore();
  const { toggleFavorite, isFavorite, openDetail } = useSongStore();
  const authUser = useAuthStore((s) => s.user);

  const isCurrentSong = playlist[currentIndex]?.id === song.id;
  const fav = isFavorite(song.id);
  const avgRating = getAverageRating(song.ratings);

  const handlePlay = () => {
    if (isCurrentSong) { togglePlay(); }
    else { playSong(song); }
  };

  return (
    <div className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => openDetail(song)}>
        <img src={song.cover} alt={song.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* 序号标记 */}
        <div className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
          <span className="text-sm font-bold text-white">{index + 1}</span>
        </div>
        {/* 播放按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePlay(); }}
          className="absolute bottom-4 right-4 p-4 bg-primary rounded-full shadow-[0_0_20px_rgba(29,185,84,0.3)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 translate-y-2 group-hover:translate-y-0"
        >
          {isCurrentSong && isPlaying ? <Pause size={20} className="text-black" /> : <Play size={20} className="text-black ml-0.5" />}
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-white line-clamp-1 cursor-pointer hover:text-primary transition-colors" onClick={() => openDetail(song)}>
          {song.title}
        </h3>
        <p className="text-sm text-text-muted mt-1">{song.artist} · {song.album}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <span className="text-sm">★</span>
            <span className="text-sm font-semibold text-white">{avgRating}</span>
            <span className="text-[11px] text-text-muted">({song.ratings.length})</span>
          </div>
          <span className="text-xs text-text-muted bg-white/[0.04] px-2 py-0.5 rounded">{formatDuration(song.duration)}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
          <button
            onClick={() => { toggleFavorite(song.id, authUser?.id); toast.success(fav ? t('landing.collected') : t('landing.collect')); }}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <Heart size={15} className={fav ? 'fill-primary text-primary' : ''} />
            {fav ? t('landing.collected') : t('landing.collect')}
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(`${song.title} - ${song.artist}`); toast.success(t('landing.copiedLink')); }}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors"
          >
            <Share2 size={13} /> {t('landing.share')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 歌曲展示区
function MusicSection() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const [showAll, setShowAll] = useState(false);
  const displaySongs = showAll ? songs : songs.slice(0, 6);

  return (
    <section id="music" className="py-24 px-6 bg-[#0a0a0f]">
      <div className="smart-container">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-xs font-medium text-primary mb-4">{t('landing.worksTag')}</span>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t('landing.worksTitle')}</h2>
          <p className="text-text-muted max-w-xl mx-auto text-base">{t('landing.worksDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySongs.map((song, i) => (
            <FeaturedSongCard key={song.id} song={song} index={i} />
          ))}
        </div>

        {songs.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3.5 border border-primary/50 text-primary font-bold rounded-full hover:bg-primary hover:text-black transition-all text-[15px] hover:shadow-[0_0_30px_rgba(29,185,84,0.15)]"
            >
              {showAll ? t('landing.collapse') : t('landing.viewAllSongs', { count: songs.length })}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// 联系区 — CTA风格
function ContactSection() {
  const { t } = useTranslation();
  return (
    <section id="contact" className="py-24 px-6 bg-[#0a0a0f]">
      <div className="smart-container-md">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/15 to-cyan-500/20" />
          <div className="absolute inset-0 bg-[#0a0a0f]/50 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />
          <div className="relative px-8 lg:px-16 py-20 text-center">
            <span className="inline-block px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-xs font-medium text-primary mb-4">{t('landing.contactTag')}</span>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t('landing.contactTitle')}</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-10 text-base leading-relaxed">
              {t('landing.contactDesc')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a href="mailto:contact@example.com" className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.2)] flex items-center gap-2">
                {t('landing.sendEmail')}
              </a>
              <a href="#" className="px-8 py-3.5 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-semibold rounded-full text-[15px] transition-all">
                {t('landing.followSocial')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 页脚
function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-white/[0.04] py-10 px-6 bg-[#0a0a0f]">
      <div className="smart-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <span className="text-black font-black text-sm">M</span>
          </div>
          <span className="font-bold text-white">MySpace</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <a href="#about" className="hover:text-primary transition-colors">{t('landing.navAbout')}</a>
          <a href="#music" className="hover:text-primary transition-colors">{t('landing.navSongs')}</a>
          <a href="#contact" className="hover:text-primary transition-colors">{t('landing.navContact')}</a>
          <Link to="/login" className="hover:text-primary transition-colors">{t('nav.login')}</Link>
        </div>
        <p className="text-[11px] text-text-muted">© {new Date().getFullYear()} MySpace. All rights reserved.</p>
      </div>
    </footer>
  );
}

// 顶部导航栏
function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/[0.04]' : 'bg-transparent'}`}>
      <div className="smart-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(29,185,84,0.3)] transition-shadow">
            <span className="text-black font-black text-lg">M</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">MySpace</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/[0.04]">
          <a href="#about" className="px-4 py-2 rounded-xl text-[13px] text-text-muted hover:text-white hover:bg-white/[0.04] transition-all font-medium">{t('landing.navAbout')}</a>
          <a href="#music" className="px-4 py-2 rounded-xl text-[13px] text-text-muted hover:text-white hover:bg-white/[0.04] transition-all font-medium">{t('landing.navSongs')}</a>
          <a href="#contact" className="px-4 py-2 rounded-xl text-[13px] text-text-muted hover:text-white hover:bg-white/[0.04] transition-all font-medium">{t('landing.navContact')}</a>
          <Link to="/login" className="px-5 py-2 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl text-[13px] transition-all ml-1">
            {t('nav.login')}
          </Link>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

// Landing 主页面
export default function LandingPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('landing.title'));
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <MusicSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
