import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Music } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';

export default function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notFound.title'));

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${useThemeStore.getState().theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
      {/* 背景光效 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] top-1/4 left-1/4 rounded-full bg-gradient-to-br from-primary/10 to-cyan-500/5 blur-3xl animate-glow" />
        <div className="absolute w-[400px] h-[400px] bottom-1/4 right-1/4 rounded-full bg-gradient-to-br from-purple-600/10 to-pink-500/5 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* 404 大字 — 渐变发光 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-gradient select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[120px] sm:text-[160px] font-black leading-none text-primary/5 blur-2xl select-none" aria-hidden="true">
            404
          </div>
        </div>

        {/* 图标 */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Music size={28} className="text-text-muted" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{t('notFound.heading')}</h2>
        <p className="text-text-muted mb-10 leading-relaxed">
          {t('notFound.desc')}<br />{t('notFound.desc2')}
        </p>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/"
            className="flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.2)]"
          >
            <Home size={17} /> {t('notFound.goHome')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-semibold rounded-full text-[15px] transition-all"
          >
            <ArrowLeft size={17} /> {t('notFound.goBack')}
          </button>
        </div>
      </div>
    </div>
  );
}
