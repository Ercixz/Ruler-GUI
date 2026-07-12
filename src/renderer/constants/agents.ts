import type { AgentInfo } from '@shared/types'

export const AGENTS: AgentInfo[] = [
  { id: 'agentsmd', name: 'AGENTS.md', outputFile: 'AGENTS.md', category: 'Base' },
  { id: 'cursor', name: 'Cursor', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'windsurf', name: 'Windsurf', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'cline', name: 'Cline', outputFile: '.clinerules', category: 'IDE' },
  { id: 'roo', name: 'RooCode', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'zed', name: 'Zed', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'kilocode', name: 'Kilo Code', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'antigravity', name: 'Antigravity', outputFile: '.agent/rules/ruler.md', category: 'Editors & Extensions' },
  { id: 'augmentcode', name: 'AugmentCode', outputFile: '.augment/rules/ruler_augment_instructions.md', category: 'Editors & Extensions' },
  { id: 'jetbrains-ai', name: 'JetBrains AI', outputFile: '.aiassistant/rules/AGENTS.md', category: 'Editors & Extensions' },
  { id: 'trae', name: 'Trae AI', outputFile: '.trae/rules/project_rules.md', category: 'Editors & Extensions' },
  { id: 'junie', name: 'Junie', outputFile: '.junie/guidelines.md', category: 'Editors & Extensions' },
  { id: 'copilot', name: 'GitHub Copilot', outputFile: 'AGENTS.md', category: 'Cloud & Platform' },
  { id: 'codex', name: 'OpenAI Codex CLI', outputFile: 'AGENTS.md', category: 'Cloud & Platform' },
  { id: 'gemini-cli', name: 'Gemini CLI', outputFile: 'AGENTS.md', category: 'Cloud & Platform' },
  { id: 'firebase', name: 'Firebase Studio', outputFile: '.idx/airules.md', category: 'Cloud & Platform' },
  { id: 'warp', name: 'Warp', outputFile: 'WARP.md', category: 'Cloud & Platform' },
  { id: 'claude', name: 'Claude Code', outputFile: 'CLAUDE.md', category: 'AI Models' },
  { id: 'qwen', name: 'Qwen Code', outputFile: 'AGENTS.md', category: 'AI Models' },
  { id: 'mistral', name: 'Mistral Vibe', outputFile: 'AGENTS.md', category: 'AI Models' },
  { id: 'pi', name: 'Pi Coding Agent', outputFile: 'AGENTS.md', category: 'AI Models' },
  { id: 'amazonqcli', name: 'Amazon Q CLI', outputFile: '.amazonq/rules/ruler_q_rules.md', category: 'AI Models' },
  { id: 'aider', name: 'Aider', outputFile: 'AGENTS.md', category: 'CLI & Tools' },
  { id: 'opencode', name: 'OpenCode', outputFile: 'AGENTS.md', category: 'CLI & Tools' },
  { id: 'jules', name: 'Jules', outputFile: 'AGENTS.md', category: 'CLI & Tools' },
  { id: 'crush', name: 'Crush', outputFile: 'CRUSH.md', category: 'CLI & Tools' },
  { id: 'amp', name: 'Amp', outputFile: 'AGENTS.md', category: 'CLI & Tools' },
  { id: 'openhands', name: 'Open Hands', outputFile: '.openhands/microagents/repo.md', category: 'Other' },
  { id: 'goose', name: 'Goose', outputFile: '.goosehints', category: 'Other' },
  { id: 'kiro', name: 'Kiro', outputFile: '.kiro/steering/ruler_kiro_instructions.md', category: 'Other' },
  { id: 'firebender', name: 'Firebender', outputFile: 'firebender.json', category: 'Other' },
  { id: 'factory', name: 'Factory Droid', outputFile: 'AGENTS.md', category: 'Other' }
]

export const AGENTS_BY_CATEGORY = AGENTS.reduce(
  (acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = []
    acc[agent.category].push(agent)
    return acc
  },
  {} as Record<string, AgentInfo[]>
)

export const CATEGORIES = ['Base', 'IDE', 'Editors & Extensions', 'Cloud & Platform', 'AI Models', 'CLI & Tools', 'Other']
