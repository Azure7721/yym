# YUMEI YI - Personal Portfolio

个人作品集网站，基于 Figma 设计稿开发。

## 技术栈

- **前端：** Vue 3 + TypeScript + CSS + Vite
- **后端：** Express + TypeScript + SQLite
- **PDF渲染：** pdf.js

## 快速开始

```bash
# 1. 安装所有依赖
npm run install:all

# 2. 同时启动前后端
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001
- 管理后台：http://localhost:5173/admin
- 管理员账号：admin / admin

## 功能说明

### 前台页面
- **首页 (Home)** - 带鼠标视差效果的全屏首页
- **关于我 (About Me)** - 三层可折叠信息面板
- **作品集 (Works)** - 作品网格展示
- **作品详情** - 支持 PDF 内容逐页展示

### 管理后台
- 作品的增删改查（支持封面图和 PDF 上传）
- 个人信息管理（基本信息、经历、技能）
- 个人照片上传

## 项目结构

```
├── client/          # 前端 Vue 项目
│   └── src/
│       ├── views/       # 页面组件
│       ├── components/  # 公共组件
│       ├── stores/      # Pinia 状态管理
│       ├── router/      # 路由配置
│       ├── styles/      # 全局样式
│       └── utils/       # 工具函数
├── server/          # 后端 Express 项目
│   └── src/
│       ├── routes/      # API 路由
│       ├── middleware/  # 中间件
│       └── database.ts  # 数据库初始化
└── package.json     # 根配置
```
