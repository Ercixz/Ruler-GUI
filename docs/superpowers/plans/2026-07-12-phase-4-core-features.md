# Phase 4: 核心功能 — 实施计划
**日期：** 2026-07-12
**状态：** 已完成

---

## 目标

集成 CodeMirror 6 编辑器、Agent 选择面板、TOML 可视化表单，实现三栏布局的全部功能。

## 依赖

Phase 1-3 构建通过。

## 实施步骤

### 4.1 CodeMirror 编辑器
**产出：** `src/renderer/components/editor/MarkdownEditor.tsx`
- CodeMirror 6 + `@codemirror/lang-markdown` 基础设置
- `@codemirror/view` 亮暗主题跟随
- Ctrl/Cmd+S 保存文件
- 未保存状态跟踪（文件旁小圆点）
- EditorContent 状态：loading → empty → content → error

### 4.2 Agent 选择面板
**产出：** `src/renderer/components/agents/AgentList.tsx`
- 按 categories 分组折叠面板
- 每个 agent：checkbox + name + output path hint
- 全选/取消全选 + 按分类选择
- 防抖 500ms 写回 ruler.toml

### 4.3 TOML 配置表单
**产出：** `src/renderer/components/config/TomlEditor.tsx`
- settings 区：default_agents 多选、backup/gitignore 开关
- 折叠高级区：mcp.enabled、mcp.merge_strategy、nested
- 读/写 ruler.toml，解析失败降级到 raw 文本

### 4.4 Editor 交互
**产出：** 更新 Sidebar + editor 面板
- 点击文件 → 读取内容 → 设置 CodeMirror 值
- Ctrl+S → 保存 → 清除未保存标记 → Toast
- 文件变化监听 → 询问是否重载

### 4.5 App.tsx 面板重构
**产出：** 更新右侧 Panel 为 Agent + Config 组合
- 上方：AgentList（可折叠）
- 下方：TomlEditor（可折叠）
- SplitView 或 tab 切换

### 4.6 Hooks 完善
**产出：** `src/renderer/hooks/useRulerFiles.ts` `useToml.ts` `useRulerCli.ts`
- useRulerFiles：文件列表 + 当前文件加载
- useToml：ruler.toml 读取/写入
- useRulerCli：apply/dryRun/revert 调用

### 4.7 验证
- [x] `npm run build` 无报错 — main 16KB + preload 4.8KB + renderer 1.3MB (CodeMirror + lang-data)
- [x] `npm run typecheck` 零错误
