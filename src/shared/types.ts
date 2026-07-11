export const IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized',

  FOLDER_OPEN: 'folder:open',
  FOLDER_GET_RECENT: 'folder:getRecent',

  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_LIST: 'file:list',
  FILE_CREATE: 'file:create',
  FILE_RENAME: 'file:rename',
  FILE_DELETE: 'file:delete',
  FILE_WATCH: 'file:watch',
  FILE_UNWATCH: 'file:unwatch',
  FILE_EXISTS: 'file:exists',

  RULER_INIT: 'ruler:init',
  RULER_APPLY: 'ruler:apply',
  RULER_APPLY_STREAM: 'ruler:applyStream',
  RULER_REVERT: 'ruler:revert',
  RULER_CHECK: 'ruler:check',
  RULER_DRY_RUN: 'ruler:dryRun',
  RULER_VERSION: 'ruler:version',

  TOML_READ: 'toml:read',
  TOML_WRITE: 'toml:write',

  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_DELETE: 'store:delete',

  COMPONENTS_LIST: 'components:list',
  COMPONENTS_CREATE: 'components:create',
  COMPONENTS_UPDATE: 'components:update',
  COMPONENTS_DELETE: 'components:delete',
  COMPONENTS_SAVE: 'components:save',

  SHELL_OPEN_PATH: 'shell:openPath',

  THEME_GET: 'theme:get',
  LOCALE_GET: 'locale:get'
} as const

export const IPC_EVENTS = {
  FILE_CHANGED: 'file:changed',
  RULER_STREAM_OUTPUT: 'ruler:streamOutput',
  RULER_STREAM_ERROR: 'ruler:streamError',
  RULER_STREAM_DONE: 'ruler:streamDone'
} as const

export interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modifiedAt: string
}

export interface FileWatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir'
  path: string
  name: string
}

export interface RulerResult {
  success: boolean
  output: string
  exitCode: number
}

export interface RulerDiffEntry {
  action: 'writing' | 'skipping' | 'removing'
  filePath: string
  agent: string
}

export interface RulerStreamChunk {
  line: string
  type: 'stdout' | 'stderr'
  timestamp: number
}

export interface ProjectInfo {
  path: string
  name: string
  lastOpened: string
  hasRulerDir: boolean
}

export interface AgentInfo {
  id: string
  name: string
  outputFile: string
  category: string
}

export interface RulerTomlAgent {
  enabled: boolean
  output?: string
}

export interface RulerTomlSettings {
  default_agents?: string[]
  backup?: boolean
  gitignore?: boolean
}

export interface RulerTomlMcp {
  enabled?: boolean
  merge_strategy?: 'merge' | 'replace'
}

export interface RulerTomlConfig {
  agents?: Record<string, RulerTomlAgent>
  settings?: RulerTomlSettings
  mcp?: RulerTomlMcp
  nested?: Record<string, string[]>
}

export interface TomlParseError {
  message: string
  line?: number
  column?: number
}

export interface TomlReadResult {
  data: RulerTomlConfig | null
  error: TomlParseError | null
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type LocaleCode = 'zh' | 'en'

export interface RulePiece {
  id: string
  title: string
  content: string
  source: 'global' | 'project'
  enabled: boolean
}
