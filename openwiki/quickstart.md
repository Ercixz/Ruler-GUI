---
type: Reference
title: RuleSync Quickstart
description: Entrypoint for the RuleSync knowledge base — a visual GUI frontend for Ruler that distributes Markdown rule files to 30+ AI coding agents
tags: [quickstart, overview, electron, react]
---

# RuleSync Quickstart

RuleSync is a desktop GUI frontend for [Ruler](https://github.com/intellectronica/ruler), a tool that distributes Markdown rule files to 30+ AI coding agents (Claude Code, Cursor, Gemini CLI, Copilot, etc.) in their native formats. It provides a three-panel visual interface for managing reusable rule "components" and assigning them to projects and agents.

## Key Concepts

- **Components** — Reusable Markdown rule blocks organized by category. Components can be marked as Global (applied before or after all project rules) or assigned per-project.
- **Projects** — Filesystem directories managed by RuleSync. Each project has a `.ruler/` directory and can have its own component sequence and agent selection.
- **Agents** — 30+ AI coding agents with known output file paths. Users select which agents to apply rules to per project.
- **Global Rules** — Components that appear before or after all project-specific rule sequences, managed in a "Global Rules" view when no project is selected.

## Features

- **Zero terminal knowledge** — manage everything through a clean three-panel UI
- **Built-in Ruler CLI** — `@intellectronica/ruler` npm package bundled; no separate installation required
- **Markdown editor** — CodeMirror 6 with syntax highlighting and read-only preview
- **Agent manager** — 30+ AI agents by category with pinning, select-all/none
- **Visual TOML config** — backup, gitignore, MCP settings without touching raw TOML
- **Drag-and-drop** — reorder components in a project's rule sequence
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
| Persistence | electron-store |
| File Watch | chokidar |
| Packager | electron-builder (NSIS + DMG) |
| Test | Vitest + jsdom |

## Quick Start (Development)

```bash
npm install
npm run dev       # Start dev server with HMR
npm run typecheck # TypeScript type check
npm run test      # Run Vitest tests
npm run build     # Production build
```

## Project Structure

```
src/
├── main/              # Electron main process
│   └── ipc/
│       ├── handlers.ts    # IPC channel registration
│       ├── fs.ts          # File system + chokidar file watch
│       ├── ruler-cli.ts   # Bundled Ruler library usage
│       └── toml.ts        # ruler.toml read/write (smol-toml)
├── preload/           # contextBridge typed API (window.rulerApi)
├── shared/            # IPC channel constants + shared TS types
└── renderer/          # React frontend (three-panel layout)
    ├── components/
    │   ├── common/        # Button, Modal, Toast, FileTree
    │   ├── layout/        # TitleBar
    │   └── pool/          # ComponentPool, ProjectView, ProjectTabs
    ├── store/          # Zustand global state (appStore)
    ├── constants/      # 30+ AI agent definitions
    └── i18n/           # zh.ts / en.ts translations
```

## When to Use This Wiki

- **Understand the architecture** — How the three Electron processes communicate (see [Architecture Overview](architecture/overview.md))
- **Work with components and projects** — Learn the core domain model of components, global rules, project management, and agent selection (see [Components & Projects](domain/components-and-projects.md))
- **Understand Ruler CLI integration** — How the app bundles and invokes the Ruler library for init/apply/dry-run/revert, and how TOML config works (see [Ruler CLI Integration](integrations/ruler-cli.md))
- **Build, package, and deploy** — Development workflow, electron-builder config, testing, and CI (see [Build & Package](operations/build-and-package.md))

## Backlog

- **IPC event documentation** — Detailed schema of every IPC channel and event (deferred: low churn, well-typed in source)
- **CSS theming system** — Full design token reference for light/dark themes (deferred: documented in `docs/superpowers/specs/2026-07-12-rulesync-design.md` and css variables in `src/renderer/index.css`)
