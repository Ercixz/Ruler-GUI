---
type: Reference
title: Components & Projects
description: Core domain model of RuleSync — reusable Markdown components, project management, rule sequencing, global rules, and agent assignment
tags: [domain, components, projects, agents, zustand]
---

# Components & Projects

This page documents the core domain model: how reusable rule "components" are created, organized, assigned to projects, and applied to AI agents.

## Domain Model

### Component

A reusable Markdown rule block. Defined by the `Component` interface in `/src/renderer/store/appStore.ts`:

```typescript
interface Component {
  id: string              // Auto-generated ("c-" + timestamp)
  title: string           // Display name
  content: string         // Full Markdown content
  category: string        // Grouping category (e.g., "Security", "Style")
  globalHead: boolean     // Appears before all project rule sequences
  globalTail: boolean     // Appears after all project rule sequences
}
```

A component can be in one of four global states (cycled by clicking the star button in the pool):
- **Off** (`☆`): Not global; only used when explicitly assigned to a project
- **Head** (`★↑`): Appended before all project rule sequences
- **Tail** (`★↓`): Appended after all project rule sequences
- **Head + Tail** (`★↕`): Appears both before and after

### ProjectState

A managed project directory. Defined in `/src/renderer/store/appStore.ts`:

```typescript
interface ProjectState {
  path: string            // Absolute filesystem path
  name: string            // Derived from path (last segment)
  componentIds: string[]  // Ordered list of assigned component IDs
  agents: string[]        // Selected agent IDs for this project
}
```

### AgentInfo

A known AI coding agent with its output file path. Defined in `/src/shared/types.ts` and the constant list in `/src/renderer/constants/agents.ts`:

```typescript
interface AgentInfo {
  id: string
  name: string
  outputFile: string   // Native config file name (e.g., "CLAUDE.md", ".clinerules")
  category: string     // Group: Base, IDE, Editors & Extensions, Cloud & Platform, AI Models, CLI & Tools, Other
}
```

The app ships with **35 agents** across 7 categories. See `/src/renderer/constants/agents.ts` for the complete list.

## Component Pool (Left Panel)

**Source: `/src/renderer/components/pool/ComponentPool.tsx`**

The left panel manages the library of reusable rule components.

### Operations
- **Create**: Type a title + optional category, press Enter or click "+"
- **Edit**: Click a component card to open the inline editor (title, content, category)
- **Delete**: Click the ✕ button on a component card
- **Recategorize**: Edit the category field, or use the "Move to Uncategorized" bulk action
- **Global toggle**: Cycle through Off → Head → Tail → Head+Tail via the star button
- **Drag**: Component cards are draggable; dropping on a project view assigns them
- **Category collapsible**: Categories auto-open when first component is added

### Editor Panel
When a component is selected for editing, an inline panel appears with:
- Title input field
- Multi-line textarea for Markdown content
- Category input + dropdown selector
- Global position indicator (Head/Tail/Off)
- "Used in" references showing which projects use this component and at what sequence position

### Apply All / Revert
The pool footer has two buttons:
- **Apply All**: For each project, writes the full rule sequence (Global Head + assigned components + Global Tail) to `.ruler/AGENTS.md`, updates `ruler.toml` with selected agents, and runs the Ruler library's `apply()`.
- **Revert**: Restores previously saved project state from electron-store.

## Project Sidebar (Right Panel)

**Source: `/src/renderer/components/pool/ProjectTabs.tsx`**

The right panel manages the project list.

### Operations
- **Add by path**: Paste a filesystem path and press Enter
- **Browse**: Folder picker dialog
- **Filter**: Type to filter by name or path
- **Global Rules entry**: Always at top; click to view global-only rules
- **Reorder**: Drag-and-drop projects to rearrange their order
- **Context menu**: Right-click a project → "Open in Explorer" or "Remove"
- **Close**: Click the ✕ button on a project row

## Project View (Center Panel)

**Source: `/src/renderer/components/pool/ProjectView.tsx`**

The center panel shows the active project's rule configuration.

### Global Rules View
When no project is active ("Global Rules" selected), shows:
- **Before Project Rules**: Components marked as `globalHead`
- **After Project Rules**: Components marked as `globalTail`
- Both sections accept drag-and-drop from the component pool

### Project View
When a project is active, shows:

1. **Rule Sequence** — Ordered list of assigned components with drag-to-reorder. Each component shows its sequence number, title, and a remove button. Empty state shows a drop hint.

2. **Preview** — Up to 3 component snippets (number, title, truncated content). Shows "+ N more components..." when applicable.

3. **Target Agents** — Categorized agent selection with:
   - **Pinned section**: Frequently-used agents (pinned via star button)
   - **Category grid**: 7 collapsible categories with individual checkboxes
   - **Actions**: "All" and "None" quick-select buttons

### Drag-and-Drop
- Components can be dragged from the pool to the center panel (project rule sequence or global sections)
- Components within the sequence can be reordered via drag
- Visual feedback: drop zones highlight, drag item dims

## State Management

**Source: `/src/renderer/store/appStore.ts`**

Global state managed by Zustand:

| State Field | Type | Persisted? |
|---|---|---|
| `theme` | `ThemeMode` (`'light'\|'dark'\|'system'`) | Yes (electron-store) |
| `locale` | `LocaleCode` (`'en'\|'zh'`) | Yes |
| `components` | `Component[]` | Yes (via `rulerApi.components.save`) |
| `projects` | `ProjectState[]` | Yes (as `projectStates`) |
| `activeProjectPath` | `string \| null` | No (session) |
| `editingComponentId` | `string \| null` | No (session) |
| `previewingPath` | `string \| null` | No (session) |
| `poolCollapsed` | `boolean` | No (session) |
| `pinnedAgentIds` | `string[]` | Yes |

### Key State Operations
- `addProject(path)` — Adds project; prevents duplicates; sets as active
- `removeProject(path)` — Removes and updates `activeProjectPath`
- `assignComponent/unassignComponent` — Toggles component membership
- `reorderComponents` — Changes component sequence order
- `setProjectAgents` — Updates selected agent set
- `togglePinAgent` — Adds/removes from pinned list
- `loadProjectState` — Restores saved project state (path, componentIds, agents)

## Data Flow: Component Assignment

```
User drags component → ComponentPool (onDragStart sets dataTransfer)
    ↓
ProjectView (onDrop calls assignComponent)
    ↓
Zustand store updates projects[projectPath].componentIds
    ↓
React re-renders ProjectView (shows updated sequence)
    ↓
useEffect in App.tsx persists to electron-store
```

## Data Flow: Apply All

```
User clicks "Apply All" in ComponentPool
    ↓
For each project:
  1. Read globalHead components + project sequence + globalTail components
  2. Write merged Markdown to .ruler/AGENTS.md
  3. Write selected agents to .ruler/ruler.toml
  4. Call ruler.apply(projectPath, { agents })
    ↓
Toast notification on completion
```

## Source Map

| Concept | Source File |
|---|---|
| Component & ProjectState interfaces | `/src/renderer/store/appStore.ts` |
| Component pool UI | `/src/renderer/components/pool/ComponentPool.tsx` |
| Project sidebar | `/src/renderer/components/pool/ProjectTabs.tsx` |
| Project view + agents | `/src/renderer/components/pool/ProjectView.tsx` |
| Agent constants | `/src/renderer/constants/agents.ts` |
| AgentInfo type | `/src/shared/types.ts` |
| Markdown preview | `/src/renderer/components/pool/MarkdownPreview.tsx` |
| UI translations | `/src/renderer/i18n/en.ts`, `/src/renderer/i18n/zh.ts` |
