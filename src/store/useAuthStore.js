import { create } from 'zustand';
import { isSupabaseConfigured } from '../lib/supabase';
import { signIn, signUp, signOut, onAuthStateChange } from '../lib/supabaseService';

// 用户认证状态管理（支持 Supabase 真实认证 + 本地模拟双模式）
const useAuthStore = create((set) => ({
  // 当前用户
  user: null,
  // 是否显示登录弹窗
  showAuthModal: false,
  // 弹窗模式: 'login' | 'register'
  authMode: 'login',
  // 加载状态
  loading: false,

  // 登录
  login: async (username, password) => {
    if (isSupabaseConfigured) {
      set({ loading: true });
      const { data, error } = await signIn(username, password);
      set({ loading: false });
      if (error) return false;
      set({
        user: { id: data.user.id, username: data.user.user_metadata?.username || username, avatar: '🎵' },
        showAuthModal: false,
      });
      return true;
    }
    // 本地模拟模式（admin/admin123 为管理员，其他为普通用户）
    if (username && password) {
      const isAdmin = (username === 'admin' && password === 'admin123');
      set({
        user: {
          id: isAdmin ? 'admin-001' : Date.now(),
          username,
          avatar: '🎵',
          role: isAdmin ? 'admin' : 'user',
          joinDate: new Date().toISOString(),
        },
        showAuthModal: false,
      });
      return true;
    }
    return false;
  },

  // 注册
  register: async (username, password) => {
    if (isSupabaseConfigured) {
      set({ loading: true });
      const { data, error } = await signUp(username, password, username);
      set({ loading: false });
      if (error) return false;
      set({
        user: { id: data.user?.id, username, avatar: '🎵' },
        showAuthModal: false,
      });
      return true;
    }
    // 本地模拟模式
    if (username && password && password.length >= 6) {
      set({
        user: { id: Date.now(), username, avatar: '🎵', role: 'user', joinDate: new Date().toISOString() },
        showAuthModal: false,
      });
      return true;
    }
    return false;
  },

  // 退出登录
  logout: async () => {
    if (isSupabaseConfigured) await signOut();
    set({ user: null });
  },

  // 初始化认证监听（Supabase 模式下使用）
  initAuth: () => {
    if (!isSupabaseConfigured) return;
    onAuthStateChange((event, session) => {
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email,
            avatar: '🎵',
          },
        });
      } else {
        set({ user: null });
      }
    });
  },

  // 打开登录弹窗
  openAuth: (mode = 'login') => set({ showAuthModal: true, authMode: mode }),

  // 关闭登录弹窗
  closeAuth: () => set({ showAuthModal: false }),

  // 切换登录/注册
  toggleAuthMode: () => set((state) => ({
    authMode: state.authMode === 'login' ? 'register' : 'login',
  })),
}));

export default useAuthStore;
