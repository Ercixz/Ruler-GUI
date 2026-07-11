import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { watch } from 'chokidar'
import type { FSWatcher } from 'chokidar'
import type { FileInfo, FileWatchEvent } from '../../shared/types'

const watchers = new Map<string, FSWatcher>()

type WatchCallback = (event: FileWatchEvent) => void

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8')
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8')
}

export async function listFiles(dirPath: string): Promise<FileInfo[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const results: FileInfo[] = []

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    const stat = await fs.stat(fullPath)

    if (entry.name.startsWith('.') && entry.name !== '.ruler') {
      continue
    }

    results.push({
      name: entry.name,
      path: fullPath,
      isDirectory: entry.isDirectory(),
      size: stat.size,
      modifiedAt: stat.mtime.toISOString()
    })
  }

  return results.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

export async function listRulerMdFiles(dirPath: string): Promise<FileInfo[]> {
  const allFiles = await listFiles(dirPath)
  return allFiles.filter(
    (f) => !f.isDirectory && (f.name.endsWith('.md') || f.name.endsWith('.MD'))
  )
}

export async function createFile(filePath: string, content: string = ''): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8')
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  await fs.rename(oldPath, newPath)
}

export async function deleteFile(filePath: string): Promise<void> {
  const stat = await fs.stat(filePath)
  if (stat.isDirectory()) {
    await fs.rm(filePath, { recursive: true, force: true })
  } else {
    await fs.unlink(filePath)
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export function watchDir(dirPath: string, callback: WatchCallback): void {
  if (watchers.has(dirPath)) {
    return
  }

  const watcher = watch(dirPath, {
    ignored: [/(^|[\\/])\..(?!ruler$)/],
    ignoreInitial: true,
    persistent: true,
    depth: 10,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  })

  watcher.on('add', (filePath: string) => {
    const name = filePath.replace(join(dirPath, ''), '')
    callback({ type: 'add', path: filePath, name })
  })

  watcher.on('change', (filePath: string) => {
    const name = filePath.replace(join(dirPath, ''), '')
    callback({ type: 'change', path: filePath, name })
  })

  watcher.on('unlink', (filePath: string) => {
    const name = filePath.replace(join(dirPath, ''), '')
    callback({ type: 'unlink', path: filePath, name })
  })

  watcher.on('addDir', (filePath: string) => {
    const name = filePath.replace(join(dirPath, ''), '')
    callback({ type: 'addDir', path: filePath, name })
  })

  watcher.on('unlinkDir', (filePath: string) => {
    const name = filePath.replace(join(dirPath, ''), '')
    callback({ type: 'unlinkDir', path: filePath, name })
  })

  watcher.on('error', (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[chokidar] Watch error on ${dirPath}:`, msg)
  })

  watchers.set(dirPath, watcher)
}

export async function unwatchDir(dirPath: string): Promise<void> {
  const watcher = watchers.get(dirPath)
  if (watcher) {
    await watcher.close()
    watchers.delete(dirPath)
  }
}

export async function unwatchAll(): Promise<void> {
  for (const [dirPath, watcher] of watchers) {
    await watcher.close()
    watchers.delete(dirPath)
  }
}
