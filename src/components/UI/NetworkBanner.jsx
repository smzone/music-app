import { WifiOff, Wifi } from 'lucide-react';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';

// 网络状态提示 Banner — 离线时固定顶部显示红色警告，恢复后绿色提示 3 秒
export default function NetworkBanner() {
  const { t } = useTranslation();
  const { isOnline, wasOffline } = useNetworkStatus();

  // 在线且没有刚恢复 → 不显示
  if (isOnline && !wasOffline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all duration-300 ${
      isOnline
        ? 'bg-primary/90 text-black'
        : 'bg-red-500/90 text-white'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={15} />
          <span>{t('network.restored') || '网络已恢复'}</span>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>{t('network.offline') || '网络连接已断开，部分功能可能不可用'}</span>
        </>
      )}
    </div>
  );
}
