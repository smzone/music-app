import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, LogIn } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';

export default function AccessDeniedPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('accessDenied.title'));
  const user = useAuthStore((s) => s.user);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${useThemeStore.getState().theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
      <div className="text-center max-w-md">
        {/* 图标 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/10">
          <ShieldX size={48} className="text-red-400" />
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-black text-white mb-3">{t('accessDenied.heading')}</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">{t('accessDenied.desc')}</p>

        {/* 当前角色信息 */}
        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-text-muted mb-8">
            <span className="text-lg">{user.avatar}</span>
            <span>{user.username}</span>
            <span className="text-white/10">|</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{user.role}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-sm transition-all">
            <Home size={16} /> {t('accessDenied.goHome')}
          </Link>
          {!user && (
            <Link to="/login" className="flex items-center gap-2 px-6 py-3 glass-strong hover:bg-white/10 text-white font-semibold rounded-full text-sm transition-all">
              <LogIn size={16} /> {t('accessDenied.login')}
            </Link>
          )}
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 glass-strong hover:bg-white/10 text-white font-semibold rounded-full text-sm transition-all">
            <ArrowLeft size={16} /> {t('accessDenied.goBack')}
          </button>
        </div>
      </div>
    </div>
  );
}
