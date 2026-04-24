-- ============================================================
-- Music App - 商城/订单模块 Supabase 架构
-- 在现有 schema.sql 执行完毕后，再执行本脚本
-- 覆盖：收货地址、订单、订单商品、商品评价、心愿单
-- ============================================================

-- ============================================================
-- 1. shipping_addresses — 收货地址
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.shipping_addresses(user_id, is_default DESC);

-- 同用户只能有一个默认地址（触发器实现）
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.shipping_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_single_default_address ON public.shipping_addresses;
CREATE TRIGGER trg_single_default_address
  AFTER INSERT OR UPDATE OF is_default ON public.shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();

-- ============================================================
-- 2. orders — 订单主表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 金额相关
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- 状态机：pending(待付款) → paid(已付款/待发货) → shipped(已发货) →
  --         delivered(已送达/待确认) → completed(已完成)
  --         cancelled / refunding / refunded
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','shipped','delivered','completed','cancelled','refunding','refunded')),

  -- 收货信息（冗余快照）
  address_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- 物流
  tracking_no TEXT DEFAULT '',
  carrier TEXT DEFAULT '',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- 支付
  payment_method TEXT DEFAULT 'mock',
  paid_at TIMESTAMPTZ,

  -- 备注
  note TEXT DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_no ON public.orders(order_no);

-- ============================================================
-- 3. order_items — 订单商品明细
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  -- 商品 id（兼容本地 mock 商品，使用整数；对接真实商品表时可换 UUID）
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- 4. product_reviews — 商品评价（订单维度）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.product_reviews(user_id, created_at DESC);

-- ============================================================
-- 5. wishlist_items — 心愿单
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist_items(user_id, created_at DESC);

-- ============================================================
-- 6. RLS 策略
-- ============================================================
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- shipping_addresses：仅本人可操作
CREATE POLICY "addresses_select" ON public.shipping_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert" ON public.shipping_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update" ON public.shipping_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete" ON public.shipping_addresses FOR DELETE USING (auth.uid() = user_id);

-- orders：本人可读写，管理员可读写全部
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- order_items：通过 orders 继承权限
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    o.user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  ))
);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- product_reviews：所有人可读，仅本人可写
CREATE POLICY "reviews_select" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON public.product_reviews FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- wishlist_items：仅本人可操作
CREATE POLICY "wishlist_select" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 7. updated_at 自动更新
-- ============================================================
CREATE TRIGGER set_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 8. Realtime（订单状态变更 & 评价）
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;

-- ============================================================
-- 完成！在 Supabase Dashboard > SQL Editor 中执行此脚本
-- ============================================================
