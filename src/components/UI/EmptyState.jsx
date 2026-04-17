import { Inbox } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

// 通用空状态组件 — 用于列表/搜索结果为空时的友好提示
// 用法: <EmptyState icon={Music} title="暂无歌曲" description="快去添加你的第一首歌曲吧" action={<button>添加</button>} />
export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
        isLight ? 'bg-black/[0.03]' : 'bg-white/[0.04]'
      }`}>
        <Icon size={28} className="text-text-muted opacity-50" />
      </div>
      {title && (
        <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-700' : 'text-white/70'}`}>{title}</h3>
      )}
      {description && (
        <p className="text-sm text-text-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}
