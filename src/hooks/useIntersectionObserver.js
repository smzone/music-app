import { useState, useEffect, useRef } from 'react';

// IntersectionObserver Hook — 检测元素是否进入视口
// 用法: const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
//       <div ref={ref} className={isVisible ? 'animate-fadeIn' : 'opacity-0'}>...</div>
export default function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}
