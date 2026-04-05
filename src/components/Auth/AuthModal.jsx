import { useState } from 'react';
import { X, Music } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { showAuthModal, authMode, login, register, closeAuth, toggleAuthMode } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('请输入用户名'); return; }
    if (!password.trim()) { toast.error('请输入密码'); return; }

    if (authMode === 'login') {
      const ok = login(username.trim(), password);
      if (ok) {
        toast.success('登录成功！');
        setUsername(''); setPassword('');
      } else {
        toast.error('登录失败');
      }
    } else {
      if (password.length < 6) { toast.error('密码至少6位'); return; }
      const ok = register(username.trim(), password);
      if (ok) {
        toast.success('注册成功！');
        setUsername(''); setPassword('');
      } else {
        toast.error('注册失败');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeAuth}>
      <div
        className="bg-surface-light rounded-2xl w-full max-w-sm p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <div className="flex justify-end">
          <button onClick={closeAuth} className="text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-3">
            <Music size={28} className="text-black" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {authMode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {authMode === 'login' ? '登录以享受完整功能' : '注册以开始你的音乐之旅'}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-primary text-sm placeholder:text-text-muted"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={authMode === 'register' ? '至少6位密码' : '请输入密码'}
              className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-primary text-sm placeholder:text-text-muted"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-black font-semibold rounded-full text-sm transition-colors"
          >
            {authMode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <p className="text-center text-sm text-text-secondary mt-4">
          {authMode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={toggleAuthMode}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {authMode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
