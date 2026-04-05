import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, User, Crown, ChevronDown, Home, Music, Film, MessageSquare, ShoppingBag, Radio, LogOut, Settings, Target } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import MusicPlayer from '../Player/MusicPlayer';
import usePlayerStore from '../../store/usePlayerStore';
import ScrollProgress from './ScrollProgress';
import BackToTop from './BackToTop';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const navKeys = [
  { to: '/', key: 'nav.home', icon: Home, end: true },
  { to: '/music', key: 'nav.music', icon: Music },
  { to: '/videos', key: 'nav.videos', icon: Film },
  { to: '/forum', key: 'nav.forum', icon: MessageSquare },
  { to: '/shop', key: 'nav.shop', icon: ShoppingBag },
  { to: '/live', key: 'nav.live', icon: Radio },
  { to: '/tasks', key: 'nav.tasks', icon: Target },
];

export default function MainLayout() {
  useKeyboardShortcuts();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { showPlayer } = usePlayerStore();
  const location = useLocation();

  // 路由变化时关闭菜单
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* 跳过导航 — 无障碍快捷入口，Tab 键可见 */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-bold focus:text-sm">
        {t('nav.skipNav')}
      </a>

      {/* 顶部导航 */}
      <nav aria-label="主导航" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/[0.04]' : 'bg-[#0a0a0f]/80 backdrop-blur-md'}`}>
        <ScrollProgress />
        <div className="smart-container flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(29,185,84,0.3)] transition-shadow">
              <span className="text-black font-black text-lg">M</span>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block tracking-tight">MySpace</span>
          </Link>

          {/* 桌面导航 */}
          <div className="hidden lg:flex items-center gap-0.5 bg-white/[0.03] rounded-2xl p-1 border border-white/[0.04]">
            {navKeys.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-primary/15 text-primary shadow-[0_0_10px_rgba(29,185,84,0.08)]' : 'text-text-muted hover:text-white hover:bg-white/[0.04]'}`
                  }
                >
                  <Icon size={15} />
                  {t(item.key)}
                </NavLink>
              );
            })}
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-emerald-600/30 flex items-center justify-center text-sm border border-white/[0.1]">{user.avatar || '🎵'}</div>
                  <span className="text-sm text-white hidden sm:block font-medium">{user.username}</span>
                  <ChevronDown size={13} className={`text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-14 w-56 bg-[#15151e] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] border border-white/[0.08] z-50 py-2 animate-fadeIn">
                      {/* 用户信息头部 */}
                      <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{user.role === 'admin' ? t('common.admin') : t('common.user')}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/[0.04] transition-colors mx-1 rounded-lg">
                          <Settings size={15} /> {t('nav.admin')}
                        </Link>
                      )}
                      <Link to="/membership" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-yellow-400 hover:bg-white/[0.04] transition-colors mx-1 rounded-lg">
                        <Crown size={15} className="text-yellow-500" /> {t('nav.membership')}
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors mx-1 rounded-lg">
                        <User size={15} /> {t('nav.profile')}
                      </Link>
                      <div className="border-t border-white/[0.06] my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-red-400 hover:bg-red-500/[0.05] transition-colors mx-1 rounded-lg">
                        <LogOut size={15} /> {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-text-muted hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">{t('nav.login')}</Link>
                <Link to="/register" className="text-sm bg-primary hover:bg-primary-hover text-black font-bold px-5 py-2 rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.2)]">{t('nav.register')}</Link>
              </div>
            )}

            {/* 语言切换 */}
            <LanguageSwitcher />

            {/* 移动端汉堡菜单 */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-colors">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* 移动端导航 — 滑入动画 */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-white/[0.06]">
            <div className="px-4 py-3 space-y-1">
              {navKeys.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all ${isActive ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'}`
                    }>
                    <Icon size={18} />
                    {t(item.key)}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 页面内容（顶部留出导航高度） — 路由切换淡入动画 */}
      <main id="main-content" className={`pt-16 ${showPlayer ? 'pb-20' : ''}`} key={location.pathname}>
        <div className="animate-page-in">
          <Outlet />
        </div>
      </main>

      {/* 全局音乐播放器 */}
      <MusicPlayer />

      {/* 回到顶部浮动按钮 */}
      <BackToTop />
    </div>
  );
}
