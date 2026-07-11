# Phase 3: 设计系统 + 基础布局 — 实施计划
**日期：** 2026-07-12
**状态：** 已完成

---

## 目标

构建完整设计系统与三栏布局组件，使应用具备可交互的 UI 骨架。

## 依赖

Phase 1-2 构建通过。

## 实施步骤

### 3.1 Common 通用组件
**产出：** `src/renderer/components/common/`
- `Button.tsx` — 变体：primary/secondary/danger/ghost，尺寸：sm/md/lg
- `Modal.tsx` — 弹窗容器，含遮罩、标题、内容、按钮行
- `Toast.tsx` — 非阻塞通知，支持 success/error/warning/info 类型
- `FileTree.tsx` — 虚拟文件树，支持文件夹展开/折叠、文件选中态
- `IconButton.tsx` — 纯图标按钮
- `index.ts` — 统一导出

### 3.2 Layout 布局组件
**产出：** `src/renderer/components/layout/`
- `TitleBar.tsx` — 无边框窗口拖拽区 + 窗口控制按钮 + 主题/locale 切换
- `Sidebar.tsx` — 左侧规则文件列表，含右键菜单、新建按钮
- `StatusBar.tsx` — 底部状态栏，显示文件路径、Agent 数量等

### 3.3 Hooks
**产出：** `src/renderer/hooks/`
- `useTheme.ts` — 主题切换逻辑，同步 electron-store
- `useI18n.ts` — 简化 t() 调用语法
- `useProject.ts` — 项目文件夹状态管理

### 3.4 Store 增强
**产出：** 更新 `src/renderer/store/appStore.ts`
- 添加 fileList、fileTree、toasts 状态
- 连接主题/locale 到 electron-store 持久化

### 3.5 App.tsx 重构
**产出：** 更新 `src/renderer/App.tsx`
- 欢迎页 + 主界面状态切换
- 三栏布局串联：TitleBar + Sidebar + Editor(placeholder) + Panel(placeholder) + StatusBar
- Toast 容器

### 3.6 验证
- [x] `npm run build` 无报错 — main 16KB + preload 4.8KB + renderer 249KB + CSS 14KB
- [x] `npm run typecheck` 零错误
