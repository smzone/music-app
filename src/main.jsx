import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import useAuthStore from './store/useAuthStore';
import useSongStore from './store/useSongStore';
import useNotificationStore from './store/useNotificationStore';

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
