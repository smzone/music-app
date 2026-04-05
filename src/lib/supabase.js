import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 请在 .env 文件中设置以下环境变量：
//   VITE_SUPABASE_URL=你的Supabase项目URL
//   VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 是否已配置 Supabase（未配置时使用本地模拟数据）
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// 创建 Supabase 客户端（仅在配置后可用）
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
