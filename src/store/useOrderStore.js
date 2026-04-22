import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// 订单 + 地址 + 优惠券 统一 Store
// 订单状态机：
//   pending  - 待付款（15 分钟内未付款会被标记 expired）
//   paying   - 支付中（临时态，PaymentModal 展示）
//   paid     - 已付款（商家未发货）
//   shipping - 已发货（物流中）
//   delivered- 已送达
//   completed- 已完成（用户确认收货）
//   cancelled- 已取消
//   refunded - 已退款
//   expired  - 已超时取消
// ============================================================================

// 预设优惠券（实际项目应由后端校验）
export const COUPONS = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, min: 0, desc: '新人 9 折' },
  SAVE20: { code: 'SAVE20', type: 'amount', value: 20, min: 100, desc: '满 100 减 20' },
  SAVE50: { code: 'SAVE50', type: 'amount', value: 50, min: 300, desc: '满 300 减 50' },
  VIP30: { code: 'VIP30', type: 'percent', value: 30, min: 200, desc: 'VIP 专享 7 折' },
};

// 免邮门槛
export const FREE_SHIPPING_THRESHOLD = 99;
// 运费
export const SHIPPING_FEE = 12;
// 订单支付超时（毫秒）
export const ORDER_EXPIRE_MS = 15 * 60 * 1000;

// 生成 22 位订单号：yyyymmddhhmmss + 6 位随机
const genOrderId = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  return `${ts}${rand}`;
};

// 校验并计算优惠券优惠金额
export function calcCouponDiscount(code, subtotal) {
  if (!code) return { valid: false, discount: 0, coupon: null };
  const coupon = COUPONS[String(code).toUpperCase().trim()];
  if (!coupon) return { valid: false, discount: 0, coupon: null, error: 'invalid' };
  if (subtotal < coupon.min) return { valid: false, discount: 0, coupon, error: 'minNotMet' };
  const discount = coupon.type === 'percent'
    ? Math.round((subtotal * coupon.value) / 100 * 100) / 100
    : coupon.value;
  return { valid: true, discount: Math.min(discount, subtotal), coupon };
}

// 计算运费
export function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// 生成物流轨迹（模拟）
function seedTrace(status, createdAt) {
  const t0 = new Date(createdAt).getTime();
  const evt = (offset, title, desc) => ({ time: new Date(t0 + offset).toISOString(), title, desc });
  const events = [evt(0, '订单创建', '订单已提交，等待付款')];
  if (['paid', 'shipping', 'delivered', 'completed'].includes(status)) {
    events.push(evt(60_000, '支付成功', '商家正在备货'));
  }
  if (['shipping', 'delivered', 'completed'].includes(status)) {
    events.push(evt(3600_000, '已发货', '快递单号：SF' + Math.floor(Math.random() * 1e10)));
    events.push(evt(7200_000, '运输中', '包裹已到达本地派送中心'));
  }
  if (['delivered', 'completed'].includes(status)) {
    events.push(evt(10800_000, '已送达', '快递已投递至指定地址，请注意查收'));
  }
  if (status === 'completed') {
    events.push(evt(12000_000, '订单完成', '感谢您的购买'));
  }
  return events;
}

const useOrderStore = create(persist((set, get) => ({
  // ============ 地址簿 ============
  addresses: [
    // 预置一条示例地址
    {
      id: 'addr-default',
      name: '默认收货人',
      phone: '138****0000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园 XX 路 XX 号',
      isDefault: true,
    },
  ],

  addAddress: (addr) => set((s) => {
    const id = `addr-${Date.now()}`;
    const isFirst = s.addresses.length === 0;
    const next = [
      ...s.addresses.map((a) => addr.isDefault ? { ...a, isDefault: false } : a),
      { ...addr, id, isDefault: isFirst || !!addr.isDefault },
    ];
    return { addresses: next };
  }),

  updateAddress: (id, patch) => set((s) => ({
    addresses: s.addresses.map((a) => {
      if (a.id === id) return { ...a, ...patch };
      // 设为默认时其他取消默认
      if (patch.isDefault) return { ...a, isDefault: false };
      return a;
    }),
  })),

  removeAddress: (id) => set((s) => {
    const next = s.addresses.filter((a) => a.id !== id);
    // 删的是默认地址 → 把第一个升为默认
    if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
    return { addresses: next };
  }),

  setDefaultAddress: (id) => set((s) => ({
    addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
  })),

  getDefaultAddress: () => get().addresses.find((a) => a.isDefault) || get().addresses[0] || null,

  // ============ 订单 ============
  orders: [],

  // 创建 pending 订单（未付款）
  createPendingOrder: ({ items, address, couponCode, subtotal, discount, shipping, total, paymentMethod, remark }) => {
    const id = genOrderId();
    const createdAt = new Date().toISOString();
    const order = {
      id,
      items: items.map((i) => ({ id: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty })),
      address,
      couponCode: couponCode || null,
      subtotal,
      discount: discount || 0,
      shipping: shipping || 0,
      total,
      paymentMethod: paymentMethod || null,
      remark: remark || '',
      status: 'pending',
      createdAt,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + ORDER_EXPIRE_MS).toISOString(),
      trace: [{ time: createdAt, title: '订单创建', desc: '订单已提交，等待付款' }],
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  // 标记已付款（支付成功回调）
  markPaid: (orderId, paymentMethod) => {
    const now = new Date().toISOString();
    set((s) => ({
      orders: s.orders.map((o) => o.id === orderId ? {
        ...o,
        status: 'paid',
        paidAt: now,
        paymentMethod: paymentMethod || o.paymentMethod,
        trace: [...o.trace, { time: now, title: '支付成功', desc: `使用${paymentMethod || o.paymentMethod}支付` }],
      } : o),
    }));
  },

  // 取消订单（pending/paid 可取消）
  cancelOrder: (orderId, reason = '用户取消') => {
    const now = new Date().toISOString();
    set((s) => ({
      orders: s.orders.map((o) => ['pending', 'paid'].includes(o.status) && o.id === orderId ? {
        ...o,
        status: 'cancelled',
        cancelledAt: now,
        cancelReason: reason,
        trace: [...o.trace, { time: now, title: '订单取消', desc: reason }],
      } : o),
    }));
  },

  // 模拟商家发货
  shipOrder: (orderId) => {
    const now = new Date().toISOString();
    const trackingNo = 'SF' + Math.floor(Math.random() * 1e10);
    set((s) => ({
      orders: s.orders.map((o) => o.status === 'paid' && o.id === orderId ? {
        ...o,
        status: 'shipping',
        shippedAt: now,
        trackingNo,
        trace: [...o.trace, { time: now, title: '已发货', desc: `快递单号：${trackingNo}` }],
      } : o),
    }));
  },

  // 确认收货
  confirmReceive: (orderId) => {
    const now = new Date().toISOString();
    set((s) => ({
      orders: s.orders.map((o) => o.status === 'shipping' && o.id === orderId ? {
        ...o,
        status: 'completed',
        deliveredAt: now,
        completedAt: now,
        trace: [...o.trace, { time: now, title: '确认收货', desc: '订单已完成' }],
      } : o),
    }));
  },

  // 清扫过期订单（每次打开订单页或 checkout 时调用）
  sweepExpired: () => {
    const now = Date.now();
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.status === 'pending' && o.expiresAt && now > new Date(o.expiresAt).getTime()) {
          return {
            ...o,
            status: 'expired',
            cancelledAt: new Date().toISOString(),
            trace: [...o.trace, { time: new Date().toISOString(), title: '订单已超时', desc: '未在 15 分钟内完成支付，订单自动关闭' }],
          };
        }
        return o;
      }),
    }));
  },

  // 获取单个订单
  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),

  // 已支付订单总金额统计
  getTotalSpent: () => get().orders
    .filter((o) => ['paid', 'shipping', 'delivered', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0),
}), {
  name: 'music-app-orders',
  storage: createJSONStorage(() => localStorage),
  version: 1,
}));

// 导出 seedTrace 供测试/mock 使用
export { seedTrace };

export default useOrderStore;
