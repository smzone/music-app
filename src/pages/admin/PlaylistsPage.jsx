import { useState } from 'react';
import { Plus, Edit3, Trash2, Music, X } from 'lucide-react';
import { songsData } from '../../data/songs';
import toast from 'react-hot-toast';

const defaultPlaylists = [
  { id: 1, name: '精选推荐', description: '我最满意的作品合集', songIds: [1, 2, 5, 7], cover: songsData[0]?.cover },
  { id: 2, name: '深夜放松', description: '适合深夜聆听的轻柔旋律', songIds: [5, 7, 9], cover: songsData[4]?.cover },
  { id: 3, name: '电子节拍', description: '充满能量的电子音乐', songIds: [1, 3, 10], cover: songsData[2]?.cover },
];

function PlaylistModal({ playlist, onClose, onSave }) {
  const [form, setForm] = useState(playlist || { name: '', description: '', songIds: [], cover: '' });
  const [selectedSongs, setSelectedSongs] = useState(new Set(form.songIds || []));

  const toggleSong = (id) => {
    setSelectedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('请输入播放列表名称'); return; }
    const songIds = [...selectedSongs];
    const cover = songIds.length > 0 ? songsData.find((s) => s.id === songIds[0])?.cover : '';
    onSave({ ...form, id: form.id || Date.now(), songIds, cover });
    toast.success(playlist ? '播放列表已更新' : '播放列表已创建');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-lighter">
          <h2 className="text-xl font-bold text-white">{playlist ? '编辑播放列表' : '创建播放列表'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1">名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted" placeholder="播放列表名称" />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1">描述</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted resize-none" placeholder="简单描述..." />
          </div>
          {/* 选择歌曲 */}
          <div>
            <label className="text-sm text-text-secondary block mb-2">选择歌曲（已选 {selectedSongs.size} 首）</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {songsData.map((song) => (
                <label key={song.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-lighter cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedSongs.has(song.id)} onChange={() => toggleSong(song.id)}
                    className="w-4 h-4 rounded accent-primary" />
                  <img src={song.cover} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-xs text-text-muted">{song.artist}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-surface-lighter text-text-secondary rounded-full hover:text-white transition-colors">取消</button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">
              {playlist ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState(defaultPlaylists);
  const [editPL, setEditPL] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (pl) => {
    setPlaylists((prev) => {
      const idx = prev.findIndex((p) => p.id === pl.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = pl; return next; }
      return [pl, ...prev];
    });
  };

  const handleDelete = (id) => {
    if (!confirm('确定删除此播放列表？')) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    toast.success('播放列表已删除');
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">播放列表管理</h1>
        <button onClick={() => { setEditPL(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">
          <Plus size={18} /> 新建列表
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <Music size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">还没有播放列表</p>
          <p className="text-sm mt-1">点击上方按钮创建第一个播放列表</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((pl) => (
            <div key={pl.id} className="bg-surface-light rounded-2xl overflow-hidden border border-surface-lighter hover:border-primary/30 transition-all group">
              <div className="aspect-video bg-surface-lighter relative overflow-hidden">
                {pl.cover ? (
                  <img src={pl.cover} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Music size={40} className="text-text-muted" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-lg font-bold text-white">{pl.name}</p>
                  <p className="text-sm text-white/70">{pl.songIds.length} 首歌曲</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-text-secondary line-clamp-2">{pl.description || '暂无描述'}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-lighter/50">
                  <button onClick={() => { setEditPL(pl); setShowModal(true); }}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors">
                    <Edit3 size={14} /> 编辑
                  </button>
                  <span className="text-surface-lighter">|</span>
                  <button onClick={() => handleDelete(pl.id)}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-danger transition-colors">
                    <Trash2 size={14} /> 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <PlaylistModal playlist={editPL} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
