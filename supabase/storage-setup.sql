-- ============================================================
-- Music App - Supabase Storage 存储桶配置
-- 在 Supabase SQL Editor 中执行此脚本
-- ------------------------------------------------------------
-- 覆盖 3 个 Bucket：
--   product-images  — 商品图片（管理员可写，所有人可读）
--   avatars         — 用户头像（本人可写，所有人可读）
--   review-images   — 评价图片（登录用户可写，所有人可读）
-- ============================================================

-- ============================================================
-- 1. 创建 Bucket（公开读）
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('avatars',        'avatars',        true, 2097152, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('review-images',  'review-images',  true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- 2. RLS 策略
-- ------------------------------------------------------------
-- 注意：storage.objects 已默认开启 RLS，只需创建 policy
-- ============================================================

-- 清理可能存在的旧策略（幂等）
DROP POLICY IF EXISTS "product_images_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_write" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_write" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
DROP POLICY IF EXISTS "review_images_read" ON storage.objects;
DROP POLICY IF EXISTS "review_images_write" ON storage.objects;
DROP POLICY IF EXISTS "review_images_delete" ON storage.objects;

-- ---------- product-images：所有人可读，管理员/版主可写 ----------
CREATE POLICY "product_images_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

-- ---------- avatars：所有人可读；本人可写入/更新/删除自己的目录 ----------
-- 存储路径约定：<user_id>/<filename>
CREATE POLICY "avatars_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------- review-images：所有人可读，登录用户写自己目录 ----------
-- 存储路径约定：<user_id>/<order_id>_<product_id>/<filename>
CREATE POLICY "review_images_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "review_images_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "review_images_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-images' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
    )
  );

-- ============================================================
-- 完成！执行后请在 Supabase Dashboard > Storage 确认三个桶已创建
-- ============================================================
