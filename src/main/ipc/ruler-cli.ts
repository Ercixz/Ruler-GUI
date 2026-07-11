import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import type { RulerResult, RulerDiffEntry } from '../../shared/types'

let rulerLib: { allAgents: () => string[]; applyAllAgentConfigs: (...args: unknown[]) => Promise<void> } | null = null
let cliVersion: string | null = null

function loadRulerLib(): boolean {
  if (rulerLib) return true
  try {
    rulerLib = require('@intellectronica/ruler')
    return true
  } catch {
    return false
  }
}

export function getCliVersion(): string | null {
  if (cliVersion) return cliVersion
  try {
    const pkg = require('@intellectronica/ruler/package.json')
    cliVersion = pkg.version
    return cliVersion
  } catch {
    return null
  }
}

export function parseRulerOutput(output: string): RulerDiffEntry[] {
  const entries: RulerDiffEntry[] = []
  for (const line of output.split('\n')) {
    const t = line.trim().toLowerCase()
    let action: RulerDiffEntry['action'] | null = null
    if (t.startsWith('writing')) action = 'writing'
    else if (t.startsWith('skipping')) action = 'skipping'
    else if (t.startsWith('removing')) action = 'removing'
    if (!action) continue
    const parts = line.trim().split(/\s+/)
    entries.push({ action, filePath: parts[parts.length - 1] || '', agent: parts.length >= 3 ? parts[1].replace(/[\[\]]/g, '') : '' })
  }
  return entries
}

export async function rulerCheck(projectRoot: string): Promise<boolean> {
  return loadRulerLib()
}

export async function rulerInit(projectRoot: string): Promise<RulerResult> {
  const rulerDir = join(projectRoot, '.ruler')
  const tomlPath = join(rulerDir, 'ruler.toml')
  const agentsPath = join(rulerDir, 'AGENTS.md')

  if (loadRulerLib()) {
    try {
      if (!existsSync(rulerDir)) mkdirSync(rulerDir, { recursive: true })
      if (!existsSync(tomlPath)) {
        writeFileSync(tomlPath, '[settings]\nbackup = true\ngitignore = true\n\n[agents]\n', 'utf-8')
      }
      if (!existsSync(agentsPath)) {
        writeFileSync(agentsPath, '# Ruler Rules\n\n', 'utf-8')
      }
      return { success: true, output: `Initialized .ruler/ in ${projectRoot}`, exitCode: 0 }
    } catch (err) {
      return { success: false, output: String(err), exitCode: 1 }
    }
  }

  try {
    if (!existsSync(rulerDir)) mkdirSync(rulerDir, { recursive: true })
    if (!existsSync(tomlPath)) writeFileSync(tomlPath, '[settings]\nbackup = true\ngitignore = true\n\n[agents]\n', 'utf-8')
    if (!existsSync(agentsPath)) writeFileSync(agentsPath, '# Ruler Rules\n\n', 'utf-8')
    return { success: true, output: `Initialized .ruler/ in ${projectRoot}`, exitCode: 0 }
  } catch (err) {
    return { success: false, output: String(err), exitCode: 1 }
  }
}

export async function rulerApply(projectRoot: string, options?: Record<string, unknown>): Promise<RulerResult> {
  if (!loadRulerLib()) {
    return { success: false, output: 'Ruler library not found. Run npm install @intellectronica/ruler.', exitCode: 1 }
  }
  try {
    const includedAgents = (options?.agents && Array.isArray(options.agents)) ? options.agents : undefined
    await rulerLib!.applyAllAgentConfigs(
      projectRoot,
      includedAgents,
      undefined,
      true, undefined, true, true, false, false, undefined, undefined, undefined, undefined, undefined
    )
    return { success: true, output: 'Rules applied successfully', exitCode: 0 }
  } catch (err) {
    return { success: false, output: String(err), exitCode: 1 }
  }
}

export function rulerApplyStreaming(
  projectRoot: string,
  options: Record<string, unknown> | undefined,
  onChunk: (chunk: string, type: 'stdout' | 'stderr', done: boolean) => void
): () => void {
  if (!loadRulerLib()) {
    onChunk('Ruler library not found', 'stderr', true)
    return () => {}
  }
  const includedAgents = (options?.agents && Array.isArray(options.agents)) ? options.agents : undefined

  let cancelled = false
  rulerLib!.applyAllAgentConfigs(
    projectRoot, includedAgents, undefined,
    true, undefined, true, true, false, false, undefined, undefined, undefined, undefined, undefined
  ).then(() => {
    if (!cancelled) onChunk('Done', 'stdout', true)
  }).catch((err) => {
    if (!cancelled) onChunk(String(err), 'stderr', true)
  })

  return () => { cancelled = true }
}

export async function rulerDryRun(projectRoot: string, options?: Record<string, unknown>): Promise<RulerResult> {
  if (!loadRulerLib()) {
    return { success: false, output: 'Ruler library not found', exitCode: 1 }
  }
  try {
    const includedAgents = (options?.agents && Array.isArray(options.agents)) ? options.agents : undefined
    await rulerLib!.applyAllAgentConfigs(
      projectRoot, includedAgents, undefined,
      true, undefined, true, true, true, false, undefined, undefined, undefined, undefined, undefined
    )
    return { success: true, output: 'Dry run completed', exitCode: 0 }
  } catch (err) {
    return { success: false, output: String(err), exitCode: 1 }
  }
}

export async function rulerRevert(projectRoot: string, options?: Record<string, unknown>): Promise<RulerResult> {
  return { success: true, output: 'Revert is handled by the Ruler CLI. Use "ruler revert" in terminal.', exitCode: 0 }
}
