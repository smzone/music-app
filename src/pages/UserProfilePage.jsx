import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Music, Heart, MessageSquare, Calendar, Shield, Crown, Edit3, Save, X, Headphones, Users, Award, Loader2, Package, ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import useWishlistStore from '../store/useWishlistStore';
import useHistoryStore from '../store/useHistoryStore';
import useAuthStore, { ROLES } from '../store/useAuthStore';
import useSongStore from '../store/useSongStore';
import useForumStore from '../store/useForumStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchFollowCounts } from '../lib/supabaseService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// 角色徽章配色
const roleBadge = {
  [ROLES.ADMIN]: { bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', icon: Shield },
  [ROLES.MODERATOR]: { bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-400', icon: Award },
  [ROLES.VIP]: { bg: 'bg-yellow-500/15 border-yellow-500/30', text: 'text-yellow-400', icon: Crown },
  [ROLES.USER]: { bg: 'bg-primary/15 border-primary/30', text: 'text-primary', icon: User },
};

export default function UserProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '🎵',
    genres: (user?.genres || []).join(', '),
  });

  // 从各 store 读取实时统计（hooks 必须在 early return 之前）
  const favCount = useSongStore((s) => s.favorites.length);
  const forumPosts = useForumStore((s) => s.posts);
  const wishCount = useWishlistStore((s) => s.items.length);
  const historyCount = useHistoryStore((s) => s.history.length);
  const orderCount = useOrderStore((s) => s.orders.length);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [followLoading, setFollowLoading] = useState(false);

  // Supabase 模式：加载关注/粉丝数
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;
    setFollowLoading(true);
    fetchFollowCounts(user.id).then((counts) => {
      setFollowCounts(counts);
      setFollowLoading(false);
    });
  }, [user?.id]);

  // 未登录跳转
  if (!user) {
    navigate('/login');
    return null;
  }

  const badge = roleBadge[user.role] || roleBadge[ROLES.USER];
  const BadgeIcon = badge.icon;
  const myPostsCount = forumPosts.filter((p) => (p.author === user?.username || p.user_id === user?.id)).length;

  const handleSave = () => {
    if (!form.username.trim()) { toast.error(t('userProfile.errUsername')); return; }
    updateProfile({
      username: form.username.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      avatar: form.avatar,
      genres: form.genres.split(',').map(g => g.trim()).filter(Boolean),
    });
    setEditing(false);
    toast.success(t('userProfile.saved'));
  };

  const avatarOptions = ['🎵', '🎸', '🎹', '🎤', '🎧', '🎺', '🥁', '🎻', '🎷', '🪗', '🎶', '🎼', '🦊', '🐱', '🐶', '🌟', '🔥', '💎', '🌈', '🍀'];

  // 统计数据
  const stats = [
    { icon: Heart, label: t('userProfile.likesReceived'), value: favCount },
    { icon: MessageSquare, label: t('userProfile.posts'), value: myPostsCount || user.postsCount || 0 },
    { icon: Users, label: t('userProfile.followers'), value: followLoading ? -1 : (followCounts.followers || user.followers || 0) },
    { icon: Headphones, label: t('userProfile.following'), value: followLoading ? -1 : (followCounts.following || 0) },
  ];

  return (
    <div className="smart-container py-10 animate-fadeIn">
      {/* 个人资料卡片 */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
        {/* 封面背景 */}
        <div className="h-40 md:h-52 bg-gradient-to-br from-primary/30 via-emerald-600/20 to-blue-600/20 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        </div>

        {/* 头像 + 基本信息 */}
        <div className="px-6 md:px-10 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            {/* 头像 */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/40 to-emerald-600/40 flex items-center justify-center text-5xl border-4 border-[#0f0f17] shadow-[0_0_30px_rgba(29,185,84,0.15)]">
                {user.avatar || '🎵'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg ${badge.bg} border flex items-center justify-center`}>
                <BadgeIcon size={13} className={badge.text} />
              </div>
            </div>

            {/* 文字信息 */}
            <div className="flex-1 min-w-0 md:pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-text-primary">{user.username}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} border uppercase tracking-wider`}>
                  {t(`userProfile.role_${user.role}`)}
                </span>
                {user.membership === 'vip' && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                    <Crown size={10} className="inline -mt-0.5 mr-0.5" /> VIP
                  </span>
                )}
              </div>
              {user.bio && <p className="text-sm text-text-secondary mt-2 max-w-xl">{user.bio}</p>}
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {user.email && (
                  <span className="text-xs text-text-muted flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                )}
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Calendar size={12} /> {t('userProfile.joined')} {new Date(user.joinDate).toLocaleDateString()}
                </span>
              </div>
              {user.genres?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Music size={13} className="text-text-muted" />
                  {user.genres.map((g, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-secondary border border-white/[0.06]">{g}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 编辑按钮 */}
            <div className="flex gap-2 md:pb-1">
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-text-primary text-sm font-medium rounded-xl border border-white/[0.08] transition-all">
                  <Edit3 size={14} /> {t('userProfile.editProfile')}
                </button>
              ) : (
                <>
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black text-sm font-bold rounded-xl transition-all">
                    <Save size={14} /> {t('userProfile.save')}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-text-muted text-sm rounded-xl border border-white/[0.08] transition-all">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center hover:border-white/[0.1] transition-all">
              <Icon size={20} className="mx-auto text-primary mb-2" />
              {s.value === -1 ? (
                <Loader2 size={18} className="animate-spin text-primary mx-auto" />
              ) : (
                <p className="text-xl font-black text-text-primary">{s.value.toLocaleString()}</p>
              )}
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        <Link to="/orders" className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-primary/30 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('nav.orders')}</p>
            <p className="text-xs text-text-muted truncate">{orderCount} {t('userProfile.orderCount') || '个订单'}</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </Link>

        <Link to="/wishlist" className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-red-400/30 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Heart size={18} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('wishlist.title') || '心愿单'}</p>
            <p className="text-xs text-text-muted truncate">{wishCount} {t('userProfile.itemCount') || '件商品'}</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-red-400 transition-colors shrink-0" />
        </Link>

        <Link to="/history" className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-blue-400/30 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('nav.history') || '播放历史'}</p>
            <p className="text-xs text-text-muted truncate">{historyCount} {t('userProfile.trackCount') || '首'}</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-blue-400 transition-colors shrink-0" />
        </Link>

        <Link to="/shop" className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-primary/30 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('nav.shop')}</p>
            <p className="text-xs text-text-muted truncate">{t('userProfile.goShopping')}</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </Link>

        <Link to="/membership" className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-yellow-500/30 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Crown size={18} className="text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('nav.membership')}</p>
            <p className="text-xs text-text-muted truncate">{t('userProfile.manageMembership')}</p>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-yellow-400 transition-colors shrink-0" />
        </Link>
      </div>

      {/* 编辑表单 */}
      {editing && (
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 animate-fadeIn">
          <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2"><Edit3 size={18} /> {t('userProfile.editTitle')}</h2>
          <div className="space-y-5">
            {/* 头像选择 */}
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('userProfile.selectAvatar')}</label>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map((emoji) => (
                  <button key={emoji} onClick={() => setForm({ ...form, avatar: emoji })}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${form.avatar === emoji ? 'bg-primary/20 border-2 border-primary scale-110 shadow-[0_0_15px_rgba(29,185,84,0.2)]' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('userProfile.username')}</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-white/[0.04] text-text-primary px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[14px] transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('userProfile.email')}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/[0.04] text-text-primary px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[14px] transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('userProfile.bio')}</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                placeholder={t('userProfile.bioPlaceholder')}
                className="w-full bg-white/[0.04] text-text-primary px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[14px] resize-none transition-all" />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('userProfile.genres')}</label>
              <input type="text" value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })}
                placeholder={t('userProfile.genresPlaceholder')}
                className="w-full bg-white/[0.04] text-white px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[14px] transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* 权限信息 */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Shield size={18} /> {t('userProfile.permissionsTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'canPost', check: user.role !== ROLES.GUEST },
            { key: 'canComment', check: user.role !== ROLES.GUEST },
            { key: 'canRate', check: user.role !== ROLES.GUEST },
            { key: 'canFollow', check: user.role !== ROLES.GUEST },
            { key: 'canUpload', check: user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR },
            { key: 'canModerate', check: user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR },
            { key: 'canAccessAdmin', check: user.role === ROLES.ADMIN },
            { key: 'canDownloadHQ', check: user.role === ROLES.VIP || user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR },
          ].map((p) => (
            <div key={p.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${p.check ? 'border-primary/20 bg-primary/[0.03]' : 'border-white/[0.04] bg-white/[0.01]'}`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${p.check ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-text-muted'}`}>
                {p.check ? '✓' : '✗'}
              </div>
              <span className={`text-sm ${p.check ? 'text-text-primary' : 'text-text-muted'}`}>{t(`userProfile.perm_${p.key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
