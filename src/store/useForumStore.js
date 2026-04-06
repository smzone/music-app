import { create } from 'zustand';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchForumPosts,
  fetchForumPost,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  fetchForumReplies,
  createForumReply,
  deleteForumReply,
  togglePostLike,
  checkPostLiked,
  subscribeForumReplies,
} from '../lib/supabaseService';

// 论坛帖子/回复状态管理（支持 Supabase / 本地双模式）
const useForumStore = create((set, get) => ({
  // 帖子列表
  posts: [],
  // 总帖子数（分页用）
  totalPosts: 0,
  // 当前帖子详情
  currentPost: null,
  // 当前帖子的回复列表
  replies: [],
  // 加载状态
  postsLoading: false,
  repliesLoading: false,
  // 已点赞帖子集合
  likedPosts: new Set(),
  // 筛选/排序参数
  filters: {
    page: 1,
    pageSize: 20,
    category: 'all',
    sort: 'latest',
    search: '',
  },
  // Realtime 取消订阅句柄
  _replyUnsub: null,

  // ========== 帖子列表 ==========

  // 设置筛选参数并重新加载
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  // 加载帖子列表
  loadPosts: async (filterOverrides = {}) => {
    if (!isSupabaseConfigured) return;
    const filters = { ...get().filters, ...filterOverrides };
    set({ postsLoading: true });
    const { data, count } = await fetchForumPosts(filters);
    set({ posts: data, totalPosts: count, postsLoading: false });
  },

  // ========== 帖子详情 ==========

  // 加载单个帖子（含浏览+1）
  loadPost: async (postId) => {
    if (!isSupabaseConfigured) return null;
    set({ postsLoading: true });
    const post = await fetchForumPost(postId);
    set({ currentPost: post, postsLoading: false });
    return post;
  },

  // 清除当前帖子
  clearCurrentPost: () => set({ currentPost: null, replies: [] }),

  // ========== 发帖 ==========

  createPost: async (postData) => {
    if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
    const { data, error } = await createForumPost(postData);
    if (!error && data) {
      // 插入到列表头部
      set((state) => ({ posts: [data, ...state.posts], totalPosts: state.totalPosts + 1 }));
    }
    return { data, error };
  },

  // ========== 编辑/管理帖子 ==========

  updatePost: async (postId, updates) => {
    if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
    const { data, error } = await updateForumPost(postId, updates);
    if (!error) {
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
        currentPost: state.currentPost?.id === postId ? { ...state.currentPost, ...updates } : state.currentPost,
      }));
    }
    return { data, error };
  },

  // 置顶/取消置顶
  togglePin: async (postId, isPinned) => get().updatePost(postId, { is_pinned: !isPinned }),

  // 精华/取消精华
  toggleEssence: async (postId, isEssence) => get().updatePost(postId, { is_essence: !isEssence }),

  // 删除帖子（软删除）
  removePost: async (postId) => {
    if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
    const { error } = await deleteForumPost(postId);
    if (!error) {
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
        totalPosts: state.totalPosts - 1,
      }));
    }
    return { error };
  },

  // ========== 回复 ==========

  // 加载帖子回复
  loadReplies: async (postId) => {
    if (!isSupabaseConfigured) return;
    set({ repliesLoading: true });
    const data = await fetchForumReplies(postId);
    set({ replies: data, repliesLoading: false });
  },

  // 发表回复
  addReply: async ({ post_id, author_id, content, parent_id }) => {
    if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
    const { data, error } = await createForumReply({ post_id, author_id, content, parent_id });
    if (!error && data) {
      set((state) => ({ replies: [...state.replies, data] }));
      // 更新帖子的回复数
      set((state) => ({
        currentPost: state.currentPost?.id === post_id
          ? { ...state.currentPost, reply_count: (state.currentPost.reply_count || 0) + 1 }
          : state.currentPost,
      }));
    }
    return { data, error };
  },

  // 删除回复
  removeReply: async (replyId, postId) => {
    if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
    const { error } = await deleteForumReply(replyId);
    if (!error) {
      set((state) => ({
        replies: state.replies.filter((r) => r.id !== replyId),
        currentPost: state.currentPost?.id === postId
          ? { ...state.currentPost, reply_count: Math.max((state.currentPost.reply_count || 1) - 1, 0) }
          : state.currentPost,
      }));
    }
    return { error };
  },

  // ========== 点赞 ==========

  // 初始化点赞状态
  checkLiked: async (userId, postId) => {
    if (!isSupabaseConfigured) return;
    const liked = await checkPostLiked(userId, postId);
    if (liked) {
      set((state) => {
        const newSet = new Set(state.likedPosts);
        newSet.add(postId);
        return { likedPosts: newSet };
      });
    }
  },

  // 切换点赞
  toggleLike: async (userId, postId) => {
    if (!isSupabaseConfigured) return;
    const isLiked = get().likedPosts.has(postId);
    // 乐观更新
    set((state) => {
      const newSet = new Set(state.likedPosts);
      if (isLiked) newSet.delete(postId); else newSet.add(postId);
      return {
        likedPosts: newSet,
        currentPost: state.currentPost?.id === postId
          ? { ...state.currentPost, like_count: (state.currentPost.like_count || 0) + (isLiked ? -1 : 1) }
          : state.currentPost,
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, like_count: (p.like_count || 0) + (isLiked ? -1 : 1) } : p
        ),
      };
    });
    await togglePostLike(userId, postId);
  },

  // ========== Realtime 订阅 ==========

  // 订阅帖子回复实时更新
  subscribeToReplies: (postId) => {
    get()._replyUnsub?.unsubscribe?.();
    if (!isSupabaseConfigured) return;
    const sub = subscribeForumReplies(postId, (newReply) => {
      set((state) => {
        // 避免重复
        if (state.replies.some((r) => r.id === newReply.id)) return state;
        return { replies: [...state.replies, newReply] };
      });
    });
    set({ _replyUnsub: sub });
  },

  // 取消回复订阅
  unsubscribeReplies: () => {
    get()._replyUnsub?.unsubscribe?.();
    set({ _replyUnsub: null });
  },
}));

export default useForumStore;
