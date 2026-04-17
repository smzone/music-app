import { useState, useRef, useEffect } from 'react';

// 图片懒加载组件 — IntersectionObserver 驱动，带 blur-up 渐入动画
// 用法: <LazyImage src="..." alt="..." className="w-full h-full object-cover" />
export default function LazyImage({ src, alt = '', className = '', wrapperClassName = '', placeholder, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  // IntersectionObserver 检测是否进入视口
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' } // 提前 200px 开始加载
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* 骨架占位 */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />
      )}
      {/* 自定义占位符 */}
      {placeholder && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          {placeholder}
        </div>
      )}
      {/* 实际图片 — 进入视口后才设置 src */}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}
