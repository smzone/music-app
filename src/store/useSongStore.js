import { create } from 'zustand';
import { songsData } from '../data/songs';

// 歌曲/收藏/评分状态管理
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

  // 切换收藏
  toggleFavorite: (songId) => set((state) => {
    const isFav = state.favorites.includes(songId);
    return {
      favorites: isFav
        ? state.favorites.filter((id) => id !== songId)
        : [...state.favorites, songId],
    };
  }),

  // 是否已收藏
  isFavorite: (songId) => get().favorites.includes(songId),

  // 设置用户评分
  rateSong: (songId, rating) => set((state) => ({
    userRatings: { ...state.userRatings, [songId]: rating },
  })),

  // 添加评论
  addComment: (songId, comment) => set((state) => ({
    songs: state.songs.map((song) =>
      song.id === songId
        ? { ...song, comments: [comment, ...song.comments] }
        : song
    ),
  })),

  // 点赞评论
  likeComment: (songId, commentId) => set((state) => ({
    songs: state.songs.map((song) =>
      song.id === songId
        ? {
            ...song,
            comments: song.comments.map((c) =>
              c.id === commentId ? { ...c, likes: c.likes + 1 } : c
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
          s.album.toLowerCase().includes(q)
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
