import { Component } from 'react';
import {
  RefreshCw, Home, AlertTriangle, Copy, Check, Trash2,
  ChevronDown, ChevronUp, Bug, RotateCcw,
} from 'lucide-react';
import i18n from '../../i18n';
import {
  logError, dumpEntry, isChunkLoadError, softResetApp,
} from '../../lib/errorLogger';

// =====================================================================
// 全局错误边界（升级版）
// 功能：
//   1. 捕获 React 渲染错误，记录到 localStorage 错误日志
//   2. chunk-load 错误（PWA 升级后旧 SW 缓存）→ 一次性自动 reload 修复
//   3. 详情面板：折叠展开错误名/消息/堆栈/组件栈
//   4. 一键复制错误报告（含环境信息）
//   5. 重置应用（清空业务数据，保留主题/语言）
//   6. 兼容浅色/深色主题（不强制白底）
// =====================================================================

const RELOAD_FLAG = 'app:chunk-reload-attempted';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      entry: null,           // errorLogger 写入的完整条目
      detailOpen: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // chunk 加载错误（如 vite-pwa 升级后旧 chunk 失效）→ 自动尝试一次刷新
    if (isChunkLoadError(error)) {
      try {
        const attempted = sessionStorage.getItem(RELOAD_FLAG);
        if (!attempted) {
          sessionStorage.setItem(RELOAD_FLAG, '1');
          // 卸载旧 SW 后硬刷
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
              .then((regs) => Promise.all(regs.map((r) => r.unregister())))
              .finally(() => window.location.reload());
          } else {
            window.location.reload();
          }
          return; // 等待 reload，无需进入错误 UI
        }
      } catch { /* ignore */ }
    }

    const entry = logError({
      source: 'react',
      error,
      info: errorInfo?.componentStack || null,
    });
    this.setState({ entry });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, entry: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, entry: null });
    window.location.href = '/';
  };

  handleCopy = async () => {
    const text = dumpEntry(this.state.entry) || (this.state.error?.toString() || '');
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2200);
    } catch {
      // 降级：选中文本框
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2200);
    }
  };

  handleSoftReset = () => {
    if (!window.confirm(i18n.t('error.resetConfirm'))) return;
    softResetApp();
    window.location.href = '/';
  };

  toggleDetail = () => this.setState((s) => ({ detailOpen: !s.detailOpen }));

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, entry, detailOpen, copied } = this.state;
    const errMsg = (error && (error.message || error.toString())) || 'Unknown error';
    const errName = error?.name || 'Error';
    const stack = error?.stack || '';
    const compStack = entry?.info || '';

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10 relative overflow-hidden text-text-primary">
        {/* 背景光效 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[480px] h-[480px] top-1/4 left-1/4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/5 blur-3xl animate-glow" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          {/* 顶部图标 + 标题 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              {i18n.t('error.heading')}
            </h2>
            <p className="text-text-muted mb-6 leading-relaxed text-sm">
              {i18n.t('error.desc')}
              <br />
              {i18n.t('error.desc2')}
            </p>
          </div>

          {/* 错误摘要卡 */}
          <div className="mb-5 rounded-2xl bg-red-500/[0.04] border border-red-500/15 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Bug size={16} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-red-400 mb-1">{errName}</p>
                <p className="text-sm font-mono break-all leading-relaxed">{errMsg}</p>
              </div>
              <button
                type="button"
                onClick={this.handleCopy}
                title={i18n.t('error.copy')}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold transition-colors"
              >
                {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                {copied ? i18n.t('error.copied') : i18n.t('error.copy')}
              </button>
            </div>

            {/* 折叠详情 */}
            <button
              type="button"
              onClick={this.toggleDetail}
              className="w-full flex items-center justify-between px-4 py-2.5 border-t border-red-500/10 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <span className="font-bold">
                {i18n.t('error.detailToggle')}
              </span>
              {detailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {detailOpen && (
              <div className="border-t border-red-500/10 p-4 space-y-4 max-h-80 overflow-auto">
                {entry && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
                    <div className="text-text-muted">Time</div>     <div className="break-all">{entry.ts}</div>
                    <div className="text-text-muted">URL</div>      <div className="break-all">{entry.url}</div>
                    <div className="text-text-muted">Version</div>  <div>{entry.version}</div>
                    <div className="text-text-muted">Online</div>   <div>{String(entry.online)}</div>
                    <div className="text-text-muted">Viewport</div> <div>{entry.viewport}</div>
                  </div>
                )}
                {stack && (
                  <div>
                    <p className="text-[11px] font-bold text-red-400 mb-1.5">{i18n.t('error.stack')}</p>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap break-all text-text-muted leading-relaxed">{stack}</pre>
                  </div>
                )}
                {compStack && (
                  <div>
                    <p className="text-[11px] font-bold text-red-400 mb-1.5">{i18n.t('error.componentStack')}</p>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap break-all text-text-muted leading-relaxed">{compStack}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-sm transition-all hover:shadow-[0_0_25px_rgba(29,185,84,0.25)]"
            >
              <RefreshCw size={15} /> {i18n.t('error.reload')}
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-5 py-3 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] font-semibold rounded-full text-sm transition-all"
            >
              <Home size={15} /> {i18n.t('error.goHome')}
            </button>
            <button
              onClick={this.handleSoftReset}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-400 font-semibold rounded-full text-sm transition-all"
              title={i18n.t('error.resetTip')}
            >
              <RotateCcw size={15} /> {i18n.t('error.reset')}
            </button>
          </div>

          <p className="text-center text-[11px] text-text-muted mt-6 flex items-center justify-center gap-1.5">
            <Trash2 size={11} />
            {i18n.t('error.logsHint')}
          </p>
        </div>
      </div>
    );
  }
}
