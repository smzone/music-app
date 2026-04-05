import { useState, useRef, useEffect } from 'react';
import { Heart, Gift, Send, Clock, Bell, Eye, Zap, MessageSquare, Volume2, Maximize2, ThumbsUp, Share2, CalendarDays } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 模拟聊天消息
const initialMessages = [
  { id: 1, user: '小明', avatar: '😊', content: '主播好！今天唱什么？', type: 'message', time: '14:01' },
  { id: 2, user: '音乐迷', avatar: '🎵', content: '期待新歌！', type: 'message', time: '14:02' },
  { id: 3, user: '系统', avatar: '🎁', content: '音乐迷 送出了 🌹×5', type: 'gift', time: '14:02' },
  { id: 4, user: '老粉丝', avatar: '⭐', content: '每次直播都来支持', type: 'message', time: '14:03' },
  { id: 5, user: '系统', avatar: '👑', content: '大佬666 送出了 🚀×1', type: 'gift', time: '14:04' },
  { id: 6, user: '新来的', avatar: '🐣', content: '第一次来，好酷！', type: 'message', time: '14:05' },
  { id: 7, user: '电子达人', avatar: '🎹', content: '这个beat太好听了！', type: 'message', time: '14:06' },
  { id: 8, user: '系统', avatar: '🎁', content: '电子达人 送出了 💎×3', type: 'gift', time: '14:06' },
  { id: 9, user: '吉他手阿杰', avatar: '🎸', content: '能教一下这个和弦进行吗？', type: 'message', time: '14:07' },
  { id: 10, user: '路过的', avatar: '👋', content: '被推荐进来的，声音太棒了', type: 'message', time: '14:08' },
];

// 礼物列表
const gifts = [
  { id: 1, emoji: '🌹', nameKey: 'live.gift.rose', price: 1, color: 'from-red-500/20 to-pink-500/20' },
  { id: 2, emoji: '🎵', nameKey: 'live.gift.note', price: 5, color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 3, emoji: '💎', nameKey: 'live.gift.diamond', price: 10, color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 4, emoji: '🚀', nameKey: 'live.gift.rocket', price: 50, color: 'from-orange-500/20 to-red-500/20' },
  { id: 5, emoji: '👑', nameKey: 'live.gift.crown', price: 100, color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 6, emoji: '🏆', nameKey: 'live.gift.trophy', price: 200, color: 'from-yellow-400/20 to-amber-500/20' },
];

// 直播预告
const upcomingStreams = [
  { id: 1, titleKey: 'live.upcoming.0.title', date: '03/28', time: '20:00', descKey: 'live.upcoming.0.desc', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop', tagKey: 'live.upcoming.0.tag' },
  { id: 2, titleKey: 'live.upcoming.1.title', date: '03/30', time: '15:00', descKey: 'live.upcoming.1.desc', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop', tagKey: 'live.upcoming.1.tag' },
  { id: 3, titleKey: 'live.upcoming.2.title', date: '04/01', time: '21:00', descKey: 'live.upcoming.2.desc', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=250&fit=crop', tagKey: 'live.upcoming.2.tag' },
];

// 直播数据统计
const liveStats = [
  { labelKey: 'live.stat.viewers', value: '1,234', icon: Eye, color: 'text-blue-400' },
  { labelKey: 'live.stat.likes', value: '8.6k', icon: ThumbsUp, color: 'text-red-400' },
  { labelKey: 'live.stat.giftIncome', value: '¥2,345', icon: Gift, color: 'text-yellow-400' },
  { labelKey: 'live.stat.duration', value: '2h 15m', icon: Clock, color: 'text-green-400' },
];

export default function LivePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('live.title'));
  const [messages, setMessages] = useState(initialMessages);
  const [inputMsg, setInputMsg] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [isLive] = useState(true);
  const [liked, setLiked] = useState(false);
  const { user } = useAuthStore();
  const chatEndRef = useRef(null);

  // 自动滚动到最新消息
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!user) { toast.error(t('live.loginFirst')); return; }
    if (!inputMsg.trim()) return;
    const newMsg = {
      id: Date.now(), user: user.username, avatar: user.avatar || '😊',
      content: inputMsg.trim(), type: 'message',
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleGift = (gift) => {
    if (!user) { toast.error(t('live.loginFirst')); return; }
    const giftMsg = {
      id: Date.now(), user: t('live.system'), avatar: '🎁',
      content: t('live.giftMsg', { user: user.username, gift: gift.emoji }),
      type: 'gift',
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, giftMsg]);
    setShowGifts(false);
    toast.success(t('live.sendGift', { name: t(gift.nameKey) }));
  };

  return (
    <div className="smart-container pt-8 pb-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：直播画面 */}
        <div className="flex-1 min-w-0">
          {/* 直播画面 */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop"
              alt="直播画面" className="w-full h-full object-cover" />
            {/* 顶部渐变 */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
            {/* 底部渐变 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

            {/* 直播状态 */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isLive ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/70 text-xs font-medium rounded-lg">
                  <Clock size={12} /> {t('live.offline')}
                </span>
              )}
              <span className="flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs rounded-lg">
                <Eye size={12} /> 1,234
              </span>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs rounded-lg">
                <Clock size={12} /> 2:15:33
              </span>
            </div>

            {/* 右上角控制 */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/80 hover:text-white"><Volume2 size={16} /></button>
              <button className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/80 hover:text-white"><Maximize2 size={16} /></button>
            </div>

            {/* 主播信息 */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-2 border-white/30 flex items-center justify-center text-xl shadow-lg">🎵</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold">{t('live.streamer')}</p>
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">{t('live.streamerTag')}</span>
                  </div>
                  <p className="text-white/60 text-sm">{t('live.streamerDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setLiked(!liked); toast.success(liked ? t('live.unfollowed') : t('live.liked')); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${liked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'}`}>
                  <Heart size={16} className={liked ? 'fill-red-400' : ''} /> {liked ? t('live.following') : t('live.follow')}
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success(t('live.shareCopied')); }}
                  className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 直播数据统计 */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {liveStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <Icon size={16} className={`mx-auto mb-1.5 ${s.color}`} />
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{t(s.labelKey)}</p>
                </div>
              );
            })}
          </div>

          {/* 直播预告 */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" /> {t('live.upcomingTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {upcomingStreams.map((stream) => (
                <div key={stream.id} className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 group">
                  <div className="aspect-video overflow-hidden relative">
                    <img src={stream.image} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-black text-[10px] font-bold rounded-md">{t(stream.tagKey)}</span>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white font-bold text-sm">{t(stream.titleKey)}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="text-primary font-bold">{stream.date}</span>
                      <span className="text-text-muted">{stream.time}</span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{t(stream.descKey)}</p>
                    <button onClick={() => toast.success(t('live.reminded'))}
                      className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                      <Bell size={11} /> {t('live.remind')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：聊天区 */}
        <div className="lg:w-[340px] shrink-0 flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden h-[650px] lg:h-auto">
          <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" /> {t('live.chat')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] text-text-muted"><Zap size={10} className="text-green-400" /> {t('live.realtime')}</span>
              <span className="text-[10px] text-text-muted bg-white/[0.05] px-2 py-0.5 rounded">{messages.length}</span>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {messages.map((msg) => (
              <div key={msg.id} className={`text-[13px] rounded-lg px-3 py-2 transition-colors ${msg.type === 'gift' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/10' : 'hover:bg-white/[0.03]'}`}>
                {msg.type === 'gift' ? (
                  <p className="text-yellow-400 font-medium flex items-center gap-1"><Gift size={12} /> {msg.content}</p>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0 mt-0.5">{msg.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary text-xs">{msg.user}</span>
                        <span className="text-text-muted text-[10px]">{msg.time}</span>
                      </div>
                      <p className="text-text-secondary mt-0.5 break-words">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* 礼物面板 */}
          {showGifts && (
            <div className="px-3 py-3 border-t border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-text-muted mb-2 font-medium">{t('live.sendGiftTo')}</p>
              <div className="grid grid-cols-3 gap-2">
                {gifts.map((gift) => (
                  <button key={gift.id} onClick={() => handleGift(gift)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gradient-to-br ${gift.color} border border-white/[0.05] hover:border-primary/30 transition-all hover:scale-105`}>
                    <span className="text-2xl">{gift.emoji}</span>
                    <span className="text-[10px] text-white font-medium">{t(gift.nameKey)}</span>
                    <span className="text-[10px] text-primary font-bold">{gift.price} {t('live.coins')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区 */}
          <div className="px-3 py-3 border-t border-white/[0.06] flex items-center gap-2">
            <button onClick={() => setShowGifts(!showGifts)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showGifts ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' : 'bg-white/[0.05] text-text-muted hover:text-yellow-400 border border-white/[0.06]'}`}>
              <Gift size={16} />
            </button>
            <input type="text" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={user ? t('live.chatPlaceholder') : t('live.chatPlaceholderLogin')}
              disabled={!user}
              className="flex-1 bg-white/[0.05] text-white px-3.5 py-2.5 rounded-xl outline-none text-sm placeholder:text-text-muted disabled:opacity-40 border border-white/[0.06] focus:border-primary transition-colors" />
            <button onClick={handleSend} disabled={!user || !inputMsg.trim()}
              className="w-9 h-9 bg-primary text-black rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-primary-hover transition-all">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
