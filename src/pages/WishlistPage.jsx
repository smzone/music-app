import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2, Package, ArrowLeft } from 'lucide-react';
import useWishlistStore from '../store/useWishlistStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getProductById } from '../data/products';
import LazyImage from '../components/UI/LazyImage';

export default function WishlistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addToCart);

  useDocumentTitle(t('wishlist.title') || '我的心愿单');

  // 解析有效商品（剔除已下架）
  const products = useMemo(() => {
    return items
      .map((i) => ({ ...getProductById(i.id), addedAt: i.addedAt }))
      .filter((p) => p && p.id);
  }, [items]);

  const handleAddAll = () => {
    if (!products.length) return;
    products.forEach((p) => addToCart(p));
    toast.success(t('wishlist.allAdded') || `已加入 ${products.length} 件商品到购物车`);
  };

  const handleClear = () => {
    if (!items.length) return;
    if (!window.confirm(t('wishlist.confirmClear') || '确认清空心愿单？')) return;
    clear();
    toast.success(t('wishlist.cleared') || '心愿单已清空');
  };

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-text-secondary';
  const textMuted = isLight ? 'text-gray-500' : 'text-text-muted';
  const cardBg = isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        <button onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-1.5 text-sm mb-4 ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-text-muted hover:text-white'}`}>
          <ArrowLeft size={14} /> {t('common.back') || '返回'}
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${textMain}`}>
              <Heart size={22} className="fill-red-400 text-red-400" />
              {t('wishlist.title') || '我的心愿单'}
            </h1>
            <p className={`text-sm mt-1 ${textSub}`}>
              {products.length > 0
                ? (t('wishlist.count', { count: products.length }) || `共 ${products.length} 件商品`)
                : (t('wishlist.empty') || '你还没有收藏任何商品')}
            </p>
          </div>

          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={handleAddAll}
                className="px-4 py-2 rounded-full bg-primary text-black text-sm font-bold hover:bg-primary-hover flex items-center gap-1.5">
                <ShoppingCart size={14} /> {t('wishlist.addAll') || '全部加入购物车'}
              </button>
              <button onClick={handleClear}
                className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-1.5 ${isLight ? 'border-black/[0.08] text-gray-700 hover:border-red-400 hover:text-red-400' : 'border-white/[0.08] text-text-muted hover:border-red-400 hover:text-red-400'}`}>
                <Trash2 size={14} /> {t('wishlist.clear') || '清空'}
              </button>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className={`rounded-2xl border p-16 text-center ${cardBg}`}>
            <Heart size={48} className={`mx-auto mb-4 ${textMuted}`} />
            <p className={`text-base font-medium mb-2 ${textMain}`}>{t('wishlist.emptyTitle') || '心愿单空空如也'}</p>
            <p className={`text-sm mb-6 ${textMuted}`}>{t('wishlist.emptyDesc') || '发现喜欢的商品时，记得点击 ❤ 按钮收藏它们'}</p>
            <Link to="/shop"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-black text-sm font-bold hover:bg-primary-hover">
              <Package size={14} /> {t('wishlist.goShop') || '去逛逛'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {products.map((p) => (
              <div key={p.id} className={`group rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 ${cardBg} hover:border-primary/30`}>
                <Link to={`/shop/${p.id}`} className="block relative aspect-square overflow-hidden">
                  <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" wrapperClassName="w-full h-full" />
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(p.id); toast(t('wishlist.removed') || '已移出心愿单', { icon: '💔' }); }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all">
                    <Trash2 size={13} className="text-white" />
                  </button>
                  {p.originalPrice > p.price && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-md">
                      -{Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <p className={`text-[11px] mb-1.5 ${textMuted}`}>{p.category}</p>
                  <h3 className={`text-sm font-semibold line-clamp-2 mb-2 min-h-[36px] ${textMain} group-hover:text-primary transition-colors`}>{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-primary">¥{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className={`text-[11px] line-through ${textMuted}`}>¥{p.originalPrice}</span>
                      )}
                    </div>
                    <button onClick={() => { addToCart(p); toast.success(t('shop.addedToCart') || '已加入购物车'); }}
                      className="w-8 h-8 bg-primary hover:bg-primary-hover text-black rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                  <p className={`text-[10px] mt-2 ${textMuted}`}>
                    {t('wishlist.addedAt') || '加入时间'}: {new Date(p.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
