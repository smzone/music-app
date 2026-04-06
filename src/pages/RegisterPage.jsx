import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Sparkles, Check, X, AlertCircle, Info } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';

// 可选头像列表
const avatarOptions = ['🎵', '🎸', '🎹', '🎤', '🎧', '🥁', '🎷', '🎺', '🎻', '🪗', '🎶', '🌟', '🦊', '🐱', '🐼', '🦁'];

export default function RegisterPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('register.title'));
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🎵');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // 用户名验证规则
  const usernameRules = useMemo(() => {
    const rules = [
      { key: 'len', pass: username.length >= 2 && username.length <= 20, text: t('register.ruleUsernameLen') },
      { key: 'char', pass: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(username) || !username, text: t('register.ruleUsernameChar') },
      { key: 'noSpace', pass: !/\s/.test(username), text: t('register.ruleUsernameNoSpace') },
    ];
    return rules;
  }, [username, t]);

  const usernameValid = username && usernameRules.every(r => r.pass);

  // 邮箱格式校验
  const emailValid = useMemo(() => {
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  // 密码强度计算
  const pwdStrength = useMemo(() => {
    if (!password) return { level: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, text: t('register.pwdWeak'), color: 'bg-red-500' };
    if (score <= 3) return { level: 2, text: t('register.pwdMedium'), color: 'bg-yellow-500' };
    return { level: 3, text: t('register.pwdStrong'), color: 'bg-green-500' };
  }, [password, t]);

  const pwdMatch = confirmPwd && password === confirmPwd;

  // 密码详细规则
  const pwdRules = useMemo(() => [
    { pass: password.length >= 6, text: t('register.rulePwdLen') },
    { pass: /[A-Z]/.test(password), text: t('register.rulePwdUpper') },
    { pass: /[0-9]/.test(password), text: t('register.rulePwdNum') },
    { pass: /[^A-Za-z0-9]/.test(password), text: t('register.rulePwdSpecial') },
  ], [password, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameValid) { toast.error(t('register.errorUsername')); return; }
    if (!emailValid) { toast.error(t('register.errorEmailFormat')); return; }
    if (password.length < 6) { toast.error(t('register.errorPwdLength')); return; }
    if (password !== confirmPwd) { toast.error(t('register.errorPwdMatch')); return; }
    if (!agreedTerms) { toast.error(t('register.errorTerms')); return; }

    const ok = await register(username.trim(), password, { email: email.trim(), avatar: selectedAvatar });
    if (ok) {
      toast.success(t('register.success'));
      navigate('/');
    } else {
      toast.error(t('register.failed'));
    }
  };

  const inputCls = "w-full bg-white/[0.04] text-white px-4 py-3.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary text-[15px] placeholder:text-text-muted transition-all focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)]";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 右上角语言切换 */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>
      {/* 背景光效 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-40 -right-20 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/5 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-20 -left-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 返回按钮 */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> {t('register.backHome')}
        </Link>

        {/* Logo + 标题 */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.2)]">
              <span className="text-black font-black text-lg">M</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">MySpace</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('register.createAccount')}</h1>
          <p className="text-text-muted mt-2 text-sm">{t('register.desc')}</p>
        </div>

        {/* 表单卡片 */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 space-y-4">
          {/* 头像选择 */}
          <div className="flex flex-col items-center mb-2">
            <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/20 border-2 border-primary/30 flex items-center justify-center text-3xl hover:scale-110 transition-all hover:border-primary/60 hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
              {selectedAvatar}
            </button>
            <p className="text-[11px] text-text-muted mt-2">{t('register.pickAvatar')}</p>
            {showAvatarPicker && (
              <div className="mt-3 grid grid-cols-8 gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] animate-fadeIn">
                {avatarOptions.map((av) => (
                  <button key={av} type="button" onClick={() => { setSelectedAvatar(av); setShowAvatarPicker(false); }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:scale-110 transition-all ${selectedAvatar === av ? 'bg-primary/20 border border-primary/40 shadow-[0_0_10px_rgba(29,185,84,0.1)]' : 'hover:bg-white/[0.06]'}`}>
                    {av}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 用户名 */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('register.usernameLabel')}</label>
            <div className="relative">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('register.usernamePlaceholder')}
                className={`${inputCls} pr-10 ${username && !usernameValid ? 'border-red-500/50 focus:border-red-500' : username && usernameValid ? 'border-green-500/50 focus:border-green-500' : ''}`} />
              {username && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameValid ? <Check size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-red-400" />}
                </div>
              )}
            </div>
            {/* 用户名规则提示 */}
            {username && !usernameValid && (
              <div className="mt-2 space-y-1">
                {usernameRules.filter(r => !r.pass).map(r => (
                  <p key={r.key} className="text-[11px] text-red-400 flex items-center gap-1"><X size={10} /> {r.text}</p>
                ))}
              </div>
            )}
          </div>

          {/* 邮箱 */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('register.emailLabel')}</label>
            <div className="relative">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('register.emailPlaceholder')}
                className={`${inputCls} pr-10 ${emailValid === false ? 'border-red-500/50 focus:border-red-500' : emailValid === true ? 'border-green-500/50 focus:border-green-500' : ''}`} />
              {email && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {emailValid ? <Check size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-red-400" />}
                </div>
              )}
            </div>
            {email && !emailValid && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><X size={10} /> {t('register.errorEmailFormat')}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('register.passwordLabel')}</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('register.passwordPlaceholder')}
                className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-0.5">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {/* 密码强度指示器 */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwdStrength.level >= i ? pwdStrength.color : 'bg-white/[0.06]'}`} />
                    ))}
                  </div>
                  <span className={`text-[11px] font-semibold ${pwdStrength.level === 1 ? 'text-red-400' : pwdStrength.level === 2 ? 'text-yellow-400' : 'text-green-400'}`}>{pwdStrength.text}</span>
                </div>
                {/* 密码规则清单 */}
                <div className="grid grid-cols-2 gap-1">
                  {pwdRules.map((r, i) => (
                    <p key={i} className={`text-[10px] flex items-center gap-1 ${r.pass ? 'text-green-400' : 'text-text-muted'}`}>
                      {r.pass ? <Check size={9} /> : <X size={9} className="text-text-muted/50" />} {r.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('register.confirmLabel')}</label>
            <div className="relative">
              <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={t('register.confirmPlaceholder')}
                className={`${inputCls} pr-10`} />
              {confirmPwd && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {pwdMatch ? <Check size={16} className="text-green-400" /> : <X size={16} className="text-red-400" />}
                </div>
              )}
            </div>
          </div>
          {/* 服务条款同意 */}
          <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
            <div className="relative mt-0.5">
              <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="sr-only" />
              <div className={`w-[18px] h-[18px] rounded-md border transition-all flex items-center justify-center ${agreedTerms ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}`}>
                {agreedTerms && <Check size={12} className="text-black" />}
              </div>
            </div>
            <span className="text-xs text-text-muted leading-relaxed">
              {t('register.agreeTerms')}
              <button type="button" onClick={() => toast(t('register.termsDetail'), { icon: <Info size={16} /> })} className="text-primary hover:underline ml-0.5">{t('register.termsLink')}</button>
              {t('register.andPolicy')}
              <button type="button" onClick={() => toast(t('register.privacyDetail'), { icon: <Info size={16} /> })} className="text-primary hover:underline ml-0.5">{t('register.privacyLink')}</button>
            </span>
          </label>

          <button type="submit" disabled={loading || !agreedTerms}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(29,185,84,0.2)]">
            <UserPlus size={17} /> {loading ? t('register.loading') : t('register.submit')}
          </button>
        </form>

        {/* 底部链接 */}
        <div className="mt-7 text-center">
          <p className="text-sm text-text-muted">
            {t('register.hasAccount')}<Link to="/login" className="text-primary hover:underline ml-1 font-semibold">{t('register.goLogin')}</Link>
          </p>
        </div>

        {/* 底部标签 */}
        <div className="mt-10 flex items-center justify-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><Sparkles size={10} /> {t('register.security')}</span>
          <span className="text-white/10">|</span>
          <span>{t('register.privacy')}</span>
          <span className="text-white/10">|</span>
          <span>© {new Date().getFullYear()} MySpace</span>
        </div>
      </div>
    </div>
  );
}
