import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { languages } from '../../i18n';
import useThemeStore from '../../store/useThemeStore';

// 语言切换器 — 高科技感下拉菜单，支持中/英/日/韩
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isLight = useThemeStore((s) => s.theme === 'light');

  // 当前语言
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* 触发按钮 — 醒目的胶囊式设计 */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          group flex items-center gap-2 px-3.5 py-2 rounded-full
          border transition-all duration-300 cursor-pointer
          ${open
            ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_20px_rgba(29,185,84,0.15)]'
            : isLight
              ? 'bg-black/[0.04] border-black/[0.08] text-gray-600 hover:text-gray-900 hover:bg-black/[0.07] hover:border-black/[0.12]'
              : 'bg-white/[0.06] border-white/[0.1] text-text-secondary hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
          }
        `}
        aria-label="Switch language"
      >
        <Globe size={16} className={`transition-transform duration-300 ${open ? 'rotate-180 text-primary' : 'group-hover:rotate-12'}`} />
        <span className="text-[13px] font-bold tracking-wide">{currentLang.flag}</span>
        <span className="text-[13px] font-semibold hidden sm:block">{currentLang.code.toUpperCase()}</span>
        <ChevronDown size={13} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''} opacity-50`} />
      </button>

      {/* 下拉菜单 — 毛玻璃卡片 */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-[calc(100%+8px)] w-52 backdrop-blur-2xl rounded-2xl z-50 py-2 px-1.5 animate-fadeIn border ${isLight ? 'bg-white/98 border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.12)]' : 'bg-[#15151e]/95 border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_1px_rgba(255,255,255,0.1)]'}`}>
            {/* 标题 */}
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted flex items-center gap-1.5">
                <Globe size={10} className="text-primary" />
                Language
              </p>
            </div>
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 rounded-xl group/item
                    ${isActive
                      ? 'text-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(29,185,84,0.05)]'
                      : isLight
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]'
                        : 'text-text-secondary hover:text-white hover:bg-white/[0.06]'
                    }
                  `}
                >
                  <span className="text-lg leading-none group-hover/item:scale-110 transition-transform">{lang.flag}</span>
                  <span className="flex-1 text-left font-semibold">{lang.label}</span>
                  {isActive && <Check size={14} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
