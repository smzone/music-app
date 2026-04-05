import { useState } from 'react';
import { Save, Database, Globe, Shield } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [siteName, setSiteName] = useState(t('settings.defaultName'));
  const [siteDesc, setSiteDesc] = useState(t('settings.defaultDesc'));

  const inputCls = "w-full bg-white/[0.04] text-white px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-[14px] placeholder:text-text-muted transition-all";

  return (
    <div className="animate-fadeIn max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('settings.desc')}</p>
      </div>

      <div className="space-y-5">
        {/* Supabase 状态 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-900/10 flex items-center justify-center">
              <Database size={17} className={isSupabaseConfigured ? 'text-primary' : 'text-yellow-400'} />
            </div>
            <h2 className="text-base font-bold text-white">{t('settings.dbTitle')}</h2>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isSupabaseConfigured ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-primary animate-pulse' : 'bg-yellow-400'}`} />
            {isSupabaseConfigured ? t('settings.dbConnected') : t('settings.dbLocal')}
          </div>
          {!isSupabaseConfigured && (
            <div className="mt-4 bg-white/[0.03] rounded-xl p-4 text-sm text-text-muted border border-white/[0.04]">
              <p className="font-semibold text-white text-xs uppercase tracking-wider mb-2">{t('settings.dbGuideTitle')}</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[13px]">
                <li>{t('settings.dbStep1')} <a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a></li>
                <li>{t('settings.dbStep2')}</li>
                <li>{t('settings.dbStep3')}</li>
                <li>{t('settings.dbStep4')}</li>
                <li>{t('settings.dbStep5')}</li>
              </ol>
            </div>
          )}
        </div>

        {/* 网站基本信息 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-green-900/10 flex items-center justify-center">
              <Globe size={17} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-white">{t('settings.siteTitle')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('settings.siteName')}</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('settings.siteDescription')}</label>
              <input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-red-900/10 flex items-center justify-center">
              <Shield size={17} className="text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white">{t('settings.securityTitle')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('settings.changePassword')}</label>
              <input type="password" placeholder={t('settings.newPwdPlaceholder')} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">{t('settings.confirmPassword')}</label>
              <input type="password" placeholder={t('settings.confirmPwdPlaceholder')} className={inputCls} />
            </div>
          </div>
        </div>

        <button onClick={() => toast.success(t('settings.saved'))}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
          <Save size={17} /> {t('settings.saveAll')}
        </button>
      </div>
    </div>
  );
}
