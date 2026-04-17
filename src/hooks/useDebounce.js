import { useState, useEffect } from 'react';

// useDebounce — 输入防抖 Hook，延迟指定毫秒后才更新值
// 用法: const debouncedQuery = useDebounce(searchQuery, 300);
//       useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
