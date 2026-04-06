import { create } from 'zustand';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchNotifications as fetchNotificationsApi,
  fetchUnreadCount as fetchUnreadCountApi,
  markNotificationRead as markReadApi,
  markAllNotificationsRead as markAllReadApi,
  subscribeNotifications,
} from '../lib/supabaseService';

// 通知状态管理（支持 Supabase / 本地双模式）
const useNotificationStore = create((set, get) => ({
  // 通知列表
  notifications: [],
  // 未读数量
  unreadCount: 0,
  // 总数（分页用）
  totalCount: 0,
  // 加载状态
  loading: false,
  // 当前页
  page: 1,
  // Realtime 取消订阅句柄
  _unsub: null,

  // ========== 加载通知列表 ==========
  loadNotifications: async (userId, { page = 1, unreadOnly = false } = {}) => {
    if (!isSupabaseConfigured || !userId) return;
    set({ loading: true });
    const { data, count } = await fetchNotificationsApi(userId, { page, unreadOnly });
    set({
      notifications: page === 1 ? data : [...get().notifications, ...data],
      totalCount: count,
      page,
      loading: false,
    });
  },

  // 加载更多（下一页）
  loadMore: async (userId) => {
    const nextPage = get().page + 1;
    await get().loadNotifications(userId, { page: nextPage });
  },

  // ========== 未读计数 ==========
  refreshUnreadCount: async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    const count = await fetchUnreadCountApi(userId);
    set({ unreadCount: count });
  },

  // ========== 标记已读 ==========
  markRead: async (notificationId) => {
    if (!isSupabaseConfigured) return;
    // 乐观更新
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    await markReadApi(notificationId);
  },

  // 全部标记已读
  markAllRead: async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    // 乐观更新
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
    await markAllReadApi(userId);
  },

  // ========== Realtime 订阅 ==========
  subscribe: (userId) => {
    // 先取消旧订阅
    get()._unsub?.unsubscribe?.();
    if (!isSupabaseConfigured || !userId) return;
    const sub = subscribeNotifications(userId, (newNotification) => {
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
    set({ _unsub: sub });
  },

  unsubscribe: () => {
    get()._unsub?.unsubscribe?.();
    set({ _unsub: null });
  },

  // 清空（登出时调用）
  reset: () => {
    get()._unsub?.unsubscribe?.();
    set({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      loading: false,
      page: 1,
      _unsub: null,
    });
  },
}));

export default useNotificationStore;
