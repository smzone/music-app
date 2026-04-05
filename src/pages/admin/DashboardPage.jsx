import { Music, Users, Headphones, Star, TrendingUp, MessageSquare, ArrowUpRight, Activity, Clock, Shield, Settings } from 'lucide-react';
import { songsData } from '../../data/songs';
import { Link } from 'react-router-dom';

// 模拟最近活动日志
const recentActivities = [
  { id: 1, type: 'user', text: '新用户 “星空旅人” 注册加入', time: '5分钟前', color: 'text-green-400' },
  { id: 2, type: 'song', text: '《夜曲》播放量突破 10,000', time: '12分钟前', color: 'text-blue-400' },
  { id: 3, type: 'forum', text: '新帖子「混音技巧分享」获 50+ 点赞', time: '30分钟前', color: 'text-purple-400' },
  { id: 4, type: 'system', text: '系统备份完成，数据安全', time: '1小时前', color: 'text-primary' },
  { id: 5, type: 'user', text: '“混音师老王” 升级为版主', time: '2小时前', color: 'text-yellow-400' },
  { id: 6, type: 'song', text: '新上传 3 首原创歌曲', time: '3小时前', color: 'text-blue-400' },
];

// 快捷操作入口
const quickActions = [
  { to: '/admin/songs', icon: Music, label: '歌曲管理', color: 'from-green-500/20 to-emerald-500/10' },
  { to: '/admin/users', icon: Users, label: '用户管理', color: 'from-blue-500/20 to-cyan-500/10' },
  { to: '/admin/forum', icon: MessageSquare, label: '论坛管理', color: 'from-purple-500/20 to-pink-500/10' },
  { to: '/admin/settings', icon: Settings, label: '系统设置', color: 'from-orange-500/20 to-red-500/10' },
];

export default function DashboardPage() {
  const totalPlays = songsData.reduce((sum, s) => sum + s.plays, 0);
  const totalComments = songsData.reduce((sum, s) => sum + (s.comments?.length || 0), 0);
  const avgRating = (songsData.reduce((sum, s) => {
    const avg = s.ratings.length ? s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length : 0;
    return sum + avg;
  }, 0) / songsData.length).toFixed(1);

  const cards = [
    { icon: Music, label: '歌曲总数', value: songsData.length, color: 'text-primary', bg: 'from-green-500/20 to-green-900/10', trend: '+2' },
    { icon: Headphones, label: '总播放量', value: totalPlays.toLocaleString(), color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-900/10', trend: '+8.5%' },
    { icon: Star, label: '平均评分', value: avgRating, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-900/10', trend: '+0.2' },
    { icon: MessageSquare, label: '评论数', value: totalComments, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-900/10', trend: '+15' },
    { icon: Users, label: '粉丝数', value: '10,234', color: 'text-pink-400', bg: 'from-pink-500/20 to-pink-900/10', trend: '+128' },
    { icon: TrendingUp, label: '本月增长', value: '+12%', color: 'text-green-400', bg: 'from-green-500/20 to-green-900/10', trend: '↑' },
  ];

  // 最近歌曲排行
  const topSongs = [...songsData].sort((a, b) => b.plays - a.plays).slice(0, 5);

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">仪表盘概览</h1>
          <p className="text-sm text-text-muted mt-1">数据实时更新，接入Supabase后自动同步</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] transition-all hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
                <span className="text-[11px] text-green-400 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={11} /> {card.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{card.value}</p>
              <p className="text-xs text-text-muted mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 热门歌曲排行 */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">🔥 热门歌曲排行</h2>
          <div className="space-y-1">
            {topSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <span className={`text-base font-black w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-text-muted'}`}>{i + 1}</span>
                <img src={song.cover} alt={song.title} className="w-11 h-11 rounded-lg object-cover border border-white/[0.06]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white truncate">{song.title}</p>
                  <p className="text-xs text-text-muted truncate">{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{song.plays.toLocaleString()}</p>
                  <p className="text-[11px] text-text-muted">播放</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧栏：最近活动 + 快捷操作 */}
        <div className="space-y-6">
          {/* 最近活动 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-primary" /> 最近活动
            </h3>
            <div className="space-y-3">
              {recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.color.replace('text-', 'bg-')}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5"><Clock size={9} /> {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={14} className="text-primary" /> 快捷操作
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(qa => {
                const Icon = qa.icon;
                return (
                  <Link key={qa.to} to={qa.to}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl bg-gradient-to-br ${qa.color} border border-white/[0.04] hover:border-white/[0.1] transition-all hover:-translate-y-0.5`}>
                    <Icon size={18} className="text-white/80" />
                    <span className="text-[11px] text-text-secondary font-medium">{qa.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 系统状态 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Activity size={14} className="text-green-400" /> 系统状态
            </h3>
            <div className="space-y-2.5">
              {[
                { label: '服务器', value: '运行中', ok: true },
                { label: '数据库', value: '正常', ok: true },
                { label: 'CDN', value: '已启用', ok: true },
                { label: '最后备份', value: '今天 03:00', ok: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{s.label}</span>
                  <span className={`text-xs font-medium flex items-center gap-1 ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-400' : 'bg-red-400'}`} /> {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
