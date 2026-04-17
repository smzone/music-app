import { useState, useEffect, useRef } from 'react';

// 数字跳动动画组件 — 从 0 平滑递增到目标值
// 用法: <AnimatedNumber value={1234} duration={800} />
export default function AnimatedNumber({ value, duration = 800, className = '', formatter }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = typeof value === 'number' ? value : 0;
    const diff = to - from;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo 缓动
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = from + diff * eased;
      setDisplay(Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatter ? formatter(display) : display.toLocaleString();

  return <span className={className}>{formatted}</span>;
}
