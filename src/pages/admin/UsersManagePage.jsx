import { useState } from 'react';
import { Users, Search, Shield, ShieldCheck, ShieldX, Ban, CheckCircle, Mail, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

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

const roleLabels = {
  admin: { text: '管理员', color: 'bg-red-500/15 text-red-400' },
  moderator: { text: '版主', color: 'bg-purple-500/15 text-purple-400' },
  user: { text: '用户', color: 'bg-gray-500/15 text-gray-400' },
};

const statusLabels = {
  active: { text: '正常', color: 'bg-green-500/15 text-green-400', icon: CheckCircle },
  muted: { text: '禁言', color: 'bg-yellow-500/15 text-yellow-400', icon: ShieldX },
  banned: { text: '封禁', color: 'bg-red-500/15 text-red-400', icon: Ban },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export default function UsersManagePage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQ, setSearchQ] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = users.filter((u) => {
    const matchSearch = !searchQ || u.username.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const setRole = (id, role) => {
    setUsers(users.map((u) => u.id === id ? { ...u, role } : u));
    toast.success('角色已更新');
  };

  const setStatus = (id, status) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status } : u));
    toast.success('状态已更新');
  };

  const stats = [
    { label: '总用户', value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '活跃用户', value: users.filter((u) => u.status === 'active').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: '版主', value: users.filter((u) => u.role === 'moderator').length, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: '本月新增', value: users.filter((u) => new Date(u.joinDate) > new Date('2025-03-01')).length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">用户管理</h1>
      </div>

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
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="搜索用户名或邮箱..."
            className="w-full bg-surface-light text-white pl-9 pr-4 py-2.5 rounded-xl outline-none border border-surface-lighter focus:border-primary text-sm placeholder:text-text-muted" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="bg-surface-light text-white px-4 py-2.5 rounded-xl outline-none border border-surface-lighter text-sm">
          <option value="all">全部角色</option>
          <option value="admin">管理员</option>
          <option value="moderator">版主</option>
          <option value="user">普通用户</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface-light text-white px-4 py-2.5 rounded-xl outline-none border border-surface-lighter text-sm">
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="muted">禁言</option>
          <option value="banned">封禁</option>
        </select>
      </div>

      {/* 用户列表 */}
      <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-lighter text-text-muted text-left">
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium w-20">角色</th>
                <th className="px-4 py-3 font-medium w-20">状态</th>
                <th className="px-4 py-3 font-medium w-16 text-center">帖子</th>
                <th className="px-4 py-3 font-medium w-16 text-center">获赞</th>
                <th className="px-4 py-3 font-medium w-24">注册时间</th>
                <th className="px-4 py-3 font-medium w-36 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-lighter">
              {filtered.map((user) => {
                const role = roleLabels[user.role];
                const status = statusLabels[user.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={user.id} className="hover:bg-surface-lighter/30 transition-colors">
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${role.color}`}>{role.text}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded w-fit ${status.color}`}>
                        <StatusIcon size={10} /> {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{user.posts}</td>
                    <td className="px-4 py-3 text-xs text-text-muted text-center">{user.likes}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{formatDate(user.joinDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {user.role !== 'moderator' && user.role !== 'admin' && (
                          <button onClick={() => setRole(user.id, 'moderator')} title="设为版主"
                            className="p-1.5 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {user.role === 'moderator' && (
                          <button onClick={() => setRole(user.id, 'user')} title="取消版主"
                            className="p-1.5 rounded-lg text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                            <ShieldX size={14} />
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button onClick={() => setStatus(user.id, 'muted')} title="禁言"
                            className="p-1.5 rounded-lg text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                            <ShieldX size={14} />
                          </button>
                        )}
                        {user.status === 'muted' && (
                          <button onClick={() => setStatus(user.id, 'active')} title="解除禁言"
                            className="p-1.5 rounded-lg text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {user.status !== 'banned' ? (
                          <button onClick={() => setStatus(user.id, 'banned')} title="封禁"
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                            <Ban size={14} />
                          </button>
                        ) : (
                          <button onClick={() => setStatus(user.id, 'active')} title="解封"
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">暂无匹配的用户</div>
        )}
      </div>
    </div>
  );
}
