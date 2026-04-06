import { useEffect } from 'react';
import { Bell, CheckCheck, MessageSquare, Heart, UserPlus, Award, Loader2 } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';
import useAuthStore from '../store/useAuthStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 通知类型图标映射
const typeIcons = {
  reply: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  like: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
  follow: { icon: UserPlus, color: 'text-green-400', bg: 'bg-green-500/10' },
  system: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  default: { icon: Bell, color: 'text-text-muted', bg: 'bg-white/[0.04]' },
};

function NotificationItem({ notification, onRead, t }) {
  const typeInfo = typeIcons[notification.type] || typeIcons.default;
  const Icon = typeInfo.icon;
  const sender = notification.sender?.username || t('notifications.system');
  const timeStr = notification.created_at
    ? new Date(notification.created_at).toLocaleString()
    : '';

  return (
    <div
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`flex items-start gap-4 p-5 transition-colors cursor-pointer ${notification.is_read ? 'opacity-60' : 'hover:bg-white/[0.02]'}`}
    >
      <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={typeInfo.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${notification.is_read ? 'text-text-muted' : 'text-white'}`}>
          <span className="font-semibold">{sender}</span>{' '}
          {notification.content || notification.message || t('notifications.defaultMsg')}
        </p>
        <p className="text-xs text-text-muted mt-1">{timeStr}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_6px_rgba(29,185,84,0.4)]" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notifications.title'));
  const user = useAuthStore((s) => s.user);
  const {
    notifications, loading, unreadCount, totalCount,
    loadNotifications, markRead, markAllRead, loadMore,
  } = useNotificationStore();

  // 进入页面时加载通知
  useEffect(() => {
    if (user?.id) loadNotifications(user.id);
  }, [user?.id, loadNotifications]);

  const hasMore = notifications.length < totalCount;

  // 未登录提示
  if (!user) {
    return (
      <div className="smart-container pt-20 pb-12 text-center">
        <Bell size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
        <p className="text-text-muted">{t('notifications.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="smart-container pt-8 pb-12 max-w-2xl mx-auto">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Bell size={22} className="text-primary" />
          {t('notifications.title')}
          {unreadCount > 0 && (
            <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {unreadCount} {t('notifications.unread')}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead(user.id)}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <CheckCheck size={16} /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* 通知列表 */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04] overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell size={40} className="mx-auto mb-3 text-text-muted opacity-20" />
            <p className="text-sm text-text-muted">{t('notifications.empty')}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} t={t} />
          ))
        )}
      </div>

      {/* 加载更多 */}
      {hasMore && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={() => loadMore(user.id)}
            className="px-6 py-2.5 text-sm font-medium text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors border border-white/[0.06]"
          >
            {t('notifications.loadMore')}
          </button>
        </div>
      )}
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
