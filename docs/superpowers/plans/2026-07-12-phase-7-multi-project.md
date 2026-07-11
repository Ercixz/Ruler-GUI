# Phase 7: 多项目管理 — 实施计划
**日期：** 2026-07-12
**状态：** 已完成

---

## 目标

将单项目架构重构为全局多项目管理器。

## 当前 vs 目标

| 维度 | 当前 | 目标 |
|------|------|------|
| 项目模型 | `projectPath: string \| null` | `projects: string[]` + `activeProject: string` |
| 欢迎页 | 打开文件夹 | 项目列表 + 添加项目 |
| 侧边栏 | 只显示当前项目文件 | 上方项目列表 + 下方文件树 |
| 切换项目 | 关闭重开 | 点击项目即可切换 |

## 实施步骤

### 7.1 Store 重构
- `projects: string[]` — 所有已添加项目路径
- `activeProject: string | null` — 当前激活项目
- 所有原来查 `projectPath` 的地方改为 `activeProject`
- `addProject(path)`, `removeProject(path)`, `setActiveProject(path)`

### 7.2 欢迎页 → 项目管理页
- 显示所有已添加项目（名称、路径）
- "添加项目"按钮
- 每个项目有 "打开" / "移除" 按钮
- 点击项目 → 进入主界面

### 7.3 侧边栏改造
- 顶部：项目列表（activeProject 高亮，可切换）
- 下方：当前项目的文件树
- 点击项目名 → 切换到该项目

### 7.4 TitleBar 改造
- 左侧显示当前项目名称
- 下拉切换项目

### 7.5 数据持久化
- electron-store 存 `projects` 数组
- 启动时恢复上次激活的项目

### 7.6 验证
- [x] build + typecheck 通过 — main 18KB + CSS 23KB + renderer 1.3MB
