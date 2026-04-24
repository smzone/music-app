-- ============================================================
-- Music App - 优惠券 / 积分 / 签到系统
-- 在 Supabase SQL Editor 中执行（在 schema.sql / shop-schema.sql 之后）
-- ------------------------------------------------------------
-- 覆盖：
--   coupons         — 优惠券模板（管理员配置，用户领取）
--   user_coupons    — 用户领取记录
--   points_logs     — 积分流水
--   user_points     — 用户积分汇总（缓存，触发器维护）
--   checkins        — 签到记录
-- ============================================================

-- ============================================================
-- 1. 优惠券模板
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,          -- 券码（领取时使用，如 NEWUSER10）
  title           text NOT NULL,                 -- 标题（如 新人 10 元券）
  description     text,
  -- 类型：fixed（固定金额）| percent（百分比）| shipping（免邮）
  type            text NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed','percent','shipping')),
  value           numeric(10,2) NOT NULL DEFAULT 0,  -- 金额 / 百分比数值 (10 = 10% 或 ¥10)
  min_amount      numeric(10,2) NOT NULL DEFAULT 0,  -- 最低订单金额
  max_discount    numeric(10,2),                     -- percent 类型的最高抵扣上限
  total_quantity  integer NOT NULL DEFAULT 1000,     -- 总发放量
  claimed_count   integer NOT NULL DEFAULT 0,        -- 已领取数量
  per_user_limit  integer NOT NULL DEFAULT 1,        -- 每用户领取上限
  is_active       boolean NOT NULL DEFAULT true,
  -- 积分兑换相关：points_cost > 0 表示需要消耗积分兑换
  points_cost     integer NOT NULL DEFAULT 0,
  start_at        timestamptz NOT NULL DEFAULT now(),
  end_at          timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, end_at);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coupons_read_all" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_write" ON public.coupons;
CREATE POLICY "coupons_read_all" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_admin_write" ON public.coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- ============================================================
-- 2. 用户领取的优惠券
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id   uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  -- 使用状态：unused | used | expired
  status      text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','used','expired')),
  order_id    uuid,                                  -- 使用到的订单
  claimed_at  timestamptz NOT NULL DEFAULT now(),
  used_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON public.user_coupons(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon ON public.user_coupons(coupon_id);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_coupons_self_read" ON public.user_coupons;
DROP POLICY IF EXISTS "user_coupons_self_insert" ON public.user_coupons;
DROP POLICY IF EXISTS "user_coupons_self_update" ON public.user_coupons;
DROP POLICY IF EXISTS "user_coupons_admin_all" ON public.user_coupons;
CREATE POLICY "user_coupons_self_read" ON public.user_coupons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_coupons_self_insert" ON public.user_coupons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_coupons_self_update" ON public.user_coupons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_coupons_admin_all" ON public.user_coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- 领取优惠券时自动累加 claimed_count
CREATE OR REPLACE FUNCTION public.tg_coupon_claimed() RETURNS trigger AS $$
BEGIN
  UPDATE public.coupons SET claimed_count = claimed_count + 1 WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_coupon_claimed ON public.user_coupons;
CREATE TRIGGER trg_coupon_claimed AFTER INSERT ON public.user_coupons
  FOR EACH ROW EXECUTE FUNCTION public.tg_coupon_claimed();

-- ============================================================
-- 3. 积分系统
-- ============================================================

-- 积分汇总表（缓存）
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent  integer NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_points_self_read" ON public.user_points;
DROP POLICY IF EXISTS "user_points_admin_all" ON public.user_points;
CREATE POLICY "user_points_self_read" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_points_admin_all" ON public.user_points FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- 积分流水（不可编辑，只能插入）
CREATE TABLE IF NOT EXISTS public.points_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta       integer NOT NULL,                -- 正数=获得，负数=消耗
  reason      text NOT NULL,                   -- 原因标识：order_paid / checkin / coupon_exchange / refund ...
  description text,                            -- 可读描述
  ref_id      text,                            -- 关联 ID（订单号、优惠券 ID 等）
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_logs_user ON public.points_logs(user_id, created_at DESC);

ALTER TABLE public.points_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "points_logs_self_read" ON public.points_logs;
DROP POLICY IF EXISTS "points_logs_self_insert" ON public.points_logs;
DROP POLICY IF EXISTS "points_logs_admin_all" ON public.points_logs;
CREATE POLICY "points_logs_self_read" ON public.points_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "points_logs_self_insert" ON public.points_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "points_logs_admin_all" ON public.points_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- 流水变更时自动更新汇总
CREATE OR REPLACE FUNCTION public.tg_points_log_aggregate() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_points (user_id, balance, total_earned, total_spent, updated_at)
  VALUES (
    NEW.user_id,
    NEW.delta,
    CASE WHEN NEW.delta > 0 THEN NEW.delta ELSE 0 END,
    CASE WHEN NEW.delta < 0 THEN -NEW.delta ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    balance = public.user_points.balance + NEW.delta,
    total_earned = public.user_points.total_earned + CASE WHEN NEW.delta > 0 THEN NEW.delta ELSE 0 END,
    total_spent  = public.user_points.total_spent  + CASE WHEN NEW.delta < 0 THEN -NEW.delta ELSE 0 END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_points_log_aggregate ON public.points_logs;
CREATE TRIGGER trg_points_log_aggregate AFTER INSERT ON public.points_logs
  FOR EACH ROW EXECUTE FUNCTION public.tg_points_log_aggregate();

-- 订单付款时自动赠送积分（订单金额的 1%，向下取整）
CREATE OR REPLACE FUNCTION public.tg_order_paid_grant_points() RETURNS trigger AS $$
DECLARE
  v_points integer;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid') THEN
    v_points := FLOOR(COALESCE(NEW.total, 0))::integer;
    IF v_points > 0 THEN
      INSERT INTO public.points_logs (user_id, delta, reason, description, ref_id)
      VALUES (NEW.user_id, v_points, 'order_paid', '订单支付奖励', NEW.id::text);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_paid_grant_points ON public.orders;
CREATE TRIGGER trg_order_paid_grant_points AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_order_paid_grant_points();

-- ============================================================
-- 4. 签到系统
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date date NOT NULL,                 -- 签到日期（按天去重）
  streak      integer NOT NULL DEFAULT 1,     -- 连续签到天数
  points      integer NOT NULL DEFAULT 5,     -- 当日获得积分
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON public.checkins(user_id, checkin_date DESC);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checkins_self_read" ON public.checkins;
DROP POLICY IF EXISTS "checkins_self_insert" ON public.checkins;
DROP POLICY IF EXISTS "checkins_admin_all" ON public.checkins;
CREATE POLICY "checkins_self_read" ON public.checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "checkins_self_insert" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checkins_admin_all" ON public.checkins FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- 签到时自动写积分流水
CREATE OR REPLACE FUNCTION public.tg_checkin_grant_points() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.points_logs (user_id, delta, reason, description, ref_id)
  VALUES (NEW.user_id, NEW.points, 'checkin', '每日签到', NEW.checkin_date::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_checkin_grant_points ON public.checkins;
CREATE TRIGGER trg_checkin_grant_points AFTER INSERT ON public.checkins
  FOR EACH ROW EXECUTE FUNCTION public.tg_checkin_grant_points();

-- ============================================================
-- 5. Seed 优惠券数据
-- ============================================================
INSERT INTO public.coupons (code, title, description, type, value, min_amount, max_discount, total_quantity, per_user_limit, points_cost, end_at)
VALUES
  ('NEWUSER10', '新人专享 10 元券', '全场满 50 元可用，新用户限领一次', 'fixed', 10, 50, NULL, 10000, 1, 0, now() + interval '90 days'),
  ('VIP20',      'VIP 满减 20 元券', '全场满 100 元可用', 'fixed', 20, 100, NULL, 5000, 3, 0, now() + interval '60 days'),
  ('SAVE15PCT',  '满 200 享 85 折', '百分比优惠，最高抵扣 50 元', 'percent', 15, 200, 50, 3000, 1, 0, now() + interval '45 days'),
  ('FREESHIP',   '全场免邮券', '无门槛免邮', 'shipping', 0, 0, NULL, 20000, 5, 0, now() + interval '120 days'),
  ('PTS100_15',  '100 积分兑 15 元券', '需消耗 100 积分兑换', 'fixed', 15, 80, NULL, 2000, 10, 100, now() + interval '180 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 完成！
-- ============================================================
