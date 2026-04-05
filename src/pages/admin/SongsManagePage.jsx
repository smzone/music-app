import { useState } from 'react';
import { Plus, Edit3, Trash2, Search, X, Upload, Music } from 'lucide-react';
import { songsData, formatDuration, getAverageRating } from '../../data/songs';
import toast from 'react-hot-toast';

// 歌曲编辑/新增弹窗
function SongModal({ song, onClose, onSave }) {
  const [form, setForm] = useState(song || {
    title: '', artist: '', album: '', genre: '电子', duration: 200,
    releaseDate: new Date().toISOString().split('T')[0], cover: '', plays: 0, ratings: [], comments: [],
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('请输入歌曲名'); return; }
    if (!form.artist.trim()) { toast.error('请输入艺术家'); return; }
    onSave({ ...form, id: form.id || Date.now() });
    toast.success(song ? '歌曲已更新' : '歌曲已添加');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-lighter">
          <h2 className="text-xl font-bold text-white">{song ? '编辑歌曲' : '添加新歌曲'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-text-secondary block mb-1">歌曲名称 *</label>
              <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted" placeholder="输入歌曲名" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1">艺术家 *</label>
              <input type="text" value={form.artist} onChange={(e) => handleChange('artist', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted" placeholder="艺术家名" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1">专辑</label>
              <input type="text" value={form.album} onChange={(e) => handleChange('album', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted" placeholder="专辑名" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1">类型</label>
              <select value={form.genre} onChange={(e) => handleChange('genre', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]">
                {['电子', '流行', '摇滚', '民谣', '嘻哈', '轻音乐', '爵士', '合成波'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1">时长（秒）</label>
              <input type="number" value={form.duration} onChange={(e) => handleChange('duration', Number(e.target.value))}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]" />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1">发行日期</label>
              <input type="date" value={form.releaseDate} onChange={(e) => handleChange('releaseDate', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px]" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-text-secondary block mb-1">封面图片 URL</label>
              <input type="url" value={form.cover} onChange={(e) => handleChange('cover', e.target.value)}
                className="w-full bg-surface-lighter text-white px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-primary text-[15px] placeholder:text-text-muted" placeholder="https://..." />
            </div>
            {/* 音频上传区 */}
            <div className="col-span-2">
              <label className="text-sm text-text-secondary block mb-1">音频文件</label>
              <div className="border-2 border-dashed border-surface-lighter rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload size={28} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-muted">点击上传音频文件 (.mp3, .wav, .flac)</p>
                <p className="text-xs text-text-muted mt-1">接入 Supabase 后支持真实上传</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-surface-lighter text-text-secondary rounded-full hover:text-white hover:border-white transition-colors">
              取消
            </button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">
              {song ? '保存修改' : '添加歌曲'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SongsManagePage() {
  const [searchQ, setSearchQ] = useState('');
  const [editSong, setEditSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // 使用本地状态模拟管理（接入 Supabase 后切换为真实 CRUD）
  const [localSongs, setLocalSongs] = useState([...songsData]);

  const filtered = localSongs.filter((s) =>
    s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleSave = (song) => {
    setLocalSongs((prev) => {
      const idx = prev.findIndex((s) => s.id === song.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = song; return next; }
      return [song, ...prev];
    });
  };

  const handleDelete = (id) => {
    if (!confirm('确定要删除这首歌曲吗？')) return;
    setLocalSongs((prev) => prev.filter((s) => s.id !== id));
    toast.success('歌曲已删除');
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">歌曲管理</h1>
          <p className="text-sm text-text-muted mt-1">共 {localSongs.length} 首歌曲</p>
        </div>
        <button onClick={() => { setEditSong(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]">
          <Plus size={17} /> 添加歌曲
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="搜索歌曲..."
          className="w-full bg-white/[0.04] text-white pl-11 pr-4 py-2.5 rounded-xl outline-none border border-white/[0.08] focus:border-primary focus:shadow-[0_0_0_3px_rgba(29,185,84,0.1)] text-[14px] placeholder:text-text-muted transition-all" />
      </div>

      {/* 歌曲列表 */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* 表头 */}
        <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_80px_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.04] text-xs text-text-muted font-semibold uppercase tracking-wider">
          <span className="w-12">#</span>
          <span>歌曲</span>
          <span>专辑</span>
          <span>类型</span>
          <span>时长</span>
          <span>评分</span>
          <span>操作</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-text-muted">
            <Music size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无歌曲数据</p>
          </div>
        )}

        {filtered.map((song, i) => (
          <div key={song.id} className="grid grid-cols-1 md:grid-cols-[auto_2fr_1fr_1fr_80px_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors items-center">
            <span className="hidden md:block text-sm text-text-muted w-12 font-mono">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-3">
              <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/[0.06]" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate">{song.title}</p>
                <p className="text-xs text-text-muted truncate">{song.artist}</p>
              </div>
            </div>
            <span className="hidden md:block text-sm text-text-muted truncate">{song.album}</span>
            <span className="hidden md:block text-xs text-text-muted bg-white/[0.04] px-2 py-0.5 rounded w-fit">{song.genre}</span>
            <span className="hidden md:block text-sm text-text-muted">{formatDuration(song.duration)}</span>
            <span className="hidden md:block text-sm text-yellow-400">★ {getAverageRating(song.ratings)}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditSong(song); setShowModal(true); }}
                className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-primary transition-colors">
                <Edit3 size={15} />
              </button>
              <button onClick={() => handleDelete(song.id)}
                className="p-2 rounded-lg hover:bg-red-500/[0.05] text-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 弹窗 */}
      {showModal && <SongModal song={editSong} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
