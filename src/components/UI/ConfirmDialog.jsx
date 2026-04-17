import { AlertTriangle, X } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

// 通用确认弹窗组件 — 支持危险/普通两种模式，适配 light/dark 主题
// 用法: <ConfirmDialog open={true} title="删除确认" message="..." onConfirm={fn} onCancel={fn} danger />
export default function ConfirmDialog({
  open, title, message, confirmText = '确认', cancelText = '取消',
  onConfirm, onCancel, danger = false, loading = false,
}) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={onCancel}>
      {/* 遮罩 */}
      <div className={`absolute inset-0 ${isLight ? 'bg-black/20' : 'bg-black/50'} backdrop-blur-sm animate-fadeIn`} />

      {/* 弹窗 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-2xl border p-6 animate-fadeIn ${
          isLight
            ? 'bg-white border-black/[0.08] shadow-[0_25px_65px_rgba(0,0,0,0.12)]'
            : 'bg-[#15151e] border-white/[0.08] shadow-[0_25px_65px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* 图标 */}
        {danger && (
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
        )}

        {/* 标题 + 内容 */}
        <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed mb-6">{message}</p>

        {/* 按钮组 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isLight
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_15px_rgba(239,68,68,0.25)]'
                : 'bg-primary hover:bg-primary-hover text-black shadow-[0_4px_15px_rgba(29,185,84,0.25)]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
