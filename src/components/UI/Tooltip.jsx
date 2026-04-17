import { useState, useRef, useEffect } from 'react';

// 通用 Tooltip 提示组件 — 悬停显示，支持上下左右定位
// 用法: <Tooltip content="提示文字"><button>hover me</button></Tooltip>
export default function Tooltip({ children, content, position = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  // 计算定位
  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0, left = 0;
    switch (position) {
      case 'top':
        top = trigger.top - tooltip.height - gap;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case 'bottom':
        top = trigger.bottom + gap;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case 'left':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.left - tooltip.width - gap;
        break;
      case 'right':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.right + gap;
        break;
      default:
        break;
    }

    // 防止溢出屏幕
    left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
    top = Math.max(8, top);

    setCoords({ top, left });
  }, [visible, position]);

  // 清理定时器
  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!content) return children;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </div>
      {visible && (
        <div
          ref={tooltipRef}
          className="fixed z-[99999] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg pointer-events-none animate-fadeIn whitespace-nowrap"
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
          {/* 小三角箭头 */}
          <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
            position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
            position === 'left' ? '-right-1 top-1/2 -translate-y-1/2' :
            '-left-1 top-1/2 -translate-y-1/2'
          }`} />
        </div>
      )}
    </>
  );
}
