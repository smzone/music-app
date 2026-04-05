import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import useAuthStore from './store/useAuthStore';

// 初始化 Supabase 认证监听（如已配置）
useAuthStore.getState().initAuth();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
