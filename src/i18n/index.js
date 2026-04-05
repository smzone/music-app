import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

// 支持的语言列表
const supportedLngs = ['zh', 'en', 'ja', 'ko'];

// 智能语言映射 — 将浏览器返回的完整语言代码映射到支持的语言
const convertDetectedLanguage = (lng) => {
  if (!lng) return 'zh';
  // 取主语言码（zh-CN -> zh, en-US -> en, ja-JP -> ja）
  const base = lng.split('-')[0].toLowerCase();
  // 精确匹配
  if (supportedLngs.includes(base)) return base;
  // 繁体中文也映射到 zh
  if (lng.toLowerCase().startsWith('zh')) return 'zh';
  // 默认回退中文
  return 'zh';
};

// i18n 初始化 — 支持中文、英文、日语、韩语，自动检测浏览器/系统语言
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    supportedLngs,
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    detection: {
      // localStorage 优先（用户手动选择保持），其次浏览器语言，再 HTML lang 属性
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nLng',
      convertDetectedLanguage,
    },
  });

export default i18n;

// 语言元数据 — 供语言切换器使用
export const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];
