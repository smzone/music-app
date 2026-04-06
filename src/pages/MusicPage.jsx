import { useState, useMemo, useCallback } from 'react';
import { Play, Heart, Star, Search, ListMusic, Shuffle, Clock, Disc3, TrendingUp, Headphones, BarChart3, Music, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SongContextMenu from '../components/Song/SongContextMenu';
import usePlayerStore from '../store/usePlayerStore';
import useSongStore from '../store/useSongStore';
import useAuthStore from '../store/useAuthStore';
import { genreKeys, formatDuration, getAverageRating } from '../data/songs';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 歌曲行组件 — 增强视觉效果 + 右键菜单
function SongRow({ song, index, onContextMenu }) {
  const { t } = useTranslation();
  const { playSong, playlist, currentIndex, isPlaying, togglePlay } = usePlayerStore();
  const { toggleFavorite, isFavorite } = useSongStore();
  const authUser = useAuthStore((s) => s.user);
  const isCurrentSong = playlist[currentIndex]?.id === song.id;
  const fav = isFavorite(song.id);

  const handlePlay = () => {
    if (isCurrentSong) togglePlay();
    else playSong(song);
  };

  return (
    <div onContextMenu={(e) => onContextMenu(e, song)}
      className={`group grid grid-cols-[36px_1fr_1fr_72px_72px_36px] gap-4 px-4 py-3 rounded-xl items-center transition-all duration-200 ${isCurrentSong ? 'bg-primary/10 shadow-[inset_0_0_20px_rgba(29,185,84,0.05)]' : 'hover:bg-white/[0.03]'}`}>
      <div className="text-center">
        {isCurrentSong && isPlaying ? (
          <button onClick={handlePlay} className="mx-auto">
            <div className="flex items-end justify-center gap-[2px] h-4">
              <div className="w-[3px] bg-primary rounded-full animate-[barBounce_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
              <div className="w-[3px] bg-primary rounded-full animate-[barBounce_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
              <div className="w-[3px] bg-primary rounded-full animate-[barBounce_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
            </div>
          </button>
        ) : (
          <>
            <span className="group-hover:hidden text-sm text-text-muted font-mono">{String(index + 1).padStart(2, '0')}</span>
            <button onClick={handlePlay} className="hidden group-hover:block mx-auto">
              <Play size={15} className="text-white ml-0.5" />
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img src={song.cover} alt={song.title} className={`w-11 h-11 rounded-lg object-cover transition-all ${isCurrentSong ? 'shadow-[0_0_15px_rgba(29,185,84,0.3)]' : ''}`} />
          {isCurrentSong && <div className="absolute inset-0 rounded-lg ring-2 ring-primary/40" />}
        </div>
        <div className="min-w-0">
          <p className={`text-[14px] font-semibold truncate ${isCurrentSong ? 'text-primary' : 'text-white'}`}>{song.title}</p>
          <p className="text-[12px] text-text-muted truncate mt-0.5">{song.artist}</p>
        </div>
      </div>
      <span className="text-[13px] text-text-muted truncate hidden md:block">{song.album}</span>
      <div className="flex items-center gap-1 text-star">
        <Star size={11} className="fill-star" />
        <span className="text-xs font-medium">{getAverageRating(song.ratings)}</span>
      </div>
      <span className="text-[13px] text-text-muted font-mono">{formatDuration(song.duration)}</span>
      <button onClick={() => { toggleFavorite(song.id, authUser?.id); toast.success(fav ? t('music.unfavorited') : t('music.favorited')); }}
        className="transition-transform hover:scale-110">
        <Heart size={15} className={fav ? 'fill-primary text-primary' : 'text-text-muted hover:text-white transition-colors'} />
      </button>
    </div>
  );
}

export default function MusicPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('music.title'));
  const [activeGenre, setActiveGenre] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, song }
  const { setPlaylist, playSong } = usePlayerStore();
  const { songs, songsLoading, toggleFavorite, isFavorite } = useSongStore();
  const authUser = useAuthStore((s) => s.user);

  // 右键菜单
  const handleContextMenu = useCallback((e, song) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, song });
  }, []);

  const closeCtxMenu = useCallback(() => setCtxMenu(null), []);

  const ctxActions = ctxMenu ? {
    play: () => playSong(ctxMenu.song),
    playNext: () => {
      const store = usePlayerStore.getState();
      const newList = [...store.playlist];
      const insertIdx = store.currentIndex + 1;
      newList.splice(insertIdx, 0, ctxMenu.song);
      usePlayerStore.setState({ playlist: newList });
      toast.success(t('music.ctx.addedNext'));
    },
    addToQueue: () => {
      const store = usePlayerStore.getState();
      usePlayerStore.setState({ playlist: [...store.playlist, ctxMenu.song] });
      toast.success(t('music.ctx.addedToQueue'));
    },
    toggleFav: () => {
      toggleFavorite(ctxMenu.song.id, authUser?.id);
      toast.success(isFavorite(ctxMenu.song.id) ? t('music.unfavorited') : t('music.favorited'));
    },
    isFav: isFavorite(ctxMenu.song.id),
    share: () => {
      navigator.clipboard.writeText(`${window.location.origin}/songs/${ctxMenu.song.id}`);
      toast.success(t('player.copiedLink'));
    },
    download: () => toast(t('music.ctx.downloadTip'), { icon: '📥' }),
    startRadio: () => {
      const sameSongs = songs.filter(s => s.genre === ctxMenu.song.genre).sort(() => Math.random() - 0.5);
      setPlaylist(sameSongs, 0);
      toast.success(t('music.ctx.radioStarted'));
    },
    detail: () => navigate(`/songs/${ctxMenu.song.id}`),
  } : {};

  const filtered = useMemo(() => songs.filter((s) => {
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const matchSearch = !searchQ || s.title.toLowerCase().includes(searchQ.toLowerCase()) || s.artist.toLowerCase().includes(searchQ.toLowerCase());
    return matchGenre && matchSearch;
  }), [songs, activeGenre, searchQ]);

  // 热门歌曲（按评分排序前5）
  const hotSongs = useMemo(() =>
    [...songs].sort((a, b) => getAverageRating(b.ratings || []) - getAverageRating(a.ratings || [])).slice(0, 5),
  [songs]);

  // 统计数据
  const totalDuration = useMemo(() => {
    const total = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}${t('music.hour')}${m}${t('music.minute')}`;
  }, [songs, t]);

  const handlePlayAll = () => {
    if (filtered.length === 0) return;
    setPlaylist(filtered, 0);
    toast.success(t('music.playingCount', { count: filtered.length }));
  };

  const handleShuffle = () => {
    if (filtered.length === 0) return;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setPlaylist(shuffled, 0);
    toast.success(t('music.shuffleOn'));
  };

  return (
    <div className="smart-container pt-8 pb-12">
      {/* ===== Hero 区域 — 沉浸式渐变 ===== */}
      <div className="relative rounded-3xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-emerald-900/30 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(29,185,84,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="relative flex flex-col md:flex-row md:items-end gap-7 p-8 lg:p-10">
          <div className="w-44 h-44 lg:w-52 lg:h-52 rounded-2xl bg-gradient-to-br from-primary via-emerald-600 to-green-900 flex items-center justify-center shadow-[0_20px_60px_rgba(29,185,84,0.3)] shrink-0 relative group">
            <ListMusic size={60} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors" />
          </div>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
              <Disc3 size={11} className="inline mr-1" /> {t('music.badge')}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">{t('music.heroTitle')}</h1>
            <p className="text-text-secondary mb-5 text-base">{t('music.heroDesc', { count: songs.length, duration: totalDuration })}</p>
            <div className="flex items-center gap-3">
              <button onClick={handlePlayAll}
                className="flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.3)] text-[15px]">
                <Play size={20} /> {t('music.playAll')}
              </button>
              <button onClick={handleShuffle}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-full transition-all backdrop-blur-sm text-[15px]">
                <Shuffle size={18} /> {t('music.shuffle')}
              </button>
            </div>
          </div>
          {/* 右侧统计数据 */}
          <div className="hidden lg:flex items-center gap-6 text-center pb-2">
            <div>
              <p className="text-2xl font-black text-white">{songs.length}</p>
              <p className="text-xs text-text-muted mt-1">{t('music.songs')}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-white">{totalDuration}</p>
              <p className="text-xs text-text-muted mt-1">{t('music.totalDuration')}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-white">{genreKeys.length - 1}</p>
              <p className="text-xs text-text-muted mt-1">{t('music.styles')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧：主内容区 */}
        <div className="flex-1 min-w-0">
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder={t('music.search')}
                className="w-full bg-white/[0.04] text-white pl-10 pr-4 py-2.5 rounded-full outline-none border border-white/[0.06] focus:border-primary text-sm placeholder:text-text-muted transition-colors" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {genreKeys.map((g) => (
                <button key={g} onClick={() => setActiveGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeGenre === g ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'bg-white/[0.04] text-text-secondary hover:text-white hover:bg-white/[0.08]'}`}>
                  {t(`music.genre.${g}`)}
                </button>
              ))}
            </div>
          </div>

          {/* 歌曲列表 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
            {/* 表头 */}
            <div className="grid grid-cols-[36px_1fr_1fr_72px_72px_36px] gap-4 px-4 py-2.5 text-[11px] text-text-muted font-semibold uppercase tracking-wider border-b border-white/[0.05] mb-1">
              <span className="text-center">#</span>
              <span>{t('music.song')}</span>
              <span className="hidden md:block">{t('music.album')}</span>
              <span>{t('music.rating')}</span>
              <span><Clock size={12} className="inline" /></span>
              <span></span>
            </div>
            {songsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {filtered.map((song, i) => <SongRow key={song.id} song={song} index={i} onContextMenu={handleContextMenu} />)}
                {filtered.length === 0 && (
                  <div className="py-20 text-center text-text-muted">
                    <Music size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t('music.noResults')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 右侧：热门推荐 */}
        <div className="lg:w-72 shrink-0 space-y-6">
          {/* 热门歌曲 Top 5 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <TrendingUp size={16} className="text-primary" /> {t('music.hotRanking')}
            </h3>
            <div className="space-y-2.5">
              {hotSongs.map((song, i) => {
                const { playSong } = usePlayerStore.getState();
                return (
                  <button key={song.id} onClick={() => playSong(song)}
                    className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/[0.04] transition-colors group text-left">
                    <span className={`text-sm font-black w-5 ${i < 3 ? 'text-primary' : 'text-text-muted'}`}>{i + 1}</span>
                    <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover shrink-0 group-hover:shadow-lg transition-shadow" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-white truncate group-hover:text-primary transition-colors">{song.title}</p>
                      <p className="text-[11px] text-text-muted truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-star shrink-0">
                      <Star size={10} className="fill-star" />
                      <span className="text-[11px] font-medium">{getAverageRating(song.ratings)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 收听统计 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <BarChart3 size={16} className="text-primary" /> {t('music.listeningData')}
            </h3>
            <div className="space-y-4">
              {[
                { labelKey: 'music.todayPlays', value: '328', icon: Headphones, color: 'text-green-400', bg: 'bg-green-500/10' },
                { labelKey: 'music.weekPlays', value: '2.1k', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { labelKey: 'music.favSongs', value: '156', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon size={16} className={stat.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted">{t(stat.labelKey)}</p>
                      <p className="text-sm font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 风格分布 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <Disc3 size={16} className="text-primary" /> {t('music.genreDistribution')}
            </h3>
            <div className="space-y-3">
              {genreKeys.filter((g) => g !== 'all').map((g) => {
                const count = songs.filter((s) => s.genre === g).length;
                const pct = songs.length > 0 ? Math.round((count / songs.length) * 100) : 0;
                return (
                  <div key={g}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">{t(`music.genre.${g}`)}</span>
                      <span className="text-xs text-text-muted">{count}{t('music.songsUnit')}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 右键上下文菜单 */}
      {ctxMenu && (
        <SongContextMenu
          x={ctxMenu.x} y={ctxMenu.y} song={ctxMenu.song}
          onClose={closeCtxMenu} actions={ctxActions}
        />
      )}
    </div>
  );
}
