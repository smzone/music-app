import { useState, useEffect, useRef } from 'react';
import { Play, Heart, MessageSquare, X, Share2, Bookmark, Send, ChevronUp, ChevronDown, Eye, Film, TrendingUp, Clock, Sparkles, Crown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 模拟视频数据 — 抖音风格竖版封面（9:16比例）
const videosData = [
  { id: 1, title: '原创歌曲《夜空中的星》完整MV', thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop', duration: '4:32', views: 12500, likes: 890, comments: 67, category: 'MV', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 2, title: '如何用Logic Pro制作电子音乐', thumbnail: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400&h=600&fit=crop', duration: '18:45', views: 89000, likes: 6540, comments: 1200, category: '教程', author: '音乐创作者', avatar: '🎵', isPremium: true },
  { id: 3, title: '探店：北京最酷的独立唱片店', thumbnail: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&h=600&fit=crop', duration: '12:08', views: 67000, likes: 4320, comments: 580, category: 'Vlog', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 4, title: '合成器制作 Lo-Fi 节拍教学', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop', duration: '22:15', views: 152000, likes: 12300, comments: 1980, category: '教程', author: '音乐创作者', avatar: '🎵', isPremium: true },
  { id: 5, title: '「城市漫步」原创音乐短片', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop', duration: '3:48', views: 98000, likes: 7650, comments: 450, category: 'MV', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 6, title: '我的音乐工作室 Tour 2025', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=600&fit=crop', duration: '8:22', views: 113000, likes: 9870, comments: 890, category: 'Vlog', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 7, title: '混音技巧：让人声更有质感', thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=600&fit=crop', duration: '15:30', views: 76000, likes: 5430, comments: 760, category: '教程', author: '音乐创作者', avatar: '🎵', isPremium: true },
  { id: 8, title: '新歌创作幕后花絮', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=600&fit=crop', duration: '6:45', views: 54000, likes: 3210, comments: 340, category: 'Vlog', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 9, title: '一分钟学会这个和弦进行', thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=600&fit=crop', duration: '1:02', views: 230000, likes: 18900, comments: 2340, category: '教程', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 10, title: '深夜录音室即兴弹唱', thumbnail: 'https://images.unsplash.com/photo-1460667262436-cf19894f4774?w=400&h=600&fit=crop', duration: '5:18', views: 87000, likes: 6780, comments: 560, category: 'MV', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 11, title: '设备开箱：新到的模块合成器', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop', duration: '9:42', views: 45000, likes: 3890, comments: 420, category: 'Vlog', author: '音乐创作者', avatar: '🎵', isPremium: false },
  { id: 12, title: '翻唱挑战：用一把吉他演绎经典', thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=600&fit=crop', duration: '3:25', views: 178000, likes: 15600, comments: 1870, category: 'MV', author: '音乐创作者', avatar: '🎵', isPremium: false },
];

const categories = [
  { id: '全部', icon: '📺', emoji: true },
  { id: 'MV', icon: '🎬', emoji: true },
  { id: '教程', icon: '📚', emoji: true },
  { id: 'Vlog', icon: '📷', emoji: true },
];

// 格式化播放量
function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// 抖音风格视频播放弹窗 — 支持上下滚动切换
function VideoPlayerModal({ video, videos, onClose, onLike, onSwitch, t }) {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(null);
  const touchStartY = useRef(null);
  const switchVideoRef = useRef(null);
  const { user } = useAuthStore();

  // 重置点赞状态
  useEffect(() => { setLiked(false); setComment(''); }, [video?.id]);

  // 键盘切换
  useEffect(() => {
    if (!video) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') switchVideoRef.current?.('up');
      else if (e.key === 'ArrowUp' || e.key === 'k') switchVideoRef.current?.('down');
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [video, onClose]);

  if (!video) return null;

  const currentIndex = videos.findIndex((v) => v.id === video.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const handleLike = () => { setLiked(!liked); if (onLike) onLike(video.id); };

  const switchVideo = (dir) => {
    if (transitioning) return;
    const nextIdx = dir === 'up' ? currentIndex + 1 : currentIndex - 1;
    if (nextIdx < 0 || nextIdx >= videos.length) return;
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      onSwitch(videos[nextIdx]);
      setDirection(null);
      setTransitioning(false);
    }, 300);
  };

  // 鼠标滚轮切换
  const handleWheel = (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 30) return;
    switchVideo(e.deltaY > 0 ? 'up' : 'down');
  };

  // 触摸滑动切换
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 60) switchVideo(diff > 0 ? 'up' : 'down');
    touchStartY.current = null;
  };

  // 更新 switchVideo ref，供键盘事件安全调用
  switchVideoRef.current = switchVideo;

  const animClass = direction === 'up' ? 'translate-y-full opacity-0' : direction === 'down' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100';

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={onClose}
      onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative w-full h-full max-w-lg mx-auto flex items-center" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <X size={22} />
        </button>

        {/* 上下切换箭头提示 */}
        {hasPrev && (
          <button onClick={() => switchVideo('down')} className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors animate-bounce">
            <ChevronUp size={24} />
          </button>
        )}
        {hasNext && (
          <button onClick={() => switchVideo('up')} className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors animate-bounce">
            <ChevronDown size={24} />
          </button>
        )}

        {/* 视频序号指示器 */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          {videos.slice(Math.max(0, currentIndex - 3), Math.min(videos.length, currentIndex + 4)).map((v) => (
            <div key={v.id} className={`w-1 rounded-full transition-all duration-300 ${v.id === video.id ? 'h-6 bg-primary' : 'h-2 bg-white/20'}`} />
          ))}
        </div>

        {/* 视频画面 — 带切换动画 */}
        <div className={`relative w-full aspect-[9/16] max-h-[90vh] bg-black rounded-2xl overflow-hidden mx-auto transition-all duration-300 ease-out ${animClass}`}>
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />

          {/* 播放按钮 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <Play size={30} className="text-white ml-1" />
            </div>
          </div>

          {/* VIP标记 */}
          {video.isPremium && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">VIP</div>
          )}

          {/* 底部信息 */}
          <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{video.avatar}</span>
              <span className="text-sm font-bold text-white">@{video.author}</span>
              <button className="ml-2 px-3 py-0.5 border border-primary text-primary text-xs rounded-full font-medium hover:bg-primary hover:text-black transition-all">{t('videos.follow')}</button>
            </div>
            <p className="text-sm text-white/90 line-clamp-2 mb-2">{video.title}</p>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="px-2 py-0.5 bg-white/10 rounded">{video.category}</span>
              <span>{video.duration}</span>
              <span className="ml-auto">{currentIndex + 1}/{videos.length}</span>
            </div>
          </div>

          {/* 右侧互动栏 */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
            <button onClick={handleLike} className="flex flex-col items-center gap-1">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-red-500/20' : 'bg-black/30 backdrop-blur-sm'}`}>
                <Heart size={22} className={liked ? 'fill-red-500 text-red-500' : 'text-white'} />
              </div>
              <span className="text-xs text-white font-medium">{formatCount(video.likes + (liked ? 1 : 0))}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare size={22} className="text-white" />
              </div>
              <span className="text-xs text-white font-medium">{formatCount(video.comments)}</span>
            </button>
            <button onClick={() => toast.success(t('videos.favorited'))} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Bookmark size={22} className="text-white" />
              </div>
              <span className="text-xs text-white font-medium">{t('videos.favorite')}</span>
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(t('videos.shareText', { title: video.title })); toast.success(t('videos.linkCopied')); }} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 size={22} className="text-white" />
              </div>
              <span className="text-xs text-white font-medium">{t('videos.share')}</span>
            </button>
          </div>
        </div>

        {/* 底部评论输入 */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2">
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={user ? t('videos.commentPlaceholder') : t('videos.commentPlaceholderLogin')} disabled={!user}
            className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-full outline-none text-sm placeholder:text-white/40 disabled:opacity-40" />
          <button disabled={!user || !comment.trim()}
            onClick={() => { toast.success(t('videos.commentSent')); setComment(''); }}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center disabled:opacity-30">
            <Send size={16} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('videos.title'));
  const [activeCategory, setActiveCategory] = useState('全部');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(new Set());

  const filtered = videosData.filter((v) => activeCategory === '全部' || v.category === activeCategory);
  const totalViews = videosData.reduce((s, v) => s + v.views, 0);
  const totalLikes = videosData.reduce((s, v) => s + v.likes, 0);

  const toggleLike = (id) => {
    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // 瀑布流左右两列
  const leftCol = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 === 1);

  const VideoCard = ({ video, tall }) => (
    <div className="group cursor-pointer mb-3.5" onClick={() => setPlayingVideo(video)}>
      <div className={`relative ${tall ? 'aspect-[9/14]' : 'aspect-[9/12]'} rounded-2xl overflow-hidden border border-white/[0.06] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]`}>
        <img src={video.thumbnail} alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* VIP */}
        {video.isPremium && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold rounded-md">
            <Crown size={9} /> VIP
          </div>
        )}

        {/* 时长 */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[10px] text-white font-medium flex items-center gap-1">
          <Clock size={9} /> {video.duration}
        </div>

        {/* 播放按钮 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:scale-110 transition-transform">
            <Play size={24} className="text-black ml-0.5" />
          </div>
        </div>

        {/* 底部信息叠加 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[13px] font-bold text-white line-clamp-2 leading-snug mb-2.5">{video.title}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px]">{video.avatar}</div>
              <span className="text-[11px] text-white/70 font-medium">{video.author}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/50">
              <span className="flex items-center gap-0.5"><Eye size={10} /> {formatCount(video.views)}</span>
              <span className="flex items-center gap-0.5"><Heart size={10} className={likedVideos.has(video.id) ? 'fill-red-400 text-red-400' : ''} /> {formatCount(video.likes)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="smart-container-sm pt-6 pb-12">
      {/* ===== Hero 横幅 ===== */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/15 to-pink-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="relative p-7 lg:p-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
            <Film size={12} /> {t('videos.badge')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">{t('videos.heading')}</h1>
          <p className="text-text-secondary text-sm max-w-md">{t('videos.desc')}</p>
          <div className="flex items-center gap-5 mt-5 text-sm text-text-muted">
            <span className="flex items-center gap-1"><Film size={14} /> {t('videos.videoCount', { count: videosData.length })}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {formatCount(totalViews)} {t('videos.totalViews')}</span>
            <span className="flex items-center gap-1"><Heart size={14} /> {formatCount(totalLikes)} {t('videos.totalLikes')}</span>
          </div>
        </div>
      </div>

      {/* ===== 分类标签 ===== */}
      <div className="flex items-center gap-2.5 mb-6 overflow-x-auto scrollbar-none pb-1">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(29,185,84,0.1)]' : 'bg-white/[0.03] text-text-secondary hover:text-white border border-white/[0.06] hover:border-white/[0.12]'}`}>
            <span>{c.icon}</span> {c.id}
          </button>
        ))}
        <span className="text-xs text-text-muted ml-auto shrink-0 bg-white/[0.04] px-2.5 py-1 rounded-lg">{t('videos.videoCount', { count: filtered.length })}</span>
      </div>

      {/* ===== 热门推荐 — 大卡片 ===== */}
      {activeCategory === '全部' && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> {t('videos.all')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {videosData.sort((a, b) => b.views - a.views).slice(0, 2).map((video) => (
              <div key={video.id} className="group cursor-pointer relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-primary/20 transition-all duration-500" onClick={() => setPlayingVideo(video)}>
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {video.isPremium && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold rounded-md"><Crown size={9} /> VIP</div>
                )}
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[10px] text-white flex items-center gap-1"><Clock size={9} /> {video.duration}</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.3)]"><Play size={24} className="text-black ml-0.5" /></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-bold text-white line-clamp-1 mb-1.5">{video.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-white/60">
                    <span className="flex items-center gap-0.5"><Eye size={10} /> {formatCount(video.views)}</span>
                    <span className="flex items-center gap-0.5"><Heart size={10} /> {formatCount(video.likes)}</span>
                    <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {formatCount(video.comments)}</span>
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 双列瀑布流 ===== */}
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-primary" /> {activeCategory === '全部' ? t('videos.all') : activeCategory}
      </h2>
      <div className="flex gap-3">
        {/* 左列 */}
        <div className="flex-1">
          {leftCol.map((video, i) => (
            <VideoCard key={video.id} video={video} tall={i % 3 === 0} />
          ))}
        </div>
        {/* 右列 */}
        <div className="flex-1">
          {rightCol.map((video, i) => (
            <VideoCard key={video.id} video={video} tall={i % 3 === 1} />
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-text-muted">
          <Film size={40} className="mx-auto mb-3 opacity-20" />
          <p>该分类暂无视频</p>
        </div>
      )}

      {/* 视频播放弹窗 */}
      <VideoPlayerModal video={playingVideo} videos={filtered} onClose={() => setPlayingVideo(null)} onLike={toggleLike} onSwitch={setPlayingVideo} t={t} />
    </div>
  );
}
