import useAuthStore from '../../store/useAuthStore';
import { hasPermission, hasRole } from '../../store/useAuthStore';

/**
 * UI 级权限门控组件
 * - permission: 需要的权限常量（如 PERMISSIONS.CREATE_POST）
 * - minRole: 最低角色要求（如 ROLES.VIP）
 * - fallback: 无权限时显示的替代内容（默认不渲染）
 * - showLocked: 为 true 时无权限显示一个锁定提示而非隐藏
 *
 * 用法:
 *   <PermissionGate permission={PERMISSIONS.CREATE_POST}>
 *     <button>发帖</button>
 *   </PermissionGate>
 *
 *   <PermissionGate minRole={ROLES.VIP} fallback={<UpgradeHint />}>
 *     <ExclusiveContent />
 *   </PermissionGate>
 */
export default function PermissionGate({ permission, minRole, fallback = null, children }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'guest';

  // 检查权限
  if (permission && !hasPermission(role, permission)) {
    return fallback;
  }

  // 检查角色等级
  if (minRole && !hasRole(role, minRole)) {
    return fallback;
  }

  return children;
}
