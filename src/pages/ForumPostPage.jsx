import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, MessageSquare, Clock, Share2, Bookmark, ArrowLeft, Send, Heart, Film, ChevronDown, ChevronUp, MoreHorizontal, Flag, Pin, Flame, Star, Image } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { initialPosts, forumCategories, postTags, formatTime, formatNum, getLevelStyle } from '../data/forum';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 单条回复组件（支持嵌套）
function ReplyItem({ reply, depth = 0, onReplyTo, t }) {
  const [liked, setLiked] = useState(false);
  const [showNested, setShowNested] = useState(true);
  const lvl = getLevelStyle(reply.level);

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-white/[0.06] pl-4' : ''}`}>
      <div className="flex gap-3 py-4 group hover:bg-white/[0.015] -mx-3 px-3 rounded-xl transition-colors">
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-lg">{reply.avatar}</div>
        </div>
        <div className="flex-1 min-w-0">
          {/* 作者信息 */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-white">{reply.author}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lvl.color}`}>{lvl.textKey ? t(lvl.textKey) : lvl.text}</span>
            <span className="text-xs text-text-muted">{formatTime(reply.date, t)}</span>
          </div>
          {/* 回复内容 */}
          <p className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-line">{reply.content}</p>
          {/* 操作栏 */}
          <div className="flex items-center gap-4 mt-2.5">
            <button onClick={() => { setLiked(!liked); }} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-400' : 'text-text-muted hover:text-white'}`}>
              <Heart size={13} className={liked ? 'fill-red-400' : ''} /> {reply.likes + (liked ? 1 : 0)}
            </button>
            <button onClick={() => onReplyTo(reply.author)} className="text-xs text-text-muted hover:text-primary transition-colors">{t('forumPost.reply')}</button>
            <button className="text-xs text-text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={14} /></button>
          </div>
          {/* 嵌套回复 */}
          {reply.replies?.length > 0 && (
            <div className="mt-2">
              <button onClick={() => setShowNested(!showNested)} className="flex items-center gap-1 text-xs text-primary hover:underline mb-1">
                {showNested ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {t('forumPost.repliesCount', { count: reply.replies.length })}
              </button>
              {showNested && reply.replies.map((nested) => (
                <ReplyItem key={nested.id} reply={nested} depth={depth + 1} onReplyTo={onReplyTo} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForumPostPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const post = initialPosts.find((p) => p.id === Number(id));
  useDocumentTitle(post ? post.title : t('forumPost.detailTitle'));
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <MessageSquare size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
        <h2 className="text-xl font-bold text-white mb-2">{t('forumPost.notFound')}</h2>
        <p className="text-text-muted mb-6">{t('forumPost.notFoundDesc')}</p>
        <Link to="/forum" className="text-primary hover:underline">{t('forumPost.backToForum')}</Link>
      </div>
    );
  }

  const catInfo = forumCategories.find((c) => c.id === post.category);
  const lvl = getLevelStyle(post.level);

  const handleReply = () => {
    if (!user) { toast.error(t('forumPost.loginFirst')); return; }
    if (!replyText.trim()) return;
    toast.success(t('forumPost.replySent'));
    setReplyText('');
    setReplyTo('');
  };

  const handleReplyTo = (author) => {
    if (!user) { toast.error(t('forumPost.loginFirst')); return; }
    setReplyTo(author);
    setReplyText(`@${author} `);
    document.getElementById('reply-input')?.focus();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success(t('forumPost.linkCopied'));
  };

  // 渲染帖子内容（简单 Markdown 支持）
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h3>;
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*(.*)$/);
        if (match) return <li key={i} className="ml-4 mb-1"><strong className="text-white">{match[1]}</strong><span className="text-text-secondary">{match[2]}</span></li>;
      }
      if (line.startsWith('- ')) return <li key={i} className="text-text-secondary ml-4 mb-1">{line.replace('- ', '')}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="text-text-secondary ml-4 mb-1">{line}</li>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-text-secondary leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="smart-container-sm pb-16" style={{ paddingTop: 'clamp(5rem, 8vw, 8rem)' }}>
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <button onClick={() => navigate('/forum')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-primary transition-all">
          <ArrowLeft size={15} /> {t('forumPost.forum')}
        </button>
        <span className="text-white/10">/</span>
        {catInfo && <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.03]">{catInfo.icon} {t(catInfo.nameKey)}</span>}
      </div>

      {/* 帖子主体 */}
      <article className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* 帖子头部 */}
        <div className="p-6 lg:p-8 border-b border-white/[0.04]">
          {/* 标记 */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {post.isPinned && <span className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2.5 py-1 rounded-full"><Pin size={11} /> {t('forumPost.pinned')}</span>}
            {post.isHot && <span className="flex items-center gap-0.5 text-xs text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-full"><Flame size={11} /> {t('forumPost.hot')}</span>}
            {post.isEssence && <span className="flex items-center gap-0.5 text-xs text-yellow-300 font-bold bg-yellow-500/10 px-2.5 py-1 rounded-full"><Star size={11} /> {t('forumPost.essence')}</span>}
            {catInfo && <span className="text-xs bg-surface-lighter px-2.5 py-1 rounded-full text-text-muted">{catInfo.icon} {t(catInfo.nameKey)}</span>}
            {post.tags?.map((tagId) => {
              const tagItem = postTags.find((tg) => tg.id === tagId);
              return tagItem ? <span key={tagId} className={`text-xs px-2.5 py-1 rounded-full font-medium ${tagItem.color}`}>{t(tagItem.nameKey)}</span> : null;
            })}
          </div>

          {/* 标题 */}
          <h1 className="text-2xl lg:text-3xl font-black text-white leading-snug mb-5 break-words">{post.title}</h1>

          {/* 作者信息 */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-2xl">{post.avatar}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{post.author}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lvl.color}`}>{lvl.textKey ? t(lvl.textKey) : lvl.text}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(post.date, t)}</span>
                <span className="flex items-center gap-1"><Eye size={11} /> {formatNum(post.views, t)} {t('forumPost.views')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 帖子正文 */}
        <div className="p-6 lg:p-8">
          <div className="text-[15px] leading-relaxed">
            {renderContent(post.content)}
          </div>

          {/* 媒体展示 */}
          {post.media?.length > 0 && (
            <div className="mt-6">
              <div className={`grid gap-3 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {post.media.map((m, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer group" onClick={() => setMediaPreview(m)}>
                    <div className={`${post.media.length === 1 ? 'aspect-video' : 'aspect-[4/3]'}`}>
                      <img src={m.thumbnail || m.url} alt={m.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    {m.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Film size={20} className="text-white ml-0.5" />
                        </div>
                        {m.duration && <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">{m.duration}</span>}
                      </div>
                    )}
                    {m.caption && <p className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent text-xs text-white/80">{m.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 互动栏 */}
          <div className="flex items-center gap-2.5 flex-wrap mt-8 pt-6 border-t border-white/[0.04]">
            <button onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${liked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:text-white hover:border-white/[0.1]'}`}>
              <Heart size={15} className={liked ? 'fill-red-400' : ''} /> {formatNum(post.likes + (liked ? 1 : 0), t)}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:text-white hover:border-white/[0.1] transition-all">
              <MessageSquare size={15} /> {t('forumPost.repliesCount', { count: post.replies?.length || 0 })}
            </button>
            <button onClick={() => { setBookmarked(!bookmarked); toast.success(bookmarked ? t('forumPost.unfavorited') : t('forumPost.favorited')); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${bookmarked ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:text-white hover:border-white/[0.1]'}`}>
              <Bookmark size={15} className={bookmarked ? 'fill-yellow-400' : ''} /> {formatNum(post.bookmarks + (bookmarked ? 1 : 0), t)}
            </button>
            <div className="flex-1" />
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:text-white hover:border-white/[0.1] transition-all">
              <Share2 size={15} /> {t('forumPost.share')}
            </button>
            <button className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-white hover:border-white/[0.1] transition-all">
              <Flag size={15} />
            </button>
          </div>
        </div>
      </article>

      {/* 回复区域 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={17} className="text-primary" /> {t('forumPost.allReplies')}
            <span className="text-sm font-normal text-text-muted">({post.replies?.length || 0})</span>
          </h2>
        </div>

        {/* 回复列表 */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04] px-5 lg:px-6">
          {post.replies?.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} onReplyTo={handleReplyTo} t={t} />
          ))}
          {(!post.replies || post.replies.length === 0) && (
            <div className="py-12 text-center text-text-muted">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('forumPost.noReplies')}</p>
            </div>
          )}
        </div>

        {/* 回复输入框 */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 lg:p-6 mt-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-1">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm">{user?.avatar || '😊'}</div>
            </div>
            <div className="flex-1">
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                  <span>{t('forumPost.replyTo')} <span className="text-primary font-medium">@{replyTo}</span></span>
                  <button onClick={() => { setReplyTo(''); setReplyText(''); }} className="text-text-muted hover:text-white">{t('forumPost.cancelReply')}</button>
                </div>
              )}
              <textarea id="reply-input" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                rows={3} placeholder={user ? t('forumPost.replyPlaceholder') : t('forumPost.replyPlaceholderLogin')} disabled={!user}
                className="w-full bg-white/[0.04] text-white px-4 py-3 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-sm placeholder:text-text-muted resize-none disabled:opacity-40 transition-all" />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button type="button" disabled={!user} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30">
                    <Image size={15} />
                  </button>
                  <button type="button" disabled={!user} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-30">
                    <Film size={15} />
                  </button>
                </div>
                <button onClick={handleReply} disabled={!user || !replyText.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-sm transition-all disabled:opacity-30 hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
                  <Send size={14} /> {t('forumPost.sendReply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 媒体预览弹窗 */}
      {mediaPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setMediaPreview(null)}>
          <div className="max-w-4xl w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <img src={mediaPreview.url} alt={mediaPreview.caption || ''} className="w-full rounded-xl" />
            {mediaPreview.caption && <p className="text-sm text-text-secondary mt-3 text-center">{mediaPreview.caption}</p>}
          </div>
        </div>
      )}

      {/* 底部安全间距 */}
      <div className="h-4" />
    </div>
  );
}
