---
type: Reference
title: Build & Package
description: Development workflow, npm scripts, electron-builder packaging, testing setup, and CI configuration for RuleSync
tags: [operations, build, package, testing, ci]
---

# Build & Package

## Development Workflow

### Prerequisites
- Node.js 22+ (matching the CI setup)
- npm

### Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies (529 packages as of scaffolding) |
| `npm run dev` | Start electron-vite dev server with HMR |
| `npm run build` | Production build via electron-vite |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Vitest watch mode |
| `npm run pack` | Build + package via electron-builder (unpacked) |
| `npm run dist` | Build + package for current platform |
| `npm run dist:win` | Build + Windows NSIS installer |
| `npm run dist:mac` | Build + macOS DMG |

### Type Checking

TypeScript configuration uses three `tsconfig` files:
- **`tsconfig.json`** — Root config with path aliases (`@/*` → `src/renderer/*`, `@shared/*` → `src/shared/*`)
- **`tsconfig.node.json`** — Node environment for main/preload
- **`tsconfig.web.json`** — DOM environment for renderer

## Build Configuration

**Source: `/electron.vite.config.ts`**

electron-vite builds three separate targets:

| Target | Input | Plugins | Special |
|---|---|---|---|
| `main` | `src/main/index.ts` | `externalizeDepsPlugin()` | Ruler lib externalized from bundle |
| `preload` | `src/preload/index.ts` | `externalizeDepsPlugin()` | — |
| `renderer` | `src/renderer/index.html` | `@vitejs/plugin-react` | Aliases `@` and `@shared` |

Output goes to `/out/main/`, `/out/preload/`, and `/out/renderer/` respectively.

## Packaging (electron-builder)

**Source: `/electron-builder.yml`**

### Configuration
- **App ID**: `com.rulesync.app`
- **Product name**: RuleSync
- **Build resources**: `build/` directory (icons, brand assets)

### Files Included
- Application bundle files
- Excluded: source (`src/`), configs (`electron.vite.config.*`, `tsconfig*.json`), docs, tests, bin

### Windows (NSIS Installer)
- Architecture: x64
- One-click install: **disabled** (allows custom install directory)
- Icons: `build/icon.ico`

### macOS (DMG)
- Architectures: x64 + arm64 (universal)
- Category: `public.app-category.developer-tools`
- Icons: `build/icon.icns`
- Artifact name: `{name}-{version}-{arch}.{ext}`

### Brand Assets
Located in `/build/`:
- `brand-cover.png` / `brand-cover.svg` — Cover image for README
- `icon.ico`, `icon.icns`, `icon.png`, `icon.svg` — Application icons
- `icon.iconset/` — macOS icon set source

## Testing

**Source: `/vitest.config.ts`**, Tests: `/src/renderer/__tests__/store.test.ts`

### Configuration
- **Environment**: jsdom (DOM simulation in Node)
- **Globals**: enabled (no explicit imports needed)
- **Aliases**: Same `@` and `@shared` path aliases as the build

### Test Coverage
- **Store tests** (`store.test.ts`): Tests for Zustand store operations
  - Empty initial state
  - Project add (no duplicates, auto-activate)
  - Component add/remove
  - Component assignment to projects
  - Theme toggle
  - Agent assignment
  - Component reordering

### Running Tests
```bash
npm run test          # Single run
npm run test:watch    # Watch mode
```

## OpenWiki Updates

OpenWiki documentation is stored in `/openwiki/` and can be refreshed from the repository root.

```bash
openwiki code --update --print
```

For GitHub Actions automation, add a workflow that installs OpenWiki and runs the same command. The workflow needs an `OPENAI_COMPATIBLE_API_KEY` secret when using the DeepSeek/OpenAI-compatible provider.

## Change Guidance for Future Agents

### When modifying the IPC layer
- Update both `IPC_CHANNELS` (invoke names) and `IPC_EVENTS` (event names) in `/src/shared/types.ts`
- Add both the main process handler (`handlers.ts`) and preload bridge method (`preload/index.ts`)
- Run `npm run typecheck` to verify cross-process type safety

### When adding components
- Add component modules under `src/renderer/components/<area>/`
- Export from an `index.ts` barrel file if multiple related components
- Run `npm run test` to verify store integration doesn't break

### When packaging
- Test both `dist:win` and `dist:mac` before release
- Verify the Ruler library is bundled (not externalized for the main process)
- Check that `build/` assets exist for all required icon formats

### Source Map

| Concept | Source File |
|---|---|
| npm scripts | `/package.json` |
| electron-vite config | `/electron.vite.config.ts` |
| electron-builder config | `/electron-builder.yml` |
| Vitest config | `/vitest.config.ts` |
| Store tests | `/src/renderer/__tests__/store.test.ts` |
| CI workflow | `/.github/workflows/openwiki-update.yml` |
| TypeScript config | `/tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json` |
| Brand assets | `/build/*` |
