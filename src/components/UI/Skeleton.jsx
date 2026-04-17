// 通用骨架屏组件 — 支持多种形状，自动适配 light/dark 主题
// 用法: <Skeleton className="w-40 h-6" /> 或 <Skeleton circle size={48} />

export function Skeleton({ className = '', circle = false, size, style, ...props }) {
  const baseClass = 'animate-pulse bg-white/[0.06] rounded-lg';
  const shapeClass = circle ? 'rounded-full' : '';
  const sizeStyle = circle && size ? { width: size, height: size } : {};

  return (
    <div
      className={`${baseClass} ${shapeClass} ${className}`}
      style={{ ...sizeStyle, ...style }}
      {...props}
    />
  );
}

// 歌曲行骨架
export function SongRowSkeleton() {
  return (
    <div className="grid grid-cols-[36px_1fr_1fr_72px_72px_36px] gap-4 px-4 py-3 items-center">
      <Skeleton className="w-6 h-4 mx-auto" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="w-32 h-4 mb-1.5" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-24 h-3.5 hidden md:block" />
      <Skeleton className="w-8 h-3.5" />
      <Skeleton className="w-10 h-3.5" />
      <Skeleton className="w-5 h-5" />
    </div>
  );
}

// 卡片骨架（通用）
export function CardSkeleton({ aspect = 'square' }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
      <Skeleton className={`w-full ${aspect === 'square' ? 'aspect-square' : 'aspect-video'}`} />
      <div className="p-4">
        <Skeleton className="w-3/4 h-4 mb-2" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}

// 论坛帖子骨架
export function PostSkeleton() {
  return (
    <div className="p-5 border-b border-white/[0.04]">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton circle size={36} />
        <div>
          <Skeleton className="w-20 h-3.5 mb-1" />
          <Skeleton className="w-14 h-2.5" />
        </div>
      </div>
      <Skeleton className="w-4/5 h-5 mb-2" />
      <Skeleton className="w-full h-3.5 mb-1.5" />
      <Skeleton className="w-2/3 h-3.5" />
    </div>
  );
}

// 统计卡片骨架
export function StatCardSkeleton() {
  return (
    <div className="bg-surface-light rounded-2xl p-5 border border-surface-lighter">
      <Skeleton className="w-10 h-10 rounded-xl mb-3" />
      <Skeleton className="w-16 h-7 mb-1.5" />
      <Skeleton className="w-24 h-3" />
    </div>
  );
}

// 页面级骨架：音乐页
export function MusicPageSkeleton() {
  return (
    <div className="smart-container pt-8 pb-12 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-64 h-10 rounded-xl" />
      </div>
      {/* 分类标签 */}
      <div className="flex gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-20 h-9 rounded-full" />
        ))}
      </div>
      {/* 歌曲列表 */}
      {[...Array(8)].map((_, i) => (
        <SongRowSkeleton key={i} />
      ))}
    </div>
  );
}

// 页面级骨架：论坛
export function ForumPageSkeleton() {
  return (
    <div className="smart-container pt-8 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-28 h-10 rounded-full" />
      </div>
      <div className="flex gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-24 h-9 rounded-full" />
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
