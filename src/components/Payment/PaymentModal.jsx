import { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Wallet, CreditCard, Loader2, Check, Shield, RefreshCw, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../../store/useThemeStore';
import FakeQRCode from './FakeQRCode';

// 支付通道配置
const CHANNELS = [
  {
    id: 'alipay',
    nameKey: 'checkout.alipay',
    icon: Wallet,
    accent: '#1677FF',          // 支付宝蓝
    bg: 'bg-blue-500/10',
    desc: 'checkout.alipayDesc',
    qrBg: '#f5faff',
  },
  {
    id: 'wechat',
    nameKey: 'checkout.wechat',
    icon: Smartphone,
    accent: '#07C160',          // 微信绿
    bg: 'bg-green-500/10',
    desc: 'checkout.wechatDesc',
    qrBg: '#f3fbf5',
  },
  {
    id: 'card',
    nameKey: 'checkout.card',
    icon: CreditCard,
    accent: '#8b5cf6',          // 银行卡紫
    bg: 'bg-purple-500/10',
    desc: 'checkout.cardDesc',
    qrBg: '#f7f4ff',
  },
];

// 格式化 mm:ss
const fmtMMSS = (ms) => {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

/**
 * 支付弹窗
 * @param {object} order 订单对象
 * @param {function} onPaid 支付成功回调 (paymentMethod) => void
 * @param {function} onClose 关闭/取消
 */
export default function PaymentModal({ order, onPaid, onClose }) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const [channel, setChannel] = useState(order?.paymentMethod || 'alipay');
  const [state, setState] = useState('waiting');  // waiting | paying | success | expired
  const [remaining, setRemaining] = useState(15 * 60 * 1000);
  const [autoPayMs] = useState(() => 8000 + Math.floor(Math.random() * 4000)); // 8-12s 自动完成
  const autoTimerRef = useRef(null);
  const tickTimerRef = useRef(null);

  // 基于订单过期时间的倒计时
  useEffect(() => {
    if (!order) return;
    const expireTs = new Date(order.expiresAt).getTime();
    const update = () => {
      const diff = expireTs - Date.now();
      setRemaining(diff);
      if (diff <= 0 && state === 'waiting') {
        setState('expired');
      }
    };
    update();
    tickTimerRef.current = setInterval(update, 1000);
    return () => clearInterval(tickTimerRef.current);
  }, [order, state]);

  // 模拟支付完成：每切换一次通道 / 打开时，启动自动支付定时器
  useEffect(() => {
    if (state !== 'waiting') return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      // 模拟真实用户扫码支付 → success
      setState('success');
      // 1s 展示成功动画后回调
      setTimeout(() => onPaid?.(channel), 1000);
    }, autoPayMs);
    return () => clearTimeout(autoTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, state]);

  // 手动触发"已支付"
  const triggerPaid = () => {
    if (state !== 'waiting') return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setState('paying');
    setTimeout(() => {
      setState('success');
      setTimeout(() => onPaid?.(channel), 900);
    }, 1200);
  };

  // 刷新二维码
  const refreshQR = () => {
    if (state === 'waiting') {
      // 重新触发 useEffect 内定时器：切一下 state
      setState('paying');
      setTimeout(() => setState('waiting'), 100);
    }
  };

  if (!order) return null;

  const active = CHANNELS.find((c) => c.id === channel) || CHANNELS[0];
  const ActiveIcon = active.icon;

  // 二维码内容（真实场景为支付 URL）
  const qrValue = `${active.id}://pay?order=${order.id}&amount=${order.total.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={state === 'success' ? undefined : onClose} />

      {/* 弹窗内容 */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fadeIn border ${
          isLight ? 'bg-white border-black/[0.06]' : 'bg-[#15151e] border-white/[0.06]'
        }`}
      >
        {/* 顶部渐变条（按支付通道变色） */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${active.accent}, ${active.accent}80)` }} />

        {/* 头部 */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-black/[0.04]' : 'border-white/[0.04]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${active.accent}1A` }}>
              <Shield size={18} style={{ color: active.accent }} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('checkout.payTitle') || '安全支付'}</h2>
              <p className="text-[11px] text-text-muted">{t('checkout.orderId')}: <span className="font-mono">{order.id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isLight ? 'hover:bg-black/[0.05] text-gray-500 hover:text-gray-900' : 'hover:bg-white/[0.06] text-text-muted hover:text-white'
            }`}
            aria-label="close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 支付金额展示 */}
        <div className={`px-6 py-5 text-center ${isLight ? 'bg-gray-50' : 'bg-white/[0.02]'}`}>
          <p className="text-xs text-text-muted mb-1.5">{t('checkout.payAmount') || '待支付金额'}</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xl font-bold" style={{ color: active.accent }}>¥</span>
            <span className="text-4xl font-black tabular-nums" style={{ color: active.accent }}>{order.total.toFixed(2)}</span>
          </div>
          {/* 倒计时 */}
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Clock size={11} />
            {t('checkout.expiresIn') || '支付剩余时间'}:
            <span className="font-mono font-bold text-text-primary">{fmtMMSS(remaining)}</span>
          </div>
        </div>

        {/* 通道选择 tabs */}
        <div className={`flex px-6 gap-2 pt-4 pb-2 ${isLight ? 'bg-white' : ''}`}>
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const isActive = c.id === channel;
            return (
              <button
                key={c.id}
                onClick={() => state === 'waiting' && setChannel(c.id)}
                disabled={state !== 'waiting'}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? 'border-transparent shadow-sm'
                    : isLight
                      ? 'border-black/[0.06] hover:border-black/[0.12] bg-white'
                      : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                }`}
                style={isActive ? { background: `${c.accent}12`, borderColor: c.accent } : {}}
              >
                <Icon size={20} style={{ color: isActive ? c.accent : undefined }} className={!isActive ? 'text-text-muted' : ''} />
                <span className={`text-xs font-bold ${isActive ? '' : isLight ? 'text-gray-700' : 'text-text-secondary'}`} style={isActive ? { color: c.accent } : {}}>
                  {t(c.nameKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* 主内容区：二维码 / 成功 / 过期 */}
        <div className="px-6 pb-6 pt-2 min-h-[320px] flex items-center justify-center">
          {state === 'success' && (
            <div className="text-center animate-fadeIn py-6">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: `${active.accent}20` }}>
                <Check size={44} style={{ color: active.accent }} strokeWidth={3} />
              </div>
              <h3 className={`text-xl font-black mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('checkout.paySuccess') || '支付成功'}</h3>
              <p className="text-sm text-text-muted">{t('checkout.redirecting') || '正在跳转...'}</p>
            </div>
          )}

          {state === 'expired' && (
            <div className="text-center animate-fadeIn py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/15 flex items-center justify-center mb-4">
                <Clock size={40} className="text-red-500" />
              </div>
              <h3 className={`text-xl font-black mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('checkout.expired') || '订单已超时'}</h3>
              <p className="text-sm text-text-muted mb-5">{t('checkout.expiredDesc') || '订单已关闭，请重新下单'}</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-black rounded-full font-bold text-sm hover:shadow-[0_0_25px_rgba(29,185,84,0.3)]"
              >
                {t('checkout.close') || '关闭'}
              </button>
            </div>
          )}

          {(state === 'waiting' || state === 'paying') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fadeIn">
              {/* 左：二维码 */}
              <div className="flex flex-col items-center">
                <div
                  className="relative p-4 rounded-2xl border shadow-sm"
                  style={{ background: active.qrBg, borderColor: `${active.accent}33` }}
                >
                  <FakeQRCode value={qrValue} size={200} color={active.accent} bg="#fff" />
                  {/* 二维码中心 Logo */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: active.accent }}
                  >
                    <ActiveIcon size={24} className="text-white" />
                  </div>
                  {/* 支付中遮罩 */}
                  {state === 'paying' && (
                    <div className="absolute inset-0 rounded-2xl bg-white/85 flex flex-col items-center justify-center gap-2">
                      <Loader2 size={32} className="animate-spin" style={{ color: active.accent }} />
                      <span className="text-xs font-bold" style={{ color: active.accent }}>{t('checkout.processing') || '支付确认中...'}</span>
                    </div>
                  )}
                </div>
                {/* 刷新 */}
                <button
                  onClick={refreshQR}
                  disabled={state !== 'waiting'}
                  className="mt-3 text-[11px] text-text-muted hover:text-primary flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={10} /> {t('checkout.refreshQR') || '刷新二维码'}
                </button>
              </div>

              {/* 右：说明 + 操作 */}
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <h3 className={`text-base font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {t('checkout.scanToPay') || '扫码支付'}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">
                    {t(active.desc)}
                  </p>

                  {/* 支付步骤 */}
                  <ol className="space-y-2 text-xs text-text-secondary">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: `${active.accent}20`, color: active.accent }}
                        >
                          {n}
                        </span>
                        <span>
                          {t(`checkout.step${n}_${channel}`, { defaultValue: t(`checkout.step${n}`, { defaultValue: n === 1 ? '打开手机 APP 扫描左侧二维码' : n === 2 ? '在手机上确认支付金额和订单' : '完成支付后页面会自动跳转' }) })}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 模拟按钮（演示用）*/}
                <div className="space-y-2">
                  <button
                    onClick={triggerPaid}
                    disabled={state !== 'waiting'}
                    className="w-full py-3 rounded-full font-bold text-sm text-white disabled:opacity-60 transition-all hover:shadow-lg"
                    style={{ background: active.accent }}
                  >
                    {t('checkout.simulatePaid') || '我已完成支付（演示）'}
                  </button>
                  <p className="text-[10px] text-text-muted text-center">
                    {t('checkout.autoPayHint') || `演示模式下 ${Math.round(autoPayMs / 1000)} 秒后自动完成支付`.replace('${...}', Math.round(autoPayMs / 1000))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
