// 模拟歌曲数据（使用 Unsplash 音乐相关图片）
export const songsData = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Luna Sky',
    album: 'Ethereal Nights',
    genre: 'electronic',
    duration: 245,
    releaseDate: '2024-01-15',
    plays: 45230,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    ratings: [4, 5, 4, 5, 3, 4, 5, 4, 4, 5],
    comments: [
      { id: 1, user: '音乐爱好者', avatar: '🎵', text: '这首歌太棒了！深夜听真的很有氛围感。', time: '1小时前', likes: 24 },
      { id: 2, user: '夜猫子', avatar: '🌙', text: 'Luna Sky的作品从来不会让人失望！', time: '2小时前', likes: 18 },
    ],
  },
  {
    id: 2,
    title: 'Summer Vibes',
    artist: 'The Groove Collective',
    album: 'Sunshine Days',
    genre: 'pop',
    duration: 218,
    releaseDate: '2024-03-20',
    plays: 89120,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ratings: [5, 4, 5, 4, 5, 5, 4, 5],
    comments: [
      { id: 1, user: '阳光少年', avatar: '☀️', text: '夏天必听！节奏感超强。', time: '30分钟前', likes: 42 },
    ],
  },
  {
    id: 3,
    title: 'Neon Lights',
    artist: 'Cyber Wave',
    album: 'Digital Horizon',
    genre: 'synthwave',
    duration: 312,
    releaseDate: '2024-02-10',
    plays: 67850,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    ratings: [5, 5, 4, 5, 5, 4, 5],
    comments: [
      { id: 1, user: '赛博朋克迷', avatar: '🤖', text: '浓浓的赛博朋克风！', time: '3小时前', likes: 31 },
      { id: 2, user: '电子乐迷', avatar: '🎧', text: '合成器的音色太好听了。', time: '5小时前', likes: 15 },
    ],
  },
  {
    id: 4,
    title: '霓虹灯',
    artist: '暮色乐队',
    album: '城市夜景',
    genre: 'rock',
    duration: 278,
    releaseDate: '2024-04-05',
    plays: 34560,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ratings: [4, 4, 5, 3, 4, 4, 5],
    comments: [
      { id: 1, user: '摇滚青年', avatar: '🎸', text: '吉他solo太燃了！', time: '1天前', likes: 56 },
    ],
  },
  {
    id: 5,
    title: 'Acoustic Soul',
    artist: 'James Morrison',
    album: 'Unplugged',
    genre: 'folk',
    duration: 196,
    releaseDate: '2024-05-12',
    plays: 52340,
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    ratings: [5, 5, 5, 4, 5, 5, 4, 5, 5],
    comments: [
      { id: 1, user: '民谣控', avatar: '🎶', text: '安静的午后，一杯咖啡，一首好歌。', time: '2天前', likes: 38 },
      { id: 2, user: '吉他手', avatar: '🎸', text: '指弹编配太棒了，学习中！', time: '3天前', likes: 22 },
    ],
  },
  {
    id: 6,
    title: 'Urban Jungle',
    artist: 'Street Poets',
    album: 'City Life',
    genre: 'hiphop',
    duration: 231,
    releaseDate: '2024-06-01',
    plays: 78900,
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    ratings: [4, 5, 4, 4, 5, 3, 4],
    comments: [
      { id: 1, user: 'Hip-Hop Fan', avatar: '🎤', text: 'Beat超好听，歌词也很有深度。', time: '6小时前', likes: 45 },
    ],
  },
  {
    id: 7,
    title: 'Ocean Waves',
    artist: 'Meditation Masters',
    album: 'Inner Peace',
    genre: 'ambient',
    duration: 420,
    releaseDate: '2024-07-20',
    plays: 123400,
    cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    ratings: [5, 5, 5, 5, 4, 5, 5, 5],
    comments: [
      { id: 1, user: '冥想者', avatar: '🧘', text: '睡前必听，太治愈了。', time: '1天前', likes: 67 },
    ],
  },
  {
    id: 8,
    title: 'Rock Anthem',
    artist: 'Thunder Strike',
    album: 'Power Up',
    genre: 'rock',
    duration: 289,
    releaseDate: '2024-08-15',
    plays: 56780,
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
    ratings: [5, 4, 5, 5, 4, 5, 4],
    comments: [
      { id: 1, user: '重金属粉', avatar: '🤘', text: '现场一定更炸！', time: '12小时前', likes: 33 },
      { id: 2, user: '鼓手', avatar: '🥁', text: '鼓点太有力量了！', time: '1天前', likes: 19 },
    ],
  },
  {
    id: 9,
    title: 'Jazz Café',
    artist: 'Smooth Trio',
    album: 'Late Night Jazz',
    genre: 'jazz',
    duration: 356,
    releaseDate: '2024-09-01',
    plays: 41230,
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',
    ratings: [5, 5, 4, 5, 5, 5, 4, 5],
    comments: [
      { id: 1, user: '爵士迷', avatar: '🎷', text: '萨克斯的音色太迷人了！', time: '4小时前', likes: 28 },
    ],
  },
  {
    id: 10,
    title: '星空下',
    artist: '梦境乐团',
    album: '银河漫游',
    genre: 'electronic',
    duration: 267,
    releaseDate: '2024-10-10',
    plays: 98760,
    cover: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop',
    ratings: [5, 5, 5, 4, 5, 5, 5, 5, 4],
    comments: [
      { id: 1, user: '星空观察者', avatar: '⭐', text: '仰望星空时听，感觉整个宇宙都在耳边。', time: '2小时前', likes: 51 },
      { id: 2, user: '太空迷', avatar: '🚀', text: '氛围感拉满！', time: '8小时前', likes: 37 },
    ],
  },
];

// 获取歌曲平均评分
export const getAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
};

// 格式化时间（秒 → 分:秒）
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 格式化播放次数——支持 i18n时传入 wan 参数
export const formatPlays = (num, wanLabel = '万') => {
  if (num >= 10000) return (num / 10000).toFixed(1) + wanLabel;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// 所有分类（英文 key，显示名称通过 i18n 翻译）
export const genreKeys = ['all', 'electronic', 'pop', 'rock', 'folk', 'hiphop', 'ambient', 'jazz', 'synthwave'];
// 兼容旧引用
export const genres = genreKeys;
