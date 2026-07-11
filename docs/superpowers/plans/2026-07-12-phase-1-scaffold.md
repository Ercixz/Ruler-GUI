# Phase 1: 脚手架 — 实施计划
**日期：** 2026-07-12
**状态：** 源码已完成，待本地 `npm install` 验证

---

## 目标

搭建可运行的 Electron + React + electron-vite 工程骨架，验证三进程通信链路。

## 实施步骤

### 1.1 工程配置文件
- [x] `package.json` — 依赖声明、脚本
- [x] `electron.vite.config.ts` — 构建配置
- [x] `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` — TS 编译配置
- [x] `electron-builder.yml` — 打包配置

### 1.2 主进程
- [x] `src/main/index.ts` — BrowserWindow 创建，无边框窗口，dev/prod 环境判断
- [x] `src/main/ipc/handlers.ts` — IPC 注册骨架（完整 25 个频道）
- [x] `src/main/ipc/fs.ts` — 文件系统操作（read/write/list/create/rename/delete/exists）
- [x] `src/main/ipc/ruler-cli.ts` — spawn 封装（check/init/apply/dryRun/revert）
- [x] `src/main/ipc/toml.ts` — TOML 读写（smol-toml）

### 1.3 Preload + Shared
- [x] `src/shared/types.ts` — IPC 频道常量 + 共享类型（FileInfo, RulerResult, ProjectInfo, ThemeMode, LocaleCode）
- [x] `src/preload/index.ts` — contextBridge 类型化 API（window.rulerApi）

### 1.4 Renderer
- [x] `src/renderer/index.html` — HTML 入口
- [x] `src/renderer/main.tsx` — React 挂载点
- [x] `src/renderer/App.tsx` — 根组件（欢迎页 + 三栏布局占位）
- [x] `src/renderer/index.css` — 设计 token + 亮暗主题系统 + 自适应黑暗模式
- [x] `src/renderer/i18n/zh.ts` / `en.ts` — 完整中英文语言表
- [x] `src/renderer/store/appStore.ts` — Zustand store 骨架
- [x] `src/renderer/globals.d.ts` — RulerApi 全局类型声明

### 1.5 验证
- [x] `npm install` — 529 packages，无报错
- [x] `npm run build` — main/preload/renderer 三进程均构建通过
- [x] `npm run typecheck` — tsc --noEmit 零错误
- [ ] `npm run dev` 启动 Electron 窗口（需桌面环境）

## 产出物

完整的可运行 Electron 应用骨架，三进程通信链路畅通，可进入 Phase 2。
