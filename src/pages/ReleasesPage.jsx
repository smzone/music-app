import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Star, Eye, Heart, Filter, ChevronDown, Package } from 'lucide-react';
import { initialReleases, releaseCategories, releaseSortOptions, platformTags } from '../data/releases';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import LazyImage from '../components/UI/LazyImage';

// 评分星星组件
function RatingStars({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
        ))}
      </div>
      <span className="text-xs text-text-muted">{rating}</span>
      {count > 0 && <span className="text-[10px] text-text-muted">({count})</span>}
    </div>
  );
}

// 平台标签组件
function PlatformBadge({ platformId }) {
  const p = platformTags.find((t) => t.id === platformId);
  if (!p) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${p.color}`}>
      {p.icon} {p.label}
    </span>
  );
}

// 发布卡片组件
function ReleaseCard({ item, t }) {
  const cat = releaseCategories.find((c) => c.id === item.category);

  return (
    <Link to={`/releases/${item.id}`}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300">
      {/* 封面图 */}
      <div className="relative aspect-video overflow-hidden bg-surface-light">
        <LazyImage src={item.screenshots[0]} alt={item.title}
          wrapperClassName="w-full h-full absolute inset-0"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* 顶部角标 */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {item.isPinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/90 text-black">{t('releases.pinned')}</span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat?.color || ''} text-white border border-white/10 backdrop-blur-sm`}>
            {cat?.icon} {t(cat?.nameKey || '')}
          </span>
        </div>
        {/* 版本号 */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white/80 backdrop-blur-sm border border-white/10">
            v{item.version}
          </span>
        </div>
        {/* 底部渐变 */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f0f17] to-transparent" />
      </div>

      {/* 内容 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="text-[15px] font-bold text-text-primary group-hover:text-primary transition-colors truncate">{item.title}</h3>
        <p className="text-xs text-text-muted mt-0.5 truncate">{item.subtitle}</p>

        {/* 平台 */}
        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
          {item.platforms.map((p) => <PlatformBadge key={p} platformId={p} />)}
        </div>

        {/* 标签 */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted border border-white/[0.06]">{tag}</span>
          ))}
        </div>

        {/* 评分 */}
        <div className="mt-3">
          <RatingStars rating={item.rating} count={item.ratingCount} />
        </div>

        {/* 作者 & 统计 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{item.avatar}</span>
            <span className="text-xs text-text-secondary truncate">{item.author}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-muted shrink-0">
            <span className="flex items-center gap-0.5"><Download size={11} /> {item.downloads > 1000 ? (item.downloads / 1000).toFixed(1) + 'k' : item.downloads}</span>
            <span className="flex items-center gap-0.5"><Heart size={11} /> {item.likes}</span>
            <span className="flex items-center gap-0.5"><Eye size={11} /> {item.views > 1000 ? (item.views / 1000).toFixed(1) + 'k' : item.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ReleasesPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('releases.pageTitle'));

  const [searchQ, setSearchQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePlatform, setActivePlatform] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // 筛选 + 排序
  const filtered = useMemo(() => {
    let list = [...initialReleases];

    // 搜索
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.tags.some((tag) => tag.toLowerCase().includes(q)));
    }

    // 分类
    if (activeCategory !== 'all') {
      list = list.filter((r) => r.category === activeCategory);
    }

    // 平台
    if (activePlatform !== 'all') {
      list = list.filter((r) => r.platforms.includes(activePlatform));
    }

    // 排序
    if (sortBy === 'popular') list.sort((a, b) => b.likes - a.likes);
    else if (sortBy === 'downloads') list.sort((a, b) => b.downloads - a.downloads);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 置顶优先
    list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return list;
  }, [searchQ, activeCategory, activePlatform, sortBy]);

  // 统计
  const totalDownloads = initialReleases.reduce((s, r) => s + r.downloads, 0);
  const totalLikes = initialReleases.reduce((s, r) => s + r.likes, 0);

  return (
    <div className="smart-container py-8 animate-fadeIn">
      {/* 头部 Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 p-8 md:p-12 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">🎮</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-text-primary">{t('releases.title')}</h1>
              <p className="text-sm text-text-muted mt-0.5">{t('releases.subtitle')}</p>
            </div>
          </div>
          {/* 统计 */}
          <div className="flex items-center gap-6 mt-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-primary" />
              <span className="text-sm text-text-primary font-semibold">{initialReleases.length}</span>
              <span className="text-xs text-text-muted">{t('releases.statProjects')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download size={16} className="text-blue-400" />
              <span className="text-sm text-text-primary font-semibold">{(totalDownloads / 1000).toFixed(1)}k</span>
              <span className="text-xs text-text-muted">{t('releases.statDownloads')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              <span className="text-sm text-text-primary font-semibold">{(totalLikes / 1000).toFixed(1)}k</span>
              <span className="text-xs text-text-muted">{t('releases.statLikes')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder={t('releases.searchPH')}
            className="w-full bg-white/[0.04] text-text-primary pl-11 pr-4 py-3 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-[14px] placeholder:text-text-muted transition-all" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-text-primary'}`}>
          <Filter size={15} /> {t('releases.filter')}
          <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 筛选面板 */}
      <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[500px] opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          {/* 分类 */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{t('releases.filterCategory')}</p>
            <div className="flex flex-wrap gap-1.5">
              {releaseCategories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-white/[0.04] text-text-muted hover:text-text-primary border border-transparent'}`}>
                  {cat.icon} {t(cat.nameKey)}
                </button>
              ))}
            </div>
          </div>
          {/* 平台 */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{t('releases.filterPlatform')}</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setActivePlatform('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePlatform === 'all' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-white/[0.04] text-text-muted hover:text-text-primary border border-transparent'}`}>
                {t('releases.allPlatforms')}
              </button>
              {platformTags.map((p) => (
                <button key={p.id} onClick={() => setActivePlatform(p.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePlatform === p.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-white/[0.04] text-text-muted hover:text-text-primary border border-transparent'}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          {/* 排序 */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{t('releases.filterSort')}</p>
            <div className="flex flex-wrap gap-1.5">
              {releaseSortOptions.map((s) => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-white/[0.04] text-text-muted hover:text-text-primary border border-transparent'}`}>
                  {t(s.nameKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 分类快捷标签（始终可见） */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {releaseCategories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-primary/15 text-primary shadow-[0_0_10px_rgba(29,185,84,0.08)]' : 'bg-white/[0.03] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'}`}>
            {cat.icon} {t(cat.nameKey)}
          </button>
        ))}
      </div>

      {/* 结果数量 */}
      <p className="text-xs text-text-muted mb-4">{t('releases.resultCount', { count: filtered.length })}</p>

      {/* 卡片网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <ReleaseCard key={item.id} item={item} t={t} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Package size={48} className="mx-auto text-text-muted/30 mb-4" />
          <p className="text-text-muted">{t('releases.noResults')}</p>
        </div>
      )}
    </div>
  );
}
