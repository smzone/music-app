import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  signIn, signUp, signOut, onAuthStateChange,
  fetchProfile as fetchProfileApi, updateProfile as updateProfileApi,
} from '../lib/supabaseService';

// ========== 权限定义 ==========
// 角色: admin(管理员) > moderator(版主) > vip(VIP会员) > user(普通用户) > guest(游客)
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  VIP: 'vip',
  USER: 'user',
  GUEST: 'guest',
};

// 各角色拥有的权限集合
export const PERMISSIONS = {
  // 管理后台
  ACCESS_ADMIN: 'access_admin',
  MANAGE_USERS: 'manage_users',
  MANAGE_SONGS: 'manage_songs',
  MANAGE_FORUM: 'manage_forum',
  MANAGE_SETTINGS: 'manage_settings',
  // 内容操作
  CREATE_POST: 'create_post',
  DELETE_OWN_POST: 'delete_own_post',
  DELETE_ANY_POST: 'delete_any_post',
  PIN_POST: 'pin_post',
  RATE_SONG: 'rate_song',
  COMMENT: 'comment',
  UPLOAD_SONG: 'upload_song',
  // 社交
  FOLLOW_USER: 'follow_user',
  SEND_MESSAGE: 'send_message',
  // VIP 专属
  DOWNLOAD_HQ: 'download_hq',
  AD_FREE: 'ad_free',
  EXCLUSIVE_CONTENT: 'exclusive_content',
};

// 角色→权限映射表
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MODERATOR]: [
    PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_OWN_POST, PERMISSIONS.DELETE_ANY_POST,
    PERMISSIONS.PIN_POST, PERMISSIONS.RATE_SONG, PERMISSIONS.COMMENT, PERMISSIONS.UPLOAD_SONG,
    PERMISSIONS.FOLLOW_USER, PERMISSIONS.SEND_MESSAGE, PERMISSIONS.MANAGE_FORUM,
    PERMISSIONS.DOWNLOAD_HQ, PERMISSIONS.AD_FREE,
  ],
  [ROLES.VIP]: [
    PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_OWN_POST, PERMISSIONS.RATE_SONG,
    PERMISSIONS.COMMENT, PERMISSIONS.FOLLOW_USER, PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.DOWNLOAD_HQ, PERMISSIONS.AD_FREE, PERMISSIONS.EXCLUSIVE_CONTENT,
  ],
  [ROLES.USER]: [
    PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_OWN_POST, PERMISSIONS.RATE_SONG,
    PERMISSIONS.COMMENT, PERMISSIONS.FOLLOW_USER, PERMISSIONS.SEND_MESSAGE,
  ],
  [ROLES.GUEST]: [],
};

// 检查角色是否拥有某个权限
export function hasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

// 检查角色等级是否 >= 目标角色
export function hasRole(userRole, requiredRole) {
  const hierarchy = [ROLES.GUEST, ROLES.USER, ROLES.VIP, ROLES.MODERATOR, ROLES.ADMIN];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole);
}

// ========== 创建默认用户对象 ==========
function createUserObj({ id, username, email, avatar, role, bio, genres }) {
  return {
    id: id || Date.now().toString(),
    username: username || '',
    email: email || '',
    avatar: avatar || '🎵',
    role: role || ROLES.USER,
    bio: bio || '',
    genres: genres || [],
    membership: role === ROLES.VIP || role === ROLES.ADMIN ? 'vip' : 'free',
    joinDate: new Date().toISOString(),
    followers: 0,
    following: 0,
    postsCount: 0,
    likesReceived: 0,
    songsPlayed: 0,
    lastActive: new Date().toISOString(),
  };
}

// ========== 用户认证状态管理 ==========
const useAuthStore = create(
  persist(
    (set, get) => ({
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
          if (error) { set({ loading: false }); return false; }
          // 从 profiles 表拉取真实角色和资料
          const profile = await fetchProfileApi(data.user.id);
          set({
            loading: false,
            user: createUserObj({
              id: data.user.id,
              username: profile?.username || data.user.user_metadata?.username || username,
              email: data.user.email,
              avatar: profile?.avatar_url || '🎵',
              role: profile?.role || ROLES.USER,
              bio: profile?.bio || '',
            }),
            showAuthModal: false,
          });
          return true;
        }
        // 本地模拟模式
        if (username && password) {
          const isAdmin = (username === 'admin' && password === 'admin123');
          const isMod = (username === 'mod' && password === 'mod123');
          const isVip = (username === 'vip' && password === 'vip123');
          let role = ROLES.USER;
          if (isAdmin) role = ROLES.ADMIN;
          else if (isMod) role = ROLES.MODERATOR;
          else if (isVip) role = ROLES.VIP;

          set({
            user: createUserObj({
              id: isAdmin ? 'admin-001' : isMod ? 'mod-001' : isVip ? 'vip-001' : Date.now().toString(),
              username,
              email: `${username}@myspace.music`,
              role,
              bio: isAdmin ? 'System Administrator' : isVip ? 'VIP Member' : '',
            }),
            showAuthModal: false,
          });
          return true;
        }
        return false;
      },

      // 注册（支持额外参数：email, avatar）
      register: async (username, password, extra = {}) => {
        if (isSupabaseConfigured) {
          set({ loading: true });
          // Supabase Auth 用 email 注册，username 存入 metadata
          const email = extra.email || `${username}@myspace.music`;
          const { data, error } = await signUp(email, password, username);
          if (error) { set({ loading: false }); return false; }
          set({
            loading: false,
            user: createUserObj({
              id: data.user?.id,
              username,
              email,
              avatar: extra.avatar || '🎵',
              role: ROLES.USER,
            }),
            showAuthModal: false,
          });
          return true;
        }
        // 本地模拟模式
        if (username && password && password.length >= 6) {
          set({
            user: createUserObj({
              username,
              email: extra.email || `${username}@myspace.music`,
              avatar: extra.avatar || '🎵',
              role: ROLES.USER,
            }),
            showAuthModal: false,
          });
          return true;
        }
        return false;
      },

      // 更新用户资料（本地 + Supabase 同步）
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        // 先更新本地状态
        set({ user: { ...user, ...updates, lastActive: new Date().toISOString() } });
        // Supabase 模式下同步到远端 profiles 表
        if (isSupabaseConfigured) {
          const remoteUpdates = {};
          if (updates.username) remoteUpdates.username = updates.username;
          if (updates.avatar) remoteUpdates.avatar_url = updates.avatar;
          if (updates.bio !== undefined) remoteUpdates.bio = updates.bio;
          if (Object.keys(remoteUpdates).length > 0) {
            await updateProfileApi(user.id, remoteUpdates);
          }
        }
      },

      // 检查当前用户是否有权限
      can: (permission) => {
        const { user } = get();
        if (!user) return false;
        return hasPermission(user.role, permission);
      },

      // 检查当前用户角色是否 >= 目标角色
      isAtLeast: (role) => {
        const { user } = get();
        if (!user) return false;
        return hasRole(user.role, role);
      },

      // 退出登录
      logout: async () => {
        if (isSupabaseConfigured) await signOut();
        set({ user: null });
      },

      // 初始化认证监听（Supabase 模式下使用）
      initAuth: () => {
        if (!isSupabaseConfigured) return;
        onAuthStateChange(async (event, session) => {
          if (session?.user) {
            // 从 profiles 表拉取角色和资料
            const profile = await fetchProfileApi(session.user.id);
            set({
              user: createUserObj({
                id: session.user.id,
                username: profile?.username || session.user.user_metadata?.username || session.user.email,
                email: session.user.email,
                avatar: profile?.avatar_url || '🎵',
                role: profile?.role || ROLES.USER,
                bio: profile?.bio || '',
              }),
            });
          } else if (event === 'SIGNED_OUT') {
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
    }),
    {
      name: 'myspace-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
