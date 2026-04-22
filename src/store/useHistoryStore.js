import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 最大保留最近播放数量
const MAX_HISTORY = 30;

// 最近播放历史 store（本地持久化）
const useHistoryStore = create(
  persist(
    (set, get) => ({
      // 播放历史列表，最近的在最前面
      history: [],

      // 添加一首歌到播放历史
      // 如果已存在则提升到最前面，总数限制为 MAX_HISTORY
      addToHistory: (song) => {
        if (!song || !song.id) return;
        const current = get().history;
        const filtered = current.filter((s) => s.id !== song.id);
        // 仅存必要字段，避免 localStorage 过大
        const slim = {
          id: song.id,
          title: song.title,
          artist: song.artist,
          cover: song.cover,
          duration: song.duration,
          playedAt: Date.now(),
        };
        const next = [slim, ...filtered].slice(0, MAX_HISTORY);
        set({ history: next });
      },

      // 移除某条记录
      removeFromHistory: (songId) => {
        set({ history: get().history.filter((s) => s.id !== songId) });
      },

      // 清空历史
      clearHistory: () => set({ history: [] }),

      // 获取最近 N 条（默认 10）
      getRecent: (n = 10) => get().history.slice(0, n),
    }),
    {
      name: 'music-app-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export default useHistoryStore;
