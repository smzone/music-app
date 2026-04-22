import { useState, useRef, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

// 图片懒加载组件 — IntersectionObserver 驱动，带 blur-up 渐入动画 + 错误回退
// 用法: <LazyImage src="..." alt="..." className="w-full h-full object-cover" />
export default function LazyImage({ src, alt = '', className = '', wrapperClassName = '', placeholder, fallbackSrc, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [errored, setErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);

  // src 变化时重置状态
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setCurrentSrc(src);
  }, [src]);

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

  // 图片加载失败处理：先尝试 fallbackSrc，仍失败则显示占位图标
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setErrored(false);
    } else {
      setErrored(true);
    }
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* 骨架占位 */}
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-white/[0.06]" />
      )}
      {/* 自定义占位符 */}
      {placeholder && !loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          {placeholder}
        </div>
      )}
      {/* 加载失败占位 */}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.04] text-text-muted gap-1">
          <ImageOff size={20} className="opacity-60" />
          <span className="text-[10px] opacity-60">无法加载</span>
        </div>
      )}
      {/* 实际图片 — 进入视口后才设置 src */}
      {inView && !errored && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}
