import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Pause, Trash2, X, Music, ChevronLeft } from 'lucide-react';
import useHistoryStore from '../store/useHistoryStore';
import usePlayerStore from '../store/usePlayerStore';
import useSongStore from '../store/useSongStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../data/songs';
import LazyImage from '../components/UI/LazyImage';

// 格式化相对时间（中文友好）
function formatRelative(ts, t) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('history.justNow') || '刚刚';
  if (min < 60) return `${min} ${t('history.minAgo') || '分钟前'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${t('history.hrAgo') || '小时前'}`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ${t('history.dayAgo') || '天前'}`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('history.title') || '最近播放');

  const history = useHistoryStore((s) => s.history);
  const removeFromHistory = useHistoryStore((s) => s.removeFromHistory);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const songs = useSongStore((s) => s.songs);
  const { playSong, currentIndex, playlist, isPlaying, togglePlay } = usePlayerStore();
  const currentSong = playlist[currentIndex];

  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  // 匹配完整 song 对象（song store 中可能存在更多字段）
  const enhancedHistory = useMemo(() => {
    return history.map((h) => {
      const full = songs?.find((s) => s.id === h.id);
      return full ? { ...h, ...full, playedAt: h.playedAt } : h;
    });
  }, [history, songs]);

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t('history.confirmClear') || '确定要清空所有播放历史吗？')) {
      clearHistory();
    }
  };

  return (
    <div className="smart-container pt-8 pb-16 animate-fadeIn">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ChevronLeft size={16} /> {t('history.back') || '返回'}
      </button>

      {/* 头部 */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center">
            <Clock size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary">{t('history.title') || '最近播放'}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {t('history.subtitle', { count: history.length }) || `共 ${history.length} 首`}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isLight
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15 border border-red-500/20'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20'
            }`}
          >
            <Trash2 size={14} /> {t('history.clearAll') || '清空历史'}
          </button>
        )}
      </div>

      {/* 空状态 */}
      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <Music size={36} className="text-text-muted opacity-50" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">{t('history.empty') || '暂无播放历史'}</h2>
          <p className="text-text-muted text-sm mb-6 max-w-sm">
            {t('history.emptyDesc') || '开始听音乐，你的最近播放记录将会显示在这里'}
          </p>
          <button
            onClick={() => navigate('/music')}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-sm transition-all hover:shadow-[0_0_25px_rgba(29,185,84,0.25)]"
          >
            {t('history.goMusic') || '去听音乐'}
          </button>
        </div>
      )}

      {/* 列表 */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {enhancedHistory.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            const showPause = isCurrent && isPlaying;
            return (
              <div
                key={`${song.id}-${song.playedAt}`}
                className={`group flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer border-b last:border-b-0 ${
                  isLight ? 'border-black/[0.04] hover:bg-black/[0.02]' : 'border-white/[0.03] hover:bg-white/[0.03]'
                } ${isCurrent ? (isLight ? 'bg-primary/[0.04]' : 'bg-primary/[0.06]') : ''}`}
                onClick={() => handlePlay(song)}
              >
                {/* 序号 / 播放按钮 */}
                <div className="w-8 shrink-0 text-center">
                  <span className={`text-xs text-text-muted group-hover:hidden ${showPause ? 'hidden' : ''}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <button
                    className={`${showPause ? 'inline-flex' : 'hidden'} group-hover:inline-flex w-7 h-7 rounded-full items-center justify-center text-primary`}
                    onClick={(e) => { e.stopPropagation(); handlePlay(song); }}
                    aria-label="play"
                  >
                    {showPause ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                </div>

                {/* 封面 */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-light">
                  <LazyImage
                    src={song.cover}
                    alt={song.title}
                    wrapperClassName="w-full h-full absolute inset-0"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 歌曲信息 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">{song.artist}</p>
                </div>

                {/* 时长 / 播放时间 */}
                <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[90px]">
                  <span className="text-xs text-text-muted">{formatRelative(song.playedAt, t)}</span>
                  {song.duration != null && (
                    <span className="text-[11px] text-text-muted/70 mt-0.5">
                      {typeof song.duration === 'number' ? formatDuration(song.duration) : song.duration}
                    </span>
                  )}
                </div>

                {/* 移除按钮 */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromHistory(song.id); }}
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                    isLight ? 'hover:bg-black/[0.06] text-gray-500 hover:text-red-500' : 'hover:bg-white/[0.08] text-text-muted hover:text-red-400'
                  }`}
                  aria-label="remove"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
