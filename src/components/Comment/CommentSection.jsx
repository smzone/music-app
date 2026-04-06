import { useState } from 'react';
import { Heart, Send } from 'lucide-react';
import useSongStore from '../../store/useSongStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CommentSection({ song }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const { addComment, likeComment } = useSongStore();
  const { user, openAuth } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) { openAuth('login'); return; }
    if (!text.trim()) { toast.error(t('comment.errorEmpty')); return; }
    addComment(song.id, {
      id: Date.now(),
      user: user.username,
      avatar: user.avatar,
      text: text.trim(),
      content: text.trim(),
      time: t('comment.justNow'),
      likes: 0,
    }, user?.id);
    setText('');
    toast.success(t('comment.success'));
  };

  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold text-white mb-3">
        {t('comment.title', { count: song.comments?.length || 0 })}
      </h3>

      {/* 评论输入 */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-sm shrink-0">
          {user ? user.avatar : '👤'}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? t('comment.placeholder') : t('comment.placeholderLogin')}
          className="flex-1 bg-surface-lighter text-white text-sm px-3 py-2 rounded-full outline-none border border-transparent focus:border-primary placeholder:text-text-muted"
        />
        <button
          type="submit"
          className="p-2 bg-primary rounded-full text-black hover:bg-primary-hover transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {song.comments?.map((comment) => (
          <div key={comment.id} className="flex gap-2.5 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-sm shrink-0">
              {comment.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{comment.user}</span>
                <span className="text-xs text-text-muted">{comment.time}</span>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">{comment.text}</p>
              <button
                onClick={() => likeComment(song.id, comment.id)}
                className="flex items-center gap-1 mt-1 text-text-muted hover:text-primary transition-colors"
              >
                <Heart size={12} />
                <span className="text-xs">{comment.likes}</span>
              </button>
            </div>
          </div>
        ))}
        {(!song.comments || song.comments.length === 0) && (
          <p className="text-sm text-text-muted text-center py-4">{t('comment.empty')}</p>
        )}
      </div>
    </div>
  );
}
