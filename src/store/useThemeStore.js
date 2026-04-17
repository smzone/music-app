import { create } from 'zustand';

// 主题对应的 meta theme-color 颜色值
const THEME_COLORS = { dark: '#0a0a0f', light: '#ffffff' };

// 同步 meta theme-color 标签
const syncMetaThemeColor = (theme) => {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
  meta.content = THEME_COLORS[theme] || THEME_COLORS.dark;
};

// 主题切换 Store — 支持 dark / light 双主题，持久化到 localStorage
const useThemeStore = create((set) => ({
  // 初始化：优先读取 localStorage，默认 dark
  theme: localStorage.getItem('app-theme') || 'dark',

  // 切换主题
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    syncMetaThemeColor(next);
    return { theme: next };
  }),

  // 设置指定主题
  setTheme: (theme) => set(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    syncMetaThemeColor(theme);
    return { theme };
  }),

  // 初始化（在 App 启动时调用，确保 DOM 同步）
  initTheme: () => set(() => {
    const saved = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    syncMetaThemeColor(saved);
    return { theme: saved };
  }),
}));

export default useThemeStore;
