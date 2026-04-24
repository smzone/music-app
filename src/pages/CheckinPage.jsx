import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Calendar, Flame, Coins, Gift, Sparkles, TrendingUp, CheckCircle2, ChevronLeft, ChevronRight, Trophy, Ticket,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import useRewardsStore from '../store/useRewardsStore';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';

// ============================================================================
// CheckinPage /checkin
//   • 今日签到 CTA（已签/未签）
//   • 7 日连签奖励进度
//   • 月日历（显示已签日期）
//   • 积分流水列表
// ============================================================================
export default function CheckinPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('checkin.title') || '每日签到');
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const {
    points, totalEarned, totalSpent, checkins, pointsLogs,
    currentStreak, hasCheckedInToday, doCheckin, syncAll,
  } = useRewardsStore();

  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => { if (user) syncAll(); /* eslint-disable-next-line */ }, [user?.id]);

  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = hasCheckedInToday();

  const checkinDateSet = useMemo(() => new Set(checkins.map((c) => c.checkin_date)), [checkins]);

  const handleCheckin = async () => {
    if (checkedToday) return;
    setSubmitting(true);
    const { ok, streak, points: earned, bonus, error } = await doCheckin();
    setSubmitting(false);
    if (error) {
      toast.error(error.message || (t('checkin.failed') || '签到失败'));
      return;
    }
    if (ok) {
      if (bonus) {
        toast.success(`${t('checkin.bonusReward', { streak, earned }) || `连签 ${streak} 天 + ${earned} 积分`} 🎉`);
      } else {
        toast.success(`${t('checkin.reward', { earned }) || `签到成功 +${earned} 积分`}`);
      }
    }
  };

  // 月日历
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(month.year, month.month, 1).getDay(); // 0=Sun
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, date: dateStr, isChecked: checkinDateSet.has(dateStr), isToday: dateStr === today });
    }
    return cells;
  }, [daysInMonth, firstDayOfWeek, month, checkinDateSet, today]);

  // 本月签到天数
  const monthCheckins = useMemo(() =>
    checkins.filter((c) => c.checkin_date.startsWith(`${month.year}-${String(month.month + 1).padStart(2, '0')}`)).length,
  [checkins, month]);

  const prevMonth = () => setMonth((m) => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 });
  const nextMonth = () => setMonth((m) => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 });

  const cardBg = isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.08]';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';

  const weekNames = [
    t('checkin.sun') || '日', t('checkin.mon') || '一', t('checkin.tue') || '二',
    t('checkin.wed') || '三', t('checkin.thu') || '四', t('checkin.fri') || '五', t('checkin.sat') || '六',
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${textMain}`}>
              {t('checkin.title') || '每日签到'}
            </h1>
            <p className={`text-sm mt-1 ${textSub}`}>
              {t('checkin.subtitle') || '每日签到赚积分，连签 7 天可得大额奖励'}
            </p>
          </div>
          <Link to="/coupons" className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors ${cardBg} ${textSub}`}>
            <Ticket size={14} /> {t('checkin.goCoupons') || '去券中心'}
          </Link>
        </div>

        {/* 签到 CTA + 积分总览 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 今日签到卡 */}
          <div className="lg:col-span-2 relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-primary/20 via-emerald-400/15 to-bg border border-primary/20">
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={20} className="text-orange-400" />
                  <span className="text-xs uppercase tracking-widest font-bold text-primary">
                    {t('checkin.streakLabel') || '连续签到'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-5xl font-black ${textMain}`}>{currentStreak}</span>
                  <span className={`text-lg ${textSub}`}>{t('checkin.days') || '天'}</span>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  {checkedToday
                    ? (t('checkin.checkedDesc') || '今日已签到，明天再来吧～')
                    : (t('checkin.notCheckedDesc') || '今天还没签到，快来领积分！')}
                </p>
              </div>
              <button
                onClick={handleCheckin}
                disabled={checkedToday || submitting}
                className={`px-8 py-4 rounded-full text-base font-black transition-all flex items-center gap-2
                  ${checkedToday
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-emerald-400 text-black hover:shadow-2xl hover:shadow-primary/30 hover:scale-105'}`}
              >
                {checkedToday ? (
                  <>
                    <CheckCircle2 size={18} /> {t('checkin.checked') || '今日已签到'}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> {submitting ? (t('checkin.submitting') || '签到中...') : (t('checkin.actionBtn') || '立即签到')}
                  </>
                )}
              </button>
            </div>

            {/* 7 日进度条 */}
            <div className="mt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${textSub}`}>
                  {t('checkin.weekProgress') || '7 日连签奖励'}
                </span>
                <span className="text-xs font-bold text-primary">
                  {currentStreak % 7} / 7
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const done = (currentStreak % 7) > i || (currentStreak > 0 && currentStreak % 7 === 0);
                  const isBonus = i === 6;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-10 rounded-lg flex flex-col items-center justify-center border transition-colors
                        ${done
                          ? isBonus ? 'bg-yellow-400/20 border-yellow-400 text-yellow-500' : 'bg-primary/20 border-primary text-primary'
                          : `${isLight ? 'bg-gray-100 border-black/[0.06]' : 'bg-white/[0.03] border-white/[0.08]'} ${textMuted}`}`}
                    >
                      {isBonus ? <Trophy size={12} /> : <Coins size={10} />}
                      <span className="text-[9px] font-bold">+{isBonus ? 15 : 5}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 积分总览 */}
          <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs uppercase tracking-widest font-bold ${textMuted}`}>
                {t('checkin.myPoints') || '我的积分'}
              </span>
              <Coins size={16} className="text-yellow-400" />
            </div>
            <div>
              <div className={`text-4xl font-black ${textMain}`}>{points}</div>
              <div className={`text-xs ${textMuted}`}>{t('checkin.pointsAvail') || '可用积分'}</div>
            </div>
            <div className={`pt-3 border-t grid grid-cols-2 gap-3 text-xs ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <div>
                <div className={`${textMuted} mb-0.5`}>{t('checkin.totalEarned') || '累计获得'}</div>
                <div className={`font-bold text-primary flex items-center gap-0.5`}>
                  <TrendingUp size={10} /> +{totalEarned}
                </div>
              </div>
              <div>
                <div className={`${textMuted} mb-0.5`}>{t('checkin.totalSpent') || '累计消耗'}</div>
                <div className={`font-bold text-red-400`}>-{totalSpent}</div>
              </div>
            </div>
            <Link
              to="/coupons"
              className="block text-center px-3 py-2 rounded-full text-xs font-bold bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              <Gift size={11} className="inline mr-1" /> {t('checkin.exchange') || '积分兑好券'}
            </Link>
          </div>
        </div>

        {/* 月日历 + 积分流水 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* 日历 */}
          <div className={`lg:col-span-3 rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className={`p-1.5 rounded-lg ${textMuted} hover:text-primary`}>
                <ChevronLeft size={16} />
              </button>
              <div className={`flex items-center gap-2 font-bold ${textMain}`}>
                <Calendar size={14} className="text-primary" />
                {month.year}-{String(month.month + 1).padStart(2, '0')}
                <span className={`ml-2 text-xs font-normal ${textMuted}`}>
                  ({t('checkin.monthCount', { n: monthCheckins }) || `本月签到 ${monthCheckins} 天`})
                </span>
              </div>
              <button onClick={nextMonth} className={`p-1.5 rounded-lg ${textMuted} hover:text-primary`}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {weekNames.map((w) => (
                <div key={w} className={`text-[10px] font-bold ${textMuted}`}>{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) return <div key={idx} />;
                return (
                  <div
                    key={cell.date}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative
                      ${cell.isChecked
                        ? 'bg-gradient-to-br from-primary to-emerald-400 text-black font-bold'
                        : cell.isToday
                          ? `border-2 border-primary ${textMain}`
                          : `${isLight ? 'bg-gray-50 text-gray-600' : 'bg-white/[0.02] text-text-muted'}`}`}
                  >
                    {cell.day}
                    {cell.isChecked && (
                      <CheckCircle2 size={8} className="absolute bottom-0.5 right-0.5 text-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 积分流水 */}
          <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-sm font-bold mb-3 flex items-center gap-1.5 ${textMain}`}>
              <Coins size={14} className="text-yellow-400" />
              {t('checkin.logs') || '积分流水'}
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {pointsLogs.length === 0 ? (
                <p className={`text-xs text-center py-8 ${textMuted}`}>{t('checkin.emptyLogs') || '暂无积分记录'}</p>
              ) : pointsLogs.slice(0, 20).map((log) => (
                <div key={log.id} className={`flex items-center justify-between p-2 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-white/[0.02]'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${textMain}`}>
                      {log.description || log.reason}
                    </p>
                    <p className={`text-[10px] ${textMuted}`}>
                      {new Date(log.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`text-sm font-black ${log.delta > 0 ? 'text-primary' : 'text-red-400'}`}>
                    {log.delta > 0 ? '+' : ''}{log.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
