import type { Translations } from './zh'

const en: Translations = {
  app: {
    title: 'RuleSync',
    subtitle: 'Manage AI coding agent rules visually'
  },
  welcome: {
    openFolder: 'Open Project Folder',
    recentProjects: 'Recent Projects',
    noRecent: 'No recent projects',
    initBanner: 'This folder is not initialized with Ruler. Initialize now?',
    initButton: 'Initialize Ruler',
    initSuccess: 'Ruler initialized successfully',
    initFailed: 'Ruler initialization failed'
  },
  sidebar: {
    rules: 'Rule Files',
    noFiles: 'No rule files yet',
    newFile: 'New File',
    newFolder: 'New Folder',
    rename: 'Rename',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete "{name}"?',
    fileOrder: 'File Merge Order',
    fileOrderHint: 'root AGENTS.md > .ruler/AGENTS.md > rest in alphabetical order'
  },
  editor: {
    unsaved: 'Unsaved',
    save: 'Save',
    saved: 'Saved',
    markdown: 'Markdown',
    preview: 'Preview'
  },
  agents: {
    title: 'Target Agents',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    count: '{count}/{total} agents selected'
  },
  config: {
    title: 'Configuration',
    defaultAgents: 'Default Agents',
    backup: 'Backup',
    backupHint: 'Auto-backup target files before Apply',
    gitignore: 'Gitignore',
    gitignoreHint: 'Auto-update .gitignore',
    advanced: 'Advanced Settings',
    mcpEnabled: 'MCP Enabled',
    mcpMergeStrategy: 'MCP Merge Strategy',
    nested: 'Nested Rules'
  },
  apply: {
    title: 'Apply Rules',
    dryRun: 'Preview (Dry Run)',
    apply: 'Apply',
    revert: 'Revert',
    confirm: 'Confirm Apply',
    confirmMessage: 'The following files will be modified. Continue?',
    success: 'Rules applied successfully',
    revertSuccess: 'Rules reverted successfully',
    failed: 'Operation failed',
    noChanges: 'No files need to be modified'
  },
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry'
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  }
} as const

export default en
