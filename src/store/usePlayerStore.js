import { create } from 'zustand';
import { songsData } from '../data/songs';

// 播放器状态管理
const usePlayerStore = create((set, get) => ({
  // 当前播放列表
  playlist: songsData,
  // 当前播放歌曲索引
  currentIndex: 0,
  // 是否正在播放
  isPlaying: false,
  // 当前播放时间（秒）
  currentTime: 0,
  // 音量 0-1
  volume: 0.7,
  // 是否静音
  isMuted: false,
  // 播放模式: 'normal' | 'shuffle' | 'repeat' | 'repeatOne'
  playMode: 'normal',
  // 是否显示播放器
  showPlayer: false,

  // 获取当前歌曲
  currentSong: () => {
    const state = get();
    return state.playlist[state.currentIndex] || null;
  },

  // 播放指定歌曲
  playSong: (song) => {
    const state = get();
    const index = state.playlist.findIndex((s) => s.id === song.id);
    if (index !== -1) {
      set({ currentIndex: index, isPlaying: true, currentTime: 0, showPlayer: true });
    } else {
      set({ playlist: [song, ...state.playlist], currentIndex: 0, isPlaying: true, currentTime: 0, showPlayer: true });
    }
  },

  // 播放/暂停切换
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying, showPlayer: true })),

  // 下一首
  nextSong: () => set((state) => {
    const { playlist, currentIndex, playMode } = state;
    if (playMode === 'repeatOne') return { currentTime: 0 };
    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      return { currentIndex: randomIndex, currentTime: 0, isPlaying: true };
    }
    const nextIndex = (currentIndex + 1) % playlist.length;
    return { currentIndex: nextIndex, currentTime: 0, isPlaying: true };
  }),

  // 上一首
  prevSong: () => set((state) => {
    const { playlist, currentIndex } = state;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    return { currentIndex: prevIndex, currentTime: 0, isPlaying: true };
  }),

  // 设置当前时间
  setCurrentTime: (time) => set({ currentTime: time }),

  // 设置音量
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  // 切换静音
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // 设置播放列表并播放指定索引
  setPlaylist: (list, index = 0) => set({
    playlist: list,
    currentIndex: index,
    currentTime: 0,
    isPlaying: true,
    showPlayer: true,
  }),

  // 切换播放模式
  togglePlayMode: () => set((state) => {
    const modes = ['normal', 'shuffle', 'repeat', 'repeatOne'];
    const currentModeIndex = modes.indexOf(state.playMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    return { playMode: nextMode };
  }),
}));

export default usePlayerStore;
