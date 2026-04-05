import { useEffect, useRef } from 'react';
import { Play, ListPlus, Heart, Share2, Info, SkipForward, Download, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * 歌曲右键上下文菜单
 * @param {{ x: number, y: number, song: object, onClose: () => void, actions: object }} props
 */
export default function SongContextMenu({ x, y, song, onClose, actions }) {
  const { t } = useTranslation();
  const menuRef = useRef(null);

  // 点击外部 / 滚动 / ESC 关闭菜单
  useEffect(() => {
    const handleClose = () => onClose();
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('click', handleClose);
    document.addEventListener('scroll', handleClose, true);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClose);
      document.removeEventListener('scroll', handleClose, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // 自动调整位置防止溢出屏幕
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) menuRef.current.style.left = `${x - rect.width}px`;
    if (rect.bottom > vh) menuRef.current.style.top = `${y - rect.height}px`;
  }, [x, y]);

  const menuItems = [
    { icon: Play, label: t('music.ctx.play'), action: actions.play },
    { icon: SkipForward, label: t('music.ctx.playNext'), action: actions.playNext },
    { icon: ListPlus, label: t('music.ctx.addToQueue'), action: actions.addToQueue },
    { divider: true },
    { icon: Heart, label: actions.isFav ? t('music.ctx.unfavorite') : t('music.ctx.favorite'), action: actions.toggleFav, highlight: actions.isFav },
    { icon: Share2, label: t('music.ctx.share'), action: actions.share },
    { icon: Download, label: t('music.ctx.download'), action: actions.download },
    { divider: true },
    { icon: Radio, label: t('music.ctx.startRadio'), action: actions.startRadio },
    { icon: Info, label: t('music.ctx.detail'), action: actions.detail },
  ];

  return (
    <div ref={menuRef}
      className="fixed z-[999] min-w-[200px] py-2 rounded-xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-fadeIn"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}>
      {/* 歌曲信息头 */}
      <div className="flex items-center gap-3 px-4 py-2.5 mb-1 border-b border-white/[0.06]">
        <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{song.title}</p>
          <p className="text-[11px] text-text-muted truncate">{song.artist}</p>
        </div>
      </div>
      {/* 菜单项 */}
      {menuItems.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1.5 mx-3 h-px bg-white/[0.06]" />
        ) : (
          <button key={i}
            onClick={() => { item.action?.(); onClose(); }}
            className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
              item.highlight ? 'text-primary hover:bg-primary/10' : 'text-text-secondary hover:text-white hover:bg-white/[0.06]'
            }`}>
            <item.icon size={15} className={item.highlight ? 'text-primary fill-primary' : ''} />
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
