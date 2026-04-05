import StarRating from './StarRating';

export default {
  title: '组件/StarRating',
  component: StarRating,
  parameters: { layout: 'centered' },
};

export const ReadOnly = { args: { rating: 4.5, totalRatings: 120, readonly: true } };
export const Interactive = { args: { rating: 0, onRate: (r) => console.log('评分:', r) } };
export const Small = { args: { rating: 3, readonly: true, size: 16 } };
export const Large = { args: { rating: 5, totalRatings: 500, readonly: true, size: 32 } };
