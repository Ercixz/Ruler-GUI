# Phase 10: CLI 组件管理 — 实施计划
**日期：** 2026-07-12
**状态：** 实施中

---

## 目标

让 AI 能通过 CLI 管理组件池（创建、列出、分配组件到项目），同时 GUI 同步显示。

## 数据流

```
CLI (rulesync components)
  │ write
  ▼
~/.rulesync/components.json
  │ read
  ▼
electron-store → IPC → Zustand Store → UI
```

## 实施

1. 组件持久化到 electron-store（`components` key）
2. IPC 频道的 component CRUD
3. CLI 脚本 `bin/rulesync.cmd` 调用 IPC 或直接读写文件
4. 组件变更自动同步到 GUI
