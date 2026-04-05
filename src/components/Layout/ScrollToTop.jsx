import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 路由切换时自动滚动到页面顶部
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
