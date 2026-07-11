import type { AgentInfo } from '@shared/types'

export const AGENTS: AgentInfo[] = [
  { id: 'agentsmd', name: 'AGENTS.md', outputFile: 'AGENTS.md', category: 'Base' },
  { id: 'copilot', name: 'GitHub Copilot', outputFile: 'AGENTS.md', category: 'GitHub' },
  { id: 'claude', name: 'Claude Code', outputFile: 'CLAUDE.md', category: 'Anthropic' },
  { id: 'codex', name: 'OpenAI Codex CLI', outputFile: 'AGENTS.md', category: 'OpenAI' },
  { id: 'pi', name: 'Pi Coding Agent', outputFile: 'AGENTS.md', category: 'Other' },
  { id: 'jules', name: 'Jules', outputFile: 'AGENTS.md', category: 'Other' },
  { id: 'cursor', name: 'Cursor', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'windsurf', name: 'Windsurf', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'cline', name: 'Cline', outputFile: '.clinerules', category: 'IDE' },
  { id: 'crush', name: 'Crush', outputFile: 'CRUSH.md', category: 'Other' },
  { id: 'amp', name: 'Amp', outputFile: 'AGENTS.md', category: 'Other' },
  { id: 'antigravity', name: 'Antigravity', outputFile: '.agent/rules/ruler.md', category: 'IDE' },
  { id: 'amazonqcli', name: 'Amazon Q CLI', outputFile: '.amazonq/rules/ruler_q_rules.md', category: 'AWS' },
  { id: 'aider', name: 'Aider', outputFile: 'AGENTS.md', category: 'CLI' },
  { id: 'firebase', name: 'Firebase Studio', outputFile: '.idx/airules.md', category: 'Platform' },
  { id: 'openhands', name: 'Open Hands', outputFile: '.openhands/microagents/repo.md', category: 'Other' },
  { id: 'gemini-cli', name: 'Gemini CLI', outputFile: 'AGENTS.md', category: 'Google' },
  { id: 'junie', name: 'Junie', outputFile: '.junie/guidelines.md', category: 'IDE' },
  { id: 'augmentcode', name: 'AugmentCode', outputFile: '.augment/rules/ruler_augment_instructions.md', category: 'IDE' },
  { id: 'kilocode', name: 'Kilo Code', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'opencode', name: 'OpenCode', outputFile: 'AGENTS.md', category: 'CLI' },
  { id: 'goose', name: 'Goose', outputFile: '.goosehints', category: 'Other' },
  { id: 'qwen', name: 'Qwen Code', outputFile: 'AGENTS.md', category: 'Alibaba' },
  { id: 'roo', name: 'RooCode', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'zed', name: 'Zed', outputFile: 'AGENTS.md', category: 'IDE' },
  { id: 'trae', name: 'Trae AI', outputFile: '.trae/rules/project_rules.md', category: 'IDE' },
  { id: 'warp', name: 'Warp', outputFile: 'WARP.md', category: 'Terminal' },
  { id: 'kiro', name: 'Kiro', outputFile: '.kiro/steering/ruler_kiro_instructions.md', category: 'Other' },
  { id: 'firebender', name: 'Firebender', outputFile: 'firebender.json', category: 'Other' },
  { id: 'factory', name: 'Factory Droid', outputFile: 'AGENTS.md', category: 'Other' },
  { id: 'mistral', name: 'Mistral Vibe', outputFile: 'AGENTS.md', category: 'Mistral' },
  { id: 'jetbrains-ai', name: 'JetBrains AI', outputFile: '.aiassistant/rules/AGENTS.md', category: 'IDE' }
]

export const AGENTS_BY_CATEGORY = AGENTS.reduce(
  (acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = []
    acc[agent.category].push(agent)
    return acc
  },
  {} as Record<string, AgentInfo[]>
)

export const CATEGORIES = Object.keys(AGENTS_BY_CATEGORY)
