import { useState, useEffect } from 'react';

// 网络状态检测 Hook — 监听 online/offline 事件
// 返回 { isOnline, wasOffline }
// wasOffline: 曾经离线过（用于显示"已恢复连接"提示）
export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 如果之前离线过，标记 wasOffline
      setWasOffline(true);
      // 3秒后清除恢复提示
      setTimeout(() => setWasOffline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
