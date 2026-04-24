# Supabase 数据库部署指南

本目录包含 Music App 的 Supabase 数据库架构文件，按顺序执行即可完成初始化。

## 执行顺序

1. **`schema.sql`** — 核心架构（用户/歌曲/评分/论坛/任务等）
2. **`shop-schema.sql`** — 商城模块（订单/商品评价/心愿单/地址）
3. **`shop-products-schema.sql`** — 商品主表（products / product_categories）+ 评价触发器 + Seed 8 件 Mock 商品
4. **`storage-setup.sql`** — Storage 存储桶（product-images / avatars / review-images）+ RLS 策略

## 执行步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 打开目标项目 → **SQL Editor** → **New query**
3. 复制 `schema.sql` 全部内容 → 粘贴 → **Run**
4. 再次新建 query，复制 `shop-schema.sql` 全部内容 → 粘贴 → **Run**
5. 再次新建 query，复制 `shop-products-schema.sql` 全部内容 → 粘贴 → **Run**
6. 再次新建 query，复制 `storage-setup.sql` 全部内容 → 粘贴 → **Run**（创建 3 个图片 Bucket）
7. 确认在 **Table Editor** 中能看到新增的表：
   - `shipping_addresses`
   - `orders`
   - `order_items`
   - `product_reviews`
   - `wishlist_items`
   - `product_categories`
   - `products`（含 8 条 seed 数据）

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
- `product_reviews` — 新评价实时推送（`ProductDetailPage` 已订阅）
- `products` — 商品字段变更（价格/销量/评分）实时生效

## Storage 存储桶

三个公开读取的 Bucket：

- **`product-images`** — 商品图片（管理员/版主写入，所有人读取，5MB 限制）
- **`avatars`** — 用户头像（仅本人写入自己目录 `<user_id>/...`，2MB 限制）
- **`review-images`** — 评价图片（登录用户写入自己目录，5MB 限制）

前端通过 `@src/components/UI/ImageUploader.jsx` 与 `@src/components/UI/MultiImageUploader.jsx` 进行拖拽/粘贴/点击上传。
未配置 Supabase 时自动降级为 DataURL 本地预览，功能不中断。

## 自动化触发器

- **评价变更** → 自动更新 `products.rating_avg` / `rating_count`
- **订单 status 变为 paid** → 自动累加对应商品 `products.sales`
- **地址默认变更** → 自动取消同用户其他默认地址
- **updated_at** → 所有主表自动维护

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
