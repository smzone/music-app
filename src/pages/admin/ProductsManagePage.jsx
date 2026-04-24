import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Package, Search, Plus, Edit3, Trash2, Eye, EyeOff, Star, Tag,
  Cloud, Loader2, X, Image as ImageIcon, Save, Filter, TrendingUp, DollarSign,
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  fetchProductsAdmin, upsertProduct, deleteProduct, patchProduct, fetchProductCategories,
} from '../../lib/supabaseService';
import { productsData as mockProducts, shopCategories as mockCategories } from '../../data/products';
import ImageUploader from '../../components/UI/ImageUploader';
import MultiImageUploader from '../../components/UI/MultiImageUploader';

// 空模板
const EMPTY_PRODUCT = {
  id: '',
  name: '',
  description: '',
  price: 0,
  original_price: 0,
  image: '',
  category_slug: 'merch',
  category_name: '周边',
  tags: [],
  stock: 9999,
  is_active: true,
  is_featured: false,
};

// ============================================================================
// 商品管理页 — CRUD + 上架/下架 + 特色推荐 + 搜索 + 分类过滤 + 同步远端
// ============================================================================
export default function ProductsManagePage() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const [products, setProducts] = useState(() => mockProducts);
  const [categories, setCategories] = useState(() => mockCategories.filter((c) => c.id !== 'all'));
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive | featured
  const [editing, setEditing] = useState(null); // 编辑中的商品（null = 关闭）
  const [saving, setSaving] = useState(false);

  // 初始加载
  const loadProducts = async () => {
    if (!isSupabaseConfigured) {
      setProducts(mockProducts.map((p) => ({
        ...p,
        description: p.desc,
        original_price: p.originalPrice,
        category_slug: p.category === '设备' ? 'equipment' : p.category === '周边' ? 'merch' : 'music',
        category_name: p.category,
        rating_avg: p.rating,
        rating_count: 0,
        is_active: true,
        is_featured: false,
      })));
      return;
    }
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        fetchProductsAdmin(),
        fetchProductCategories(),
      ]);
      if (!list.length) {
        toast(t('adminProducts.emptyRemote') || '远端商品为空，请先执行 shop-products-schema.sql');
      }
      setProducts(list);
      if (cats.length) {
        setCategories(cats.map((c) => ({ id: c.slug, icon: c.icon, cat: c.name, key: `shop.cat_${c.slug}` })));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('adminProducts.loadFailed') || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []); // eslint-disable-line

  // 统计
  const stats = useMemo(() => {
    const active = products.filter((p) => p.is_active).length;
    const featured = products.filter((p) => p.is_featured).length;
    const totalSales = products.reduce((s, p) => s + (p.sales || 0), 0);
    const revenue = products.reduce((s, p) => s + (p.price || 0) * (p.sales || 0), 0);
    return { total: products.length, active, featured, totalSales, revenue };
  }, [products]);

  // 搜索 + 过滤
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCat !== 'all' && p.category_slug !== filterCat) return false;
      if (filterStatus === 'active' && !p.is_active) return false;
      if (filterStatus === 'inactive' && p.is_active) return false;
      if (filterStatus === 'featured' && !p.is_featured) return false;
      if (q && !(String(p.name).toLowerCase().includes(q) || String(p.id).includes(q))) return false;
      return true;
    });
  }, [products, search, filterCat, filterStatus]);

  // 新增
  const handleCreate = () => {
    const nextId = Math.max(0, ...products.map((p) => Number(p.id))) + 1;
    setEditing({ ...EMPTY_PRODUCT, id: nextId });
  };

  // 编辑
  const handleEdit = (p) => setEditing({ ...p, tags: p.tags || [] });

  // 保存
  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error(t('adminProducts.nameRequired') || '请填写商品名');
    if (!editing.id) return toast.error(t('adminProducts.idRequired') || '请填写商品 ID');
    if (!isSupabaseConfigured) {
      toast(t('adminProducts.localOnly') || '未配置 Supabase，仅在本次会话生效');
      setProducts((prev) => {
        const exists = prev.find((p) => p.id === editing.id);
        if (exists) return prev.map((p) => (p.id === editing.id ? editing : p));
        return [...prev, editing];
      });
      setEditing(null);
      return;
    }
    setSaving(true);
    const { error } = await upsertProduct(editing);
    setSaving(false);
    if (error) return toast.error((t('adminProducts.saveFailed') || '保存失败') + ': ' + error.message);
    toast.success(t('adminProducts.saveOk') || '已保存');
    setEditing(null);
    loadProducts();
  };

  // 删除
  const handleDelete = async (p) => {
    if (!window.confirm((t('adminProducts.confirmDelete') || '确认删除该商品？') + ` #${p.id} ${p.name}`)) return;
    if (!isSupabaseConfigured) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success(t('adminProducts.deleteOk') || '已删除');
      return;
    }
    const { error } = await deleteProduct(p.id);
    if (error) return toast.error((t('adminProducts.deleteFailed') || '删除失败') + ': ' + error.message);
    toast.success(t('adminProducts.deleteOk') || '已删除');
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  };

  // 切换状态
  const handleToggle = async (p, field) => {
    const next = !p[field];
    // 乐观更新
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: next } : x)));
    if (!isSupabaseConfigured) return;
    const { error } = await patchProduct(p.id, { [field]: next });
    if (error) {
      toast.error(t('adminProducts.patchFailed') || '更新失败');
      // 回滚
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: p[field] } : x)));
    }
  };

  const cardBg = isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';
  const inputBg = isLight ? 'bg-white border-black/[0.08] text-gray-900' : 'bg-white/[0.04] border-white/[0.08] text-white';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 头部 */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>
            {t('adminProducts.title') || '商品管理'}
          </h1>
          <p className={`text-sm ${textSub}`}>
            {t('adminProducts.subtitle') || '管理商城商品：上架/下架、价格、库存、推荐与分类'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSupabaseConfigured && (
            <button
              onClick={loadProducts}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition-colors border ${loading ? 'bg-white/5 text-text-muted cursor-not-allowed border-white/[0.08]' : isLight ? 'bg-white border-black/[0.08] text-gray-800 hover:border-primary hover:text-primary' : 'bg-white/[0.04] border-white/[0.08] text-white hover:border-primary hover:text-primary'}`}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
              {loading ? (t('adminProducts.syncing') || '加载中...') : (t('adminProducts.refresh') || '刷新')}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-full bg-primary text-black text-sm font-bold flex items-center gap-1.5 hover:bg-primary-hover"
          >
            <Plus size={14} /> {t('adminProducts.create') || '新增商品'}
          </button>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard isLight={isLight} icon={Package} color="text-primary" label={t('adminProducts.total') || '商品总数'} value={stats.total} />
        <StatCard isLight={isLight} icon={Eye} color="text-emerald-400" label={t('adminProducts.activeCount') || '上架中'} value={stats.active} />
        <StatCard isLight={isLight} icon={Star} color="text-yellow-400" label={t('adminProducts.featuredCount') || '推荐'} value={stats.featured} />
        <StatCard isLight={isLight} icon={TrendingUp} color="text-blue-400" label={t('adminProducts.totalSales') || '总销量'} value={stats.totalSales} />
        <StatCard isLight={isLight} icon={DollarSign} color="text-orange-400" label={t('adminProducts.totalRevenue') || '预估营收'} value={`¥${stats.revenue.toFixed(0)}`} />
      </div>

      {/* 搜索 + 过滤 */}
      <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminProducts.searchPlaceholder') || '搜索商品名称或 ID...'}
              className={`w-full pl-9 pr-3 py-2 rounded-full border text-sm outline-none transition-colors focus:border-primary ${inputBg}`}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className={textMuted} />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className={`px-3 py-2 rounded-full border text-xs outline-none ${inputBg}`}
            >
              <option value="all">{t('adminProducts.allCategories') || '所有分类'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: 'all', label: t('adminProducts.filterAll') || '全部' },
              { key: 'active', label: t('adminProducts.filterActive') || '上架' },
              { key: 'inactive', label: t('adminProducts.filterInactive') || '下架' },
              { key: 'featured', label: t('adminProducts.filterFeatured') || '推荐' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s.key ? 'bg-primary/15 text-primary' : `${textMuted} hover:text-primary`}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 列表（表格） */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${isLight ? 'bg-gray-50 text-gray-600' : 'bg-white/[0.03] text-text-muted'}`}>
              <tr>
                <th className="text-left p-3 font-semibold w-16">ID</th>
                <th className="text-left p-3 font-semibold">{t('adminProducts.colProduct') || '商品'}</th>
                <th className="text-left p-3 font-semibold">{t('adminProducts.colCategory') || '分类'}</th>
                <th className="text-right p-3 font-semibold">{t('adminProducts.colPrice') || '价格'}</th>
                <th className="text-center p-3 font-semibold">{t('adminProducts.colStock') || '库存'}</th>
                <th className="text-center p-3 font-semibold">{t('adminProducts.colSales') || '销量'}</th>
                <th className="text-center p-3 font-semibold">{t('adminProducts.colRating') || '评分'}</th>
                <th className="text-center p-3 font-semibold">{t('adminProducts.colStatus') || '状态'}</th>
                <th className="text-right p-3 font-semibold">{t('adminProducts.colActions') || '操作'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className={`p-12 text-center ${textMuted}`}>
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    <p>{t('adminProducts.empty') || '暂无商品'}</p>
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className={`border-t ${isLight ? 'border-black/[0.04] hover:bg-gray-50' : 'border-white/[0.04] hover:bg-white/[0.02]'} transition-colors`}>
                  <td className={`p-3 text-xs font-mono ${textMuted}`}>#{p.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 max-w-xs">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-gray-100' : 'bg-white/[0.05]'}`}>
                          <ImageIcon size={14} className={textMuted} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${textMain}`}>{p.name}</p>
                        {p.tags?.length > 0 && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {p.tags.slice(0, 3).map((tg) => (
                              <span key={tg} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-0.5"><Tag size={8} />{tg}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`p-3 text-xs ${textSub}`}>{p.category_name || '-'}</td>
                  <td className="p-3 text-right">
                    <div className={`text-sm font-bold text-primary`}>¥{Number(p.price).toFixed(2)}</div>
                    {Number(p.original_price) > Number(p.price) && (
                      <div className={`text-[10px] line-through ${textMuted}`}>¥{Number(p.original_price).toFixed(2)}</div>
                    )}
                  </td>
                  <td className={`p-3 text-center text-xs ${textSub}`}>{p.stock ?? '-'}</td>
                  <td className={`p-3 text-center text-xs ${textSub}`}>{p.sales ?? 0}</td>
                  <td className="p-3 text-center">
                    <div className={`flex items-center justify-center gap-1 text-xs ${textSub}`}>
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      {Number(p.rating_avg || 0).toFixed(1)}
                      <span className={textMuted}>({p.rating_count || 0})</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleToggle(p, 'is_active')}
                        title={p.is_active ? '点击下架' : '点击上架'}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${p.is_active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/25'}`}
                      >
                        {p.is_active ? (t('adminProducts.active') || '上架') : (t('adminProducts.inactive') || '下架')}
                      </button>
                      <button
                        onClick={() => handleToggle(p, 'is_featured')}
                        title={p.is_featured ? '取消推荐' : '加入推荐'}
                        className={`p-1 rounded transition-colors ${p.is_featured ? 'text-yellow-400' : `${textMuted} hover:text-yellow-400`}`}
                      >
                        <Star size={12} className={p.is_featured ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900' : 'hover:bg-white/[0.05] text-text-muted hover:text-white'}`}
                        title={t('adminProducts.edit') || '编辑'}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-red-50 text-gray-600 hover:text-red-500' : 'hover:bg-red-500/10 text-text-muted hover:text-red-400'}`}
                        title={t('adminProducts.delete') || '删除'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 编辑 Modal */}
      {editing && (
        <EditModal
          editing={editing}
          setEditing={setEditing}
          onSave={handleSave}
          saving={saving}
          categories={categories}
          isLight={isLight}
          inputBg={inputBg}
          t={t}
        />
      )}
    </div>
  );
}

// ====== 统计卡 ======
function StatCard({ isLight, icon: Icon, color, label, value }) {
  return (
    <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{label}</span>
      </div>
      <div className={`text-xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>{value}</div>
    </div>
  );
}

// ====== 编辑 Modal ======
function EditModal({ editing, setEditing, onSave, saving, categories, isLight, inputBg, t }) {
  const [tagInput, setTagInput] = useState('');
  const update = (patch) => setEditing((e) => ({ ...e, ...patch }));
  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if ((editing.tags || []).includes(v)) return;
    update({ tags: [...(editing.tags || []), v] });
    setTagInput('');
  };
  const removeTag = (tg) => update({ tags: (editing.tags || []).filter((x) => x !== tg) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)}>
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]'}`}>
          <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {editing.id && editing.name ? (t('adminProducts.editTitle') || '编辑商品') : (t('adminProducts.createTitle') || '新增商品')}
          </h2>
          <button onClick={() => setEditing(null)} className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/[0.05] text-text-muted'}`}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ID + 名称 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>ID *</label>
              <input
                type="number"
                value={editing.id}
                onChange={(e) => update({ id: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
              />
            </div>
            <div className="col-span-3">
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.name') || '商品名称'} *</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => update({ name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
                placeholder={t('adminProducts.namePlaceholder') || '如：Audio-Technica 监听耳机'}
              />
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.description') || '描述'}</label>
            <textarea
              rows={3}
              value={editing.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary resize-none ${inputBg}`}
            />
          </div>

          {/* 价格 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.price') || '售价'} *</label>
              <input
                type="number"
                step="0.01"
                value={editing.price}
                onChange={(e) => update({ price: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
              />
            </div>
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.originalPrice') || '原价'}</label>
              <input
                type="number"
                step="0.01"
                value={editing.original_price}
                onChange={(e) => update({ original_price: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
              />
            </div>
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.stock') || '库存'}</label>
              <input
                type="number"
                value={editing.stock ?? 9999}
                onChange={(e) => update({ stock: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
              />
            </div>
          </div>

          {/* 分类 */}
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.category') || '分类'}</label>
            <select
              value={editing.category_slug || ''}
              onChange={(e) => {
                const c = categories.find((x) => x.id === e.target.value);
                update({ category_slug: e.target.value, category_name: c?.cat || '' });
              }}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.cat}</option>
              ))}
            </select>
          </div>

          {/* 封面图 */}
          <ImageUploader
            label={t('adminProducts.image') || '封面图'}
            value={editing.image || ''}
            onChange={(url) => update({ image: url })}
            bucket="product-images"
            folder={`products/${editing.id}`}
            aspect="video"
            maxSizeMB={5}
          />

          {/* 图片画廊（多图） */}
          <MultiImageUploader
            label={t('adminProducts.gallery') || '图片画廊（多图）'}
            value={editing.images || []}
            onChange={(urls) => update({ images: urls })}
            bucket="product-images"
            folder={`products/${editing.id}/gallery`}
            max={8}
            maxSizeMB={5}
          />

          {/* 标签 */}
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{t('adminProducts.tags') || '标签'}</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder={t('adminProducts.tagPlaceholder') || '输入标签后按 Enter'}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary ${inputBg}`}
              />
              <button onClick={addTag} className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary-hover">
                {t('adminProducts.addTag') || '添加'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(editing.tags || []).map((tg) => (
                <span key={tg} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] flex items-center gap-1">
                  <Tag size={9} /> {tg}
                  <button onClick={() => removeTag(tg)} className="hover:text-red-400"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* 开关 */}
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${isLight ? 'bg-white border-black/[0.08]' : 'bg-white/[0.04] border-white/[0.08]'}`}>
              <input type="checkbox" checked={!!editing.is_active} onChange={(e) => update({ is_active: e.target.checked })} />
              <span className={`text-xs font-medium ${isLight ? 'text-gray-700' : 'text-text-secondary'}`}>
                {editing.is_active ? <Eye size={12} className="inline mr-1 text-emerald-400" /> : <EyeOff size={12} className="inline mr-1 text-gray-400" />}
                {t('adminProducts.toggleActive') || '商品上架'}
              </span>
            </label>
            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${isLight ? 'bg-white border-black/[0.08]' : 'bg-white/[0.04] border-white/[0.08]'}`}>
              <input type="checkbox" checked={!!editing.is_featured} onChange={(e) => update({ is_featured: e.target.checked })} />
              <span className={`text-xs font-medium ${isLight ? 'text-gray-700' : 'text-text-secondary'}`}>
                <Star size={12} className={`inline mr-1 ${editing.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                {t('adminProducts.toggleFeatured') || '推荐商品'}
              </span>
            </label>
          </div>
        </div>

        <div className={`sticky bottom-0 flex items-center justify-end gap-2 px-6 py-4 border-t ${isLight ? 'bg-white border-black/[0.06]' : 'bg-[#12121a] border-white/[0.06]'}`}>
          <button onClick={() => setEditing(null)} className={`px-4 py-2 rounded-full text-sm font-medium ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-text-muted hover:bg-white/[0.05]'}`}>
            {t('adminProducts.cancel') || '取消'}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition-colors ${saving ? 'bg-white/5 text-text-muted cursor-not-allowed' : 'bg-primary text-black hover:bg-primary-hover'}`}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? (t('adminProducts.saving') || '保存中...') : (t('adminProducts.save') || '保存')}
          </button>
        </div>
      </div>
    </div>
  );
}
