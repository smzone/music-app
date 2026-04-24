import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchWishlist,
  addToWishlist as addToWishlistRemote,
  removeFromWishlist as removeFromWishlistRemote,
  clearWishlist as clearWishlistRemote,
} from '../lib/supabaseService';

// ============================================================================
// 心愿单（Wishlist）— 持久化存储商品收藏
// 双模式：
//   • 未配置/未登录 Supabase → 仅 localStorage
//   • 已配置 + 已登录     → 本地 × Supabase 两边写，起始时 pull 同步
// ============================================================================

// 内部辅助：当前用户 ID（避免循环依赖 useAuthStore）
function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('myspace-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id || null;
  } catch {
    return null;
  }
}

// 异步同步到远端（忘记 await，不阻塞 UI）
function pushRemote(fn) {
  if (!isSupabaseConfigured) return;
  const uid = getCurrentUserId();
  if (!uid) return;
  fn(uid).catch((e) => console.error('[wishlist] 同步 Supabase 失败:', e));
}

const useWishlistStore = create(persist((set, get) => ({
  // [{ id, addedAt }]
  items: [],
  // 同步状态
  syncing: false,
  lastSyncedAt: null,

  // 添加到心愿单（幂等）
  add: (productId) => {
    set((s) => {
      if (s.items.some((i) => i.id === productId)) return s;
      return {
        items: [{ id: productId, addedAt: new Date().toISOString() }, ...s.items],
      };
    });
    pushRemote((uid) => addToWishlistRemote(uid, productId));
  },

  // 移除
  remove: (productId) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== productId) }));
    pushRemote((uid) => removeFromWishlistRemote(uid, productId));
  },

  // 切换收藏状态
  toggle: (productId) => {
    const s = get();
    if (s.items.some((i) => i.id === productId)) s.remove(productId);
    else s.add(productId);
  },

  // 是否已收藏
  has: (productId) => get().items.some((i) => i.id === productId),

  // 清空
  clear: () => {
    set({ items: [] });
    pushRemote((uid) => clearWishlistRemote(uid));
  },

  // 总数
  count: () => get().items.length,

  // 从 Supabase 拉取心愿单（登录后调用）
  syncFromSupabase: async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    set({ syncing: true });
    try {
      const remote = await fetchWishlist(userId);
      // 远端数据规范化为本地格式
      const remoteItems = (remote || []).map((r) => ({
        id: Number(r.product_id),
        addedAt: r.created_at,
      }));
      const local = get().items;
      // 合并策略：以远端为权威，但将本地独有商品推到远端
      const remoteIds = new Set(remoteItems.map((i) => i.id));
      const localOnly = local.filter((i) => !remoteIds.has(i.id));
      for (const i of localOnly) {
        try { await addToWishlistRemote(userId, i.id); } catch (e) { console.error(e); }
      }
      // 合并后的列表
      const merged = [...remoteItems, ...localOnly].sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
      );
      set({ items: merged, syncing: false, lastSyncedAt: new Date().toISOString() });
    } catch (e) {
      console.error('[wishlist] 同步失败:', e);
      set({ syncing: false });
    }
  },

  // 退出登录时清理本地缓存（保护隐私）
  resetLocal: () => set({ items: [], syncing: false, lastSyncedAt: null }),
}), {
  name: 'music-app-wishlist',
  storage: createJSONStorage(() => localStorage),
  version: 1,
  partialize: (s) => ({ items: s.items }),
}));

export default useWishlistStore;
