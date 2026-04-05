import { useState } from 'react';
import { Save, Database, Globe, Shield } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('音乐创作者');
  const [siteDesc, setSiteDesc] = useState('个人音乐宣传网站');

  const inputCls = "w-full bg-white/[0.04] text-white px-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-[14px] placeholder:text-text-muted transition-all";

  return (
    <div className="animate-fadeIn max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">系统设置</h1>
        <p className="text-sm text-text-muted mt-1">管理网站基础配置和安全选项</p>
      </div>

      <div className="space-y-5">
        {/* Supabase 状态 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-900/10 flex items-center justify-center">
              <Database size={17} className={isSupabaseConfigured ? 'text-primary' : 'text-yellow-400'} />
            </div>
            <h2 className="text-base font-bold text-white">数据库状态</h2>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isSupabaseConfigured ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-primary animate-pulse' : 'bg-yellow-400'}`} />
            {isSupabaseConfigured ? 'Supabase 已连接' : '使用本地模拟数据'}
          </div>
          {!isSupabaseConfigured && (
            <div className="mt-4 bg-white/[0.03] rounded-xl p-4 text-sm text-text-muted border border-white/[0.04]">
              <p className="font-semibold text-white text-xs uppercase tracking-wider mb-2">如何接入 Supabase</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[13px]">
                <li>在 <a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a> 创建项目</li>
                <li>复制 <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">.env.example</code> 为 <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">.env</code></li>
                <li>填入 Supabase URL 和 Anon Key</li>
                <li>在 SQL Editor 中执行 <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">supabase-schema.sql</code></li>
                <li>重启开发服务器</li>
              </ol>
            </div>
          )}
        </div>

        {/* 网站基本信息 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-green-900/10 flex items-center justify-center">
              <Globe size={17} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-white">网站信息</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">网站名称</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">网站描述</label>
              <input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-red-900/10 flex items-center justify-center">
              <Shield size={17} className="text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white">安全设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">管理员密码修改</label>
              <input type="password" placeholder="输入新密码" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">确认新密码</label>
              <input type="password" placeholder="再次输入新密码" className={inputCls} />
            </div>
          </div>
        </div>

        <button onClick={() => toast.success('设置已保存')}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
          <Save size={17} /> 保存所有设置
        </button>
      </div>
    </div>
  );
}
