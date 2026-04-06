import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore, { hasRole, ROLES } from './store/useAuthStore';
import SongDetail from './components/Song/SongDetail';
import ScrollToTop from './components/Layout/ScrollToTop';
import PageLoader from './components/Layout/PageLoader';
import ErrorBoundary from './components/Layout/ErrorBoundary';
import CursorGlow from './components/Effects/CursorGlow';

// 主布局（非懒加载，保证导航即时可见）
import MainLayout from './components/Layout/MainLayout';

// 前台页面 — React.lazy 路由级代码分割，按需加载
const HomePage = lazy(() => import('./pages/HomePage'));
const MusicPage = lazy(() => import('./pages/MusicPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ForumPostPage = lazy(() => import('./pages/ForumPostPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const LivePage = lazy(() => import('./pages/LivePage'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const TaskHallPage = lazy(() => import('./pages/TaskHallPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ReleasesPage = lazy(() => import('./pages/ReleasesPage'));
const ReleaseDetailPage = lazy(() => import('./pages/ReleaseDetailPage'));

// 管理后台 — 按需加载
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const SongsManagePage = lazy(() => import('./pages/admin/SongsManagePage'));
const ForumManagePage = lazy(() => import('./pages/admin/ForumManagePage'));
const UsersManagePage = lazy(() => import('./pages/admin/UsersManagePage'));
const ProfileEditPage = lazy(() => import('./pages/admin/ProfileEditPage'));
const SectionsPage = lazy(() => import('./pages/admin/SectionsPage'));
const PlaylistsPage = lazy(() => import('./pages/admin/PlaylistsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));

// 路由守卫：需要登录
function AuthGuard({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// 路由守卫：需要指定最低角色等级
// minRole: ROLES.USER / ROLES.VIP / ROLES.MODERATOR / ROLES.ADMIN
function RoleGuard({ minRole, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(user.role, minRole)) return <Navigate to="/access-denied" replace />;
  return children;
}

function App() {
  return (
    <ErrorBoundary>
    <CursorGlow />
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#282828', color: '#fff', borderRadius: '8px', fontSize: '14px' },
          duration: 2000,
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 带顶部导航的前台页面 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<ForumPostPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/tasks" element={<TaskHallPage />} />
            <Route path="/profile" element={<AuthGuard><UserProfilePage /></AuthGuard>} />
            <Route path="/releases" element={<ReleasesPage />} />
            <Route path="/releases/:id" element={<ReleaseDetailPage />} />
          </Route>

          {/* 独立页面（无顶部导航） */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 权限不足页 */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* 管理后台（版主及以上可进入，具体子页面按权限控制） */}
          <Route path="/admin" element={<RoleGuard minRole={ROLES.MODERATOR}><AdminLayout /></RoleGuard>}>
            <Route index element={<DashboardPage />} />
            <Route path="songs" element={<SongsManagePage />} />
            <Route path="forum" element={<ForumManagePage />} />
            <Route path="users" element={<UsersManagePage />} />
            <Route path="profile" element={<ProfileEditPage />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="playlists" element={<PlaylistsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 通配路由 — 所有未匹配的路径 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* 全局歌曲详情弹窗 */}
      <SongDetail />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
