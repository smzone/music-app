import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Clock, Pin, Flame, Search, Plus, X, Image, Film, Sparkles, ChevronRight, Bookmark, Star, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { forumCategories, initialPosts as dataInitialPosts, postTags, sortOptions, formatTime, formatNum, getLevelStyle } from '../data/forum';
import { useTranslation } from 'react-i18next';

// 富文本发帖弹窗 — 支持图片/视频/标签
function NewPostModal({ onClose, onSubmit, t }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('music');
  const [selectedTags, setSelectedTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId].slice(0, 3));
  };

  const addMedia = (type) => {
    // 模拟添加媒体文件
    const mockUrls = {
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop',
      video: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
    };
    if (mediaFiles.length >= 9) { toast.error(t('forum.maxMedia')); return; }
    setMediaFiles([...mediaFiles, { type, url: mockUrls[type], id: Date.now() }]);
    toast.success(type === 'image' ? t('forum.addedImage') : t('forum.addedVideo'));
  };

  const removeMedia = (id) => setMediaFiles(mediaFiles.filter((m) => m.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error(t('forum.errorTitle')); return; }
    if (!content.trim()) { toast.error(t('forum.errorContent')); return; }
    onSubmit({ title, content, category, tags: selectedTags, media: mediaFiles.map((m) => ({ type: m.type, url: m.url, caption: '' })) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-lighter shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles size={20} className="text-primary" /> {t('forum.newPostTitle')}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 分类与标签 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-text-secondary block mb-1.5">{t('forum.category')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]">
                {forumCategories.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          {/* 标签选择 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('forum.tags')}（{t('forum.tagsMax')}）</label>
            <div className="flex flex-wrap gap-2">
              {postTags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag.id) ? tag.color + ' ring-1 ring-white/20' : 'bg-surface-lighter text-text-muted hover:text-white'}`}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          {/* 标题 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('forum.titleLabel')}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('forum.titlePlaceholder')} maxLength={100}
              className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base placeholder:text-text-muted" />
            <p className="text-xs text-text-muted mt-1 text-right">{title.length}/100</p>
          </div>
          {/* 内容 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('forum.contentLabel')}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder={t('forum.contentPlaceholder')}
              className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted resize-none leading-relaxed" />
          </div>
          {/* 媒体附件 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('forum.mediaLabel')}</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => addMedia('image')}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-lighter rounded-xl text-sm text-text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <Image size={16} /> {t('forum.addImage')}
              </button>
              <button type="button" onClick={() => addMedia('video')}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-lighter rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Film size={16} /> {t('forum.addVideo')}
              </button>
            </div>
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaFiles.map((m) => (
                  <div key={m.id} className="relative aspect-video rounded-lg overflow-hidden group">
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                    {m.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><Film size={20} className="text-white/80" /></div>}
                    <button type="button" onClick={() => removeMedia(m.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-surface-lighter text-text-secondary rounded-full hover:text-white transition-colors">{t('forum.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">{t('forum.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 帖子详情弹窗已移除 — 改为独立路由页面 /forum/:id

export default function ForumPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('forum.title'));
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState(dataInitialPosts);
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const { user } = useAuthStore();

  const filtered = posts.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory || p.isPinned;
    const matchSearch = !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.content.toLowerCase().includes(searchQ.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    if (sortBy === 'hot') return b.likes - a.likes;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'comments') return b.comments - a.comments;
    return new Date(b.date) - new Date(a.date);
  });

  const handleNewPost = ({ title, content, category, tags, media }) => {
    const newPost = {
      id: Date.now(), title, content, category, tags: tags || [], media: media || [],
      author: user?.username || t('forum.anonymous'), authorId: user?.id || 'guest', avatar: '😊', level: 'lv1',
      isPinned: false, isHot: false, isEssence: false,
      likes: 0, views: 0, comments: 0, shares: 0, bookmarks: 0,
      date: new Date().toISOString(),
      replies: [],
    };
    setPosts([newPost, ...posts]);
    toast.success(t('forum.postSuccess'));
  };

  const activeCount = activeCategory === 'all' ? posts.length : posts.filter((p) => p.category === activeCategory).length;

  return (
    <div className="smart-container pt-6 pb-12">
      {/* ===== Hero 横幅 ===== */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-violet-600/15 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-7 lg:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
              <Sparkles size={12} /> {t('forum.badge')}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">{t('forum.heading')}</h1>
            <p className="text-text-secondary text-sm max-w-md">{t('forum.desc')}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
              <span className="flex items-center gap-1"><MessageSquare size={14} /> {posts.length} 帖子</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {posts.reduce((s, p) => s + p.views, 0).toLocaleString()} 浏览</span>
              <span className="flex items-center gap-1"><ThumbsUp size={14} /> {posts.reduce((s, p) => s + p.likes, 0).toLocaleString()} 赞</span>
            </div>
          </div>
          <button onClick={() => { if (!user) { toast.error(t('live.loginFirst')); return; } setShowNewPost(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-sm self-start hover:shadow-[0_0_25px_rgba(29,185,84,0.2)]">
            <Plus size={16} /> {t('forum.newPost')}
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ===== 左侧分类面板 ===== */}
        <div className="lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* 分类列表 */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">板块分类</h3>
              {forumCategories.map((c) => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeCategory === c.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
                  <span className="text-base">{c.icon}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === c.id ? 'bg-primary/20 text-primary' : 'bg-white/[0.05] text-text-muted'}`}>{c.count}</span>
                </button>
              ))}
            </div>

            {/* 热帖排行 */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5"><TrendingUp size={14} className="text-red-400" /> 热帖排行</h3>
              <div className="space-y-3">
                {posts.sort((a, b) => b.likes - a.likes).slice(0, 5).map((p, i) => (
                  <div key={p.id} onClick={() => navigate(`/forum/${p.id}`)}
                    className="flex items-start gap-2.5 cursor-pointer group">
                    <span className={`text-xs font-black w-5 pt-0.5 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-orange-400' : i === 2 ? 'text-yellow-400' : 'text-text-muted'}`}>{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary line-clamp-2 group-hover:text-primary transition-colors leading-snug">{p.title}</p>
                      <span className="text-[10px] text-text-muted">{formatNum(p.likes)} 赞</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 标签云 */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-bold text-white mb-3">热门标签</h3>
              <div className="flex flex-wrap gap-1.5">
                {postTags.map((tag) => (
                  <span key={tag.id} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${tag.color} hover:scale-105 transition-transform cursor-pointer`}>{tag.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 右侧帖子列表 ===== */}
        <div className="flex-1 min-w-0">
          {/* 搜索 + 排序栏 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="搜索帖子标题或内容..."
                className="w-full bg-white/[0.04] text-white pl-10 pr-4 py-2.5 rounded-full outline-none border border-white/[0.06] focus:border-primary text-sm placeholder:text-text-muted transition-colors" />
            </div>
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
              {sortOptions.map((s) => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${sortBy === s.id ? 'bg-primary/15 text-primary' : 'text-text-muted hover:text-white'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* 当前分类信息 */}
          {activeCategory !== 'all' && (
            <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{forumCategories.find((c) => c.id === activeCategory)?.icon}</span>
                <span className="text-sm font-semibold text-white">{forumCategories.find((c) => c.id === activeCategory)?.name}</span>
                <span className="text-xs text-text-muted">— {forumCategories.find((c) => c.id === activeCategory)?.desc}</span>
              </div>
              <span className="text-xs text-text-muted bg-white/[0.05] px-2 py-0.5 rounded">{activeCount} 帖子</span>
            </div>
          )}

          {/* 帖子列表 */}
          <div className="space-y-3">
            {filtered.map((post) => {
              const catInfo = forumCategories.find((c) => c.id === post.category);
              const lvl = getLevelStyle(post.level);
              return (
                <div key={post.id} onClick={() => navigate(`/forum/${post.id}`)}
                  className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] group">
                  <div className="flex items-start gap-3.5">
                    {/* 头像 */}
                    <div className="shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xl">{post.avatar}</div>
                    </div>
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 标记行 */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {post.isPinned && <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md"><Pin size={9} /> 置顶</span>}
                        {post.isHot && <span className="flex items-center gap-0.5 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md"><Flame size={9} /> 热门</span>}
                        {post.isEssence && <span className="flex items-center gap-0.5 text-[10px] text-yellow-300 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md"><Star size={9} /> 精华</span>}
                        {catInfo && <span className="text-[10px] text-text-muted bg-white/[0.05] px-2 py-0.5 rounded-md">{catInfo.icon} {catInfo.name}</span>}
                        {post.tags?.map((tagId) => {
                          const tag = postTags.find((t) => t.id === tagId);
                          return tag ? <span key={tagId} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${tag.color}`}>{tag.name}</span> : null;
                        })}
                      </div>
                      {/* 标题 */}
                      <h3 className="text-[15px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
                      {/* 内容预览 */}
                      <p className="text-sm text-text-muted line-clamp-2 mt-1 leading-relaxed">{post.content.replace(/[#*\n]/g, ' ').trim()}</p>
                      {/* 媒体预览 */}
                      {post.media?.length > 0 && (
                        <div className="flex gap-2 mt-2.5">
                          {post.media.slice(0, 3).map((m, i) => (
                            <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden bg-white/[0.05]">
                              <img src={m.thumbnail || m.url} alt="" className="w-full h-full object-cover" />
                              {m.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Film size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {post.media.length > 3 && (
                            <div className="w-20 h-14 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs text-text-muted">+{post.media.length - 3}</div>
                          )}
                        </div>
                      )}
                      {/* 底部信息 */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-text-secondary">{post.author}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lvl.color}`}>{lvl.text}</span>
                        </div>
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(post.date)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} /> {formatNum(post.likes)}</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {formatNum(post.views)}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={11} /> {post.comments}</span>
                        <span className="flex items-center gap-1 ml-auto"><Bookmark size={11} /> {formatNum(post.bookmarks)}</span>
                        <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-text-muted">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
              <p>暂无帖子</p>
            </div>
          )}
        </div>
      </div>

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} t={t} />}
    </div>
  );
}
