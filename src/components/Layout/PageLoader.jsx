import { Music } from 'lucide-react';

// 路由懒加载时的全屏加载骨架屏
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
      {/* 品牌 Logo 脉冲动画 */}
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.2)]">
          <Music size={28} className="text-black" />
        </div>
      </div>

      {/* 加载指示器 — 三点弹跳 */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            style={{
              animation: 'bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* 提示文字 */}
      <p className="text-sm text-text-muted animate-pulse">加载中...</p>

      {/* bounce 关键帧内联 */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
