import { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../../store/useThemeStore';

// 星级评分组件
function StarRating({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} star`}
          >
            <Star
              size={size}
              className={active ? 'text-yellow-400' : 'text-text-muted/30'}
              fill={active ? 'currentColor' : 'none'}
              strokeWidth={active ? 1.5 : 2}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 订单商品评价弹窗
 * @param {object} order 订单对象
 * @param {function} onSubmit (reviewsMap) => void  reviewsMap: {productId: {rating, content}}
 * @param {function} onClose
 */
export default function ReviewModal({ order, onSubmit, onClose }) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  // 初始化评价 map（若已评价则预填）
  const [reviewsMap, setReviewsMap] = useState(() => {
    const init = {};
    order.items.forEach((item) => {
      const existing = order.reviews?.[item.id];
      init[item.id] = { rating: existing?.rating || 5, content: existing?.content || '' };
    });
    return init;
  });

  const updateReview = (productId, patch) => {
    setReviewsMap((s) => ({ ...s, [productId]: { ...s[productId], ...patch } }));
  };

  const handleSubmit = () => {
    // 校验：每个商品必须有评分
    const invalid = Object.values(reviewsMap).some((r) => !r.rating || r.rating < 1);
    if (invalid) return;
    onSubmit(reviewsMap);
  };

  const ratingLabel = (r) => {
    if (!r) return t('review.selectRating') || '请选择评分';
    const labels = {
      1: t('review.rating1') || '非常差',
      2: t('review.rating2') || '不满意',
      3: t('review.rating3') || '一般',
      4: t('review.rating4') || '满意',
      5: t('review.rating5') || '非常满意',
    };
    return labels[r];
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl animate-fadeIn border flex flex-col ${
          isLight ? 'bg-white border-black/[0.06]' : 'bg-[#15151e] border-white/[0.06]'
        }`}
      >
        {/* 顶部 */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isLight ? 'border-black/[0.04]' : 'border-white/[0.04]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/15 flex items-center justify-center">
              <Star size={18} className="text-yellow-400" fill="currentColor" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {t('review.title') || '评价商品'}
              </h2>
              <p className="text-[11px] text-text-muted">
                {t('review.subtitle', { count: order.items.length }) || `${order.items.length} 件商品 · 您的评价能帮助他人`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isLight ? 'hover:bg-black/[0.05] text-gray-500' : 'hover:bg-white/[0.06] text-text-muted'}`}>
            <X size={18} />
          </button>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {order.items.map((item) => {
            const r = reviewsMap[item.id];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${isLight ? 'border-black/[0.06] bg-gray-50/50' : 'border-white/[0.06] bg-white/[0.02]'}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">¥{item.price} × {item.qty}</p>
                  </div>
                </div>

                {/* 星级 + 标签 */}
                <div className="flex items-center gap-3 mb-3">
                  <StarRating value={r.rating} onChange={(v) => updateReview(item.id, { rating: v })} />
                  <span className="text-sm font-bold text-yellow-400">{ratingLabel(r.rating)}</span>
                </div>

                {/* 文字评价 */}
                <textarea
                  value={r.content}
                  onChange={(e) => updateReview(item.id, { content: e.target.value })}
                  rows={2}
                  maxLength={500}
                  placeholder={t('review.contentPH') || '分享您对商品的感受（选填）'}
                  className={`w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none ${
                    isLight ? 'bg-white border-black/[0.08] text-gray-900 focus:border-primary' : 'bg-white/[0.04] border-white/[0.08] text-white focus:border-primary'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {/* 快速标签 */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      t('review.tag1') || '质量好',
                      t('review.tag2') || '物超所值',
                      t('review.tag3') || '发货快',
                      t('review.tag4') || '包装精美',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => updateReview(item.id, { content: (r.content ? r.content + ' ' : '') + tag })}
                        className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                          isLight ? 'bg-black/[0.04] text-gray-500 hover:bg-primary/10 hover:text-primary' : 'bg-white/[0.04] text-text-muted hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-text-muted">{r.content.length}/500</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部操作 */}
        <div className={`flex gap-3 px-6 py-4 border-t shrink-0 ${isLight ? 'border-black/[0.04]' : 'border-white/[0.04]'}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium border ${isLight ? 'border-black/[0.08] text-gray-700 hover:bg-black/[0.04]' : 'border-white/[0.08] text-text-secondary hover:bg-white/[0.04]'}`}
          >
            {t('checkout.cancel') || '取消'}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-full font-bold text-sm flex items-center justify-center gap-1.5"
          >
            <MessageSquare size={14} /> {t('review.submit') || '提交评价'}
          </button>
        </div>
      </div>
    </div>
  );
}
