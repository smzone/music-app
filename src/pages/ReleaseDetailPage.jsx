import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Star, Eye, Heart, MessageSquare, ExternalLink, Calendar, HardDrive, Tag, Send, Share2, Bookmark } from 'lucide-react';
import { initialReleases, releaseCategories, platformTags } from '../data/releases';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ReleaseDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuthStore();
  const release = initialReleases.find((r) => r.id === Number(id));
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(release?.comments || []);

  useDocumentTitle(release ? release.title : t('releases.notFound'));

  if (!release) {
    return (
      <div className="smart-container py-20 text-center animate-fadeIn">
        <p className="text-6xl mb-4">📦</p>
        <h2 className="text-xl font-bold text-white mb-2">{t('releases.notFound')}</h2>
        <Link to="/releases" className="text-primary hover:underline text-sm">{t('releases.backToList')}</Link>
      </div>
    );
  }

  const cat = releaseCategories.find((c) => c.id === release.category);

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? t('releases.unliked') : t('releases.liked'));
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? t('releases.unbookmarked') : t('releases.bookmarked'));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success(t('releases.linkCopied'));
  };

  const handleComment = () => {
    if (!user) { toast.error(t('releases.loginToComment')); return; }
    if (!commentText.trim()) return;
    setComments([...comments, {
      id: Date.now(), author: user.username, avatar: user.avatar || '🎵',
      content: commentText.trim(), date: new Date().toISOString(), likes: 0,
    }]);
    setCommentText('');
    toast.success(t('releases.commentSent'));
  };

  return (
    <div className="smart-container py-8 animate-fadeIn">
      {/* 返回 */}
      <Link to="/releases" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} /> {t('releases.backToList')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左栏：截图 + 描述 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 主截图 */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-surface-light">
            <img src={release.screenshots[activeImg]} alt={release.title}
              className="w-full aspect-video object-cover" />
          </div>
          {/* 缩略图 */}
          {release.screenshots.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {release.screenshots.map((url, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary shadow-[0_0_10px_rgba(29,185,84,0.2)]' : 'border-white/[0.06] opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 描述 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-base font-bold text-white mb-4">{t('releases.description')}</h2>
            <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
              {release.description}
            </div>
          </div>

          {/* 评论区 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> {t('releases.comments')} ({comments.length})
            </h2>
            {/* 评论输入 */}
            <div className="flex gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-sm shrink-0">
                {user?.avatar || '🎵'}
              </div>
              <div className="flex-1">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? t('releases.commentPH') : t('releases.loginToComment')}
                  rows={2} disabled={!user}
                  className="w-full bg-white/[0.04] text-white px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-sm resize-none placeholder:text-text-muted transition-all disabled:opacity-50" />
                <div className="flex justify-end mt-2">
                  <button onClick={handleComment} disabled={!user || !commentText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Send size={12} /> {t('releases.send')}
                  </button>
                </div>
              </div>
            </div>
            {/* 评论列表 */}
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span className="text-lg shrink-0">{c.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.author}</span>
                      <span className="text-[10px] text-text-muted">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{c.content}</p>
                    <button className="text-[11px] text-text-muted hover:text-primary mt-1 flex items-center gap-1 transition-colors">
                      <Heart size={10} /> {c.likes}
                    </button>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-text-muted text-center py-6">{t('releases.noComments')}</p>
              )}
            </div>
          </div>
        </div>

        {/* 右栏：信息面板 */}
        <div className="space-y-5">
          {/* 标题卡片 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat?.color || ''} text-white border border-white/10`}>
                {cat?.icon} {t(cat?.nameKey || '')}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted border border-white/[0.06]">v{release.version}</span>
            </div>
            <h1 className="text-xl font-black text-white">{release.title}</h1>
            <p className="text-sm text-text-muted mt-1">{release.subtitle}</p>

            {/* 评分 */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= Math.round(release.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{release.rating}</span>
              <span className="text-xs text-text-muted">({release.ratingCount} {t('releases.ratings')})</span>
            </div>

            {/* 下载按钮 */}
            <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-5 py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all text-sm hover:shadow-[0_0_20px_rgba(29,185,84,0.2)]">
              <Download size={17} /> {release.size === 'Online' ? t('releases.openOnline') : t('releases.download')} {release.size !== 'Online' && `(${release.size})`}
            </a>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-3">
              <button onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all border ${liked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-white'}`}>
                <Heart size={14} className={liked ? 'fill-red-400' : ''} /> {liked ? release.likes + 1 : release.likes}
              </button>
              <button onClick={handleBookmark}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all border ${bookmarked ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-white'}`}>
                <Bookmark size={14} className={bookmarked ? 'fill-yellow-400' : ''} /> {t('releases.bookmark')}
              </button>
              <button onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-text-muted hover:text-white transition-all">
                <Share2 size={14} /> {t('releases.share')}
              </button>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3.5">
            <h3 className="text-sm font-bold text-white mb-1">{t('releases.info')}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoAuthor')}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{release.avatar}</span>
                <span className="text-white font-medium">{release.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoPlatform')}</span>
              <div className="flex flex-wrap gap-1">
                {release.platforms.map((p) => {
                  const plat = platformTags.find((pt) => pt.id === p);
                  return plat ? <span key={p} className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border ${plat.color}`}>{plat.icon} {plat.label}</span> : null;
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoSize')}</span>
              <span className="text-white flex items-center gap-1"><HardDrive size={13} /> {release.size}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoLicense')}</span>
              <span className="text-primary font-medium">{release.license === 'free' ? t('releases.free') : release.license}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoDate')}</span>
              <span className="text-text-secondary flex items-center gap-1"><Calendar size={13} /> {new Date(release.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-20 shrink-0">{t('releases.infoTags')}</span>
              <div className="flex flex-wrap gap-1">
                {release.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted border border-white/[0.06] flex items-center gap-0.5"><Tag size={9} /> {tag}</span>
                ))}
              </div>
            </div>
            {/* 统计 */}
            <div className="pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-white">{release.downloads > 1000 ? (release.downloads / 1000).toFixed(1) + 'k' : release.downloads}</p>
                <p className="text-[10px] text-text-muted flex items-center justify-center gap-0.5"><Download size={9} /> {t('releases.downloads')}</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">{release.views > 1000 ? (release.views / 1000).toFixed(1) + 'k' : release.views}</p>
                <p className="text-[10px] text-text-muted flex items-center justify-center gap-0.5"><Eye size={9} /> {t('releases.views')}</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">{release.likes}</p>
                <p className="text-[10px] text-text-muted flex items-center justify-center gap-0.5"><Heart size={9} /> {t('releases.likes')}</p>
              </div>
            </div>
          </div>

          {/* 外部链接 */}
          {(release.website || release.sourceUrl) && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2">
              <h3 className="text-sm font-bold text-white mb-1">{t('releases.links')}</h3>
              {release.website && (
                <a href={release.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                  <ExternalLink size={14} /> {t('releases.website')}
                </a>
              )}
              {release.sourceUrl && (
                <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                  <ExternalLink size={14} /> {t('releases.sourceCode')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
