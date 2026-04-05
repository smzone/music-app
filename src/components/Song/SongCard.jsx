import { Play, Heart, Star, Share2, MoreHorizontal } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import useSongStore from '../../store/useSongStore';
import { getAverageRating, formatDuration } from '../../data/songs';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SongCard({ song }) {
  const { t } = useTranslation();
  const { playSong } = usePlayerStore();
  const { toggleFavorite, isFavorite, openDetail } = useSongStore();

  const fav = isFavorite(song.id);
  const avgRating = getAverageRating(song.ratings);

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(t('songDetail.shareText', { title: song.title, artist: song.artist }));
    toast.success(t('songDetail.copiedLink'));
  };

  return (
    <div className="group bg-surface-card rounded-xl overflow-hidden hover:bg-surface-lighter transition-all duration-300 animate-fadeIn hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1">
      {/* 封面区域 */}
      <div className="relative aspect-square cursor-pointer overflow-hidden" onClick={() => openDetail(song)}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* 悬浮播放按钮 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); playSong(song); }}
            className="p-4 bg-primary rounded-full hover:scale-110 transition-transform shadow-2xl"
          >
            <Play size={24} className="text-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* 信息区域 */}
      <div className="p-4">
        <h3
          className="text-base font-bold text-white line-clamp-1 cursor-pointer hover:underline"
          onClick={() => openDetail(song)}
        >
          {song.title}
        </h3>
        <p className="text-sm text-text-secondary mt-1 line-clamp-1">{song.artist}</p>

        {/* 评分 + 时长 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-star fill-star" />
            <span className="text-sm font-medium text-text-secondary">{avgRating}</span>
          </div>
          <span className="text-sm text-text-muted">{formatDuration(song.duration)}</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-lighter/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); toast.success(fav ? t('songDetail.unfavorited') : t('songDetail.favorited')); }}
            className="p-1.5 rounded-full hover:bg-surface-lighter transition-colors"
          >
            <Heart size={16} className={fav ? 'fill-primary text-primary' : 'text-text-muted hover:text-white'} />
          </button>
          <button onClick={handleShare} className="p-1.5 rounded-full hover:bg-surface-lighter transition-colors">
            <Share2 size={16} className="text-text-muted hover:text-white" />
          </button>
          <button onClick={() => openDetail(song)} className="p-1.5 rounded-full hover:bg-surface-lighter transition-colors">
            <MoreHorizontal size={16} className="text-text-muted hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
