-- ============================================================
-- Music App - 商城商品模块 Supabase 架构（续）
-- 依赖：schema.sql + shop-schema.sql 已执行
-- 覆盖：商品分类、商品主表，并把现有 Mock 商品 seed 入库
-- ============================================================

-- ============================================================
-- 1. product_categories — 商品分类
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed 分类（幂等）
INSERT INTO public.product_categories (slug, name, icon, sort_order) VALUES
  ('equipment', '设备', '🎧', 10),
  ('merch',     '周边', '👕', 20),
  ('music',     '音乐', '💿', 30)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. products — 商品主表
-- 注意：id 采用 INTEGER 与 order_items.product_id / wishlist_items.product_id 兼容
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  category_slug TEXT REFERENCES public.product_categories(slug) ON DELETE SET NULL,
  category_name TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  sales INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 9999,
  -- 以下两字段由触发器根据 product_reviews 自动维护
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active, is_featured, created_at DESC);

-- ============================================================
-- 3. 评价变更 → 自动维护 products.rating_avg / rating_count
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  pid INTEGER := COALESCE(NEW.product_id, OLD.product_id);
BEGIN
  UPDATE public.products SET
    rating_avg   = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM public.product_reviews WHERE product_id = pid), 0),
    rating_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = pid)
  WHERE id = pid;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_product_rating_changed ON public.product_reviews;
CREATE TRIGGER trg_product_rating_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ============================================================
-- 4. 订单付款 → 自动累加销量（paid 状态首次出现时）
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_order_paid_bump_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status <> 'paid') THEN
    UPDATE public.products p SET sales = sales + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_paid_sales ON public.orders;
CREATE TRIGGER trg_order_paid_sales
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.on_order_paid_bump_sales();

-- ============================================================
-- 5. updated_at 触发器
-- ============================================================
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. RLS 策略
-- ============================================================
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- product_categories: 所有人可读，管理员可写
CREATE POLICY "categories_select" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "categories_write" ON public.product_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- products: 所有人可读 active 商品，管理员可写
CREATE POLICY "products_select" ON public.products FOR SELECT USING (is_active OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "products_write" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- ============================================================
-- 7. Realtime 发布
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ============================================================
-- 8. Seed 现有 8 件 Mock 商品（幂等，UPSERT 保持最新数据）
-- ============================================================
INSERT INTO public.products (id, name, description, price, original_price, image, category_slug, category_name, tags, sales) VALUES
  (1, '定制款音乐人T恤', '100%纯棉定制印花，独家设计图案', 129, 199, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 'merch', '周边', ARRAY['限定','热卖'], 234),
  (2, 'Audio-Technica ATH-M50x 监听耳机', '专业级监听耳机，还原真实声音', 899, 1099, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', 'equipment', '设备', ARRAY['推荐'], 156),
  (3, '原创专辑《星空漫步》实体CD', '含签名版封面 + 歌词本 + 独家花絮', 68, 88, 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', 'music', '音乐', ARRAY['签名版'], 89),
  (4, 'MIDI键盘 Arturia MiniLab 3', '25键紧凑型MIDI控制器，适合入门', 699, 799, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', 'equipment', '设备', ARRAY['好评'], 78),
  (5, '音乐人定制手机壳', '多款图案可选，硅胶防摔材质', 49, 79, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', 'merch', '周边', ARRAY['热卖'], 567),
  (6, '入门级电容麦克风套装', '含麦克风+支架+防喷罩+声卡', 299, 399, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop', 'equipment', '设备', ARRAY[]::TEXT[], 123),
  (7, '音乐创作笔记本', '五线谱+空白页设计，适合记录灵感', 39, 59, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', 'merch', '周边', ARRAY[]::TEXT[], 345),
  (8, '独家数字专辑合集（数字版）', '包含全部原创歌曲无损音质下载', 29, 49, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', 'music', '音乐', ARRAY['数字'], 890)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image,
  category_slug = EXCLUDED.category_slug,
  category_name = EXCLUDED.category_name,
  tags = EXCLUDED.tags;

-- ============================================================
-- 完成！在 Supabase Dashboard > SQL Editor 中执行此脚本
-- 执行顺序：schema.sql → shop-schema.sql → shop-products-schema.sql
-- ============================================================
