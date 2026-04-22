import { create } from 'zustand';

// ============================================================================
// 购物车 Store — 仅负责购物车相关状态，持久化到 localStorage
// 订单相关逻辑已迁移到 useOrderStore（地址/优惠券/订单状态机）
// ============================================================================
const CART_KEY = 'app-cart';

const loadFromLS = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const useCartStore = create((set, get) => ({
  // 购物车列表
  cart: loadFromLS(CART_KEY, []),

  // 加入购物车：若已存在则数量 +1
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((i) => i.id === product.id);
    const next = existing
      ? state.cart.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...state.cart, { ...product, qty: 1 }];
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  // 更新数量：<=0 自动移除
  updateQty: (id, qty) => set((state) => {
    const next = qty <= 0
      ? state.cart.filter((i) => i.id !== id)
      : state.cart.map((i) => i.id === id ? { ...i, qty } : i);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  // 移除单个商品
  removeFromCart: (id) => set((state) => {
    const next = state.cart.filter((i) => i.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  // 清空购物车
  clearCart: () => set(() => {
    localStorage.setItem(CART_KEY, '[]');
    return { cart: [] };
  }),

  // 购物车金额/数量统计
  getCartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  getCartCount: () => get().cart.reduce((sum, i) => sum + i.qty, 0),
}));

export default useCartStore;
