import { Home, Search, Library, Heart, X } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'search', label: '搜索', icon: Search },
  { id: 'library', label: '曲库', icon: Library },
  { id: 'favorites', label: '收藏', icon: Heart },
];

export default function Sidebar({ isOpen, onClose }) {
  const { activePage, setActivePage } = useSongStore();
  const { user, openAuth, logout } = useAuthStore();

  const handleNav = (page) => {
    setActivePage(page);
    onClose?.();
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-black z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <h1 className="text-xl font-bold text-white tracking-tight">音乐平台</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-white p-1">
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
                    ? 'bg-surface-lighter text-white shadow-lg shadow-black/20'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                  }
                `}
              >
                <Icon size={22} className={isActive ? 'text-primary' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="px-5 py-5 border-t border-surface-lighter">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-white truncate">{user.username}</p>
                <button
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-danger transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-colors"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
