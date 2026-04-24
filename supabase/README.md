# Supabase 数据库部署指南

本目录包含 Music App 的 Supabase 数据库架构文件，按顺序执行即可完成初始化。

## 执行顺序

1. **`schema.sql`** — 核心架构（用户/歌曲/评分/论坛/任务等）
2. **`shop-schema.sql`** — 商城模块（订单/商品评价/心愿单/地址）

## 执行步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 打开目标项目 → **SQL Editor** → **New query**
3. 复制 `schema.sql` 全部内容 → 粘贴 → **Run**
4. 再次新建 query，复制 `shop-schema.sql` 全部内容 → 粘贴 → **Run**
5. 确认在 **Table Editor** 中能看到新增的表：
   - `shipping_addresses`
   - `orders`
   - `order_items`
   - `product_reviews`
   - `wishlist_items`

## 环境变量配置

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

应用启动时会自动检测配置；未配置时退化为 localStorage 模拟数据模式，功能不受影响。

## 双模式说明

`useOrderStore` / `useWishlistStore` 均实现了"本地优先 + 可选远端同步"策略：

| 场景 | 本地 localStorage | Supabase |
|------|------|-----|
| 未配置 Supabase | ✅ 全量存储 | - |
| 已配置 + 未登录 | ✅ 访客数据 | - |
| 已配置 + 已登录 | ✅ 缓存 | ✅ 主数据源 |

登录成功后，`AuthSyncGate` 会自动触发 `syncFromSupabase`，将远端订单/心愿单合并到本地。
写操作（加入心愿单、支付订单、发货、退款、评价）会在本地立即生效后异步推送到 Supabase，失败仅打印日志不影响 UI。

## 行级安全（RLS）

所有表均开启 RLS，关键策略：
- **心愿单/地址/订单** — 仅本人可读写
- **订单** — 管理员（`role IN ('admin','moderator')`）可读写全部
- **商品评价** — 所有人可读，仅本人可写

## Realtime 订阅

已为以下表开启 Realtime 发布：
- `orders` — 订单状态变更推送（可用于物流更新通知）
- `product_reviews` — 新评价实时推送

## 字段快速参考

### `orders` 状态机

```
pending → paid → shipped → delivered → completed
                ↓
             cancelled / refunding / refunded
```

前端本地态（`useOrderStore`）与远端态映射：
- 本地 `shipping` ↔ 远端 `shipped`
- 本地 `expired` → 远端 `cancelled`
- 其余一一对应

### `order_items.product_id`

目前为 **INTEGER** 类型，兼容本地 Mock 商品 ID。
对接真实商品表时可升级为 `UUID REFERENCES public.products(id)`。
