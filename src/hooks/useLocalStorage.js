import { useState, useCallback } from 'react';

// useLocalStorage — 带自动 JSON 序列化/反序列化的 localStorage 持久化 Hook
// 用法: const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);
export default function useLocalStorage(key, initialValue) {
  // 惰性初始化：从 localStorage 读取，失败则使用默认值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 设置值并同步到 localStorage
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`useLocalStorage: 无法写入 key="${key}"`, err);
    }
  }, [key, storedValue]);

  // 删除值
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`useLocalStorage: 无法删除 key="${key}"`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
