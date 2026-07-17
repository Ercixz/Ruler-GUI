# RuleSync

Visual GUI frontend for [Ruler](https://github.com/intellectronica/ruler), a tool that distributes Markdown rule files to 30+ AI coding agents in their native formats.

## Features

- **Zero terminal knowledge** — manage everything through a clean three-panel UI
- **Built-in Ruler CLI** — no separate installation required (`@intellectronica/ruler` bundled)
- **Markdown editor** — CodeMirror 6 with syntax highlighting and Ctrl+S save
- **Agent manager** — check 30+ AI agents (Claude Code, Cursor, Gemini CLI, Copilot, etc.) by category
- **Visual TOML config** — backup, gitignore, MCP settings without touching raw TOML
- **Dry-run preview** — see which files will be modified before applying
- **Streaming output** — real-time log when applying rules
- **Chokidar watch** — auto-refresh when `.ruler/` files change externally
- **Light/Dark/System themes** — auto-detects OS preference
- **i18n** — English and Chinese (中文)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Electron 33+ + electron-vite |
| Renderer | React 18 + TypeScript |
| Editor | CodeMirror 6 |
| State | Zustand |
| TOML | smol-toml |
| File Watch | chokidar |
| Package | electron-builder |

## Development

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Package

```bash
# Windows (NSIS installer)
npm run dist:win

# macOS (DMG)
npm run dist:mac
```

## Project Structure

```
src/
├── main/              # Electron main process
│   └── ipc/
│       ├── handlers.ts    # IPC channel registration
│       ├── fs.ts          # File system + chokidar watch
│       ├── ruler-cli.ts   # spawn封装, 流式输出
│       └── toml.ts        # ruler.toml读写
├── preload/           # contextBridge API
├── shared/            # IPC channels + shared types
└── renderer/          # React frontend
    ├── components/
    │   ├── common/        # Button, Modal, Toast, FileTree
    │   ├── layout/        # TitleBar, Sidebar, StatusBar
    │   ├── editor/        # CodeMirror 6 Markdown editor
    │   ├── agents/        # Agent checkbox list
    │   ├── config/        # TOML visual form
    │   └── apply/         # Apply/Revert/DiffPreview
    ├── hooks/          # useTheme, useI18n, useProject, etc.
    ├── store/          # Zustand global state
    ├── i18n/           # zh.ts / en.ts
    └── constants/      # 30 AI agent definitions
```

## License

MIT
