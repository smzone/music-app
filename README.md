# 🎵 音乐平台

在线音乐播放、分享与社交平台。React + Tailwind CSS + PWA，支持 Supabase 后端。

## 功能

- **音乐播放器**：播放/暂停/上一首/下一首/进度条/音量/随机/循环/全屏
- **用户系统**：登录/注册（模拟 + Supabase 真实认证）
- **歌曲浏览**：网格卡片、分类筛选、搜索
- **收藏**：收藏/取消收藏歌曲
- **评分**：5 星评分系统
- **评论**：发表评论、点赞评论
- **分享**：复制分享链接
- **歌曲详情**：完整歌曲信息弹窗
- **响应式**：桌面侧边栏 + 移动端底部导航 + 抽屉菜单
- **暗色主题**：Spotify 风格
- **PWA**：可安装到桌面/主屏幕

## 技术栈

- **前端**: React 18 + Vite 5
- **样式**: Tailwind CSS v4
- **状态管理**: Zustand
- **图标**: Lucide React
- **后端**: Supabase（可选）
- **组件文档**: Storybook
- **PWA**: vite-plugin-pwa

## 快速开始

```bash
# 安装依赖
npm install --registry https://registry.npmmirror.com

# 启动开发服务器
npm run dev

# 启动 Storybook
npm run storybook

# 构建生产版本
npm run build
```

## 接入 Supabase（可选）

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制 `.env.example` 为 `.env`，填入项目 URL 和 Key
3. 在 Supabase SQL Editor 中执行 `supabase-schema.sql`
4. 重启开发服务器

未配置 Supabase 时，应用使用本地模拟数据正常运行。

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── Auth/            # 登录/注册
│   ├── Comment/         # 评论
│   ├── Layout/          # 布局（侧边栏）
│   ├── Player/          # 音乐播放器
│   ├── Rating/          # 星级评分
│   └── Song/            # 歌曲卡片/详情
├── data/songs.js        # 模拟歌曲数据
├── lib/                 # Supabase 客户端与服务层
├── store/               # Zustand 状态管理
├── App.jsx              # 主页面
├── main.jsx             # 入口
└── index.css            # 全局样式 + Tailwind
```
