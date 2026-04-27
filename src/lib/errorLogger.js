// =====================================================================
// 全局错误日志记录器
// - 写入 localStorage（最近 N 条，FIFO）
// - 收集运行环境信息（UA / 路由 / 时间戳 / 应用版本）
// - 提供 dump 文本用于"一键复制"
// - 识别 chunk-load 错误（PWA 升级后常见），由调用方决定是否自动 reload
// =====================================================================

const STORAGE_KEY = 'app:error-logs';
const MAX_LOGS = 20;

// 应用版本（vite define 注入或 .env 提供）
const APP_VERSION = globalThis.__APP_VERSION__
  || import.meta.env?.VITE_APP_VERSION
  || 'dev';

// 是否是 chunk 加载错误（vendor 升级后旧 SW 缓存失效常见）
export function isChunkLoadError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module')
    || msg.includes('importing a module script failed')
    || msg.includes('error loading')
    || msg.includes('chunkloaderror')
    || name === 'chunkloaderror'
  );
}

// 序列化错误为可存储对象
function serializeError(err) {
  if (!err) return { message: 'unknown error' };
  if (typeof err === 'string') return { message: err };
  return {
    name: err.name || 'Error',
    message: err.message || String(err),
    stack: err.stack || null,
  };
}

// 收集环境快照
function snapshot() {
  return {
    ts: new Date().toISOString(),
    url: typeof location !== 'undefined' ? location.href : '',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    lang: typeof navigator !== 'undefined' ? navigator.language : '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : null,
    version: APP_VERSION,
    viewport: typeof window !== 'undefined'
      ? `${window.innerWidth}x${window.innerHeight}`
      : '',
  };
}

// 读取所有日志
export function getErrorLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 清空日志
export function clearErrorLogs() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// 写入一条日志（自动裁剪）
export function logError({ source, error, info } = {}) {
  const entry = {
    id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    source: source || 'unknown',           // 'react' | 'window' | 'promise' | 'manual'
    ...snapshot(),
    error: serializeError(error),
    info: info || null,                     // React errorInfo.componentStack 等
  };
  try {
    const list = getErrorLogs();
    list.unshift(entry);
    if (list.length > MAX_LOGS) list.length = MAX_LOGS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* localStorage 满或被禁用 */ }
  // 同时打印到控制台便于开发调试
  console.error(`[error:${entry.source}]`, entry.error.message, entry);
  return entry;
}

// 生成"一键复制"用的可读文本
export function dumpEntry(entry) {
  if (!entry) return '';
  const lines = [
    `=== Error Report ===`,
    `Time:      ${entry.ts}`,
    `Source:    ${entry.source}`,
    `Version:   ${entry.version}`,
    `URL:       ${entry.url}`,
    `Viewport:  ${entry.viewport}`,
    `Online:    ${entry.online}`,
    `Language:  ${entry.lang}`,
    `UA:        ${entry.ua}`,
    ``,
    `--- Error ---`,
    `Name:      ${entry.error.name || ''}`,
    `Message:   ${entry.error.message || ''}`,
    ``,
    `--- Stack ---`,
    entry.error.stack || '(no stack)',
  ];
  if (entry.info) {
    lines.push('', '--- Component Stack ---', entry.info);
  }
  return lines.join('\n');
}

// "重置应用"——清空业务数据但保留主题/语言
export function softResetApp() {
  const KEEP = ['app:theme', 'i18nextLng', 'app:locale'];
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (!KEEP.includes(k)) localStorage.removeItem(k);
    });
    sessionStorage.clear();
  } catch { /* ignore */ }
}
