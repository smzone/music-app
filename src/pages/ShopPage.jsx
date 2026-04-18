import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, X, Plus, Minus, Trash2, Search, Tag, TrendingUp, Package, Sparkles, ShoppingBag, Check } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import LazyImage from '../components/UI/LazyImage';

// 模拟商品数据
const productsData = [
  { id: 1, name: '定制款音乐人T恤', price: 129, originalPrice: 199, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', rating: 4.8, sales: 234, category: '周边', tags: ['限定', '热卖'], desc: '100%纯棉定制印花，独家设计图案' },
  { id: 2, name: 'Audio-Technica ATH-M50x 监听耳机', price: 899, originalPrice: 1099, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', rating: 4.9, sales: 156, category: '设备', tags: ['推荐'], desc: '专业级监听耳机，还原真实声音' },
  { id: 3, name: '原创专辑《星空漫步》实体CD', price: 68, originalPrice: 88, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', rating: 5.0, sales: 89, category: '音乐', tags: ['签名版'], desc: '含签名版封面 + 歌词本 + 独家花絮' },
  { id: 4, name: 'MIDI键盘 Arturia MiniLab 3', price: 699, originalPrice: 799, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', rating: 4.7, sales: 78, category: '设备', tags: ['好评'], desc: '25键紧凑型MIDI控制器，适合入门' },
  { id: 5, name: '音乐人定制手机壳', price: 49, originalPrice: 79, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', rating: 4.6, sales: 567, category: '周边', tags: ['热卖'], desc: '多款图案可选，硅胶防摔材质' },
  { id: 6, name: '入门级电容麦克风套装', price: 299, originalPrice: 399, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop', rating: 4.5, sales: 123, category: '设备', tags: [], desc: '含麦克风+支架+防喷罩+声卡' },
  { id: 7, name: '音乐创作笔记本', price: 39, originalPrice: 59, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', rating: 4.8, sales: 345, category: '周边', tags: [], desc: '五线谱+空白页设计，适合记录灵感' },
  { id: 8, name: '独家数字专辑合集（数字版）', price: 29, originalPrice: 49, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', rating: 4.9, sales: 890, category: '音乐', tags: ['数字'], desc: '包含全部原创歌曲无损音质下载' },
];

const shopCategories = [
  { id: 'all', icon: '📦', key: 'shop.catAll' },
  { id: 'equipment', icon: '🎧', key: 'shop.catEquipment', cat: '设备' },
  { id: 'merch', icon: '👕', key: 'shop.catMerch', cat: '周边' },
  { id: 'music', icon: '💿', key: 'shop.catMusic', cat: '音乐' },
];

// 购物车侧边栏 — 增强版
function CartSidebar({ cart, onClose, onUpdateQty, onRemove, onCheckout, t }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`absolute top-0 right-0 h-full w-full max-w-md shadow-2xl animate-fadeIn flex flex-col border-l ${useThemeStore.getState().theme === 'light' ? 'bg-white border-black/[0.06]' : 'bg-[#111118] border-white/[0.06]'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShoppingCart size={18} className="text-primary" />
            </div>
            {t('shop.cart')} <span className="text-sm text-text-muted font-normal">({t('shop.cartItems', { count: totalItems })})</span>
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-text-muted hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-text-muted">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-base font-medium mb-1">{t('shop.cartEmpty')}</p>
              <p className="text-sm">{t('shop.cartEmptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-1 mb-1">{item.name}</p>
                    <p className="text-primary font-bold text-base">¥{item.price}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center bg-white/[0.05] rounded-lg">
                        <button onClick={() => onUpdateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-white transition-colors"><Minus size={12} /></button>
                        <span className="text-sm text-white w-7 text-center font-medium">{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-white transition-colors"><Plus size={12} /></button>
                      </div>
                      <span className="text-xs text-text-muted ml-auto">¥{(item.price * item.qty).toFixed(0)}</span>
                      <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">{t('shop.subtotal')} ({t('shop.cartItems', { count: totalItems })})</span>
              <span className="text-sm text-text-secondary">¥{total.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-bold text-white">{t('shop.total')}</span>
              <span className="text-2xl font-black text-primary">¥{total.toFixed(0)}</span>
            </div>
            <button onClick={() => { onClose(); onCheckout(); }}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all text-[15px] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)]">
              {t('shop.checkout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('shop.title'));
  const [activeCategory, setActiveCategory] = useState('all');
  const { cart, addToCart: storeAdd, updateQty, removeFromCart } = useCartStore();
  const [showCart, setShowCart] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const filtered = useMemo(() => {
    let result = productsData.filter((p) => {
      const catMap = shopCategories.find(c => c.id === activeCategory);
      const matchCat = activeCategory === 'all' || p.category === (catMap?.cat || '');
      const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase());
      return matchCat && matchSearch;
    });
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'sales') result = [...result].sort((a, b) => b.sales - a.sales);
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [activeCategory, searchQ, sortBy]);

  const addToCart = (product) => {
    storeAdd(product);
    toast.success(t('shop.addedToCart'));
  };

  const toggleLike = (id) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const isInCart = (id) => cart.some((i) => i.id === id);

  return (
    <div className="smart-container pt-8 pb-12">
      {/* ===== Hero 横幅 ===== */}
      <div className="relative rounded-3xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-pink-600/15 to-purple-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
              <Sparkles size={12} /> {t('shop.badge')}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">{t('shop.heading')}</h1>
            <p className="text-text-secondary text-base max-w-md">{t('shop.desc')}</p>
            <div className="flex items-center gap-4 mt-5 text-sm text-text-muted">
              <span className="flex items-center gap-1"><Package size={14} /> {t('shop.products', { count: productsData.length })}</span>
              <span className="flex items-center gap-1"><TrendingUp size={14} /> {t('shop.totalSales', { count: productsData.reduce((s, p) => s + p.sales, 0) })}</span>
            </div>
          </div>
          <button onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-semibold rounded-full transition-all self-start border border-white/[0.1]">
            <ShoppingCart size={20} /> {t('shop.cart')}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center animate-bounce">{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ===== 分类标签 ===== */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {shopCategories.map((c) => {
          const count = c.id === 'all' ? productsData.length : productsData.filter(p => p.category === c.cat).length;
          return (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${activeCategory === c.id ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(29,185,84,0.1)]' : 'bg-white/[0.03] text-text-secondary hover:text-white border border-white/[0.06] hover:border-white/[0.12]'}`}>
              <span>{c.icon}</span> {t(c.key)}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeCategory === c.id ? 'bg-primary/20 text-primary' : 'bg-white/[0.05] text-text-muted'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ===== 搜索 + 排序 ===== */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder={t('shop.search')}
            className="w-full bg-white/[0.04] text-white pl-10 pr-4 py-2.5 rounded-full outline-none border border-white/[0.06] focus:border-primary text-sm placeholder:text-text-muted transition-colors" />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'default', key: 'shop.sortDefault' },
            { id: 'sales', key: 'shop.sortSales' },
            { id: 'price_asc', key: 'shop.sortPriceAsc' },
            { id: 'price_desc', key: 'shop.sortPriceDesc' },
            { id: 'rating', key: 'shop.sortRating' },
          ].map((s) => (
            <button key={s.id} onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s.id ? 'bg-primary/15 text-primary' : 'text-text-muted hover:text-white'}`}>
              {t(s.key)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 商品网格 ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {filtered.map((product) => (
          <div key={product.id} className={`group rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-2 ${useThemeStore.getState().theme === 'light' ? 'border-black/[0.06] bg-white hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]' : 'border-white/[0.06] bg-white/[0.02] hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]'}`}>
            <div className="relative aspect-square overflow-hidden">
              <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapperClassName="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* 标签 */}
              {product.tags.length > 0 && (
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-primary text-black text-[10px] font-bold rounded-md flex items-center gap-0.5"><Tag size={9} />{tag}</span>
                  ))}
                </div>
              )}
              {/* 收藏 */}
              <button onClick={() => toggleLike(product.id)}
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <Heart size={15} className={likedItems.has(product.id) ? 'fill-red-400 text-red-400' : 'text-white'} />
              </button>
              {/* 折扣 */}
              {product.originalPrice > product.price && (
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-md">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}
              {/* 快速加购 */}
              <button onClick={() => addToCart(product)}
                className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-primary hover:bg-primary-hover text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
                {isInCart(product.id) ? <Check size={16} /> : <Plus size={18} />}
              </button>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-text-muted mb-1.5">{product.category}</p>
              <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2 min-h-[36px] group-hover:text-primary transition-colors">{product.name}</h3>
              <p className="text-xs text-text-muted line-clamp-1 mb-3">{product.desc}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={10} className={i < Math.floor(product.rating) ? 'fill-star text-star' : 'text-white/10'} />
                  ))}
                </div>
                <span className="text-[10px] text-star font-medium">{product.rating}</span>
                <span className="text-[10px] text-text-muted">· {t('shop.sold')}{product.sales}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-primary">¥{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-[11px] text-text-muted line-through">¥{product.originalPrice}</span>
                  )}
                </div>
                <button onClick={() => addToCart(product)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-black text-xs font-semibold rounded-full transition-all">
                  <ShoppingCart size={12} /> {t('shop.quickAdd')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-text-muted">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
          <p>{t('shop.noResults')}</p>
        </div>
      )}

      {showCart && <CartSidebar cart={cart} onClose={() => setShowCart(false)} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={() => navigate('/checkout')} t={t} />}
    </div>
  );
}
