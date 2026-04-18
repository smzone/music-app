import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Repeat1, Shuffle,
  ChevronUp, ChevronDown, Heart, Share2, ListMusic, Music, Mic2
} from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import useSongStore from '../../store/useSongStore';
import useAuthStore from '../../store/useAuthStore';
import { formatDuration } from '../../data/songs';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../../store/useThemeStore';

export default function MusicPlayer() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const {
    playlist, currentIndex, isPlaying, currentTime, volume, isMuted, playMode, showPlayer,
    togglePlay, nextSong, prevSong, setCurrentTime, setVolume, toggleMute, togglePlayMode,
  } = usePlayerStore();
  const { toggleFavorite, isFavorite } = useSongStore();
  const authUser = useAuthStore((s) => s.user);

  const [expanded, setExpanded] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const intervalRef = useRef(null);
  const lyricsRef = useRef(null);
  const song = playlist[currentIndex];

  // 模拟歌词数据（按时间轴）
  const lyricsData = useMemo(() => [
    { time: 0, text: '♪ ♪ ♪' },
    { time: 5, text: t('player.lyricIntro') },
    { time: 12, text: t('player.lyric1') },
    { time: 20, text: t('player.lyric2') },
    { time: 28, text: t('player.lyric3') },
    { time: 36, text: t('player.lyric4') },
    { time: 44, text: '♪ ♪ ♪' },
    { time: 52, text: t('player.lyric5') },
    { time: 60, text: t('player.lyric6') },
    { time: 68, text: t('player.lyric7') },
    { time: 76, text: t('player.lyric8') },
    { time: 84, text: '♪ ♪ ♪' },
    { time: 92, text: t('player.lyric9') },
    { time: 100, text: t('player.lyric10') },
    { time: 110, text: t('player.lyricOutro') },
  ], [t]);

  // 当前歌词行索引
  const currentLyricIdx = useMemo(() => {
    let idx = 0;
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsData[i].time) { idx = i; break; }
    }
    return idx;
  }, [currentTime, lyricsData]);

  // 切歌时自动计数播放量
  const prevSongIdRef = useRef(null);
  useEffect(() => {
    if (song && song.id !== prevSongIdRef.current) {
      prevSongIdRef.current = song.id;
      useSongStore.getState().incrementPlay(song.id);
    }
  }, [song]);

  // 模拟播放进度
  useEffect(() => {
    if (isPlaying && song) {
      intervalRef.current = setInterval(() => {
        usePlayerStore.setState((state) => {
          const newTime = state.currentTime + 1;
          if (newTime >= song.duration) {
            nextSong();
            return { currentTime: 0 };
          }
          return { currentTime: newTime };
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, song, nextSong]);

  if (!showPlayer || !song) return null;

  const progress = song.duration > 0 ? (currentTime / song.duration) * 100 : 0;
  const fav = isFavorite(song.id);

  const playModeIcon = {
    normal: <Repeat size={18} className="text-text-muted" />,
    shuffle: <Shuffle size={18} className="text-primary" />,
    repeat: <Repeat size={18} className="text-primary" />,
    repeatOne: <Repeat1 size={18} className="text-primary" />,
  };
  const playModeLabel = { normal: t('player.normal'), shuffle: t('player.shuffle'), repeat: t('player.repeat'), repeatOne: t('player.repeatOne') };

  const handleShare = () => {
    navigator.clipboard?.writeText(`${song.title} - ${song.artist}`);
    toast.success(t('player.copiedLink'));
  };

  return (
    <>
      {/* ===== 迷你播放器（底部固定）===== */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-30
          transition-transform duration-300 backdrop-blur-xl border-t
          ${isLight ? 'bg-white/90 border-black/[0.08] shadow-[0_-2px_20px_rgba(0,0,0,0.06)]' : 'bg-[#0a0a0f]/90 border-white/[0.06]'}
          ${expanded ? 'translate-y-full' : 'translate-y-0'}
        `}
      >
        {/* 进度条 — 悬浮可拖拽 */}
        <div className={`h-1 group cursor-pointer relative -mt-0.5 ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.floor(pct * song.duration));
          }}>
          <div className="h-full bg-primary transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(29,185,84,0.5)]" />
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* 歌曲信息 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
            <div className="relative">
              <img src={song.cover} alt={song.title} className={`w-11 h-11 rounded-lg object-cover ${isPlaying ? 'shadow-[0_0_12px_rgba(29,185,84,0.2)]' : ''}`} />
              {isPlaying && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                  <div className="flex items-end gap-[1px] h-2">
                    <div className="w-[2px] bg-black rounded-full animate-[barBounce_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                    <div className="w-[2px] bg-black rounded-full animate-[barBounce_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
                    <div className="w-[2px] bg-black rounded-full animate-[barBounce_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold line-clamp-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{song.title}</p>
              <p className="text-xs text-text-muted line-clamp-1">{song.artist}</p>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => toggleFavorite(song.id, authUser?.id)} className={`p-2 hidden sm:block rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.05]'}`}>
              <Heart size={17} className={fav ? 'fill-primary text-primary' : `text-text-muted ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`} />
            </button>
            <button onClick={prevSong} className={`p-2 hidden sm:block rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.05]'}`}>
              <SkipBack size={17} className={isLight ? 'text-gray-900' : 'text-white'} />
            </button>
            <button onClick={togglePlay} className="p-2.5 bg-primary hover:bg-primary-hover rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(29,185,84,0.15)]">
              {isPlaying ? <Pause size={17} className="text-black" /> : <Play size={17} className="text-black ml-0.5" />}
            </button>
            <button onClick={nextSong} className={`p-2 hidden sm:block rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.05]'}`}>
              <SkipForward size={17} className={isLight ? 'text-gray-900' : 'text-white'} />
            </button>
          </div>

          {/* 时间 + 展开 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted hidden md:block font-mono">{formatDuration(currentTime)} / {formatDuration(song.duration)}</span>
            <button onClick={() => setExpanded(true)} className={`p-2 rounded-lg text-text-muted transition-colors ${isLight ? 'hover:bg-black/[0.04] hover:text-gray-900' : 'hover:bg-white/[0.05] hover:text-white'}`}>
              <ChevronUp size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 全屏播放器 ===== */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col animate-slideUp overflow-hidden">
          {/* 背景：模糊封面 + 渐变 */}
          <div className="absolute inset-0">
            <img src={song.cover} alt="" className="w-full h-full object-cover scale-110 blur-3xl opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0a0a0f]/95 to-[#0a0a0f]" />
          </div>

          {/* 顶栏 */}
          <div className="relative flex items-center justify-between px-6 py-5">
            <button onClick={() => setExpanded(false)} className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-widest">{t('player.nowPlaying')}</p>
              <p className="text-xs text-text-secondary font-medium mt-0.5">{song.genre || t('player.musicGenre')}</p>
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ListMusic size={18} />
            </button>
          </div>

          {/* 内容区 — 桌面端双栏布局 */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto scrollbar-none">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 w-full max-w-4xl mx-auto">
              {/* 左侧：封面 + 唱片旋转效果 */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative">
                  {/* 光晕 */}
                  <div className={`absolute -inset-6 bg-primary/10 rounded-full blur-3xl transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                  {/* 唱片底盘 */}
                  <div className={`absolute inset-0 w-64 h-64 sm:w-72 sm:h-72 rounded-full border-[6px] border-white/[0.04] transition-all duration-1000 ${isPlaying ? 'scale-105 opacity-100' : 'scale-100 opacity-0'}`}
                    style={{ animation: isPlaying ? 'spin 8s linear infinite' : 'none' }}>
                    <div className="absolute inset-0 rounded-full" style={{ background: 'repeating-radial-gradient(circle, transparent 0px, transparent 8px, rgba(255,255,255,0.02) 9px)' }} />
                  </div>
                  <img src={song.cover} alt={song.title}
                    className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-1000 ${isPlaying ? 'scale-100' : 'scale-95'}`} />
                  {/* 频谱条 */}
                  {isPlaying && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-5">
                      {[60, 100, 40, 80, 55, 90, 45].map((h, i) => (
                        <div key={i} className="w-[3px] bg-primary rounded-full animate-[barBounce_0.8s_ease-in-out_infinite]"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* 歌曲信息 */}
                <div className="mt-8 text-center w-full max-w-xs">
                  <h2 className="text-2xl font-black text-white line-clamp-1 tracking-tight">{song.title}</h2>
                  <p className="text-text-muted mt-1.5 text-base">{song.artist}</p>
                </div>

                {/* 操作栏 */}
                <div className="flex items-center gap-5 mt-4">
                  <button onClick={() => toggleFavorite(song.id, authUser?.id)} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${fav ? 'bg-primary/15' : 'bg-white/[0.05] hover:bg-white/[0.1]'}`}>
                      <Heart size={18} className={fav ? 'fill-primary text-primary' : 'text-text-muted'} />
                    </div>
                    <span className="text-[10px] text-text-muted">{fav ? t('player.collected') : t('player.collect')}</span>
                  </button>
                  <button onClick={handleShare} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                      <Share2 size={18} className="text-text-muted" />
                    </div>
                    <span className="text-[10px] text-text-muted">{t('player.share')}</span>
                  </button>
                  <button onClick={togglePlayMode} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playMode !== 'normal' ? 'bg-primary/15' : 'bg-white/[0.05] hover:bg-white/[0.1]'}`}>
                      {playModeIcon[playMode]}
                    </div>
                    <span className="text-[10px] text-text-muted">{playModeLabel[playMode]}</span>
                  </button>
                  <button onClick={() => setShowLyrics(!showLyrics)} className="flex flex-col items-center gap-1 lg:hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showLyrics ? 'bg-primary/15' : 'bg-white/[0.05] hover:bg-white/[0.1]'}`}>
                      <Mic2 size={18} className={showLyrics ? 'text-primary' : 'text-text-muted'} />
                    </div>
                    <span className="text-[10px] text-text-muted">{t('player.lyrics')}</span>
                  </button>
                </div>
              </div>

              {/* 右侧：歌词面板（桌面端始终可见，移动端切换） */}
              <div className={`flex-1 min-w-0 w-full max-w-sm lg:max-w-none ${showLyrics ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Mic2 size={14} className="text-primary" />
                  <span className="text-xs text-text-muted font-medium uppercase tracking-widest">{t('player.lyrics')}</span>
                </div>
                <div ref={lyricsRef} className="h-48 lg:h-64 overflow-y-auto scrollbar-none space-y-3 mask-gradient">
                  {lyricsData.map((line, i) => (
                    <p key={i} onClick={() => setCurrentTime(line.time)}
                      className={`text-base lg:text-lg cursor-pointer transition-all duration-500 leading-relaxed ${
                        i === currentLyricIdx
                          ? 'text-primary font-bold scale-105 origin-left'
                          : i < currentLyricIdx
                            ? 'text-text-muted/40'
                            : 'text-text-muted/60 hover:text-text-secondary'
                      }`}>
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full max-w-4xl mt-6">
              <div className="relative h-1.5 bg-white/[0.08] rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(Math.floor(pct * song.duration));
                }}>
                <div className="h-full bg-primary rounded-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-text-muted mt-2 font-mono">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(song.duration)}</span>
              </div>
            </div>

            {/* 控制栏 */}
            <div className="flex items-center gap-8 mt-4">
              <button onClick={prevSong} className="p-2 hover:bg-white/[0.05] rounded-full transition-colors">
                <SkipBack size={26} className="text-white" />
              </button>
              <button onClick={togglePlay}
                className="p-5 bg-primary hover:bg-primary-hover rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(29,185,84,0.2)]">
                {isPlaying ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-black ml-1" />}
              </button>
              <button onClick={nextSong} className="p-2 hover:bg-white/[0.05] rounded-full transition-colors">
                <SkipForward size={26} className="text-white" />
              </button>
            </div>

            {/* 音量 + 播放列表 */}
            <div className="flex items-center gap-6 mt-5 w-full max-w-md">
              <button onClick={toggleMute} className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors shrink-0">
                {isMuted ? <VolumeX size={17} className="text-text-muted" /> : <Volume2 size={17} className="text-text-muted" />}
              </button>
              <div className="flex-1 relative h-1 bg-white/[0.08] rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                }}>
                <div className="h-full bg-white/40 rounded-full" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${(isMuted ? 0 : volume) * 100}%`, transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
            </div>

            {/* 播放列表快捷 */}
            {playlist.length > 1 && (
              <div className="mt-5 w-full max-w-md">
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1"><Music size={11} /> {t('player.playlist')} ({playlist.length})</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {playlist.slice(0, 10).map((s, i) => (
                    <button key={s.id} onClick={() => { usePlayerStore.setState({ currentIndex: i, currentTime: 0 }); if (!isPlaying) togglePlay(); }}
                      className={`shrink-0 w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={s.cover} alt={s.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
