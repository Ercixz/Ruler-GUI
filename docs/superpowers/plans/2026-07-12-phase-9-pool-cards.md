# Phase 9: 组件池 + 项目卡片 — 全新架构
**日期：** 2026-07-12
**状态：** 实施中

---

## 架构变更

### 旧
```
Sidebar(项目列表) | Editor(单文件) | Panel(Agent+Config+Apply)
```

### 新
```
ComponentPool(左侧卡片瀑布流) | Projects(右侧多项目卡片横向排列)
每个项目卡片内含: Assigned Components + Agent Config + Preview + Apply
```

## 数据模型

```
组件 (Component): { id, title, content }
项目 (Project):   { path, assignedComponentIds: string[], agents: string[] }
```

组件池 = 全局共享
项目 = 每个文件夹独立的组件组合 + Agent 配置

## 交互
- 左侧组件池: 卡片瀑布流, 点击编辑, 拖拽到右侧项目
- 右侧项目卡片: 每个项目一张卡片, 含已分配组件列表、Agent 配置、预览、Apply
- 拖拽: HTML5 Drag & Drop
- 项目卡片内可拖拽调整组件顺序
