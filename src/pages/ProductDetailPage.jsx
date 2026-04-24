import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart, Share2, Truck,
  ShieldCheck, RefreshCw, MessageSquare, Tag, ChevronRight, Package,
} from 'lucide-react';
import { productsData, getProductById } from '../data/products';
import useCartStore from '../store/useCartStore';
import useOrderStore from '../store/useOrderStore';
import useWishlistStore from '../store/useWishlistStore';
import useThemeStore from '../store/useThemeStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import LazyImage from '../components/UI/LazyImage';

// 评价 Tab
function ReviewsTab({ reviews, isLight, t }) {
  if (!reviews.length) {
    return (
      <div className="py-12 text-center">
        <MessageSquare size={36} className={`mx-auto mb-3 ${isLight ? 'text-gray-300' : 'text-white/20'}`} />
        <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>{t('productDetail.noReviews') || '暂无评价'}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {reviews.map((r, idx) => (
        <div key={idx} className={`p-4 rounded-xl border ${isLight ? 'bg-gray-50 border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-emerald-500/50 flex items-center justify-center text-xs font-bold text-white">
                {r.buyer?.[0] || 'U'}
              </div>
              <div>
                <p className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.buyer || '匿名用户'}</p>
                <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={12} className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : isLight ? 'text-gray-300' : 'text-white/10'} />
              ))}
            </div>
          </div>
          <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-text-secondary'}`}>{r.content || (r.tags?.length ? r.tags.join(' · ') : t('productDetail.noContent') || '（未填写文字评价）')}</p>
          {r.tags?.length > 0 && r.content && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {r.tags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] ${isLight ? 'bg-primary/10 text-primary' : 'bg-primary/15 text-primary'}`}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const product = getProductById(id);
  useDocumentTitle(product ? product.name : t('productDetail.notFound') || '商品不存在');

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc'); // desc | reviews | shipping
  const [liked, setLiked] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const orders = useOrderStore((s) => s.orders);

  // 从所有订单聚合当前商品评价
  const reviews = useMemo(() => {
    const list = [];
    orders.forEach((o) => {
      if (!o.reviews || !o.reviews[id]) return;
      const r = o.reviews[id];
      list.push({
        ...r,
        buyer: o.address?.name || '匿名用户',
      });
    });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, id]);

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : product?.rating || 0;

  // 相关推荐（同分类，排除当前）
  const related = useMemo(() => {
    if (!product) return [];
    return productsData.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
        <div className="text-center">
          <Package size={48} className={`mx-auto mb-4 ${isLight ? 'text-gray-300' : 'text-white/20'}`} />
          <p className={`text-base ${isLight ? 'text-gray-600' : 'text-text-muted'} mb-4`}>
            {t('productDetail.notFound') || '商品不存在'}
          </p>
          <button onClick={() => navigate('/shop')}
            className="px-6 py-2 rounded-full bg-primary text-black text-sm font-bold hover:bg-primary-hover">
            {t('productDetail.backToShop') || '返回商城'}
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(t('shop.addedToCart') || '已加入购物车');
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    navigate('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.desc, url });
      } catch {/* ignored */}
    } else {
      await navigator.clipboard?.writeText(url);
      toast.success(t('productDetail.linkCopied') || '链接已复制');
    }
  };

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        {/* 面包屑 */}
        <div className={`flex items-center gap-1 text-xs mb-5 ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>
          <Link to="/" className="hover:text-primary">{t('nav.home') || '首页'}</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-primary">{t('shop.title') || '商城'}</Link>
          <ChevronRight size={12} />
          <span className={isLight ? 'text-gray-900' : 'text-white'}>{product.name}</span>
        </div>

        <button onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-1.5 text-sm mb-4 ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-text-muted hover:text-white'}`}>
          <ArrowLeft size={14} /> {t('common.back') || '返回'}
        </button>

        {/* 主区 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* 图片 */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl overflow-hidden border ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <LazyImage src={product.image} alt={product.name} className="w-full aspect-square object-cover" wrapperClassName="w-full aspect-square" />
            </div>
          </div>

          {/* 信息 */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/[0.05] text-text-muted'}`}>
                {product.category}
              </span>
              {product.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-primary/15 text-primary text-[11px] font-bold rounded-full flex items-center gap-0.5">
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>

            <h1 className={`text-2xl lg:text-3xl font-black tracking-tight mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {product.name}
            </h1>

            <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-text-secondary'}`}>{product.desc}</p>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : isLight ? 'text-gray-300' : 'text-white/10'} />
                ))}
                <span className={`text-sm font-bold ml-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{avgRating}</span>
              </div>
              <button onClick={() => setTab('reviews')}
                className={`text-xs hover:text-primary ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>
                {reviews.length} {t('productDetail.reviews') || '条评价'}
              </button>
              <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-text-muted'}`}>
                · {t('shop.sold') || '已售'} {product.sales}
              </span>
            </div>

            {/* 价格 */}
            <div className={`rounded-2xl p-5 mb-5 ${isLight ? 'bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/20' : 'bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20'}`}>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-primary">¥{product.price}</span>
                {discount > 0 && (
                  <>
                    <span className={`text-base line-through ${isLight ? 'text-gray-400' : 'text-text-muted'}`}>¥{product.originalPrice}</span>
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{discount}%</span>
                  </>
                )}
              </div>
            </div>

            {/* 数量 */}
            <div className="flex items-center gap-4 mb-5">
              <span className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {t('productDetail.qty') || '数量'}
              </span>
              <div className={`flex items-center rounded-full border ${isLight ? 'bg-white border-black/[0.08]' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className={`w-9 h-9 flex items-center justify-center rounded-l-full transition-colors ${isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-text-muted hover:bg-white/[0.05]'}`}>
                  <Minus size={14} />
                </button>
                <span className={`w-10 text-center text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-r-full transition-colors ${isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-text-muted hover:bg-white/[0.05]'}`}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 mb-6">
              <button onClick={handleAdd}
                className="flex-1 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <ShoppingCart size={14} /> {t('productDetail.addToCart') || '加入购物车'}
              </button>
              <button onClick={handleBuyNow}
                className="flex-1 py-3 rounded-full bg-primary hover:bg-primary-hover text-black text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                {t('productDetail.buyNow') || '立即购买'}
              </button>
              <button onClick={handleToggleLike}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${liked ? 'bg-red-500/15 border-red-500/40 text-red-400' : isLight ? 'border-black/[0.08] text-gray-600 hover:border-red-400 hover:text-red-400' : 'border-white/[0.08] text-text-muted hover:border-red-400 hover:text-red-400'}`}>
                <Heart size={15} className={liked ? 'fill-current' : ''} />
              </button>
              <button onClick={handleShare}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${isLight ? 'border-black/[0.08] text-gray-600 hover:border-primary hover:text-primary' : 'border-white/[0.08] text-text-muted hover:border-primary hover:text-primary'}`}>
                <Share2 size={15} />
              </button>
            </div>

            {/* 承诺 */}
            <div className={`grid grid-cols-3 gap-3 pt-4 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              {[
                { icon: Truck, label: t('productDetail.freeShipping') || '满99包邮' },
                { icon: ShieldCheck, label: t('productDetail.authentic') || '正品保障' },
                { icon: RefreshCw, label: t('productDetail.refund7Days') || '7天无理由' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <Icon size={14} className="text-primary shrink-0" />
                    <span className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-text-muted'}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className={`flex items-center gap-1 border-b mb-6 ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          {[
            { key: 'desc', label: t('productDetail.tabDesc') || '商品详情' },
            { key: 'reviews', label: `${t('productDetail.tabReviews') || '用户评价'} (${reviews.length})` },
            { key: 'shipping', label: t('productDetail.tabShipping') || '配送与售后' },
          ].map((ti) => (
            <button key={ti.key} onClick={() => setTab(ti.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === ti.key ? 'text-primary border-primary' : isLight ? 'text-gray-600 border-transparent hover:text-gray-900' : 'text-text-muted border-transparent hover:text-white'}`}>
              {ti.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className={`rounded-2xl border p-6 mb-8 ${isLight ? 'bg-white border-black/[0.06]' : 'bg-white/[0.02] border-white/[0.06]'}`}>
          {tab === 'desc' && (
            <div className={`text-sm leading-relaxed space-y-3 ${isLight ? 'text-gray-700' : 'text-text-secondary'}`}>
              <p>{product.desc}</p>
              <p>{t('productDetail.descExtra') || '我们精选优质材料与工艺，致力于为音乐爱好者提供最佳体验。商品已通过严格的质量检测，请放心购买。'}</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>{t('productDetail.feature1') || '正品授权，全新未拆封'}</li>
                <li>{t('productDetail.feature2') || '发货速度快，支持全国直邮'}</li>
                <li>{t('productDetail.feature3') || '完善的售后服务，7天无理由退换'}</li>
              </ul>
            </div>
          )}
          {tab === 'reviews' && <ReviewsTab reviews={reviews} isLight={isLight} t={t} />}
          {tab === 'shipping' && (
            <div className={`text-sm leading-relaxed space-y-3 ${isLight ? 'text-gray-700' : 'text-text-secondary'}`}>
              <div>
                <p className={`font-bold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <Truck size={14} className="inline mr-1 text-primary" /> {t('productDetail.shipInfo') || '配送信息'}
                </p>
                <p>{t('productDetail.shipDesc') || '订单支付完成后 1-3 个工作日内发货，全国大部分地区 2-4 天送达。满 99 元免运费，不满则收取 12 元运费。'}</p>
              </div>
              <div>
                <p className={`font-bold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <ShieldCheck size={14} className="inline mr-1 text-primary" /> {t('productDetail.afterSales') || '售后政策'}
                </p>
                <p>{t('productDetail.afterDesc') || '收到商品 7 天内无理由退换（商品需保持未使用状态及完整包装），质量问题我们承担来回运费。'}</p>
              </div>
            </div>
          )}
        </div>

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div>
            <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {t('productDetail.related') || '相关推荐'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/shop/${p.id}`}
                  className={`group rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 ${isLight ? 'bg-white border-black/[0.06] hover:border-primary/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-primary/30'}`}>
                  <div className="aspect-square overflow-hidden">
                    <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" wrapperClassName="w-full h-full" />
                  </div>
                  <div className="p-3">
                    <h3 className={`text-xs font-semibold line-clamp-2 mb-1.5 min-h-[32px] ${isLight ? 'text-gray-900' : 'text-white'} group-hover:text-primary transition-colors`}>{p.name}</h3>
                    <p className="text-base font-black text-primary">¥{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
