import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, totalRatings = 0, onRate, size = 20, readonly = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = readonly ? star <= Math.round(rating) : star <= (hoverRating || rating);
          return (
            <button
              key={star}
              disabled={readonly}
              onMouseEnter={() => !readonly && setHoverRating(star)}
              onMouseLeave={() => !readonly && setHoverRating(0)}
              onClick={() => !readonly && onRate?.(star)}
              className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            >
              <Star
                size={size}
                className={filled ? 'fill-star text-star' : 'text-text-muted'}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-sm text-text-secondary">
          {Number(rating).toFixed(1)}
          {totalRatings > 0 && <span className="text-text-muted ml-1">({totalRatings}评分)</span>}
        </span>
      )}
    </div>
  );
}
