import { create } from 'zustand';
import { songsData } from '../data/songs';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchSongs as fetchSongsApi,
  fetchFavorites as fetchFavoritesApi,
  toggleFavoriteApi,
  rateSongApi,
  incrementPlays,
  fetchComments as fetchCommentsApi,
  addCommentApi,
  subscribeComments,
} from '../lib/supabaseService';

// 歌曲/收藏/评分/评论状态管理（支持 Supabase / 本地双模式）
const useSongStore = create((set, get) => ({
  // 所有歌曲
  songs: songsData,
  // 收藏的歌曲ID列表
  favorites: [],
  // 用户评分记录 { songId: rating }
  userRatings: {},
  // 搜索关键词
  searchQuery: '',
  // 当前分类筛选
  activeGenre: '全部',
  // 当前页面
  activePage: 'home',
  // 歌曲详情弹窗
  detailSong: null,
  // 数据加载状态
  songsLoading: false,
  // Realtime 取消订阅句柄
  _commentUnsub: null,

  // ========== 初始化：从 Supabase 拉取歌曲 ==========
  initSongs: async () => {
    if (!isSupabaseConfigured) return;
    set({ songsLoading: true });
    const data = await fetchSongsApi();
    if (data.length > 0) set({ songs: data });
    set({ songsLoading: false });
  },

  // 初始化收藏（需传入 userId）
  initFavorites: async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    const favIds = await fetchFavoritesApi(userId);
    set({ favorites: favIds });
  },

  // ========== 收藏 ==========
  toggleFavorite: async (songId, userId) => {
    const isFav = get().favorites.includes(songId);
    // 乐观更新本地
    set((state) => ({
      favorites: isFav
        ? state.favorites.filter((id) => id !== songId)
        : [...state.favorites, songId],
    }));
    // Supabase 同步
    if (isSupabaseConfigured && userId) {
      await toggleFavoriteApi(userId, songId, isFav);
    }
  },

  // 是否已收藏
  isFavorite: (songId) => get().favorites.includes(songId),

  // ========== 评分 ==========
  rateSong: async (songId, rating, userId) => {
    set((state) => ({
      userRatings: { ...state.userRatings, [songId]: rating },
    }));
    if (isSupabaseConfigured && userId) {
      await rateSongApi(userId, songId, rating);
    }
  },

  // ========== 播放计数 ==========
  incrementPlay: async (songId) => {
    // 本地自增
    set((state) => ({
      songs: state.songs.map((s) =>
        s.id === songId ? { ...s, play_count: (s.play_count || s.plays || 0) + 1 } : s
      ),
    }));
    if (isSupabaseConfigured) await incrementPlays(songId);
  },

  // ========== 评论 ==========
  addComment: async (songId, comment, userId) => {
    // 本地即时添加
    set((state) => ({
      songs: state.songs.map((song) =>
        song.id === songId
          ? { ...song, comments: [comment, ...(song.comments || [])] }
          : song
      ),
    }));
    // Supabase 同步
    if (isSupabaseConfigured && userId) {
      await addCommentApi(userId, songId, comment.content || comment.text);
    }
  },

  // 加载歌曲评论（Supabase 模式）
  loadComments: async (songId) => {
    if (!isSupabaseConfigured) return;
    const comments = await fetchCommentsApi(songId);
    set((state) => ({
      songs: state.songs.map((song) =>
        song.id === songId ? { ...song, comments } : song
      ),
    }));
  },

  // 订阅评论实时更新
  subscribeToComments: (songId) => {
    // 先取消旧订阅
    get()._commentUnsub?.unsubscribe?.();
    if (!isSupabaseConfigured) return;
    const sub = subscribeComments(songId, (newComment) => {
      set((state) => ({
        songs: state.songs.map((song) =>
          song.id === songId
            ? { ...song, comments: [newComment, ...(song.comments || [])] }
            : song
        ),
      }));
    });
    set({ _commentUnsub: sub });
  },

  // 取消评论订阅
  unsubscribeComments: () => {
    get()._commentUnsub?.unsubscribe?.();
    set({ _commentUnsub: null });
  },

  // 点赞评论
  likeComment: (songId, commentId) => set((state) => ({
    songs: state.songs.map((song) =>
      song.id === songId
        ? {
            ...song,
            comments: (song.comments || []).map((c) =>
              c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            ),
          }
        : song
    ),
  })),

  // 设置搜索
  setSearchQuery: (query) => set({ searchQuery: query }),

  // 设置分类
  setActiveGenre: (genre) => set({ activeGenre: genre }),

  // 设置当前页面
  setActivePage: (page) => set({ activePage: page }),

  // 打开歌曲详情
  openDetail: (song) => set({ detailSong: song }),

  // 关闭歌曲详情
  closeDetail: () => set({ detailSong: null }),

  // 获取筛选后的歌曲列表
  getFilteredSongs: () => {
    const { songs, searchQuery, activeGenre } = get();
    let filtered = songs;
    if (activeGenre !== '全部') {
      filtered = filtered.filter((s) => s.genre === activeGenre);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          (s.album || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  // 获取收藏的歌曲
  getFavoriteSongs: () => {
    const { songs, favorites } = get();
    return songs.filter((s) => favorites.includes(s.id));
  },
}));

export default useSongStore;
