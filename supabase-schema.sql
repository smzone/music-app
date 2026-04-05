-- 音乐平台数据库 Schema（在 Supabase SQL Editor 中执行）

-- 1. 用户资料表（扩展 Supabase Auth 内置用户）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 歌曲表
CREATE TABLE IF NOT EXISTS songs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  release_date DATE,
  cover_url TEXT DEFAULT '',
  audio_url TEXT DEFAULT '',
  plays BIGINT DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  song_id BIGINT REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- 4. 评分表
CREATE TABLE IF NOT EXISTS ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  song_id BIGINT REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- 5. 评论表
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  song_id BIGINT REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 播放列表表
CREATE TABLE IF NOT EXISTS playlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 播放列表歌曲关联表
CREATE TABLE IF NOT EXISTS playlist_songs (
  id BIGSERIAL PRIMARY KEY,
  playlist_id BIGINT REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  song_id BIGINT REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- 索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_song ON ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

-- RLS（行级安全策略）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取歌曲
CREATE POLICY "songs_read" ON songs FOR SELECT USING (true);
-- 登录用户可以上传歌曲
CREATE POLICY "songs_insert" ON songs FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- 所有人可以读取用户资料
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
-- 用户只能修改自己的资料
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 收藏：用户只能管理自己的收藏
CREATE POLICY "favorites_read" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 评分：所有人可以读取，用户只能管理自己的评分
CREATE POLICY "ratings_read" ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_upsert" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- 评论：所有人可以读取，用户只能管理自己的评论
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 播放列表：公开可读，用户管理自己的
CREATE POLICY "playlists_read" ON playlists FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "playlists_insert" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "playlists_update" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "playlists_delete" ON playlists FOR DELETE USING (auth.uid() = user_id);

-- 播放列表歌曲关联
CREATE POLICY "playlist_songs_read" ON playlist_songs FOR SELECT USING (true);
CREATE POLICY "playlist_songs_insert" ON playlist_songs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
);
CREATE POLICY "playlist_songs_delete" ON playlist_songs FOR DELETE USING (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- 自动创建用户资料（注册时触发）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
