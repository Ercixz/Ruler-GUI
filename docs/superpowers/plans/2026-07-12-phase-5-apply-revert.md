# Phase 5: Apply/Revert 工作流 — 实施计划
**日期：** 2026-07-12
**状态：** 已完成

---

## 目标

实现完整的 Apply/Revert 工作流 UI 和错误处理。

## 实施步骤

### 5.1 ApplyPanel
- [x] Dry-Run → DiffPreview → confirm → Apply 流程
- [x] 状态机：idle → dryrun → applying → done
- [x] 三个按钮：Dry Run / Apply / Revert

### 5.2 DiffPreview
- [x] 按 action 分类着色 (writing=green / skipping=gray / removing=yellow)
- [x] 显示 agent + filePath
- [x] Confirm / Cancel 按钮

### 5.3 LogPanel
- [x] 流式逐行输出
- [x] stdout / stderr 区分着色
- [x] 自动滚动到底部
- [x] 时间戳

### 5.4 错误处理
- [x] CLI 非零退出码 → Toast error + log 面板高亮
- [x] Ruler 二进制找不到 → 优雅降级 (spawn 失败捕获)
- [x] TOML 解析失败 → TomlReadResult 含 error 字段
- [x] 权限错误 → try/catch + Toast

### 5.5 验证
- [x] `npm run build` 通过
- [x] `npm run typecheck` 通过
