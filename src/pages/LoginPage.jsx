import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft, Sparkles, Shield, Sun, Moon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import useThemeStore from '../store/useThemeStore';

export default function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('login.title'));
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error(t('login.errorEmail')); return; }
    if (!password.trim()) { toast.error(t('login.errorPwd')); return; }

    const ok = await login(email.trim(), password);
    if (ok) {
      toast.success(t('login.success'));
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      toast.error(t('login.failed'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* 右上角主题/语言切换 */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          onClick={useThemeStore.getState().toggleTheme}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-all"
          aria-label={useThemeStore.getState().theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
        >
          {useThemeStore.getState().theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <LanguageSwitcher />
      </div>
      {/* 背景光效 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-40 -left-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/5 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-20 -right-20 rounded-full bg-gradient-to-br from-purple-600/15 to-pink-500/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 返回按钮 */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> {t('login.backHome')}
        </Link>

        {/* Logo + 标题 */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.2)]">
              <span className="text-black font-black text-lg">M</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">MySpace</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('login.welcome')}</h1>
          <p className="text-text-muted mt-2 text-sm">{t('login.desc')}</p>
        </div>

        {/* 表单卡片 */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 space-y-5">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('login.emailLabel')}</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              className="w-full bg-white/[0.04] text-white px-4 py-3.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[15px] placeholder:text-text-muted transition-all focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('login.passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full bg-white/[0.04] text-white px-4 py-3.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[15px] placeholder:text-text-muted transition-all pr-12 focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)]"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-0.5">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(29,185,84,0.2)]"
          >
            <LogIn size={17} /> {loading ? t('login.loading') : t('login.submit')}
          </button>

          {/* 测试账号提示 */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2.5">
              <Shield size={13} className="text-primary" />
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">{t('login.demoTitle')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">ADMIN</span>
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">admin / admin123</code>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">MOD</span>
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">mod / mod123</code>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">VIP</span>
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">vip / vip123</code>
            </div>
          </div>
        </form>

        {/* 底部链接 */}
        <div className="mt-7 text-center space-y-2">
          <p className="text-sm text-text-muted">
            {t('login.noAccount')}
            <Link to="/register" className="text-primary hover:underline ml-1 font-semibold">{t('login.goRegister')}</Link>
          </p>
        </div>

        {/* 底部标签 */}
        <div className="mt-10 flex items-center justify-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><Sparkles size={10} /> {t('login.security')}</span>
          <span className="text-white/10">|</span>
          <span>{t('login.privacy')}</span>
          <span className="text-white/10">|</span>
          <span>© {new Date().getFullYear()} MySpace</span>
        </div>
      </div>
    </div>
  );
}
