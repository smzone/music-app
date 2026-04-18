import { Home, Search, Library, Heart, X, Bell, Play, Pause, SkipForward } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import usePlayerStore from '../../store/usePlayerStore';
import useThemeStore from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';

const navItems = [
  { id: 'home', key: 'nav.home', icon: Home },
  { id: 'search', key: 'nav.music', icon: Search },
  { id: 'library', key: 'nav.music', icon: Library },
  { id: 'favorites', key: 'sidebar.favorites', icon: Heart, badge: 'favCount' },
  { id: 'notifications', key: 'nav.notifications', icon: Bell, badge: 'unreadCount' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { activePage, setActivePage, favorites } = useSongStore();
  const { user, openAuth, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { playlist, currentIndex, isPlaying, togglePlay, nextSong, showPlayer } = usePlayerStore();
  const currentSong = playlist[currentIndex];
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const badgeValues = { favCount: favorites.length, unreadCount };

  const handleNav = (page) => {
    setActivePage(page);
    onClose?.();
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden ${isLight ? 'bg-black/30' : 'bg-black/60'}`}
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isLight ? 'bg-white border-r border-black/[0.08] shadow-[4px_0_20px_rgba(0,0,0,0.05)]' : 'bg-black'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>MySpace</h1>
          </div>
          <button onClick={onClose} className={`lg:hidden text-text-secondary p-1 ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}>
            <X size={22} />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-1
                  transition-all duration-200 text-[15px] font-medium
                  ${isActive
                    ? isLight
                      ? 'bg-primary/10 text-gray-900 shadow-sm'
                      : 'bg-surface-lighter text-white shadow-lg shadow-black/20'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]'
                      : 'text-text-secondary hover:text-white hover:bg-surface-light'
                  }
                `}
              >
                <Icon size={22} className={isActive ? 'text-primary' : ''} />
                <span className="flex-1">{t(item.key)}</span>
                {item.badge && badgeValues[item.badge] > 0 && (
                  <span className="min-w-[20px] h-5 bg-primary/20 text-primary text-[11px] font-bold rounded-full flex items-center justify-center px-1.5">
                    {badgeValues[item.badge]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 正在播放 mini widget */}
        {showPlayer && currentSong && (
          <div className={`mx-4 mb-3 p-3 rounded-2xl border transition-all ${
            isLight
              ? 'bg-primary/[0.04] border-primary/10'
              : 'bg-white/[0.03] border-white/[0.06]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  className={`w-11 h-11 rounded-lg object-cover ${isPlaying ? 'shadow-[0_0_12px_rgba(29,185,84,0.25)]' : ''}`}
                />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-primary/30 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentSong.title}</p>
                <p className="text-[11px] text-text-muted truncate">{currentSong.artist}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2.5">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary-hover transition-colors shadow-[0_2px_8px_rgba(29,185,84,0.3)]"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <button
                onClick={nextSong}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-text-muted transition-colors ${isLight ? 'bg-black/[0.04] hover:text-gray-900' : 'bg-white/[0.06] hover:text-white'}`}
              >
                <SkipForward size={13} />
              </button>
            </div>
          </div>
        )}

        {/* 用户信息 */}
        <div className={`px-5 py-5 border-t ${isLight ? 'border-black/[0.06]' : 'border-surface-lighter'}`}>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[15px] font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{user.username}</p>
                <button
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-danger transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-colors"
            >
              {t('nav.login')} / {t('nav.register')}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
