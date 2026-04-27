import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import useAuthStore from './store/useAuthStore';
import useSongStore from './store/useSongStore';
import useNotificationStore from './store/useNotificationStore';
import { logError, isChunkLoadError } from './lib/errorLogger';

// =====================================================================
// 全局错误兜底 — 在 React 渲染层之外的错误（异步、Promise、加载失败）
// 也会被记录到 errorLogger，方便用户复制问题给开发者
// =====================================================================
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    // chunk-load 错误由 ErrorBoundary 处理（自动 reload），此处仅记录
    logError({ source: 'window', error: e?.error || e?.message || 'window error' });
    if (isChunkLoadError(e?.error)) {
      // 静默：等待 ErrorBoundary 自愈或下次刷新
    }
  });
  window.addEventListener('unhandledrejection', (e) => {
    logError({ source: 'promise', error: e?.reason || 'unhandled rejection' });
  });
}

// 初始化 Supabase 认证监听（如已配置）
useAuthStore.getState().initAuth();

// 初始化歌曲数据（Supabase 模式下从远端拉取）
useSongStore.getState().initSongs();

// 登录/登出时初始化相关 stores
useAuthStore.subscribe((state, prevState) => {
  const userId = state.user?.id;
  const prevUserId = prevState.user?.id;
  if (userId && userId !== prevUserId) {
    // 登录：初始化收藏 + 通知
    useSongStore.getState().initFavorites(userId);
    useNotificationStore.getState().refreshUnreadCount(userId);
    useNotificationStore.getState().subscribe(userId);
  }
  if (!userId && prevUserId) {
    // 登出：清空通知
    useNotificationStore.getState().reset();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
