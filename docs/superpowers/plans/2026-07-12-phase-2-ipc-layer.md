# Phase 2: 主进程 IPC 层完善 — 实施计划
**日期：** 2026-07-12
**状态：** 已完成

---

## 目标

完善主进程 IPC 层，使 rules/ruler/toml 三模块具备生产可用能力。

## 依赖

Phase 1 构建通过。

## 实施步骤

### 2.1 Agent 常量列表
**产出：** `src/renderer/constants/agents.ts`
- 30 个主流 AI coding agent 的硬编码列表
- 每个 agent 含：id、name、默认输出文件路径、分类
- 用于 Agent 选择面板渲染

### 2.2 chokidar 文件监听集成
**产出：** `src/main/ipc/fs.ts` 增强
- `watchDir(dirPath)` 方法：监听 `.ruler/` 目录变更
- 通过 `mainWindow.webContents.send` 推送文件变化事件到渲染进程
- 渲染进程收到事件后更新 Zustand store，触发 UI 重绘
- 支持 add/change/unlink 事件类型
- `unwatchDir()` 清理方法

### 2.3 TOML Schema 增强
**产出：** `src/main/ipc/toml.ts` 增强
- 定义 `RulerTomlConfig` 类型（agents, settings, mcp, nested 等）
- `readTomlConfig()` — 读取并解析为强类型对象
- `writeTomlConfig()` — 合并写入（保留用户手动编辑的注释？不做）
- 解析失败时返回明确错误结构（含行号提示）
- 类型定义放入 `src/shared/types.ts` 共享

### 2.4 CLI 流式输出增强
**产出：** `src/main/ipc/ruler-cli.ts` 增强
- `runRulerStreaming()` — 流式执行，逐行将 stdout/stderr 通过 IPC event 推送到渲染进程
- 保留现有的 Promise 返回完整结果的方法（dryRun 用）
- 区分 Writing/Skipping/Removing 日志行用于 DiffPreview
- 解析 apply 输出为结构化数据 `RulerDiffEntry[]`

### 2.5 IPC Handlers 更新
**产出：** `src/main/ipc/handlers.ts` 更新
- 注册 `FILE_WATCH` / `FILE_UNWATCH` handler
- 注入 `BrowserWindow` 引用用于 webContents.send 事件推送
- 更新 Ruler CLI handlers 支持 streaming 模式参数

### 2.6 Shared Types 更新
**产出：** `src/shared/types.ts` 更新
- `RulerTomlConfig` 接口
- `RulerDiffEntry` 接口
- `FileWatchEvent` 接口
- `RulerTomlAgent` 类型

### 2.7 验证
- [x] `npm run build` 无报错
- [x] `npm run typecheck` 零错误
- [x] 文件结构完整

## 产出物

生产可用的主进程 IPC 层，包含完整文件监视、TOML 解析、CLI 流式执行能力。
