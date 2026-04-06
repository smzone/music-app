import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import useAuthStore from './store/useAuthStore';
import useSongStore from './store/useSongStore';

// 初始化 Supabase 认证监听（如已配置）
useAuthStore.getState().initAuth();

// 初始化歌曲数据（Supabase 模式下从远端拉取）
useSongStore.getState().initSongs();

// 登录后初始化收藏列表
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id && state.user?.id !== prevState.user?.id) {
    useSongStore.getState().initFavorites(state.user.id);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
