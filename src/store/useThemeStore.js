import { create } from 'zustand';

// 主题切换 Store — 支持 dark / light 双主题，持久化到 localStorage
const useThemeStore = create((set) => ({
  // 初始化：优先读取 localStorage，默认 dark
  theme: localStorage.getItem('app-theme') || 'dark',

  // 切换主题
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  // 设置指定主题
  setTheme: (theme) => set(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    return { theme };
  }),

  // 初始化（在 App 启动时调用，确保 DOM 同步）
  initTheme: () => set(() => {
    const saved = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return { theme: saved };
  }),
}));

export default useThemeStore;
