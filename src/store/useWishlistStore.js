import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// 心愿单（Wishlist）— 持久化存储商品收藏
// 仅存储商品 ID 列表与加入时间，展示时结合 productsData 渲染
// ============================================================================

const useWishlistStore = create(persist((set, get) => ({
  // [{ id, addedAt }]
  items: [],

  // 添加到心愿单（幂等）
  add: (productId) => set((s) => {
    if (s.items.some((i) => i.id === productId)) return s;
    return {
      items: [{ id: productId, addedAt: new Date().toISOString() }, ...s.items],
    };
  }),

  // 移除
  remove: (productId) => set((s) => ({
    items: s.items.filter((i) => i.id !== productId),
  })),

  // 切换收藏状态
  toggle: (productId) => {
    const s = get();
    if (s.items.some((i) => i.id === productId)) s.remove(productId);
    else s.add(productId);
  },

  // 是否已收藏
  has: (productId) => get().items.some((i) => i.id === productId),

  // 清空
  clear: () => set({ items: [] }),

  // 总数
  count: () => get().items.length,
}), {
  name: 'music-app-wishlist',
  storage: createJSONStorage(() => localStorage),
  version: 1,
}));

export default useWishlistStore;
