import { readFileSync, writeFileSync, existsSync } from 'fs'
import { parse, stringify } from 'smol-toml'
import type { RulerTomlConfig, TomlReadResult } from '../../shared/types'

export async function readToml(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    if (!existsSync(filePath)) {
      return null
    }
    const content = readFileSync(filePath, 'utf-8')
    return parse(content) as Record<string, unknown>
  } catch (err) {
    console.error('TOML parse error:', err)
    return null
  }
}

export async function readTomlConfig(filePath: string): Promise<TomlReadResult> {
  try {
    if (!existsSync(filePath)) {
      return { data: null, error: null }
    }
    const content = readFileSync(filePath, 'utf-8')
    const parsed = parse(content) as RulerTomlConfig

    if (parsed && typeof parsed === 'object') {
      return { data: parsed, error: null }
    }

    return { data: null, error: { message: 'Invalid TOML structure' } }
  } catch (err) {
    let message = 'Unknown TOML parse error'
    let line: number | undefined
    let column: number | undefined

    if (err instanceof Error) {
      message = err.message

      const lineMatch = err.message.match(/line (\d+)/i)
      const colMatch = err.message.match(/column (\d+)/i)
      if (lineMatch) line = parseInt(lineMatch[1], 10)
      if (colMatch) column = parseInt(colMatch[1], 10)
    }

    return {
      data: null,
      error: { message, line, column }
    }
  }
}

export async function writeToml(filePath: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const content = stringify(data)
    writeFileSync(filePath, content, 'utf-8')
    return true
  } catch (err) {
    console.error('TOML write error:', err)
    return false
  }
}

export function validateTomlConfig(config: unknown): config is RulerTomlConfig {
  if (!config || typeof config !== 'object') {
    return false
  }
  const obj = config as Record<string, unknown>
  if (obj.agents !== undefined && (typeof obj.agents !== 'object' || Array.isArray(obj.agents))) {
    return false
  }
  if (obj.settings !== undefined && (typeof obj.settings !== 'object' || Array.isArray(obj.settings))) {
    return false
  }
  return true
}
