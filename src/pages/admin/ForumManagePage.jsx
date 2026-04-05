import { useState } from 'react';
import { MessageSquare, Search, Pin, Flame, Star, Trash2, Filter } from 'lucide-react';
import { initialPosts, forumCategories, formatTime, formatNum } from '../../data/forum';
import toast from 'react-hot-toast';

export default function ForumManagePage() {
  const [posts, setPosts] = useState(initialPosts);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = posts.filter((p) => {
    const matchSearch = !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.author.toLowerCase().includes(searchQ.toLowerCase());
    if (filterStatus === 'pinned') return matchSearch && p.isPinned;
    if (filterStatus === 'hot') return matchSearch && p.isHot;
    if (filterStatus === 'essence') return matchSearch && p.isEssence;
    return matchSearch;
  });

  const togglePin = (id) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
    toast.success('置顶状态已更新');
  };

  const toggleHot = (id) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, isHot: !p.isHot } : p));
    toast.success('热门状态已更新');
  };

  const toggleEssence = (id) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, isEssence: !p.isEssence } : p));
    toast.success('精华状态已更新');
  };

  const deletePost = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success('帖子已删除');
  };

  // 统计数据
  const stats = [
    { label: '总帖子', value: posts.length, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '置顶帖', value: posts.filter((p) => p.isPinned).length, icon: Pin, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: '热门帖', value: posts.filter((p) => p.isHot).length, icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: '精华帖', value: posts.filter((p) => p.isEssence).length, icon: Star, color: 'text-yellow-300', bg: 'bg-yellow-300/10' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">论坛管理</h1>
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
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="搜索帖子标题或作者..."
            className="w-full bg-surface-light text-white pl-9 pr-4 py-2.5 rounded-xl outline-none border border-surface-lighter focus:border-primary text-sm placeholder:text-text-muted" />
        </div>
        <div className="flex items-center gap-1 bg-surface-light rounded-xl p-1 border border-surface-lighter">
          <Filter size={14} className="text-text-muted ml-2" />
          {[
            { id: 'all', label: '全部' },
            { id: 'pinned', label: '置顶' },
            { id: 'hot', label: '热门' },
            { id: 'essence', label: '精华' },
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
                <th className="px-4 py-3 font-medium">帖子</th>
                <th className="px-4 py-3 font-medium w-20">板块</th>
                <th className="px-4 py-3 font-medium w-16 text-center">浏览</th>
                <th className="px-4 py-3 font-medium w-16 text-center">点赞</th>
                <th className="px-4 py-3 font-medium w-16 text-center">回复</th>
                <th className="px-4 py-3 font-medium w-24">状态</th>
                <th className="px-4 py-3 font-medium w-32 text-right">操作</th>
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
                        {post.isPinned && <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded font-bold">顶</span>}
                        {post.isHot && <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-bold">热</span>}
                        {post.isEssence && <span className="text-[10px] bg-yellow-300/15 text-yellow-300 px-1.5 py-0.5 rounded font-bold">精</span>}
                        {!post.isPinned && !post.isHot && !post.isEssence && <span className="text-[10px] text-text-muted">普通</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => togglePin(post.id)} title="置顶"
                          className={`p-1.5 rounded-lg transition-colors ${post.isPinned ? 'bg-yellow-500/15 text-yellow-400' : 'text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10'}`}>
                          <Pin size={14} />
                        </button>
                        <button onClick={() => toggleHot(post.id)} title="热门"
                          className={`p-1.5 rounded-lg transition-colors ${post.isHot ? 'bg-red-500/15 text-red-400' : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'}`}>
                          <Flame size={14} />
                        </button>
                        <button onClick={() => toggleEssence(post.id)} title="精华"
                          className={`p-1.5 rounded-lg transition-colors ${post.isEssence ? 'bg-yellow-300/15 text-yellow-300' : 'text-text-muted hover:text-yellow-300 hover:bg-yellow-300/10'}`}>
                          <Star size={14} />
                        </button>
                        <button onClick={() => deletePost(post.id)} title="删除"
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
          <div className="py-12 text-center text-text-muted text-sm">暂无匹配的帖子</div>
        )}
      </div>
    </div>
  );
}
