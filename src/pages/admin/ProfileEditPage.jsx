import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ProfileEditPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '音乐创作者',
    title: '独立音乐人',
    bio: '作为一名独立音乐人，我专注于电子音乐、流行和实验音乐的创作。从2020年开始音乐之旅，至今已发布多首原创歌曲，涵盖多种风格。',
    bio2: '我相信好的音乐能够跨越语言和文化的界限，每一首歌都承载着一段独特的故事和情感。感谢你来到这里，希望我的音乐能为你带来快乐。',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face',
    aboutImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=700&fit=crop',
    heroSubtitle: '用音符讲述故事，用旋律触碰灵魂。探索我的原创音乐世界。',
    email: 'contact@example.com',
    genres: '电子, 流行, 合成波, 民谣, 摇滚',
    socialWeibo: '',
    socialBilibili: '',
    socialNetease: '',
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = () => {
    // 接入 Supabase 后保存到数据库
    toast.success(t('profile.saved'));
  };

  const inputCls = "w-full bg-white/[0.04] text-white px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-[14px] placeholder:text-text-muted transition-all";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2";
  const cardCls = "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6";

  return (
    <div className="animate-fadeIn max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('profile.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('profile.desc')}</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
          <Save size={17} /> {t('profile.save')}
        </button>
      </div>

      <div className="space-y-5">
        {/* 基本信息 */}
        <div className={cardCls}>
          <h2 className="text-base font-bold text-white mb-5">{t('profile.basicInfo')}</h2>
          <div className="space-y-4">
            {/* 头像 */}
            <div className="flex items-center gap-5">
              <img src={form.avatar} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-[0_0_20px_rgba(29,185,84,0.1)]" />
              <div className="flex-1">
                <label className={labelCls}>{t('profile.avatarUrl')}</label>
                <input type="url" value={form.avatar} onChange={(e) => handleChange('avatar', e.target.value)} className={inputCls} />
                <div className="mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
                    <Upload size={12} /> {t('profile.uploadAvatar')}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('profile.artistName')}</label>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('profile.titleLabel')}</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={inputCls} placeholder={t('profile.titlePlaceholder')} />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('profile.contactEmail')}</label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>{t('profile.genres')}</label>
              <input type="text" value={form.genres} onChange={(e) => handleChange('genres', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Hero 区域 */}
        <div className={cardCls}>
          <h2 className="text-base font-bold text-white mb-5">{t('profile.heroSection')}</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t('profile.heroSlogan')}</label>
              <textarea value={form.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} rows={2} className={textareaCls} />
            </div>
          </div>
        </div>

        {/* 关于我 */}
        <div className={cardCls}>
          <h2 className="text-base font-bold text-white mb-5">{t('profile.aboutMe')}</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t('profile.aboutImageUrl')}</label>
              <input type="url" value={form.aboutImage} onChange={(e) => handleChange('aboutImage', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('profile.bio1')}</label>
              <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>{t('profile.bio2')}</label>
              <textarea value={form.bio2} onChange={(e) => handleChange('bio2', e.target.value)} rows={3} className={textareaCls} />
            </div>
          </div>
        </div>

        {/* 社交媒体 */}
        <div className={cardCls}>
          <h2 className="text-base font-bold text-white mb-5">{t('profile.socialMedia')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('profile.weibo')}</label>
              <input type="url" value={form.socialWeibo} onChange={(e) => handleChange('socialWeibo', e.target.value)} className={inputCls} placeholder="https://weibo.com/..." />
            </div>
            <div>
              <label className={labelCls}>Bilibili</label>
              <input type="url" value={form.socialBilibili} onChange={(e) => handleChange('socialBilibili', e.target.value)} className={inputCls} placeholder="https://space.bilibili.com/..." />
            </div>
            <div>
              <label className={labelCls}>{t('profile.netease')}</label>
              <input type="url" value={form.socialNetease} onChange={(e) => handleChange('socialNetease', e.target.value)} className={inputCls} placeholder="https://music.163.com/..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
