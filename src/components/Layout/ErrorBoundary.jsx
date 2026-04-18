import { Component } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import i18n from '../../i18n';

// 全局错误边界 — React 组件崩溃时优雅降级，防止白屏
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 生产环境可替换为错误上报服务（如 Sentry）
    console.error('[ErrorBoundary] 捕获到未处理的渲染错误:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
          {/* 背景光效 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[400px] h-[400px] top-1/3 left-1/4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/5 blur-3xl animate-glow" />
          </div>

          <div className="relative z-10 text-center max-w-md">
            {/* 错误图标 */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{i18n.t('error.heading')}</h2>
            <p className="text-text-muted mb-8 leading-relaxed text-sm">
              {i18n.t('error.desc')}<br />
              {i18n.t('error.desc2')}
            </p>

            {/* 错误详情（仅开发环境） */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-left">
                <p className="text-xs text-red-400 font-mono break-all leading-relaxed">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.2)]"
              >
                <RefreshCw size={17} /> {i18n.t('error.reload')}
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-semibold rounded-full text-[15px] transition-all"
              >
                <Home size={17} /> {i18n.t('error.goHome')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
