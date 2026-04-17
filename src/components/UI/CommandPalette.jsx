import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Film, MessageSquare, User, Home, ShoppingBag, Radio, Target, Gamepad2, Crown, Command } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import usePlayerStore from '../../store/usePlayerStore';
import useThemeStore from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';

// 快捷导航页面列表
const NAV_PAGES = [
  { id: 'home', path: '/', icon: Home, labelKey: 'nav.home' },
  { id: 'music', path: '/music', icon: Music, labelKey: 'nav.music' },
  { id: 'videos', path: '/videos', icon: Film, labelKey: 'nav.videos' },
  { id: 'forum', path: '/forum', icon: MessageSquare, labelKey: 'nav.forum' },
  { id: 'shop', path: '/shop', icon: ShoppingBag, labelKey: 'nav.shop' },
  { id: 'live', path: '/live', icon: Radio, labelKey: 'nav.live' },
  { id: 'tasks', path: '/tasks', icon: Target, labelKey: 'nav.tasks' },
  { id: 'releases', path: '/releases', icon: Gamepad2, labelKey: 'nav.releases' },
  { id: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile' },
  { id: 'membership', path: '/membership', icon: Crown, labelKey: 'nav.membership' },
];

// 全局搜索面板 — Ctrl+K / Cmd+K 唤起
export default function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const songs = useSongStore((s) => s.songs);
  const playSong = usePlayerStore((s) => s.playSong);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 打开/关闭快捷键
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K 或 Cmd+K 打开
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape 关闭
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 搜索结果 — 页面 + 歌曲
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = [];

    // 搜索页面
    const matchedPages = NAV_PAGES.filter((p) => {
      const label = t(p.labelKey).toLowerCase();
      return !q || label.includes(q) || p.id.includes(q) || p.path.includes(q);
    }).slice(0, q ? 5 : 4);

    matchedPages.forEach((p) => {
      items.push({ type: 'page', id: `page-${p.id}`, icon: p.icon, label: t(p.labelKey), path: p.path, desc: p.path });
    });

    // 搜索歌曲
    if (songs?.length > 0) {
      const matchedSongs = songs.filter((s) => {
        if (!q) return true;
        return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album?.toLowerCase().includes(q);
      }).slice(0, q ? 8 : 4);

      matchedSongs.forEach((s) => {
        items.push({ type: 'song', id: `song-${s.id}`, icon: Music, label: s.title, desc: s.artist, song: s, cover: s.cover });
      });
    }

    return items;
  }, [query, songs, t]);

  // 选中项变化时滚动
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // 执行选中项操作
  const executeItem = useCallback((item) => {
    setOpen(false);
    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'song') {
      playSong(item.song);
    }
  }, [navigate, playSong]);

  // 键盘导航
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      executeItem(results[selectedIdx]);
    }
  };

  // 确保选中项始终可见
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const activeEl = listEl.children[selectedIdx];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  if (!open) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
      {/* 背景遮罩 */}
      <div className={`absolute inset-0 ${isLight ? 'bg-black/20' : 'bg-black/50'} backdrop-blur-sm animate-fadeIn`} />

      {/* 面板 */}
      <div className="relative flex items-start justify-center pt-[15vh] px-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden animate-fadeIn ${
            isLight
              ? 'bg-white border-black/[0.08] shadow-[0_25px_65px_rgba(0,0,0,0.12)]'
              : 'bg-[#15151e] border-white/[0.08] shadow-[0_25px_65px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* 搜索输入框 */}
          <div className={`flex items-center gap-3 px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
            <Search size={20} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('commandPalette.placeholder') || '搜索歌曲、页面...'}
              className={`flex-1 bg-transparent outline-none text-[15px] placeholder:text-text-muted ${isLight ? 'text-gray-900' : 'text-white'}`}
            />
            <kbd className={`hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium ${
              isLight ? 'bg-black/[0.04] text-gray-500 border border-black/[0.08]' : 'bg-white/[0.06] text-text-muted border border-white/[0.08]'
            }`}>
              ESC
            </kbd>
          </div>

          {/* 搜索结果列表 */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2 px-2">
            {results.length === 0 && query && (
              <div className="py-10 text-center text-text-muted text-sm">
                {t('commandPalette.noResults') || '没有找到结果'}
              </div>
            )}

            {results.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === selectedIdx;
              return (
                <button
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isActive
                      ? isLight ? 'bg-black/[0.04]' : 'bg-white/[0.06]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* 图标/封面 */}
                  {item.cover ? (
                    <img src={item.cover} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-primary/10' : 'bg-white/[0.06]'
                    }`}>
                      <Icon size={16} className={item.type === 'page' ? 'text-primary' : 'text-text-muted'} />
                    </div>
                  )}
                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.label}</p>
                    <p className="text-xs text-text-muted truncate">{item.desc}</p>
                  </div>
                  {/* 类型标签 */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    item.type === 'song'
                      ? 'bg-primary/10 text-primary'
                      : isLight ? 'bg-black/[0.04] text-gray-500' : 'bg-white/[0.06] text-text-muted'
                  }`}>
                    {item.type === 'song' ? '♫' : '→'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className={`flex items-center justify-between px-5 py-2.5 text-[11px] text-text-muted border-t ${
            isLight ? 'border-black/[0.04] bg-gray-50/50' : 'border-white/[0.04] bg-white/[0.02]'
          }`}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[10px]">↑↓</kbd> {t('commandPalette.navigate') || '导航'}</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[10px]">↵</kbd> {t('commandPalette.select') || '选择'}</span>
            </div>
            <span className="flex items-center gap-1">
              <Command size={10} /> + K
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
