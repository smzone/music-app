import { Music, Users, Headphones, Star, TrendingUp, MessageSquare, ArrowUpRight, Activity, Clock, Shield, Settings, Package, DollarSign, Truck } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import useForumStore from '../../store/useForumStore';
import useOrderStore from '../../store/useOrderStore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AnimatedNumber from '../../components/UI/AnimatedNumber';

// 模拟最近活动日志
const recentActivities = [
  { id: 1, textKey: 'dashboard.act1', timeKey: 'dashboard.time5m', color: 'text-green-400' },
  { id: 2, textKey: 'dashboard.act2', timeKey: 'dashboard.time12m', color: 'text-blue-400' },
  { id: 3, textKey: 'dashboard.act3', timeKey: 'dashboard.time30m', color: 'text-purple-400' },
  { id: 4, textKey: 'dashboard.act4', timeKey: 'dashboard.time1h', color: 'text-primary' },
  { id: 5, textKey: 'dashboard.act5', timeKey: 'dashboard.time2h', color: 'text-yellow-400' },
  { id: 6, textKey: 'dashboard.act6', timeKey: 'dashboard.time3h', color: 'text-blue-400' },
];

// 快捷操作入口
const quickActions = [
  { to: '/admin/songs', icon: Music, labelKey: 'admin.nav.songs', color: 'from-green-500/20 to-emerald-500/10' },
  { to: '/admin/users', icon: Users, labelKey: 'admin.nav.users', color: 'from-blue-500/20 to-cyan-500/10' },
  { to: '/admin/forum', icon: MessageSquare, labelKey: 'admin.nav.forum', color: 'from-purple-500/20 to-pink-500/10' },
  { to: '/admin/orders', icon: Package, labelKey: 'admin.nav.orders', color: 'from-cyan-500/20 to-blue-500/10' },
  { to: '/admin/settings', icon: Settings, labelKey: 'admin.nav.settings', color: 'from-orange-500/20 to-red-500/10' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const forumPosts = useForumStore((s) => s.posts);
  const orders = useOrderStore((s) => s.orders);

  // 订单统计
  const orderStats = {
    total: orders.length,
    revenue: orders.filter((o) => ['paid', 'shipping', 'delivered', 'completed'].includes(o.status)).reduce((s, o) => s + o.total, 0),
    pendingShip: orders.filter((o) => o.status === 'paid').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
  };
  // 最近 5 条订单
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const totalPlays = songs.reduce((sum, s) => sum + (s.play_count || s.plays || 0), 0);
  const totalComments = songs.reduce((sum, s) => sum + (s.comments?.length || 0), 0);
  const avgRating = songs.length > 0
    ? (songs.reduce((sum, s) => {
        const ratings = s.ratings || [];
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return sum + avg;
      }, 0) / songs.length).toFixed(1)
    : '0.0';

  const cards = [
    { icon: Music, labelKey: 'dashboard.totalSongs', value: songs.length, color: 'text-primary', bg: 'from-green-500/20 to-green-900/10', trend: '+2' },
    { icon: Headphones, labelKey: 'dashboard.totalPlays', value: totalPlays.toLocaleString(), color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-900/10', trend: '+8.5%' },
    { icon: Star, labelKey: 'dashboard.avgRating', value: avgRating, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-900/10', trend: '+0.2' },
    { icon: MessageSquare, labelKey: 'dashboard.comments', value: totalComments + (forumPosts?.length || 0), color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-900/10', trend: '+15' },
    { icon: Users, labelKey: 'dashboard.fans', value: (forumPosts?.length || 0).toLocaleString(), color: 'text-pink-400', bg: 'from-pink-500/20 to-pink-900/10', trend: '+128' },
    { icon: TrendingUp, labelKey: 'dashboard.monthGrowth', value: '+12%', color: 'text-green-400', bg: 'from-green-500/20 to-green-900/10', trend: '↑' },
    { icon: Package, labelKey: 'adminOrders.totalOrders', value: orderStats.total, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-900/10', trend: `+${orderStats.total}` },
    { icon: DollarSign, labelKey: 'adminOrders.totalRevenue', value: `¥${orderStats.revenue.toFixed(0)}`, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-900/10', trend: '↑' },
    { icon: Truck, labelKey: 'adminOrders.pendingShip', value: orderStats.pendingShip, color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-900/10', trend: `${orderStats.pendingShip}` },
  ];

  // 最近歌曲排行
  const topSongs = [...songs].sort((a, b) => (b.play_count || b.plays || 0) - (a.play_count || a.plays || 0)).slice(0, 5);

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('dashboard.desc')}</p>
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
              <p className="text-2xl font-black text-white">
                {typeof card.value === 'number'
                  ? <AnimatedNumber value={card.value} duration={1000} />
                  : card.value
                }
              </p>
              <p className="text-xs text-text-muted mt-1">{t(card.labelKey)}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近订单 */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 lg:mb-0 lg:col-start-1 lg:row-start-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package size={16} className="text-cyan-400" /> {t('dashboard.recentOrders') || '最近订单'}
            </h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              {t('dashboard.viewAll') || '查看全部'} <ArrowUpRight size={11} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">{t('adminOrders.empty') || '暂无订单'}</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((o) => (
                <Link key={o.id} to={`/orders/${o.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <img src={o.items[0]?.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-text-muted truncate">#{o.id}</p>
                    <p className="text-[13px] text-white truncate">{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">¥{o.total.toFixed(0)}</p>
                    <p className="text-[10px] text-text-muted">{t(`adminOrders.${o.status}`) || o.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 热门歌曲排行 */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">🔥 {t('dashboard.topSongs')}</h2>
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
                  <p className="text-sm font-semibold text-white">{(song.play_count || song.plays || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-text-muted">{t('dashboard.plays')}</p>
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
              <Activity size={14} className="text-primary" /> {t('dashboard.recentActivity')}
            </h3>
            <div className="space-y-3">
              {recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.color.replace('text-', 'bg-')}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">{t(a.textKey)}</p>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5"><Clock size={9} /> {t(a.timeKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={14} className="text-primary" /> {t('dashboard.quickActions')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(qa => {
                const Icon = qa.icon;
                return (
                  <Link key={qa.to} to={qa.to}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl bg-gradient-to-br ${qa.color} border border-white/[0.04] hover:border-white/[0.1] transition-all hover:-translate-y-0.5`}>
                    <Icon size={18} className="text-white/80" />
                    <span className="text-[11px] text-text-secondary font-medium">{t(qa.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 系统状态 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Activity size={14} className="text-green-400" /> {t('dashboard.systemStatus')}
            </h3>
            <div className="space-y-2.5">
              {[
                { label: t('dashboard.sysServer'), value: t('dashboard.sysRunning'), ok: true },
                { label: t('dashboard.sysDB'), value: t('dashboard.sysNormal'), ok: true },
                { label: 'CDN', value: t('dashboard.sysEnabled'), ok: true },
                { label: t('dashboard.sysBackup'), value: t('dashboard.sysBackupTime'), ok: true },
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
