import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Music, User, ListMusic, Settings, LogOut, Menu, X, GripVertical, MessageSquare, Users, ExternalLink, Shield
} from 'lucide-react';
import useAuthStore, { hasRole, ROLES, hasPermission, PERMISSIONS } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

// minRole: 该菜单项需要的最低角色等级（不填则 MODERATOR 即可见）
const adminNav = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard', end: true },
  { to: '/admin/songs', icon: Music, labelKey: 'admin.nav.songs', permission: PERMISSIONS.MANAGE_SONGS },
  { to: '/admin/forum', icon: MessageSquare, labelKey: 'admin.nav.forum', permission: PERMISSIONS.MANAGE_FORUM },
  { to: '/admin/users', icon: Users, labelKey: 'admin.nav.users', permission: PERMISSIONS.MANAGE_USERS },
  { to: '/admin/profile', icon: User, labelKey: 'admin.nav.profile' },
  { to: '/admin/sections', icon: GripVertical, labelKey: 'admin.nav.sections', minRole: ROLES.ADMIN },
  { to: '/admin/playlists', icon: ListMusic, labelKey: 'admin.nav.playlists' },
  { to: '/admin/settings', icon: Settings, labelKey: 'admin.nav.settings', permission: PERMISSIONS.MANAGE_SETTINGS },
];

export default function AdminLayout() {
  const [sideOpen, setSideOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* 移动端遮罩 */}
      {sideOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* 侧边栏 */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0c0c14] border-r border-white/[0.04] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.04]">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
              <Shield size={14} className="text-black" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">{t('admin.title')}</h1>
          </Link>
          <button onClick={() => setSideOpen(false)} className="lg:hidden text-text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          {adminNav.filter((item) => {
            if (item.permission && !hasPermission(user?.role, item.permission)) return false;
            if (item.minRole && !hasRole(user?.role, item.minRole)) return false;
            return true;
          }).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSideOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 text-[13px] font-medium transition-all
                  ${isActive ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(29,185,84,0.05)]' : 'text-text-muted hover:text-white hover:bg-white/[0.04]'}
                `}
              >
                <Icon size={17} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-emerald-600/30 flex items-center justify-center text-base border border-white/[0.08]">{user?.avatar || '🎵'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username || t('admin.admin')}</p>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${
                user?.role === 'admin' ? 'text-red-400' : user?.role === 'moderator' ? 'text-purple-400' : 'text-primary'
              }`}>{user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-red-400 hover:bg-red-500/[0.05] transition-all rounded-lg">
            <LogOut size={15} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-5 lg:px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.04] shrink-0">
          <button onClick={() => setSideOpen(true)} className="lg:hidden text-text-muted hover:text-white p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
            <Menu size={20} />
          </button>
          <h2 className="text-base font-bold text-white">{t('admin.header')}</h2>
          <div className="flex-1" />
          <a href="/" target="_blank" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
            <ExternalLink size={13} /> {t('admin.viewSite')}
          </a>
        </header>
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
