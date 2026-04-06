# 🎵 音乐平台

在线音乐播放、分享与社交平台。React + Tailwind CSS + PWA，支持 Supabase 后端。

## 功能

- **音乐播放器**：播放/暂停/上一首/下一首/进度条/音量/随机/循环/全屏
- **用户系统**：登录/注册（模拟 + Supabase 真实认证）
- **RBAC 权限系统**：admin / moderator / vip / user / guest 五级角色 + 细粒度权限控制
- **歌曲浏览**：网格卡片、分类筛选、搜索
- **收藏 & 评分**：收藏/取消、5 星评分
- **评论**：发表评论、点赞评论、Realtime 实时推送
- **论坛**：帖子发布/回复/点赞/置顶/精华、分类筛选、权限门控
- **任务大厅**：发布任务/投标，权限检查
- **管理后台**：仪表盘 / 歌曲管理 / 论坛管理 / 用户管理 / 设置（角色分级菜单可见性）
- **通知系统**：Realtime 推送 + 未读计数
- **响应式**：桌面侧边栏 + 移动端底部导航 + 抽屉菜单
- **暗色主题**：Spotify 风格
- **PWA**：可安装到桌面/主屏幕
- **i18n**：中 / 英 / 日 / 韩 四语言

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
2. 复制 `.env.example` 为 `.env`，填入项目 URL 和 anon Key
3. 在 Supabase **SQL Editor** 中执行 `supabase/schema.sql`（含 14 张表 + RLS + Triggers + Realtime）
4. 重启开发服务器 `npm run dev`

> 未配置 Supabase 时，应用自动使用本地模拟数据正常运行，无需任何后端。

### 数据库表结构概览

| 表 | 说明 |
|---|---|
| profiles | 用户资料（角色/状态/头像） |
| songs | 歌曲（播放数/评分） |
| favorites | 收藏 |
| ratings | 评分（触发器自动更新均分） |
| comments | 歌曲评论（Realtime） |
| playlists / playlist_songs | 播放列表 |
| forum_posts | 论坛帖子 |
| forum_replies | 论坛回复（Realtime） |
| forum_likes | 帖子/回复点赞 |
| follows | 用户关注 |
| notifications | 通知（Realtime） |
| tasks / task_applications | 任务大厅 |

### 测试账号（本地模拟模式）

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | admin123 | 管理员 |
| mod | mod123 | 版主 |
| vip | vip123 | VIP 会员 |
| 任意 | 任意(≥6位) | 普通用户 |

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── Auth/            # 登录/注册/PermissionGate
│   ├── Comment/         # 评论
│   ├── Layout/          # 布局（MainLayout/侧边栏）
│   ├── Player/          # 音乐播放器
│   ├── Rating/          # 星级评分
│   └── Song/            # 歌曲卡片/详情
├── data/                # 本地模拟数据
├── i18n/locales/        # 国际化翻译 (zh/en/ja/ko)
├── lib/
│   ├── supabase.js      # Supabase 客户端初始化
│   └── supabaseService.js # 完整数据服务层 (认证/歌曲/论坛/通知/任务/Realtime)
├── store/
│   ├── useAuthStore.js  # 认证 + RBAC 权限
│   ├── useSongStore.js  # 歌曲/收藏/评分/评论
│   ├── useForumStore.js # 论坛帖子/回复/点赞
│   └── usePlayerStore.js # 播放器状态
├── pages/               # 页面组件
│   ├── admin/           # 管理后台
│   └── ...              # 首页/论坛/任务/商城等
├── App.jsx              # 路由 + 守卫 (AuthGuard/RoleGuard)
├── main.jsx             # 入口
└── index.css            # 全局样式 + Tailwind
supabase/
└── schema.sql           # 完整数据库建表脚本
```
