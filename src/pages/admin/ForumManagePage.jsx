import { useState } from 'react';
import { MessageSquare, Search, Pin, Flame, Star, Trash2, Filter } from 'lucide-react';
import { forumCategories, formatTime, formatNum, initialPosts } from '../../data/forum';
import useForumStore from '../../store/useForumStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ForumManagePage() {
  const { t } = useTranslation();
  // 从 store 读取帖子列表（Supabase / 本地双模式）
  const storePosts = useForumStore((s) => s.posts);
  const storeTogglePin = useForumStore((s) => s.togglePin);
  const storeToggleEssence = useForumStore((s) => s.toggleEssence);
  const storeRemovePost = useForumStore((s) => s.removePost);
  const [localPosts, setLocalPosts] = useState(null);
  const posts = localPosts || (storePosts.length > 0 ? storePosts : initialPosts);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = posts.filter((p) => {
    const matchSearch = !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.author.toLowerCase().includes(searchQ.toLowerCase());
    if (filterStatus === 'pinned') return matchSearch && p.isPinned;
    if (filterStatus === 'hot') return matchSearch && p.isHot;
    if (filterStatus === 'essence') return matchSearch && p.isEssence;
    return matchSearch;
  });

  const updateLocal = (fn) => setLocalPosts(fn(localPosts || [...posts]));

  const togglePin = (id) => {
    updateLocal((arr) => arr.map((p) => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
    storeTogglePin?.(id);
    toast.success(t('forumMgr.pinUpdated'));
  };

  const toggleHot = (id) => {
    updateLocal((arr) => arr.map((p) => p.id === id ? { ...p, isHot: !p.isHot } : p));
    toast.success(t('forumMgr.hotUpdated'));
  };

  const toggleEssence = (id) => {
    updateLocal((arr) => arr.map((p) => p.id === id ? { ...p, isEssence: !p.isEssence } : p));
    storeToggleEssence?.(id);
    toast.success(t('forumMgr.essenceUpdated'));
  };

  const deletePost = (id) => {
    updateLocal((arr) => arr.filter((p) => p.id !== id));
    storeRemovePost?.(id);
    toast.success(t('forumMgr.postDeleted'));
  };

  // 统计数据
  const stats = [
    { label: t('forumMgr.totalPosts'), value: posts.length, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('forumMgr.pinnedPosts'), value: posts.filter((p) => p.isPinned).length, icon: Pin, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: t('forumMgr.hotPosts'), value: posts.filter((p) => p.isHot).length, icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: t('forumMgr.essencePosts'), value: posts.filter((p) => p.isEssence).length, icon: Star, color: 'text-yellow-300', bg: 'bg-yellow-300/10' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t('forumMgr.title')}</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface-light rounded-2xl p-4 border border-surface-lighter">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder={t('forumMgr.searchPH')}
            className="w-full bg-surface-light text-white pl-9 pr-4 py-2.5 rounded-xl outline-none border border-surface-lighter focus:border-primary text-sm placeholder:text-text-muted" />
        </div>
        <div className="flex items-center gap-1 bg-surface-light rounded-xl p-1 border border-surface-lighter">
          <Filter size={14} className="text-text-muted ml-2" />
          {[
            { id: 'all', label: t('forumMgr.filterAll') },
            { id: 'pinned', label: t('forumMgr.filterPinned') },
            { id: 'hot', label: t('forumMgr.filterHot') },
            { id: 'essence', label: t('forumMgr.filterEssence') },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === f.id ? 'bg-primary/15 text-primary' : 'text-text-muted hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-lighter text-text-muted text-left">
                <th className="px-4 py-3 font-medium">{t('forumMgr.colPost')}</th>
                <th className="px-4 py-3 font-medium w-20">{t('forumMgr.colCategory')}</th>
                <th className="px-4 py-3 font-medium w-16 text-center">{t('forumMgr.colViews')}</th>
                <th className="px-4 py-3 font-medium w-16 text-center">{t('forumMgr.colLikes')}</th>
                <th className="px-4 py-3 font-medium w-16 text-center">{t('forumMgr.colReplies')}</th>
                <th className="px-4 py-3 font-medium w-24">{t('forumMgr.colStatus')}</th>
                <th className="px-4 py-3 font-medium w-32 text-right">{t('forumMgr.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-lighter">
              {filtered.map((post) => {
                const cat = forumCategories.find((c) => c.id === post.category);
                return (
                  <tr key={post.id} className="hover:bg-surface-lighter/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{post.avatar}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-text-muted">{post.author} · {formatTime(post.date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{cat?.icon} {cat?.name}</td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{formatNum(post.views)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{formatNum(post.likes)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{post.comments}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {post.isPinned && <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded font-bold">{t('forumMgr.tagPin')}</span>}
                        {post.isHot && <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-bold">{t('forumMgr.tagHot')}</span>}
                        {post.isEssence && <span className="text-[10px] bg-yellow-300/15 text-yellow-300 px-1.5 py-0.5 rounded font-bold">{t('forumMgr.tagEssence')}</span>}
                        {!post.isPinned && !post.isHot && !post.isEssence && <span className="text-[10px] text-text-muted">{t('forumMgr.tagNormal')}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => togglePin(post.id)} title={t('forumMgr.filterPinned')}
                          className={`p-1.5 rounded-lg transition-colors ${post.isPinned ? 'bg-yellow-500/15 text-yellow-400' : 'text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10'}`}>
                          <Pin size={14} />
                        </button>
                        <button onClick={() => toggleHot(post.id)} title={t('forumMgr.filterHot')}
                          className={`p-1.5 rounded-lg transition-colors ${post.isHot ? 'bg-red-500/15 text-red-400' : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'}`}>
                          <Flame size={14} />
                        </button>
                        <button onClick={() => toggleEssence(post.id)} title={t('forumMgr.filterEssence')}
                          className={`p-1.5 rounded-lg transition-colors ${post.isEssence ? 'bg-yellow-300/15 text-yellow-300' : 'text-text-muted hover:text-yellow-300 hover:bg-yellow-300/10'}`}>
                          <Star size={14} />
                        </button>
                        <button onClick={() => deletePost(post.id)} title={t('forumMgr.delete')}
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">{t('forumMgr.noPosts')}</div>
        )}
      </div>
    </div>
  );
}
