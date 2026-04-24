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

// ============ 用户资料相关 ============

// 获取用户资料（含关注数/粉丝数）
export async function fetchProfile(userId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.error('获取资料失败:', error); return null; }
  return data;
}

// 更新用户资料
export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// 获取用户列表（管理后台用）
export async function fetchAllProfiles({ page = 1, pageSize = 20, search = '', role = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0 };
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });
  if (search) query = query.or(`username.ilike.%${search}%,bio.ilike.%${search}%`);
  if (role) query = query.eq('role', role);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error('获取用户列表失败:', error); return { data: [], count: 0 }; }
  return { data: data || [], count: count || 0 };
}

// 更新用户角色（管理员操作）
export async function updateUserRole(userId, role) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  return updateProfile(userId, { role });
}

// 更新用户状态（管理员操作）
export async function updateUserStatus(userId, status) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  return updateProfile(userId, { status });
}

// ============ 论坛帖子相关 ============

// 获取帖子列表（支持分页/分类/排序/搜索）
export async function fetchForumPosts({
  page = 1, pageSize = 20, category = 'all', sort = 'latest', search = ''
} = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0 };
  let query = supabase
    .from('forum_posts')
    .select('*, profiles:author_id(username, avatar_url, role)', { count: 'exact' })
    .eq('status', 'active');

  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

  // 置顶帖优先
  switch (sort) {
    case 'hot':    query = query.order('is_pinned', { ascending: false }).order('like_count', { ascending: false }); break;
    case 'views':  query = query.order('is_pinned', { ascending: false }).order('view_count', { ascending: false }); break;
    case 'comments': query = query.order('is_pinned', { ascending: false }).order('reply_count', { ascending: false }); break;
    default:       query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }); break;
  }

  const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error('获取帖子失败:', error); return { data: [], count: 0 }; }
  return { data: data || [], count: count || 0 };
}

// 获取单个帖子详情（含浏览+1）
export async function fetchForumPost(postId) {
  if (!isSupabaseConfigured) return null;
  // 浏览数+1
  await supabase.rpc('increment_post_views', { post_id: postId });
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, profiles:author_id(username, avatar_url, role)')
    .eq('id', postId)
    .single();
  if (error) { console.error('获取帖子详情失败:', error); return null; }
  return data;
}

// 创建帖子
export async function createForumPost(postData) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('forum_posts')
    .insert(postData)
    .select('*, profiles:author_id(username, avatar_url, role)')
    .single();
  return { data, error };
}

// 更新帖子（编辑/置顶/精华/热门等）
export async function updateForumPost(postId, updates) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('forum_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  return { data, error };
}

// 删除帖子（软删除）
export async function deleteForumPost(postId) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  return updateForumPost(postId, { status: 'deleted' });
}

// ============ 论坛回复相关 ============

// 获取帖子的回复列表
export async function fetchForumReplies(postId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('forum_replies')
    .select('*, profiles:author_id(username, avatar_url, role)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) { console.error('获取回复失败:', error); return []; }
  return data || [];
}

// 发表回复
export async function createForumReply({ post_id, author_id, content, parent_id = null }) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('forum_replies')
    .insert({ post_id, author_id, content, parent_id })
    .select('*, profiles:author_id(username, avatar_url, role)')
    .single();
  return { data, error };
}

// 删除回复
export async function deleteForumReply(replyId) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
  return { error };
}

// ============ 论坛点赞相关 ============

// 帖子点赞/取消点赞
export async function togglePostLike(userId, postId) {
  if (!isSupabaseConfigured) return { liked: false };
  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    await supabase.from('forum_likes').delete().eq('id', existing.id);
    await supabase.from('forum_posts').update({ like_count: supabase.rpc ? undefined : 0 }).eq('id', postId);
    // 简化：直接用 SQL 自减
    await supabase.rpc('decrement_post_likes', { p_id: postId }).catch(() => {});
    return { liked: false };
  } else {
    await supabase.from('forum_likes').insert({ user_id: userId, post_id: postId });
    await supabase.rpc('increment_post_likes', { p_id: postId }).catch(() => {});
    return { liked: true };
  }
}

// 检查是否已点赞帖子
export async function checkPostLiked(userId, postId) {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  return !!data;
}

// ============ 关注相关 ============

// 关注用户
export async function followUser(followerId, followingId) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  return { error };
}

// 取消关注
export async function unfollowUser(followerId, followingId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('follows').delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
}

// 检查是否已关注
export async function checkFollowing(followerId, followingId) {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

// 获取关注/粉丝数
export async function fetchFollowCounts(userId) {
  if (!isSupabaseConfigured) return { followers: 0, following: 0 };
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers || 0, following: following || 0 };
}

// ============ 通知相关 ============

// 获取用户通知列表
export async function fetchNotifications(userId, { page = 1, pageSize = 30, unreadOnly = false } = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0 };
  let query = supabase
    .from('notifications')
    .select('*, sender:sender_id(username, avatar_url)', { count: 'exact' })
    .eq('user_id', userId);
  if (unreadOnly) query = query.eq('is_read', false);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error('获取通知失败:', error); return { data: [], count: 0 }; }
  return { data: data || [], count: count || 0 };
}

// 未读通知数
export async function fetchUnreadCount(userId) {
  if (!isSupabaseConfigured) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
}

// 标记通知已读
export async function markNotificationRead(notificationId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}

// 全部标记已读
export async function markAllNotificationsRead(userId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
}

// ============ 任务大厅相关 ============

// 获取任务列表
export async function fetchTasks({ page = 1, pageSize = 20, category = 'all', status = '', search = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0 };
  let query = supabase
    .from('tasks')
    .select('*, profiles:creator_id(username, avatar_url)', { count: 'exact' });
  if (category && category !== 'all') query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error('获取任务失败:', error); return { data: [], count: 0 }; }
  return { data: data || [], count: count || 0 };
}

// 创建任务
export async function createTask(taskData) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select('*, profiles:creator_id(username, avatar_url)')
    .single();
  return { data, error };
}

// 申请任务
export async function applyForTask(taskId, userId, message = '') {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('task_applications')
    .insert({ task_id: taskId, user_id: userId, message })
    .select()
    .single();
  if (!error) {
    // 申请数+1
    await supabase.rpc('increment_task_applicants', { t_id: taskId }).catch(() => {});
  }
  return { data, error };
}

// 获取任务的申请列表
export async function fetchTaskApplications(taskId) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('task_applications')
    .select('*, profiles:user_id(username, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ============ Realtime 订阅 ============

// 订阅歌曲评论实时更新
export function subscribeComments(songId, callback) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`comments:${songId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `song_id=eq.${songId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// 订阅论坛回复实时更新
export function subscribeForumReplies(postId, callback) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`forum_replies:${postId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'forum_replies',
      filter: `post_id=eq.${postId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// 订阅用户通知实时更新
export function subscribeNotifications(userId, callback) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ============================================================================
// 商城 / 订单 / 心愿单 / 地址 / 评价
// ============================================================================

// ---------- 收货地址 ----------

// 获取当前用户的所有收货地址（默认地址优先）
export async function fetchAddresses(userId) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) { console.error('获取地址失败:', error); return []; }
  return data || [];
}

// 新增收货地址
export async function createAddress(userId, addr) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const payload = {
    user_id: userId,
    recipient: addr.recipient || addr.name || '',
    phone: addr.phone || '',
    province: addr.province || '',
    city: addr.city || '',
    district: addr.district || '',
    address: addr.address || addr.detail || '',
    postal_code: addr.postal_code || addr.postalCode || '',
    is_default: !!addr.is_default || !!addr.isDefault,
  };
  const { data, error } = await supabase
    .from('shipping_addresses')
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

// 更新地址
export async function updateAddress(addressId, patch) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('shipping_addresses')
    .update(patch)
    .eq('id', addressId)
    .select()
    .single();
  return { data, error };
}

// 删除地址
export async function deleteAddress(addressId) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const { error } = await supabase
    .from('shipping_addresses')
    .delete()
    .eq('id', addressId);
  return { error };
}

// ---------- 订单 ----------

// 创建订单（事务式：先插 orders，再批量插 order_items）
export async function createOrder(userId, orderPayload, items) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const orderInsert = {
    order_no: orderPayload.orderNo || orderPayload.order_no,
    user_id: userId,
    subtotal: orderPayload.subtotal || 0,
    shipping_fee: orderPayload.shippingFee ?? orderPayload.shipping_fee ?? 0,
    discount: orderPayload.discount || 0,
    total: orderPayload.total || 0,
    status: orderPayload.status || 'paid',
    address_snapshot: orderPayload.address || orderPayload.address_snapshot || {},
    payment_method: orderPayload.paymentMethod || orderPayload.payment_method || 'mock',
    paid_at: orderPayload.paidAt || orderPayload.paid_at || new Date().toISOString(),
    note: orderPayload.note || '',
  };
  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderInsert)
    .select()
    .single();
  if (error) return { error };

  // 批量写入明细
  const itemsInsert = (items || []).map((it) => ({
    order_id: order.id,
    product_id: Number(it.id || it.product_id),
    product_name: it.name || it.product_name || '',
    product_image: it.image || it.product_image || '',
    category: it.category || '',
    unit_price: it.price ?? it.unit_price ?? 0,
    original_price: it.originalPrice ?? it.original_price ?? it.price ?? 0,
    quantity: it.qty ?? it.quantity ?? 1,
    subtotal: (it.price ?? it.unit_price ?? 0) * (it.qty ?? it.quantity ?? 1),
  }));
  if (itemsInsert.length) {
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsInsert);
    if (itemsErr) {
      console.error('订单明细写入失败:', itemsErr);
      return { data: order, error: itemsErr };
    }
  }
  return { data: order };
}

// 获取当前用户订单（含明细 + 评价聚合）
export async function fetchUserOrders(userId) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      reviews:product_reviews(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('获取订单失败:', error); return []; }
  return data || [];
}

// 管理员：获取全部订单
export async function fetchAllOrders() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      reviews:product_reviews(*)
    `)
    .order('created_at', { ascending: false });
  if (error) { console.error('获取全部订单失败:', error); return []; }
  return data || [];
}

// 更新订单状态 / 物流信息
export async function updateOrderStatus(orderId, patch) {
  if (!isSupabaseConfigured) return { error: 'Supabase 未配置' };
  const now = new Date().toISOString();
  const up = { ...patch };
  // 状态变更时自动打时间戳
  if (patch.status === 'shipped' && !patch.shipped_at) up.shipped_at = now;
  if (patch.status === 'delivered' && !patch.delivered_at) up.delivered_at = now;
  if (patch.status === 'completed' && !patch.completed_at) up.completed_at = now;
  if (patch.status === 'cancelled' && !patch.cancelled_at) up.cancelled_at = now;
  if (patch.status === 'refunded' && !patch.refunded_at) up.refunded_at = now;
  const { data, error } = await supabase
    .from('orders')
    .update(up)
    .eq('id', orderId)
    .select()
    .single();
  return { data, error };
}

// ---------- 商品评价 ----------

// 提交/更新订单内某商品的评价（upsert by unique(order_id,product_id)）
export async function upsertProductReview(userId, orderId, productId, review) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const payload = {
    order_id: orderId,
    user_id: userId,
    product_id: Number(productId),
    rating: review.rating ?? 5,
    content: review.content || '',
    tags: review.tags || [],
    images: review.images || [],
  };
  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(payload, { onConflict: 'order_id,product_id' })
    .select()
    .single();
  return { data, error };
}

// 获取某商品的所有评价
export async function fetchProductReviews(productId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      *,
      profiles:user_id(username, avatar_url)
    `)
    .eq('product_id', Number(productId))
    .order('created_at', { ascending: false });
  if (error) { console.error('获取评价失败:', error); return []; }
  return data || [];
}

// ---------- 心愿单 ----------

// 获取心愿单
export async function fetchWishlist(userId) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('获取心愿单失败:', error); return []; }
  return data || [];
}

// 加入心愿单（幂等）
export async function addToWishlist(userId, productId) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const { data, error } = await supabase
    .from('wishlist_items')
    .upsert({ user_id: userId, product_id: Number(productId) }, { onConflict: 'user_id,product_id' })
    .select()
    .single();
  return { data, error };
}

// 从心愿单移除
export async function removeFromWishlist(userId, productId) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', Number(productId));
  return { error };
}

// 清空心愿单
export async function clearWishlist(userId) {
  if (!isSupabaseConfigured || !userId) return { error: 'Supabase 未配置' };
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId);
  return { error };
}
