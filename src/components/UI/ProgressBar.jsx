// 通用进度条组件 — 支持多种颜色、条纹动画、文字标签
// 用法: <ProgressBar value={75} max={100} color="primary" striped animated showLabel />
export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary',
  height = 'h-2',
  rounded = 'rounded-full',
  striped = false,
  animated = false,
  showLabel = false,
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  // 颜色映射
  const colorMap = {
    primary: 'bg-primary',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gradient: 'bg-gradient-to-r from-primary via-emerald-400 to-cyan-400',
  };

  const barColor = colorMap[color] || color;

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
          <span className="font-semibold">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className={`${height} ${rounded} bg-white/[0.06] overflow-hidden`}>
        <div
          className={`${height} ${rounded} ${barColor} transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${pct}%` }}
        >
          {/* 条纹效果 */}
          {striped && (
            <div
              className={`absolute inset-0 ${animated ? 'animate-[stripeMove_1s_linear_infinite]' : ''}`}
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                backgroundSize: '1rem 1rem',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
