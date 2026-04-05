import { useState, useEffect } from 'react';

// 页面滚动进度条 — 显示在导航栏顶部，使用 CSS 硬件加速
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 transition-[width] duration-150 ease-out will-change-[width]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
