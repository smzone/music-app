import { supabase, isSupabaseConfigured } from './supabase';

// ============ 认证相关 ============

// 注册
export async function signUp(email, password, username) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  return { data, error };
}

// 登录
export async function signIn(email, password) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// 退出
export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

// 获取当前用户
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 监听认证状态变化
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

// ============ 歌曲相关 ============

// 获取所有歌曲
export async function fetchSongs() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('获取歌曲失败:', error); return []; }
  return data;
}

// 上传歌曲
export async function uploadSong(songData) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase.from('songs').insert(songData).select().single();
  return { data, error };
}

// 增加播放次数
export async function incrementPlays(songId) {
  if (!isSupabaseConfigured) return;
  await supabase.rpc('increment_plays', { song_id: songId });
}

// ============ 收藏相关 ============

// 获取用户收藏
export async function fetchFavorites(userId) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('favorites')
    .select('song_id')
    .eq('user_id', userId);
  return data?.map((f) => f.song_id) || [];
}

// 切换收藏
export async function toggleFavoriteApi(userId, songId, isFav) {
  if (!isSupabaseConfigured) return;
  if (isFav) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
  } else {
    await supabase.from('favorites').insert({ user_id: userId, song_id: songId });
  }
}

// ============ 评分相关 ============

// 获取歌曲评分
export async function fetchRatings(songId) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('ratings')
    .select('rating')
    .eq('song_id', songId);
  return data?.map((r) => r.rating) || [];
}

// 提交评分
export async function rateSongApi(userId, songId, rating) {
  if (!isSupabaseConfigured) return;
  await supabase.from('ratings').upsert(
    { user_id: userId, song_id: songId, rating },
    { onConflict: 'user_id,song_id' }
  );
}

// ============ 评论相关 ============

// 获取歌曲评论
export async function fetchComments(songId) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('song_id', songId)
    .order('created_at', { ascending: false });
  return data || [];
}

// 添加评论
export async function addCommentApi(userId, songId, content) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, song_id: songId, content })
    .select('*, profiles(username, avatar_url)')
    .single();
  return { data, error };
}

// ============ 播放列表相关 ============

// 获取用户播放列表
export async function fetchPlaylists(userId) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('playlists')
    .select('*, playlist_songs(song_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

// 创建播放列表
export async function createPlaylistApi(userId, name, description = '') {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name, description })
    .select()
    .single();
  return { data, error };
}

// 添加歌曲到播放列表
export async function addSongToPlaylist(playlistId, songId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('playlist_songs').insert({ playlist_id: playlistId, song_id: songId });
}

// 从播放列表移除歌曲
export async function removeSongFromPlaylist(playlistId, songId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('playlist_songs').delete().eq('playlist_id', playlistId).eq('song_id', songId);
}
