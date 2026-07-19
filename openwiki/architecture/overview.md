---
type: Reference
title: Architecture Overview
description: Three-process Electron architecture of RuleSync — main process, preload bridge, and React renderer with typed IPC communication
tags: [architecture, electron, ipc, preload]
---

# Architecture Overview

RuleSync follows a standard Electron three-process architecture with strict process separation enforced by `contextIsolation: true` and `nodeIntegration: false`.

## Process Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Renderer Process                           │
│  React 18 + Zustand + CodeMirror 6                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ ComponentPool │  │ ProjectView  │  │   ProjectTabs     │  │
│  │ (left panel)  │  │ (center)     │  │   (right sidebar) │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ contextBridge (typed rulerApi)
┌──────────────────────▼───────────────────────────────────────┐
│                     Preload Script                            │
│  /src/preload/index.ts                                        │
│  window.rulerApi = { window, folder, file, ruler,             │
│                     toml, store, shell, components }          │
└──────────────────────┬───────────────────────────────────────┘
                       │ ipcMain.handle / ipcRenderer.on
┌──────────────────────▼───────────────────────────────────────┐
│                     Main Process                              │
│  Electron app lifecycle + 4 IPC modules                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  fs.ts       │  │ ruler-cli.ts │  │   toml.ts        │    │
│  │  (chokidar)  │  │ (@ruler lib) │  │   (smol-toml)  │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  handlers.ts (IPC registration + electron-store)        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Key Source Files

### Main Process

**`/src/main/index.ts`** — Application entrypoint. Creates a frameless `BrowserWindow` (1280x800, min 960x600) with `titleBarStyle: 'hidden'`. Registers IPC handlers via `registerIpcHandlers()`. In dev mode loads from `ELECTRON_RENDERER_URL`; in production loads the built `renderer/index.html`.

**`/src/main/ipc/handlers.ts`** — Central IPC handler registration. Manages:
- **Window controls**: minimize, maximize, close, isMaximized
- **Folder operations**: open dialog, get recent projects
- **File operations**: read, write, list, create, rename, delete, exists, watch, unwatch
- **Ruler CLI**: init, apply, applyStream, revert, check, dryRun, version
- **TOML config**: read, write
- **electron-store**: get, set, delete (persists projects, theme, locale, components, pinned agents)
- **Components**: list, create, delete, save (managed through a file-based config at `userData/config.json`)
- **chokidar file watcher**: watches the config file for external changes

**`/src/main/ipc/fs.ts`** — File system operations layer:
- Read/write text files (`utf-8`)
- List files with metadata (name, path, isDirectory, size, modifiedAt)
- List only Markdown files (`.md`/`.MD`)
- Create, rename, delete files and directories
- Chokidar-based directory watching with configurable depth (10), ignore patterns (dotfiles except `.ruler`), and `awaitWriteFinish` stability threshold (300ms)
- Manages a `Map<string, FSWatcher>` to support multiple watched directories and cleanup

**`/src/main/ipc/ruler-cli.ts`** — Bundles `@intellectronica/ruler` as a library (not spawned as a subprocess):
- Lazy-loads the library on first use
- `rulerInit()`: Creates `.ruler/` directory, `ruler.toml`, and `AGENTS.md` with defaults
- `rulerApply()` / `rulerApplyStreaming()`: Calls `applyAllAgentConfigs()` with project root and optional agent filter
- `rulerDryRun()`: Same as apply but with `true` for the dryRun parameter
- `rulerRevert()`: Stub that delegates to the CLI
- `parseRulerOutput()`: Parses `Writing/Skipping/Removing` lines into structured `RulerDiffEntry[]`
- See detailed documentation at [Ruler CLI Integration](../integrations/ruler-cli.md)

**`/src/main/ipc/toml.ts`** — TOML parsing/writing using `smol-toml`:
- `readToml()`: Parses file, returns raw object or null
- `readTomlConfig()`: Parses and type-checks against `RulerTomlConfig` interface, returns error details with line/column on failure
- `writeToml()`: Serializes object to TOML string and writes file
- `validateTomlConfig()`: Type guard for `RulerTomlConfig`

### Preload & Shared

**`/src/preload/index.ts`** — Exposes `window.rulerApi` via `contextBridge` with typed methods:
- `rulerApi.window`: minimize, maximize, close, isMaximized
- `rulerApi.folder`: open, getRecent
- `rulerApi.file`: read, write, list, create, rename, delete, exists, watch, unwatch, onChanged
- `rulerApi.ruler`: check, init, apply, applyStream, dryRun, revert, version
- `rulerApi.toml`: read, write
- `rulerApi.store`: get, set, delete
- `rulerApi.shell`: openPath
- `rulerApi.components`: list, create, delete, save, onChanged
- Stream operations use event listeners (`RULER_STREAM_OUTPUT`, `RULER_STREAM_ERROR`, `RULER_STREAM_DONE`)

**`/src/shared/types.ts`** — Central type definitions:
- `IPC_CHANNELS` — 25+ channel name constants (e.g., `'ruler:apply'`, `'file:read'`)
- `IPC_EVENTS` — 5 event name constants for push notifications
- Key types: `FileInfo`, `FileWatchEvent`, `RulerResult`, `RulerDiffEntry`, `RulerStreamChunk`, `ProjectInfo`, `AgentInfo`, `RulerTomlConfig`, `TomlParseError`, `TomlReadResult`, `ThemeMode`, `LocaleCode`, `RulePiece`

### Renderer

**`/src/renderer/App.tsx`** — Root React component. Manages three-panel layout with resizable splitters. Loads persisted state (projectStates, pinnedAgentIds, components) from electron-store on mount. Saves state on every change. Subscribes to `COMPONENTS_CHANGED` events for external updates.

**`/src/renderer/store/appStore.ts`** — Zustand store managing all global state. See [Components & Projects](../domain/components-and-projects.md) for full state model.

### Build Configuration

**`/electron.vite.config.ts`** — electron-vite config with three build targets:
- **main**: `externalizeDepsPlugin()`, Ruler library externalized from bundle
- **preload**: `externalizeDepsPlugin()`
- **renderer**: React plugin, path aliases `@` → `src/renderer` and `@shared` → `src/shared`

## Important Design Decisions

1. **Ruler as a library, not a subprocess** — `@intellectronica/ruler` is `require()`d directly in the main process rather than spawned as a CLI subprocess. The streaming apply is done via event listeners through IPC rather than stdout parsing.
2. **electron-store for persistence** — Projects, theme, locale, components, and pinned agents persist between sessions. Config file is also watched externally for changes.
3. **External component config file** — Components are persisted to `userData/config.json` so both the GUI and the CLI (`bin/rulesync.js`) can read/write them from the same file.
4. **No IPC fan-out** — All IPC is `invoke`/`handle` (request-response) except for file change events and ruler stream output, which use `send`/`on` (push).
5. **CSS variables for theming** — No CSS-in-JS or framework; `data-theme` attribute on root toggles between light and dark variable sets.
