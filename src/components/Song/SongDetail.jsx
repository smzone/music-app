import { useState } from 'react';
import { X, Play, Heart, Share2 } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import usePlayerStore from '../../store/usePlayerStore';
import useAuthStore from '../../store/useAuthStore';
import StarRating from '../Rating/StarRating';
import CommentSection from '../Comment/CommentSection';
import { getAverageRating, formatDuration, formatPlays } from '../../data/songs';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SongDetail() {
  const { t } = useTranslation();
  const { detailSong, closeDetail, toggleFavorite, isFavorite, rateSong, userRatings } = useSongStore();
  const { playSong } = usePlayerStore();
  const { user, openAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('comments');

  if (!detailSong) return null;

  const song = detailSong;
  const fav = isFavorite(song.id);
  const avgRating = getAverageRating(song.ratings);
  const userRating = userRatings[song.id] || 0;

  const handleRate = (rating) => {
    if (!user) { openAuth('login'); return; }
    rateSong(song.id, rating);
    toast.success(t('songDetail.rated', { rating }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(t('songDetail.shareText', { title: song.title, artist: song.artist }));
    toast.success(t('songDetail.copiedLink'));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeDetail}>
      <div
        className="bg-surface-light rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fadeIn shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <div className="flex justify-end p-4">
          <button onClick={closeDetail} className="p-1.5 rounded-full hover:bg-surface-lighter text-text-muted hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {/* 歌曲信息头部 */}
        <div className="flex gap-5 px-6">
          <img src={song.cover} alt={song.title} className="w-40 h-40 rounded-xl object-cover shadow-2xl shrink-0" />
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight">{song.title}</h2>
            <p className="text-lg text-text-secondary mt-1.5">{song.artist}</p>
            <p className="text-sm text-text-muted mt-2">{t('songDetail.album')}: {song.album}</p>
            <p className="text-sm text-text-muted">{t('songDetail.genre')}: {t(`music.genre.${song.genre}`)}</p>
            <p className="text-sm text-text-muted">{t('songDetail.releaseDate')}: {song.releaseDate}</p>
            <p className="text-sm text-text-muted">{t('songDetail.plays')}: {formatPlays(song.plays)}</p>
          </div>
        </div>

        {/* 评分 */}
        <div className="px-6 mt-5">
          <StarRating rating={Number(avgRating)} totalRatings={song.ratings.length} readonly size={24} />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3 px-6 mt-5">
          <button
            onClick={() => { playSong(song); closeDetail(); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full text-[15px] transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            <Play size={18} /> {t('songDetail.play')}
          </button>
          <button
            onClick={() => { toggleFavorite(song.id); toast.success(fav ? t('songDetail.unfavorited') : t('songDetail.favorited')); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-medium border transition-colors ${
              fav ? 'border-primary text-primary' : 'border-surface-lighter text-text-secondary hover:text-white hover:border-white'
            }`}
          >
            <Heart size={16} className={fav ? 'fill-primary' : ''} /> {fav ? t('songDetail.favorited') : t('songDetail.favorite')}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-medium border border-surface-lighter text-text-secondary hover:text-white hover:border-white transition-colors"
          >
            <Share2 size={16} /> {t('songDetail.share')}
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-surface-lighter mt-6 px-6">
          {['comments', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[15px] font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-white border-primary'
                  : 'text-text-muted border-transparent hover:text-text-secondary'
              }`}
            >
              {tab === 'comments' ? t('songDetail.tabComments') : t('songDetail.tabDetails')}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className="px-6 py-5">
          {activeTab === 'comments' ? (
            <CommentSection song={song} />
          ) : (
            <div className="space-y-5">
              {/* 用户评分 */}
              <div>
                <p className="text-[15px] text-text-secondary mb-2 font-medium">{t('songDetail.yourRating')}</p>
                <StarRating rating={userRating} onRate={handleRate} size={32} />
              </div>
              {/* 歌曲详情表格 */}
              <div>
                <h4 className="text-base font-bold text-white mb-3">{t('songDetail.songInfo')}</h4>
                <div className="space-y-1 text-[15px] bg-surface-lighter/50 rounded-xl p-4">
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.songName')}</span>
                    <span className="text-white font-medium">{song.title}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.artist')}</span>
                    <span className="text-white font-medium">{song.artist}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.album')}</span>
                    <span className="text-text-secondary">{song.album}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.genre')}</span>
                    <span className="text-text-secondary">{t(`music.genre.${song.genre}`)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.duration')}</span>
                    <span className="text-text-secondary">{formatDuration(song.duration)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-surface-lighter">
                    <span className="text-text-muted">{t('songDetail.releaseDate')}</span>
                    <span className="text-text-secondary">{song.releaseDate}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-text-muted">{t('songDetail.plays')}</span>
                    <span className="text-text-secondary">{formatPlays(song.plays)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
