// Hooks 统一导出 — 方便外部一次性导入多个 Hook
// 用法: import { useLocalStorage, useNetworkStatus, useIntersectionObserver } from '../hooks';

export { default as useKeyboardShortcuts } from './useKeyboardShortcuts';
export { default as useDocumentTitle } from './useDocumentTitle';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useNetworkStatus } from './useNetworkStatus';
export { default as useIntersectionObserver } from './useIntersectionObserver';
