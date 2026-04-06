import { useState, useMemo } from 'react';
import {
  Target, DollarSign, Clock, Users, Search, Plus, X, Filter, TrendingUp,
  CheckCircle2, AlertCircle, Timer, ChevronDown, Eye, MessageSquare, Zap,
  Music, Mic, Video, Palette, Code, PenTool, Award, ArrowUpRight, Bookmark,
  Flame
} from 'lucide-react';
import useAuthStore, { PERMISSIONS, hasPermission } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

// 任务分类
const taskCategories = [
  { id: 'all', icon: '🔥', key: 'taskHall.catAll' },
  { id: 'music', icon: '🎵', key: 'taskHall.catMusic', lucide: Music },
  { id: 'vocal', icon: '🎤', key: 'taskHall.catVocal', lucide: Mic },
  { id: 'video', icon: '🎬', key: 'taskHall.catVideo', lucide: Video },
  { id: 'design', icon: '🎨', key: 'taskHall.catDesign', lucide: Palette },
  { id: 'code', icon: '💻', key: 'taskHall.catCode', lucide: Code },
  { id: 'writing', icon: '✍️', key: 'taskHall.catWriting', lucide: PenTool },
];

// 任务状态配置
const statusConfig = {
  open: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: AlertCircle },
  inProgress: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', icon: Timer },
  completed: { color: 'bg-gray-500/15 text-gray-400 border-gray-500/20', icon: CheckCircle2 },
};

// 模拟任务数据
const tasksData = [
  {
    id: 1, title: '原创电子音乐制作 — EDM/House风格', category: 'music',
    desc: '需要一首3-4分钟的原创电子音乐，House/EDM风格，用于品牌宣传视频背景音乐。要求节奏感强、有记忆点的旋律。',
    budget: 3000, budgetMax: 5000, currency: '¥',
    poster: '品牌方小王', posterAvatar: '🏢', posterLevel: 'vip',
    status: 'open', urgency: 'high',
    skills: ['编曲', 'EDM', 'Logic Pro', '混音'],
    applicants: 8, views: 234, comments: 12,
    deadline: '2025-05-15', createdAt: '2025-04-01',
    isPinned: true, isHot: true,
  },
  {
    id: 2, title: '短视频BGM定制 — 15秒卡点音乐', category: 'music',
    desc: '为抖音短视频账号定制系列卡点BGM，每首15-30秒，共5首。风格偏潮流、活力。',
    budget: 800, budgetMax: 1500, currency: '¥',
    poster: 'MCN机构', posterAvatar: '📱', posterLevel: 'vip',
    status: 'open', urgency: 'medium',
    skills: ['卡点音乐', '短视频', '节拍制作'],
    applicants: 15, views: 567, comments: 23,
    deadline: '2025-04-20', createdAt: '2025-03-28',
    isPinned: false, isHot: true,
  },
  {
    id: 3, title: '人声录制 — 华语流行歌曲Demo', category: 'vocal',
    desc: '已有编曲和词曲，需要女声录制Demo，音域要求C3-E5，风格偏清新治愈系。后期混音另算。',
    budget: 500, budgetMax: 1000, currency: '¥',
    poster: '独立音乐人阿杰', posterAvatar: '🎸', posterLevel: 'pro',
    status: 'open', urgency: 'low',
    skills: ['女声', '录音', '流行唱法', 'Demo'],
    applicants: 22, views: 890, comments: 45,
    deadline: '2025-05-01', createdAt: '2025-03-25',
    isPinned: false, isHot: false,
  },
  {
    id: 4, title: 'MV拍摄+后期制作 — 独立乐队', category: 'video',
    desc: '独立乐队新歌MV拍摄，需要导演+摄影+后期剪辑一条龙服务。歌曲风格为Indie Rock，MV概念已确定。',
    budget: 8000, budgetMax: 15000, currency: '¥',
    poster: '回声乐队', posterAvatar: '🎤', posterLevel: 'pro',
    status: 'inProgress', urgency: 'high',
    skills: ['MV拍摄', '视频剪辑', '调色', 'After Effects'],
    applicants: 5, views: 445, comments: 18,
    deadline: '2025-04-30', createdAt: '2025-03-20',
    isPinned: true, isHot: false,
  },
  {
    id: 5, title: '专辑封面设计 — 赛博朋克风格', category: 'design',
    desc: '新专辑《数字黎明》封面设计，要求赛博朋克+未来感风格。需提供正方形3000x3000px高清图+各平台适配尺寸。',
    budget: 1500, budgetMax: 3000, currency: '¥',
    poster: '电子音乐人Zero', posterAvatar: '⚡', posterLevel: 'pro',
    status: 'open', urgency: 'medium',
    skills: ['平面设计', 'Photoshop', '赛博朋克', '封面设计'],
    applicants: 19, views: 678, comments: 31,
    deadline: '2025-04-25', createdAt: '2025-03-22',
    isPinned: false, isHot: true,
  },
  {
    id: 6, title: '音乐网站前端开发 — React + 动效', category: 'code',
    desc: '个人音乐作品集网站开发，已有UI设计稿（Figma），需要React实现，包含音频播放器、动画特效、响应式适配。',
    budget: 5000, budgetMax: 8000, currency: '¥',
    poster: '制作人Luna', posterAvatar: '🌙', posterLevel: 'normal',
    status: 'open', urgency: 'medium',
    skills: ['React', 'TailwindCSS', 'Web Audio API', '动效开发'],
    applicants: 7, views: 312, comments: 9,
    deadline: '2025-05-10', createdAt: '2025-04-01',
    isPinned: false, isHot: false,
  },
  {
    id: 7, title: '歌词创作 — 古风/国风主题', category: 'writing',
    desc: '需要一首完整歌词，主题为"山水画意境+现代情感"的古风歌曲。旋律已完成（附Demo参考），需要精准匹配节拍的歌词。',
    budget: 600, budgetMax: 1200, currency: '¥',
    poster: '作曲人小林', posterAvatar: '🎹', posterLevel: 'normal',
    status: 'open', urgency: 'low',
    skills: ['歌词创作', '古风', '押韵', '填词'],
    applicants: 28, views: 1023, comments: 56,
    deadline: '2025-04-18', createdAt: '2025-03-15',
    isPinned: false, isHot: true,
  },
  {
    id: 8, title: '混音母带处理 — 10首EP专辑', category: 'music',
    desc: '10首歌曲的混音+母带处理，风格涵盖Pop/R&B/Hip-hop。已有分轨录音文件，需要专业混音师处理。',
    budget: 6000, budgetMax: 10000, currency: '¥',
    poster: '厂牌A&R', posterAvatar: '🏷️', posterLevel: 'vip',
    status: 'inProgress', urgency: 'high',
    skills: ['混音', '母带', 'Pro Tools', 'Waves'],
    applicants: 4, views: 189, comments: 7,
    deadline: '2025-05-20', createdAt: '2025-03-30',
    isPinned: false, isHot: false,
  },
];

// 排序选项
const sortOpts = [
  { id: 'latest', key: 'taskHall.sortLatest' },
  { id: 'budget_desc', key: 'taskHall.sortBudgetDesc' },
  { id: 'budget_asc', key: 'taskHall.sortBudgetAsc' },
  { id: 'hot', key: 'taskHall.sortHot' },
  { id: 'deadline', key: 'taskHall.sortDeadline' },
];

// 紧急度标签
const urgencyLabel = { high: 'taskHall.urgentHigh', medium: 'taskHall.urgentMedium', low: 'taskHall.urgentLow' };
const urgencyColor = { high: 'text-red-400 bg-red-500/10', medium: 'text-yellow-400 bg-yellow-500/10', low: 'text-blue-400 bg-blue-500/10' };

// 等级样式
const levelStyle = { vip: 'bg-yellow-500/15 text-yellow-400', pro: 'bg-primary/15 text-primary', normal: 'bg-white/[0.06] text-text-muted' };
const levelText = { vip: 'VIP', pro: 'PRO', normal: '' };

// 格式化日期
function daysLeft(deadline) {
  const d = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 0;
}

// ===== 发布任务弹窗 =====
function NewTaskModal({ onClose, onSubmit, t }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('music');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [urgency, setUrgency] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error(t('taskHall.errTitle')); return; }
    if (!desc.trim()) { toast.error(t('taskHall.errDesc')); return; }
    if (!budgetMin) { toast.error(t('taskHall.errBudget')); return; }
    onSubmit({ title, desc, category, budgetMin: Number(budgetMin), budgetMax: Number(budgetMax) || Number(budgetMin), deadline, skills: skills.split(/[,，、\s]+/).filter(Boolean), urgency });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-lighter shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Target size={20} className="text-primary" /> {t('taskHall.publishTask')}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 分类 + 紧急度 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.taskCategory')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]">
                {taskCategories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {t(c.key)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.urgencyLabel')}</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]">
                <option value="high">{t('taskHall.urgentHigh')}</option>
                <option value="medium">{t('taskHall.urgentMedium')}</option>
                <option value="low">{t('taskHall.urgentLow')}</option>
              </select>
            </div>
          </div>
          {/* 标题 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.taskTitle')}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('taskHall.titlePH')} maxLength={80}
              className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base placeholder:text-text-muted" />
          </div>
          {/* 描述 */}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.taskDesc')}</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder={t('taskHall.descPH')}
              className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted resize-none leading-relaxed" />
          </div>
          {/* 预算 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.budgetMin')}</label>
              <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="¥"
                className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base placeholder:text-text-muted" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.budgetMax')}</label>
              <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="¥"
                className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base placeholder:text-text-muted" />
            </div>
          </div>
          {/* 技能标签 + 截止日期 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.skillTags')}</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={t('taskHall.skillPH')}
                className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base placeholder:text-text-muted" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">{t('taskHall.deadline')}</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-primary text-base" />
            </div>
          </div>
          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-surface-lighter text-text-secondary rounded-full hover:text-white transition-colors">{t('taskHall.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">{t('taskHall.publish')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== 主页面 =====
export default function TaskHallPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('taskHall.title'));

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showNewTask, setShowNewTask] = useState(false);
  const [tasks, setTasks] = useState(tasksData);
  const [savedTasks, setSavedTasks] = useState(new Set());
  const { user } = useAuthStore();

  // 筛选 + 排序
  const filtered = useMemo(() => {
    let result = tasks.filter(task => {
      const matchCat = activeCategory === 'all' || task.category === activeCategory;
      const matchSearch = !searchQ || task.title.toLowerCase().includes(searchQ.toLowerCase()) || task.desc.toLowerCase().includes(searchQ.toLowerCase());
      return matchCat && matchSearch;
    });
    // 置顶优先
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
      if (sortBy === 'budget_desc') return b.budgetMax - a.budgetMax;
      if (sortBy === 'budget_asc') return a.budget - b.budget;
      if (sortBy === 'hot') return b.applicants - a.applicants;
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [tasks, activeCategory, searchQ, sortBy]);

  // 统计
  const totalBudget = tasks.filter(t => t.status === 'open').reduce((s, t) => s + t.budgetMax, 0);
  const openCount = tasks.filter(t => t.status === 'open').length;

  // 发布新任务
  const handleNewTask = (data) => {
    const newTask = {
      id: Date.now(), ...data, budget: data.budgetMin, budgetMax: data.budgetMax, currency: '¥',
      poster: user?.username || t('taskHall.anonymous'), posterAvatar: user?.avatar || '😊', posterLevel: 'normal',
      status: 'open', applicants: 0, views: 0, comments: 0,
      createdAt: new Date().toISOString(), isPinned: false, isHot: false,
    };
    setTasks([newTask, ...tasks]);
    toast.success(t('taskHall.publishSuccess'));
  };

  const toggleSave = (id) => {
    setSavedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      toast.success(next.has(id) ? t('taskHall.saved') : t('taskHall.unsaved'));
      return next;
    });
  };

  return (
    <div className="smart-container pt-6 pb-12">
      {/* ===== Hero 横幅 ===== */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/15 to-red-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.12),transparent_60%)]" />
        {/* 装饰网格 */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-7 lg:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
              <Target size={12} /> {t('taskHall.badge')}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">{t('taskHall.heading')}</h1>
            <p className="text-text-secondary text-sm max-w-md">{t('taskHall.desc')}</p>
            <div className="flex items-center gap-5 mt-4 text-sm text-text-muted">
              <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> {openCount} {t('taskHall.openTasks')}</span>
              <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-400" /> ¥{totalBudget.toLocaleString()} {t('taskHall.totalBounty')}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {tasks.reduce((s, t) => s + t.applicants, 0)} {t('taskHall.totalApplicants')}</span>
            </div>
          </div>
          <button onClick={() => { if (!user) { toast.error(t('taskHall.loginFirst')); return; } if (!hasPermission(user.role, PERMISSIONS.CREATE_POST)) { toast.error(t('permission.noPermission')); return; } setShowNewTask(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-full transition-all text-sm self-start shadow-[0_0_25px_rgba(234,179,8,0.2)] hover:shadow-[0_0_35px_rgba(234,179,8,0.3)]">
            <Plus size={16} /> {t('taskHall.publishTask')}
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ===== 左侧分类面板 ===== */}
        <div className="lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* 分类 */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">{t('taskHall.categories')}</h3>
              {taskCategories.map(c => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeCategory === c.id ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
                  <span className="text-base">{c.icon}</span>
                  <span className="flex-1">{t(c.key)}</span>
                </button>
              ))}
            </div>

            {/* 热门悬赏榜 */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5"><Award size={14} className="text-yellow-400" /> {t('taskHall.topBounty')}</h3>
              <div className="space-y-3">
                {[...tasks].sort((a, b) => b.budgetMax - a.budgetMax).slice(0, 4).map((task, i) => (
                  <div key={task.id} className="flex items-start gap-2.5 group">
                    <span className={`text-xs font-black w-5 pt-0.5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-orange-400' : i === 2 ? 'text-amber-400' : 'text-text-muted'}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary line-clamp-1 group-hover:text-primary transition-colors">{task.title}</p>
                      <span className="text-[10px] text-amber-400 font-bold">¥{task.budgetMax.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 右侧内容区 ===== */}
        <div className="flex-1 min-w-0">
          {/* 搜索 + 排序 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder={t('taskHall.searchPH')}
                className="w-full bg-white/[0.04] border border-white/[0.06] text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-amber-500/40 text-sm placeholder:text-text-muted transition-colors" />
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-text-secondary hover:text-white hover:border-white/[0.1] transition-colors">
                <Filter size={14} /> {t('taskHall.sort')} <ChevronDown size={13} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#15151e] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] py-1 z-30 hidden group-hover:block">
                {sortOpts.map(opt => (
                  <button key={opt.id} onClick={() => setSortBy(opt.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === opt.id ? 'text-amber-400 bg-amber-500/10' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'}`}>
                    {t(opt.key)}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-text-muted bg-white/[0.04] px-3 py-1.5 rounded-lg shrink-0">{filtered.length} {t('taskHall.tasksCount')}</span>
          </div>

          {/* 任务卡片列表 */}
          <div className="space-y-4">
            {filtered.map(task => {
              const stCfg = statusConfig[task.status];
              const StIcon = stCfg.icon;
              const days = daysLeft(task.deadline);
              const isSaved = savedTasks.has(task.id);

              return (
                <div key={task.id}
                  className={`relative rounded-2xl border bg-white/[0.02] p-5 lg:p-6 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] group ${task.isPinned ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/[0.06]'}`}>
                  {/* 置顶/热门标记 */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {task.isPinned && <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full"><Flame size={10} /> {t('taskHall.pinned')}</span>}
                    {task.isHot && <span className="flex items-center gap-0.5 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full"><TrendingUp size={10} /> {t('taskHall.hot')}</span>}
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stCfg.color}`}>
                      <StIcon size={10} /> {t(`taskHall.status_${task.status}`)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgencyColor[task.urgency]}`}>
                      {t(urgencyLabel[task.urgency])}
                    </span>
                    {task.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">{s}</span>
                    ))}
                    {task.skills.length > 3 && <span className="text-[10px] text-text-muted">+{task.skills.length - 3}</span>}
                  </div>

                  {/* 标题 + 预算 */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 flex-1">{task.title}</h3>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-amber-400">
                        {task.currency}{task.budget.toLocaleString()}{task.budgetMax > task.budget ? <span className="text-text-muted font-normal text-sm"> ~ {task.currency}{task.budgetMax.toLocaleString()}</span> : ''}
                      </p>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">{task.desc}</p>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 发布者 */}
                      <div className="flex items-center gap-2">
                        <span className="text-base">{task.posterAvatar}</span>
                        <span className="text-xs text-text-secondary font-medium">{task.poster}</span>
                        {levelText[task.posterLevel] && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${levelStyle[task.posterLevel]}`}>{levelText[task.posterLevel]}</span>
                        )}
                      </div>
                      <span className="text-white/10">|</span>
                      {/* 统计 */}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-0.5"><Users size={11} /> {task.applicants}</span>
                        <span className="flex items-center gap-0.5"><Eye size={11} /> {task.views}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare size={11} /> {task.comments}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 剩余天数 */}
                      {task.status === 'open' && (
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${days <= 3 ? 'text-red-400 bg-red-500/10' : days <= 7 ? 'text-yellow-400 bg-yellow-500/10' : 'text-text-muted bg-white/[0.04]'}`}>
                          <Clock size={11} /> {days}{t('taskHall.daysLeft')}
                        </span>
                      )}
                      {/* 收藏 */}
                      <button onClick={() => toggleSave(task.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-yellow-400 bg-yellow-500/10' : 'text-text-muted hover:text-white bg-white/[0.04]'}`}>
                        <Bookmark size={14} className={isSaved ? 'fill-yellow-400' : ''} />
                      </button>
                      {/* 查看详情/投标 */}
                      {task.status === 'open' && (
                        <button onClick={() => { if (!user) { toast.error(t('taskHall.loginFirst')); return; } if (!hasPermission(user.role, PERMISSIONS.COMMENT)) { toast.error(t('permission.noPermission')); return; } toast.success(t('taskHall.applied')); }}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-lg text-xs font-bold transition-colors">
                          {t('taskHall.applyNow')} <ArrowUpRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 空状态 */}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-text-muted">
              <Target size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('taskHall.noTasks')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 发布任务弹窗 */}
      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} onSubmit={handleNewTask} t={t} />}
    </div>
  );
}
