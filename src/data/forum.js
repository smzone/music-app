// 论坛分类体系
export const forumCategories = [
  { id: 'all', nameKey: 'forum.cat.all', descKey: 'forum.cat.allDesc', icon: '📋', count: 187, color: 'from-gray-500/20 to-gray-700/20' },
  { id: 'music', nameKey: 'forum.cat.music', descKey: 'forum.cat.musicDesc', icon: '🎵', count: 45, color: 'from-green-500/20 to-green-700/20' },
  { id: 'production', nameKey: 'forum.cat.production', descKey: 'forum.cat.productionDesc', icon: '🎛️', count: 32, color: 'from-blue-500/20 to-blue-700/20' },
  { id: 'gear', nameKey: 'forum.cat.gear', descKey: 'forum.cat.gearDesc', icon: '🎧', count: 28, color: 'from-orange-500/20 to-orange-700/20' },
  { id: 'video', nameKey: 'forum.cat.video', descKey: 'forum.cat.videoDesc', icon: '🎬', count: 23, color: 'from-red-500/20 to-red-700/20' },
  { id: 'collab', nameKey: 'forum.cat.collab', descKey: 'forum.cat.collabDesc', icon: '🤝', count: 15, color: 'from-purple-500/20 to-purple-700/20' },
  { id: 'showcase', nameKey: 'forum.cat.showcase', descKey: 'forum.cat.showcaseDesc', icon: '🌟', count: 19, color: 'from-yellow-500/20 to-yellow-700/20' },
  { id: 'offtopic', nameKey: 'forum.cat.offtopic', descKey: 'forum.cat.offtopicDesc', icon: '💬', count: 67, color: 'from-pink-500/20 to-pink-700/20' },
];

// 帖子标签
export const postTags = [
  { id: 'help', nameKey: 'forum.tag.help', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'share', nameKey: 'forum.tag.share', color: 'bg-green-500/20 text-green-400' },
  { id: 'discuss', nameKey: 'forum.tag.discuss', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'tutorial', nameKey: 'forum.tag.tutorial', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'review', nameKey: 'forum.tag.review', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'resource', nameKey: 'forum.tag.resource', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'news', nameKey: 'forum.tag.news', color: 'bg-red-500/20 text-red-400' },
];

// 模拟论坛帖子数据 — 带富媒体
export const initialPosts = [
  {
    id: 1,
    title: '【置顶】论坛规则与新人指南 — 发帖前必读',
    content: '欢迎来到社区论坛！这里是音乐创作者的家园。\n\n## 论坛规则\n1. 尊重每一位成员，禁止人身攻击\n2. 禁止发布广告、垃圾信息\n3. 原创内容请注明"原创"，转载请标明出处\n4. 技术讨论请尽量详细描述问题\n\n## 新人须知\n- 完善个人资料可获得"新人"徽章\n- 发帖获得点赞可提升等级\n- VIP会员享有专属板块权限',
    author: '管理员', authorId: 'admin', avatar: '👑', level: 'admin',
    category: 'all', tags: ['news'],
    isPinned: true, isHot: false, isEssence: true,
    likes: 256, views: 8900, comments: 12, shares: 45, bookmarks: 189,
    date: '2025-01-01T10:00:00',
    media: [],
    replies: [
      { id: 101, author: '小明', authorId: 'u1', avatar: '😊', level: 'lv3', content: '收到，感谢管理员！规则很清晰。', date: '2025-01-02T08:30:00', likes: 15, replies: [] },
      { id: 102, author: '音乐新手', authorId: 'u2', avatar: '🎵', level: 'lv1', content: '新人报到，请多关照！', date: '2025-01-03T14:20:00', likes: 8, replies: [
        { id: 1021, author: '管理员', authorId: 'admin', avatar: '👑', level: 'admin', content: '欢迎加入大家庭！有问题随时提问哦 😊', date: '2025-01-03T15:00:00', likes: 12 }
      ]},
    ],
  },
  {
    id: 2,
    title: '分享一下我最近做的 Synthwave 电子音乐，求大佬点评！',
    content: '最近花了两个月做了一首 Synthwave 风格的曲子，用的是 Serum 合成器加上一些 Splice 的采样。\n\n整体想营造一种80年代复古科幻的感觉，加了很多 Reverb 和 Delay 效果。低频用的是 Sub Bass + Reese Bass 双层叠加。\n\n想请大家听听给点建议，特别是混音方面，总感觉高频有点刺耳。附上制作截图和音频片段：',
    author: '电子达人', authorId: 'u3', avatar: '🎹', level: 'lv5',
    category: 'music', tags: ['share', 'discuss'],
    isPinned: false, isHot: true, isEssence: true,
    likes: 189, views: 3200, comments: 34, shares: 28, bookmarks: 67,
    date: '2025-03-20T15:30:00',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=500&fit=crop', caption: 'DAW工程截图' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop', caption: '合成器界面' },
    ],
    replies: [
      { id: 201, author: '混音师老王', authorId: 'u4', avatar: '🎧', level: 'lv8', content: '听了一下，整体氛围很棒！几点建议：\n\n1. **低频**可以再收一点，Side Chain 加深一些，让 Kick 更突出\n2. **高频**确实有点亮，试试在 8kHz 以上做个 -2dB 的 Shelf EQ\n3. Reverb 的 Pre-delay 可以稍微拉长，避免人声被糊住\n\n总体来说完成度很高，继续加油！', date: '2025-03-20T16:45:00', likes: 42, replies: [
        { id: 2011, author: '电子达人', authorId: 'u3', avatar: '🎹', level: 'lv5', content: '太感谢了！我马上去试试调整 EQ 和 Side Chain。Pre-delay 这个确实没注意到，学到了！', date: '2025-03-20T17:00:00', likes: 8 },
      ]},
      { id: 202, author: '合成波爱好者', authorId: 'u5', avatar: '🌊', level: 'lv4', content: '这个 Pad 音色好好听，能分享一下 Serum 的预设吗？', date: '2025-03-20T18:00:00', likes: 15, replies: [] },
    ],
  },
  {
    id: 3,
    title: '2025年最值得入手的MIDI键盘推荐（万字长文）',
    content: '最近花了两周时间对比了市面上主流的MIDI键盘，从入门到专业级都有涵盖。按预算分为三个档次来推荐：\n\n## 入门级（500-1500元）\n- **Arturia MiniLab 3** — 小巧便携，功能丰富\n- **Novation Launchkey Mini** — 与 Ableton 深度集成\n\n## 中端（1500-3000元）\n- **Arturia KeyLab Essential** — 性价比之王\n- **Native Instruments M32** — 半配重手感好\n\n## 专业级（3000元以上）\n- **Arturia KeyLab 88 MkII** — 全配重88键\n- **Native Instruments S61** — 屏幕反馈强大\n\n详细对比和购买建议见正文...',
    author: '键盘侠', authorId: 'u6', avatar: '⌨️', level: 'lv6',
    category: 'gear', tags: ['review', 'share'],
    isPinned: false, isHot: true, isEssence: true,
    likes: 267, views: 5800, comments: 48, shares: 156, bookmarks: 234,
    date: '2025-03-19T10:00:00',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop', caption: '设备对比' },
      { type: 'video', url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=500&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=500&fit=crop', caption: '上手体验视频', duration: '15:30' },
    ],
    replies: [
      { id: 301, author: '预算有限', authorId: 'u7', avatar: '💰', level: 'lv2', content: '入门级的话 MiniLab 3 确实不错，我去年买的，用到现在没什么问题。', date: '2025-03-19T12:00:00', likes: 18, replies: [] },
    ],
  },
  {
    id: 4,
    title: '如何让人声和伴奏融合得更好？混音干货教程',
    content: '每次混音的时候总觉得人声和伴奏像是两个分开的层，怎么才能让它们融合得更自然？\n\n经过半年的学习和实践，我总结了以下几个技巧：\n\n1. **频率让位** — 在伴奏的 2-4kHz 区域挖一个小凹槽，给人声腾出空间\n2. **共享混响** — 让人声和乐器共用同一个混响 Bus\n3. **Sidechain压缩** — 用人声信号触发伴奏的压缩器\n4. **平行处理** — 把人声复制一轨加重度压缩，混入少量\n5. **自动化** — 手动调节每个乐段的音量平衡\n\n附上前后对比的音频截图：',
    author: '混音达人', authorId: 'u8', avatar: '🎚️', level: 'lv7',
    category: 'production', tags: ['tutorial', 'share'],
    isPinned: false, isHot: false, isEssence: true,
    likes: 145, views: 2100, comments: 29, shares: 89, bookmarks: 178,
    date: '2025-03-18T09:00:00',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=400&fit=crop', caption: '混音前后EQ对比' },
    ],
    replies: [
      { id: 401, author: '新手小白', authorId: 'u9', avatar: '🐣', level: 'lv1', content: '太实用了！第一点和第三点我之前完全没想到，马上去试试。', date: '2025-03-18T10:30:00', likes: 22, replies: [] },
    ],
  },
  {
    id: 5,
    title: '有没有人想一起做一张电子/合成波风格的合辑？',
    content: '想找5-6个独立音乐人一起做一张电子/合成波风格的合辑，每人出1-2首歌。\n\n**要求：**\n- 风格：Synthwave / Retrowave / Chillwave\n- 质量：至少 demo 级别以上\n- 时间：3个月内完成\n\n**我能提供：**\n- 混音和母带处理\n- 封面设计\n- 发行到各大平台\n\n有兴趣的朋友可以在下面留言或者私信我，附上自己的作品链接！',
    author: '合作狂人', authorId: 'u10', avatar: '🤝', level: 'lv4',
    category: 'collab', tags: ['discuss'],
    isPinned: false, isHot: false, isEssence: false,
    likes: 78, views: 1450, comments: 25, shares: 34, bookmarks: 56,
    date: '2025-03-17T14:00:00',
    media: [],
    replies: [],
  },
  {
    id: 6,
    title: '我用手机拍了一支MV，效果出乎意料！（附教程）',
    content: '一直以为拍MV需要专业设备，但这次尝试只用 iPhone 15 Pro + 达芬奇调色，效果让我非常惊喜！\n\n**拍摄设备：**\n- iPhone 15 Pro (4K ProRes)\n- DJI OM 6 稳定器\n- Godox VL150 灯光\n\n**后期软件：**\n- DaVinci Resolve (免费版就够了)\n- Motion 效果用的 After Effects\n\n教程已经剪好了，分享给大家！',
    author: '视频狂魔', authorId: 'u11', avatar: '📹', level: 'lv5',
    category: 'video', tags: ['tutorial', 'share'],
    isPinned: false, isHot: true, isEssence: false,
    likes: 234, views: 4500, comments: 56, shares: 123, bookmarks: 198,
    date: '2025-03-16T20:00:00',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=500&fit=crop', caption: '拍摄现场' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop', caption: '调色前后对比' },
      { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop', caption: '成品MV预览', duration: '3:45' },
    ],
    replies: [
      { id: 601, author: '手机导演', authorId: 'u12', avatar: '🎬', level: 'lv3', content: '太强了！请问稳定器的设置参数方便分享吗？', date: '2025-03-16T21:00:00', likes: 15, replies: [] },
    ],
  },
  {
    id: 7,
    title: '原创歌曲《星河漫步》完成了！第一次尝试太空氛围音乐',
    content: '从构思到完成花了一个半月，这是我的第三首原创。\n\n灵感来源是某天深夜抬头看星空的瞬间，想象自己漂浮在宇宙中的感觉。\n\n用了大量的 Pad 和环境音效，加上一些 Granular 合成器来营造太空感。人声做了很多效果处理，让它听起来像是从很远的地方传来的。\n\n希望大家喜欢，有什么建议请不吝赐教！',
    author: '星空旅人', authorId: 'u13', avatar: '🌌', level: 'lv3',
    category: 'showcase', tags: ['share'],
    isPinned: false, isHot: false, isEssence: false,
    likes: 98, views: 1800, comments: 18, shares: 23, bookmarks: 45,
    date: '2025-03-15T22:00:00',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop', caption: '专辑封面' },
    ],
    replies: [],
  },
  {
    id: 8,
    title: '今天心情不错，聊聊大家是怎么入坑音乐制作的？',
    content: '刚写完一首新歌的Demo，感觉灵感爆棚，分享一下好心情～\n\n我是高中时听了 Daft Punk 的 Random Access Memories 入坑电子音乐的，然后自学了 FL Studio，一路摸索到现在。\n\n大家呢？是什么契机开始做音乐的？欢迎分享你的故事！',
    author: '快乐音符', authorId: 'u14', avatar: '😄', level: 'lv4',
    category: 'offtopic', tags: ['discuss'],
    isPinned: false, isHot: false, isEssence: false,
    likes: 63, views: 920, comments: 38, shares: 5, bookmarks: 12,
    date: '2025-03-14T18:00:00',
    media: [],
    replies: [
      { id: 801, author: '摇滚少年', authorId: 'u15', avatar: '🎸', level: 'lv3', content: '初中时在音像店听到 Nirvana 的 Smells Like Teen Spirit，人生从此改变了哈哈哈', date: '2025-03-14T19:00:00', likes: 28, replies: [] },
      { id: 802, author: '古典跨界', authorId: 'u16', avatar: '🎻', level: 'lv5', content: '从小学小提琴，大学接触了电子音乐后开始尝试 Neoclassical 风格，把古典和电子融合在一起。', date: '2025-03-14T20:30:00', likes: 35, replies: [] },
    ],
  },
];

// 排序选项
export const sortOptions = [
  { id: 'latest', nameKey: 'forum.sort.latest' },
  { id: 'hot', nameKey: 'forum.sort.hot' },
  { id: 'views', nameKey: 'forum.sort.views' },
  { id: 'comments', nameKey: 'forum.sort.comments' },
];

// 格式化时间
export function formatTime(dateStr, t) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (t) {
    if (diff < 60) return t('forum.time.justNow');
    if (diff < 3600) return t('forum.time.minutesAgo', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('forum.time.hoursAgo', { count: Math.floor(diff / 3600) });
    if (diff < 604800) return t('forum.time.daysAgo', { count: Math.floor(diff / 86400) });
  } else {
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  }
  return date.toLocaleDateString();
}

// 格式化数字
export function formatNum(n, t) {
  if (t) {
    if (n >= 10000) return t('forum.num.wan', { count: (n / 10000).toFixed(1) });
    if (n >= 1000) return t('forum.num.k', { count: (n / 1000).toFixed(1) });
  } else {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  }
  return String(n);
}

// 获取等级样式
export function getLevelStyle(level) {
  const styles = {
    admin: { textKey: 'forum.level.admin', text: '管理员', color: 'bg-red-500/20 text-red-400' },
    lv1: { text: 'Lv.1', color: 'bg-gray-500/20 text-gray-400' },
    lv2: { text: 'Lv.2', color: 'bg-gray-500/20 text-gray-300' },
    lv3: { text: 'Lv.3', color: 'bg-blue-500/20 text-blue-400' },
    lv4: { text: 'Lv.4', color: 'bg-blue-500/20 text-blue-300' },
    lv5: { text: 'Lv.5', color: 'bg-purple-500/20 text-purple-400' },
    lv6: { text: 'Lv.6', color: 'bg-purple-500/20 text-purple-300' },
    lv7: { text: 'Lv.7', color: 'bg-yellow-500/20 text-yellow-400' },
    lv8: { text: 'Lv.8', color: 'bg-yellow-500/20 text-yellow-300' },
  };
  return styles[level] || styles.lv1;
}
