# RuleSync — 设计文档
**日期：** 2026-07-12  
**状态：** 已批准，进入实施

---

## 1. 项目背景与目标

[Ruler](https://github.com/intellectronica/ruler) 是一个 Node.js CLI 工具，把 `.ruler/` 目录下的 Markdown 规则文件批量分发到 30+ 种 AI coding agent（Claude Code、Cursor、Gemini CLI 等）各自的原生格式。

**RuleSync** 是它的图形化前端，目标：
- 无需终端知识即可管理规则文件和 agent 配置
- 内置 `@intellectronica/ruler` npm 包，用户**零安装依赖**
- 支持 Windows 和 macOS

---

## 2. 范围边界（明确不做的事）

- ❌ 不重新实现规则分发逻辑（全部委托给捆绑的 Ruler CLI）
- ❌ 不涉及 Skills（`.ruler/skills/`）管理
- ❌ 不涉及 Subagents（`.ruler/agents/`）管理
- ❌ 不暴露 MCP servers 的可视化编辑（折叠在高级区，仅 enabled/merge_strategy 开关）
- ❌ 不提供 CLI 终端界面

---

## 3. 技术选型

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | **Electron 31+** | 跨平台，成熟生态 |
| 构建 | **electron-vite** | 官方推荐，HMR 开箱即用 |
| UI | **React 18 + TypeScript** | 类型安全，生态丰富 |
| 样式 | **Vanilla CSS（CSS 变量）** | 零运行时，亮暗主题最直接 |
| 编辑器 | **CodeMirror 6** | 轻量，Markdown 高亮完善 |
| TOML | **smol-toml** | 轻量，无原生依赖 |
| 状态 | **Zustand** | 轻量全局状态 |
| 持久化 | **electron-store** | 存最近项目、窗口状态、语言偏好 |
| 文件监听 | **chokidar** | 跨平台文件变化监听 |
| 打包 | **electron-builder** | Windows NSIS + macOS DMG |
| Ruler | **@intellectronica/ruler（捆绑）** | 用户零额外安装 |

---

## 4. 架构设计

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  React + Zustand + CodeMirror 6                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ Sidebar  │  │  Editor   │  │  Config Panel    │  │
│  │ FileTree │  │ CodeMirror│  │  AgentList+TOML  │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │          Apply / Revert Panel + Log            │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ contextBridge (typed API)
┌─────────────────────▼───────────────────────────────┐
│                  Preload Script                       │
│  window.rulerApi = { openFolder, readFiles, ... }    │
└─────────────────────┬───────────────────────────────┘
                      │ ipcMain.handle
┌─────────────────────▼───────────────────────────────┐
│                   Main Process                        │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  fs.ts     │  │ ruler-cli.ts │  │  toml.ts    │  │
│  │ 文件读写   │  │ spawn 封装   │  │ smol-toml   │  │
│  │ chokidar   │  │ @int/ruler   │  │             │  │
│  └────────────┘  └──────────────┘  └─────────────┘  │
│  ┌────────────┐                                       │
│  │  store.ts  │  electron-store（持久化）             │
│  └────────────┘                                       │
└─────────────────────────────────────────────────────┘
```

**关键设计决策：**
- Ruler CLI 路径动态解析：`path.join(app.getAppPath(), 'node_modules/.bin/ruler')`
- 所有 CLI 调用使用 `child_process.spawn` + 参数数组（禁止字符串拼接）
- 文件覆盖前显示确认 Modal

---

## 5. 目录结构

```
rulesync/
├── docs/superpowers/
│   ├── specs/       # 设计文档
│   └── plans/       # 实施计划
├── src/
│   ├── main/
│   │   ├── index.ts              # BrowserWindow，无边框配置
│   │   └── ipc/
│   │       ├── handlers.ts       # ipcMain.handle 注册入口
│   │       ├── fs.ts             # 文件系统操作 + chokidar
│   │       ├── ruler-cli.ts      # spawn 封装（init/apply/revert）
│   │       └── toml.ts           # ruler.toml 读写
│   ├── preload/
│   │   └── index.ts              # contextBridge 类型化 API
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css             # 设计 token + 亮暗主题
│   │   ├── i18n/
│   │   │   ├── zh.ts
│   │   │   └── en.ts
│   │   ├── components/
│   │   │   ├── layout/           # TitleBar、Sidebar、StatusBar
│   │   │   ├── editor/           # MarkdownEditor、FileActions
│   │   │   ├── agents/           # AgentList、AgentCard
│   │   │   ├── config/           # TomlEditor（可视化表单）
│   │   │   ├── apply/            # ApplyPanel、DiffPreview、LogPanel
│   │   │   └── common/           # Button、Modal、Toast、FileTree
│   │   ├── hooks/
│   │   │   ├── useProject.ts
│   │   │   ├── useRulerFiles.ts
│   │   │   ├── useToml.ts
│   │   │   └── useRulerCli.ts
│   │   ├── store/
│   │   │   └── appStore.ts       # Zustand store
│   │   └── constants/
│   │       └── agents.ts         # 30 个 agent 硬编码列表
│   └── shared/
│       └── types.ts              # IPC 频道常量 + 共享 TS 类型
├── electron.vite.config.ts
├── electron-builder.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. 核心功能设计

### 6.1 项目管理
- 启动显示欢迎界面：最近项目列表 + "打开文件夹"按钮
- 检测 `.ruler/`：存在 → 进入主界面；不存在 → 显示"初始化"横幅，调用 `ruler init`

### 6.2 规则文件编辑器
- 左侧树展示 `.ruler/**/*.md`，含子目录
- 文件顺序提示（hover 说明：root AGENTS.md > .ruler/AGENTS.md > 其余字母序）
- CodeMirror 6 Markdown 编辑 + 语法高亮
- 未保存标识（文件名旁小圆点），Ctrl/Cmd+S 保存
- 右键菜单：新建 / 重命名 / 删除

### 6.3 Agent 选择与 ruler.toml 配置
- 右侧面板：30 个 agent 复选框（名称 + 默认输出路径）
- 勾选写回 `ruler.toml`（防抖 500ms）
- 基本配置表单：`default_agents`、`gitignore`、`backup`
- 折叠高级区：`mcp.enabled`、`mcp.merge_strategy`、`nested`

### 6.4 Apply / Revert 工作流
```
点击 Apply
  → ruler apply --dry-run --verbose --project-root <path>
  → 解析输出（Writing/Skipping/Removing 行）
  → DiffPreview 面板展示影响文件
  → 用户确认
  → ruler apply --project-root <path> --verbose（流式日志）
  → 完成 Toast
```

### 6.5 错误处理
- Ruler 二进制找不到 → 顶部 banner（不阻塞界面）
- TOML 解析失败 → Toast + 原始文件内容
- 权限错误 → Modal 说明
- CLI 非零退出码 → 日志面板高亮错误行

---

## 7. 国际化方案

自定义轻量 i18n（不引入第三方库）：
- `src/renderer/i18n/zh.ts` 和 `en.ts`，key-value 字符串表
- 语言偏好存入 `electron-store`，默认跟随 `app.getLocale()`
- 右上角 ZH / EN 切换按钮

---

## 8. 主题系统

```css
[data-theme="light"] {
  --bg-base:      hsl(220, 20%, 97%);
  --bg-surface:   hsl(220, 15%, 100%);
  --border:       hsl(220, 10%, 88%);
  --accent:       hsl(258, 80%, 58%);
  --text-primary: hsl(220, 20%, 12%);
  --text-muted:   hsl(220, 10%, 45%);
}
[data-theme="dark"] {
  --bg-base:      hsl(224, 20%, 8%);
  --bg-surface:   hsl(224, 15%, 13%);
  --border:       hsl(224, 10%, 22%);
  --accent:       hsl(258, 90%, 66%);
  --text-primary: hsl(220, 15%, 92%);
  --text-muted:   hsl(220, 10%, 55%);
}
```

默认跟随系统（`nativeTheme.shouldUseDarkColors`），右上角切换。

---

## 9. 打包配置

```yaml
appId: com.rulesync.app
productName: RuleSync
win:
  target: nsis
  arch: [x64]
mac:
  target: dmg
  arch: [x64, arm64]
  category: public.app-category.developer-tools
files:
  - "out/**/*"
  - "node_modules/@intellectronica/ruler/**/*"
```

---

## 10. 阶段规划

| 阶段 | 内容 |
|------|------|
| Phase 1 | 脚手架 + 工程配置（electron-vite、依赖安装、无边框窗口） |
| Phase 2 | 主进程 IPC 层（文件系统、CLI 封装、TOML 读写） |
| Phase 3 | 设计系统 + 基础布局（主题、i18n、三栏布局） |
| Phase 4 | 核心功能（编辑器、Agent 列表、TOML 表单） |
| Phase 5 | Apply/Revert 工作流 + 错误处理 |
| Phase 6 | 动效打磨 + 打包 + README |
