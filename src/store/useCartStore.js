import { create } from 'zustand';

// 购物车 + 订单管理 Store — 持久化到 localStorage
const CART_KEY = 'app-cart';
const ORDERS_KEY = 'app-orders';

const loadFromLS = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const useCartStore = create((set, get) => ({
  // 购物车
  cart: loadFromLS(CART_KEY, []),

  addToCart: (product) => set((state) => {
    const existing = state.cart.find((i) => i.id === product.id);
    const next = existing
      ? state.cart.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...state.cart, { ...product, qty: 1 }];
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  updateQty: (id, qty) => set((state) => {
    const next = qty <= 0
      ? state.cart.filter((i) => i.id !== id)
      : state.cart.map((i) => i.id === id ? { ...i, qty } : i);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  removeFromCart: (id) => set((state) => {
    const next = state.cart.filter((i) => i.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    return { cart: next };
  }),

  clearCart: () => set(() => {
    localStorage.setItem(CART_KEY, '[]');
    return { cart: [] };
  }),

  // 购物车计算
  getCartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  getCartCount: () => get().cart.reduce((sum, i) => sum + i.qty, 0),

  // 订单管理
  orders: loadFromLS(ORDERS_KEY, []),

  createOrder: (paymentMethod, address) => {
    const state = get();
    const order = {
      id: `ORD-${Date.now()}`,
      items: [...state.cart],
      total: state.getCartTotal(),
      paymentMethod,
      address: address || '',
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    const next = [order, ...state.orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
    // 清空购物车
    localStorage.setItem(CART_KEY, '[]');
    set({ orders: next, cart: [] });
    return order;
  },
}));

export default useCartStore;
