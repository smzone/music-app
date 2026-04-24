import { useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useWishlistStore from '../store/useWishlistStore';
import { isSupabaseConfigured } from '../lib/supabase';

// ============================================================================
// AuthSyncGate — 根据登录状态自动触发 Supabase 订单 / 心愿单同步
// 挂载在 App.jsx 根部（无渲染输出）
// 登录后：pull 远端订单 + 心愿单，合并到本地
// 退出后：清理本地远端缓存（保护隐私）
// ============================================================================
export default function AuthSyncGate() {
  const user = useAuthStore((s) => s.user);
  const syncOrders = useOrderStore((s) => s.syncFromSupabase);
  const resetOrders = useOrderStore((s) => s.resetRemoteLocal);
  const syncWishlist = useWishlistStore((s) => s.syncFromSupabase);
  const resetWishlist = useWishlistStore((s) => s.resetLocal);
  const lastUidRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const currentUid = user?.id || null;
    // 首次登录或切换用户
    if (currentUid && currentUid !== lastUidRef.current) {
      lastUidRef.current = currentUid;
      // 并发 pull
      syncOrders(currentUid);
      syncWishlist(currentUid);
    }
    // 退出登录
    if (!currentUid && lastUidRef.current) {
      lastUidRef.current = null;
      resetOrders();
      resetWishlist();
    }
  }, [user?.id, syncOrders, syncWishlist, resetOrders, resetWishlist]);

  return null;
}
