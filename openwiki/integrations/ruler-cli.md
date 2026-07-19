---
type: Reference
title: Ruler CLI Integration
description: How RuleSync bundles and invokes the @intellectronica/ruler library for rule distribution, TOML configuration, file watching, and the standalone CLI tool
tags: [integration, ruler, cli, toml, chokidar]
---

# Ruler CLI Integration

RuleSync bundles [`@intellectronica/ruler`](https://github.com/intellectronica/ruler) as a direct Node.js library dependency (not spawned as a subprocess). This page documents how the integration works, including TOML configuration, file watching, and the standalone CLI tool.

## Architecture

```
Renderer (Apply All click)
    │ invoke('ruler:applyStream', ...)
    ▼
Main Process (ruler-cli.ts)
    │ rulerLib.applyAllAgentConfigs(projectRoot, agents, ...)
    ▼
    │ Streaming events through IPC (RULER_STREAM_OUTPUT/DONE/ERROR)
    ▼
Renderer (event listeners → UI updates)
```

## Ruler Library Binding

**Source: `/src/main/ipc/ruler-cli.ts`**

The library is loaded lazily on first use via `require('@intellectronica/ruler')`. Key functions:

| Function | Purpose |
|---|---|
| `rulerCheck()` | Verifies the library is available (always returns true if loaded) |
| `rulerInit()` | Creates `.ruler/` directory, default `ruler.toml` and `AGENTS.md` |
| `rulerApply()` | Calls `applyAllAgentConfigs()` with dryRun=false |
| `rulerApplyStreaming()` | Same as apply but supports streaming via callback |
| `rulerDryRun()` | Calls `applyAllAgentConfigs()` with dryRun=true |
| `rulerRevert()` | Stub — delegates to CLI `ruler revert` |
| `getCliVersion()` | Reads version from Ruler's `package.json` |
| `parseRulerOutput()` | Parses stdout lines into structured diff entries |

### applyAllAgentConfigs Parameters

The library is called with a specific set of positional boolean flags:

```typescript
rulerLib.applyAllAgentConfigs(
  projectRoot,      // string: path to project
  includedAgents,   // string[] | undefined: agent IDs to include (undefined = all)
  undefined,        // excludedAgents
  true,             // verbose: enable verbose logging
  undefined,        // outputDir
  true,             // backup: create backups before overwriting
  true,             // gitignore: add output files to .gitignore
  dryRun,           // dryRun: true for preview, false for actual apply
  false,            // skipWhitespace
  undefined,        // concurrency
  undefined,        // onProgress
  undefined,        // onWarning
  undefined,        // onError
  undefined         // onOutput
)
```

## TOML Configuration

**Source: `/src/main/ipc/toml.ts`**, Schema types: `/src/shared/types.ts`

RuleSync uses `smol-toml` for lightweight TOML parsing/writing. The `ruler.toml` file lives at `<project>/.ruler/ruler.toml`.

### RulerTomlConfig Schema

```typescript
interface RulerTomlConfig {
  agents?: Record<string, RulerTomlAgent>   // e.g., { claude: { enabled: true } }
  settings?: RulerTomlSettings
  mcp?: RulerTomlMcp
  nested?: Record<string, string[]>
}

interface RulerTomlAgent {
  enabled: boolean
  output?: string
}

interface RulerTomlSettings {
  default_agents?: string[]
  backup?: boolean
  gitignore?: boolean
}

interface RulerTomlMcp {
  enabled?: boolean
  merge_strategy?: 'merge' | 'replace'
}
```

### API

| Operation | Description |
|---|---|
| `readToml(path)` | Returns parsed object or `null` |
| `readTomlConfig(path)` | Returns `{ data: RulerTomlConfig \| null, error: TomlParseError \| null }` with line/column on failure |
| `writeToml(path, data)` | Serializes and writes file, returns boolean success |
| `validateTomlConfig(config)` | Type guard validating agents and settings structure |

### Apply All TOML Flow

When "Apply All" runs, it writes agent selections to TOML:

```typescript
const r = await rulerApi.toml.read(tomlPath)
const ac: Record<string, { enabled: boolean }> = {}
for (const a of project.agents) ac[a] = { enabled: true }
await rulerApi.toml.write(tomlPath, { ...(r.data || {}), agents: ac })
```

## File Watching (Chokidar)

**Source: `/src/main/ipc/fs.ts`**

RuleSync uses `chokidar` for cross-platform file watching:

- **Directory watch**: `watchDir(dirPath, callback)` — starts watching a directory tree
- **Hide dotfiles**: Ignores all hidden files except `.ruler/`
- **Depth**: 10 levels
- **Stability**: `awaitWriteFinish` with 300ms threshold to batch rapid writes
- **Multi-watch support**: Maintains a `Map<string, FSWatcher>` for independent watch/unwatch of different directories
- **Events**: `add`, `change`, `unlink`, `addDir`, `unlinkDir`
- **Config file watch**: The main config file (`userData/config.json`) is watched for external changes to components

### Config File Watch

**Source: `/src/main/ipc/handlers.ts`** (function `watchConfigFile`)

The main process watches the `userData/config.json` file for changes. When a change is detected, it parses the `components` array and sends the `COMPONENTS_CHANGED` event to the renderer, which updates Zustand state. This allows the CLI tool and the GUI to share the same component store.

## CLI Component Tool

**Source: `/bin/rulesync.js`**

A standalone Node.js CLI for managing components from the terminal:

```
rulesync components list
rulesync components create --title "My Rule" --content "## Rule" --category "Security"
rulesync components delete --id c-1234567890
```

The CLI reads/writes the same `config.json` file as the GUI (stored at `~/.config/rulesync/config.json` on macOS/Linux or `%APPDATA%/rulesync/config.json` on Windows), so changes made via CLI are immediately visible in the GUI and vice versa.

## Scope Boundaries

Per the design spec (`docs/superpowers/specs/2026-07-12-rulesync-design.md`):

- ❌ Rule distribution logic is entirely delegated to the bundled Ruler library
- ❌ Skills (`.ruler/skills/`) and Subagents (`.ruler/agents/`) are not managed
- ❌ MCP server configuration is collapsed under "Advanced" with only enabled/merge_strategy toggles
- ❌ No CLI terminal UI for the main app

## Source Map

| Concept | Source File |
|---|---|
| Ruler library binding | `/src/main/ipc/ruler-cli.ts` |
| TOML read/write | `/src/main/ipc/toml.ts` |
| TOML config types | `/src/shared/types.ts` (RulerTomlConfig, etc.) |
| File system + chokidar | `/src/main/ipc/fs.ts` |
| CLI tool | `/bin/rulesync.js` |
| Apply All flow | `/src/renderer/components/pool/ComponentPool.tsx` |
| Design spec | `/docs/superpowers/specs/2026-07-12-rulesync-design.md` |
