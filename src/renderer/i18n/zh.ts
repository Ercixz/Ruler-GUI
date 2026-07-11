const zh = {
  app: {
    title: 'Ruler GUI',
    subtitle: '可视化管理 AI 编程助手规则文件'
  },
  welcome: {
    openFolder: '打开项目文件夹',
    recentProjects: '最近项目',
    noRecent: '暂无最近项目',
    initBanner: '当前文件夹未初始化 Ruler，是否立即初始化？',
    initButton: '初始化 Ruler',
    initSuccess: 'Ruler 初始化成功',
    initFailed: 'Ruler 初始化失败'
  },
  sidebar: {
    rules: '规则文件',
    noFiles: '尚无规则文件',
    newFile: '新建文件',
    newFolder: '新建文件夹',
    rename: '重命名',
    delete: '删除',
    deleteConfirm: '确定删除 "{name}" 吗？',
    fileOrder: '文件合并顺序',
    fileOrderHint: 'root AGENTS.md > .ruler/AGENTS.md > 其余按字母序'
  },
  editor: {
    unsaved: '未保存',
    save: '保存',
    saved: '已保存',
    markdown: 'Markdown',
    preview: '预览'
  },
  agents: {
    title: '目标 Agent',
    selectAll: '全选',
    deselectAll: '取消全选',
    count: '已选 {count}/{total} 个 Agent'
  },
  config: {
    title: '配置',
    defaultAgents: '默认 Agent',
    backup: '备份',
    backupHint: 'Apply 前自动备份目标文件',
    gitignore: 'Gitignore',
    gitignoreHint: '自动更新 .gitignore',
    advanced: '高级设置',
    mcpEnabled: 'MCP 启用',
    mcpMergeStrategy: 'MCP 合并策略',
    nested: '嵌套规则'
  },
  apply: {
    title: '应用规则',
    dryRun: '预览（Dry Run）',
    apply: '应用',
    revert: '回退',
    confirm: '确认应用',
    confirmMessage: '以下文件将被修改，是否继续？',
    success: '规则应用成功',
    revertSuccess: '规则回退成功',
    failed: '操作失败',
    noChanges: '没有文件需要修改'
  },
  common: {
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    loading: '加载中...',
    error: '出错了',
    retry: '重试'
  },
  theme: {
    light: '浅色',
    dark: '深色',
    system: '跟随系统'
  }
} as const

export default zh
export type TranslationSection = Record<string, string>
export type Translations = Record<string, TranslationSection>
