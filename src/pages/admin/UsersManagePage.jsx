import { useState, useMemo, useEffect } from 'react';
import { Users, Search, Shield, ShieldCheck, ShieldX, Ban, CheckCircle, Mail, TrendingUp, Download, History, ChevronLeft, ChevronRight, CheckSquare, Square, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// 模拟用户数据
const mockUsers = [
  { id: 1, username: '电子达人', email: 'edm@test.com', avatar: '🎹', role: 'user', level: 'lv5', status: 'active', posts: 23, likes: 456, joinDate: '2024-06-15', lastActive: '2025-03-20T15:30:00' },
  { id: 2, username: '混音师老王', email: 'wang@test.com', avatar: '🎧', role: 'moderator', level: 'lv8', status: 'active', posts: 89, likes: 2340, joinDate: '2024-01-10', lastActive: '2025-03-20T16:45:00' },
  { id: 3, username: '键盘侠', email: 'keyboard@test.com', avatar: '⌨️', role: 'user', level: 'lv6', status: 'active', posts: 45, likes: 890, joinDate: '2024-03-22', lastActive: '2025-03-19T10:00:00' },
  { id: 4, username: '新手小白', email: 'newbie@test.com', avatar: '🐣', role: 'user', level: 'lv1', status: 'active', posts: 3, likes: 12, joinDate: '2025-02-28', lastActive: '2025-03-18T10:30:00' },
  { id: 5, username: '合作狂人', email: 'collab@test.com', avatar: '🤝', role: 'user', level: 'lv4', status: 'active', posts: 18, likes: 234, joinDate: '2024-08-05', lastActive: '2025-03-17T14:00:00' },
  { id: 6, username: '快乐音符', email: 'happy@test.com', avatar: '😄', role: 'user', level: 'lv4', status: 'active', posts: 31, likes: 567, joinDate: '2024-05-12', lastActive: '2025-03-14T18:00:00' },
  { id: 7, username: '视频狂魔', email: 'video@test.com', avatar: '📹', role: 'user', level: 'lv5', status: 'active', posts: 56, likes: 1890, joinDate: '2024-02-14', lastActive: '2025-03-16T20:00:00' },
  { id: 8, username: '违规用户A', email: 'bad@test.com', avatar: '😈', role: 'user', level: 'lv2', status: 'banned', posts: 5, likes: 2, joinDate: '2025-01-20', lastActive: '2025-02-10T08:00:00' },
  { id: 9, username: '星空旅人', email: 'star@test.com', avatar: '🌌', role: 'user', level: 'lv3', status: 'active', posts: 12, likes: 198, joinDate: '2024-11-08', lastActive: '2025-03-15T22:00:00' },
  { id: 10, username: '摇滚少年', email: 'rock@test.com', avatar: '🎸', role: 'user', level: 'lv3', status: 'muted', posts: 8, likes: 67, joinDate: '2024-09-30', lastActive: '2025-03-14T19:00:00' },
];

const roleKeys = {
  admin: { key: 'usersMgr.roleAdmin', color: 'bg-red-500/15 text-red-400' },
  moderator: { key: 'usersMgr.roleMod', color: 'bg-purple-500/15 text-purple-400' },
  user: { key: 'usersMgr.roleUser', color: 'bg-gray-500/15 text-gray-400' },
};

const statusKeys = {
  active: { key: 'usersMgr.statusActive', color: 'bg-green-500/15 text-green-400', icon: CheckCircle },
  muted: { key: 'usersMgr.statusMuted', color: 'bg-yellow-500/15 text-yellow-400', icon: ShieldX },
  banned: { key: 'usersMgr.statusBanned', color: 'bg-red-500/15 text-red-400', icon: Ban },
};

// 格式化相对时间
function formatRelativeTime(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('usersMgr.timeJust');
  if (m < 60) return t('usersMgr.timeMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('usersMgr.timeHour', { n: h });
  const d = Math.floor(h / 24);
  if (d < 30) return t('usersMgr.timeDay', { n: d });
  return new Date(dateStr).toLocaleDateString();
}

const PAGE_SIZE = 6;

export default function UsersManagePage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState(mockUsers);
  const [searchQ, setSearchQ] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showLog, setShowLog] = useState(false);
  const [opLog, setOpLog] = useState([]);
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    const matchSearch = !searchQ || u.username.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  // 分页逻辑
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  // 页码越界修正
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  // 添加操作日志
  const addLog = (action, target) => {
    setOpLog(prev => [{ id: Date.now(), time: new Date().toISOString(), action, target }, ...prev].slice(0, 50));
  };

  const setRole = (id, role) => {
    const u = users.find(x => x.id === id);
    setUsers(users.map((x) => x.id === id ? { ...x, role } : x));
    addLog(t('usersMgr.logRole', { role: t(roleKeys[role].key) }), u?.username);
    toast.success(t('usersMgr.toastRoleUpdated'));
  };

  const setStatus = (id, status) => {
    const u = users.find(x => x.id === id);
    setUsers(users.map((x) => x.id === id ? { ...x, status } : x));
    addLog(t('usersMgr.logStatus', { status: t(statusKeys[status].key) }), u?.username);
    toast.success(t('usersMgr.toastStatusUpdated'));
  };

  // 批量操作
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map(u => u.id)));
    }
  };

  const batchSetStatus = (status) => {
    if (selectedIds.size === 0) return;
    const names = users.filter(u => selectedIds.has(u.id)).map(u => u.username).join(', ');
    setUsers(users.map(u => selectedIds.has(u.id) ? { ...u, status } : u));
    addLog(t('usersMgr.logBatch', { action: t(statusKeys[status].key), count: selectedIds.size }), names);
    setSelectedIds(new Set());
    toast.success(t('usersMgr.toastBatch', { action: t(statusKeys[status].key), count: selectedIds.size }));
  };

  // CSV 导出
  const exportCSV = () => {
    const header = `${t('usersMgr.colUser')},${t('usersMgr.colEmail')},${t('usersMgr.colRole')},${t('usersMgr.colStatus')},${t('usersMgr.colPosts')},${t('usersMgr.colLikes')},${t('usersMgr.colJoinDate')}\n`;
    const rows = filtered.map(u => `${u.username},${u.email},${t(roleKeys[u.role].key)},${t(statusKeys[u.status].key)},${u.posts},${u.likes},${u.joinDate}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    addLog(t('usersMgr.logExport'), `${filtered.length}`);
    toast.success(t('usersMgr.toastExported', { count: filtered.length }));
  };

  const stats = [
    { label: t('usersMgr.statTotal'), value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('usersMgr.statActive'), value: users.filter((u) => u.status === 'active').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: t('usersMgr.statMod'), value: users.filter((u) => u.role === 'moderator').length, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: t('usersMgr.statNewMonth'), value: users.filter((u) => new Date(u.joinDate) > new Date('2025-03-01')).length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t('usersMgr.title')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLog(!showLog)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${showLog ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-light text-text-muted hover:text-white border border-surface-lighter'}`}>
            <History size={14} /> {t('usersMgr.opLog')} {opLog.length > 0 && <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded-full text-[10px]">{opLog.length}</span>}
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-light text-text-muted hover:text-white border border-surface-lighter rounded-xl text-xs font-medium transition-all hover:border-primary/30">
            <Download size={14} /> {t('usersMgr.exportCSV')}
          </button>
        </div>
      </div>

      {/* 操作日志面板 */}
      {showLog && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><History size={14} className="text-primary" /> {t('usersMgr.recentOps')}</h3>
            {opLog.length > 0 && (
              <button onClick={() => { setOpLog([]); toast.success(t('usersMgr.toastLogCleared')); }} className="text-[11px] text-text-muted hover:text-red-400 transition-colors">{t('usersMgr.clear')}</button>
            )}
          </div>
          {opLog.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">{t('usersMgr.noLogs')}</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {opLog.map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                  <span className="text-text-muted shrink-0 flex items-center gap-1"><Clock size={10} /> {formatRelativeTime(log.time, t)}</span>
                  <span className="text-primary font-medium">{log.action}</span>
                  <span className="text-text-secondary truncate">{log.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface-light rounded-2xl p-4 border border-surface-lighter">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={searchQ} onChange={(e) => { setSearchQ(e.target.value); setPage(1); }} placeholder={t('usersMgr.searchPH')}
            className="w-full bg-surface-light text-white pl-9 pr-4 py-2.5 rounded-xl outline-none border border-surface-lighter focus:border-primary text-sm placeholder:text-text-muted" />
        </div>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="bg-surface-light text-white px-4 py-2.5 rounded-xl outline-none border border-surface-lighter text-sm">
          <option value="all">{t('usersMgr.allRoles')}</option>
          <option value="admin">{t('usersMgr.roleAdmin')}</option>
          <option value="moderator">{t('usersMgr.roleMod')}</option>
          <option value="user">{t('usersMgr.roleUser')}</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-surface-light text-white px-4 py-2.5 rounded-xl outline-none border border-surface-lighter text-sm">
          <option value="all">{t('usersMgr.allStatus')}</option>
          <option value="active">{t('usersMgr.statusActive')}</option>
          <option value="muted">{t('usersMgr.statusMuted')}</option>
          <option value="banned">{t('usersMgr.statusBanned')}</option>
        </select>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 animate-fadeIn">
          <span className="text-xs text-primary font-semibold">{t('usersMgr.selected', { count: selectedIds.size })}</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={() => batchSetStatus('muted')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors">
              <ShieldX size={12} /> {t('usersMgr.batchMute')}
            </button>
            <button onClick={() => batchSetStatus('banned')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
              <Ban size={12} /> {t('usersMgr.batchBan')}
            </button>
            <button onClick={() => batchSetStatus('active')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
              <CheckCircle size={12} /> {t('usersMgr.batchUnban')}
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-text-muted hover:text-white transition-colors">
              {t('usersMgr.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 用户列表 */}
      <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-lighter text-text-muted text-left">
                <th className="px-3 py-3 font-medium w-10">
                  <button onClick={toggleSelectAll} className="text-text-muted hover:text-primary transition-colors">
                    {selectedIds.size === paged.length && paged.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">{t('usersMgr.colUser')}</th>
                <th className="px-4 py-3 font-medium w-20">{t('usersMgr.colRole')}</th>
                <th className="px-4 py-3 font-medium w-20">{t('usersMgr.colStatus')}</th>
                <th className="px-4 py-3 font-medium w-16 text-center">{t('usersMgr.colPosts')}</th>
                <th className="px-4 py-3 font-medium w-16 text-center">{t('usersMgr.colLikes')}</th>
                <th className="px-4 py-3 font-medium w-24">{t('usersMgr.colLastActive')}</th>
                <th className="px-4 py-3 font-medium w-36 text-right">{t('usersMgr.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-lighter">
              {paged.map((user) => {
                const role = roleKeys[user.role];
                const status = statusKeys[user.status];
                const StatusIcon = status.icon;
                const isSelected = selectedIds.has(user.id);
                return (
                  <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-primary/[0.03]' : 'hover:bg-surface-lighter/30'}`}>
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(user.id)} className="text-text-muted hover:text-primary transition-colors">
                        {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{user.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1"><Mail size={10} /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${role.color}`}>{t(role.key)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded w-fit ${status.color}`}>
                        <StatusIcon size={10} /> {t(status.key)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{user.posts}</td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{user.likes}</td>
                    <td className="px-4 py-3 text-xs text-text-muted" title={user.lastActive}>{formatRelativeTime(user.lastActive, t)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {user.role !== 'moderator' && user.role !== 'admin' && (
                          <button onClick={() => setRole(user.id, 'moderator')} title={t('usersMgr.setMod')}
                            className="p-1.5 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {user.role === 'moderator' && (
                          <button onClick={() => setRole(user.id, 'user')} title={t('usersMgr.removeMod')}
                            className="p-1.5 rounded-lg text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                            <ShieldX size={14} />
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button onClick={() => setStatus(user.id, 'muted')} title={t('usersMgr.mute')}
                            className="p-1.5 rounded-lg text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                            <ShieldX size={14} />
                          </button>
                        )}
                        {user.status === 'muted' && (
                          <button onClick={() => setStatus(user.id, 'active')} title={t('usersMgr.unmute')}
                            className="p-1.5 rounded-lg text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {user.status !== 'banned' ? (
                          <button onClick={() => setStatus(user.id, 'banned')} title={t('usersMgr.ban')}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                            <Ban size={14} />
                          </button>
                        ) : (
                          <button onClick={() => setStatus(user.id, 'active')} title={t('usersMgr.unban')}
                            className="p-1.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paged.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">{t('usersMgr.noUsers')}</div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-lighter">
            <span className="text-xs text-text-muted">{t('usersMgr.pagination', { total: filtered.length, page, pages: totalPages })}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-primary/15 text-primary' : 'text-text-muted hover:text-white hover:bg-white/[0.04]'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
