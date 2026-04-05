import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

// 回到顶部浮动按钮 — 滚动超过 400px 后显示
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      className={`
        fixed bottom-24 right-6 z-40
        w-11 h-11 rounded-full
        bg-primary/90 hover:bg-primary text-black
        flex items-center justify-center
        shadow-[0_4px_20px_rgba(29,185,84,0.3)]
        hover:shadow-[0_6px_30px_rgba(29,185,84,0.4)]
        hover:-translate-y-0.5
        transition-all duration-300
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
      `}
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
