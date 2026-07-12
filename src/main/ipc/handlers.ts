import { ipcMain, BrowserWindow, dialog, app, shell } from 'electron'
import { IPC_CHANNELS, IPC_EVENTS } from '../../shared/types'
import type { FileWatchEvent } from '../../shared/types'
import {
  readFile,
  writeFile,
  listFiles,
  listRulerMdFiles,
  createFile,
  renameFile,
  deleteFile,
  fileExists,
  watchDir,
  unwatchDir
} from './fs'
import {
  rulerCheck,
  rulerInit,
  rulerApply,
  rulerApplyStreaming,
  rulerRevert,
  rulerDryRun,
  parseRulerOutput,
  getCliVersion
} from './ruler-cli'
import { readToml, readTomlConfig, writeToml } from './toml'
import Store from 'electron-store'
import { watch } from 'chokidar'
import { join, dirname } from 'path'
import { readFileSync, existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null

const store = new Store<Record<string, unknown>>({
  defaults: {
    recentProjects: [] as unknown,
    projects: [] as unknown,
    activeProject: null as unknown,
    theme: 'system' as unknown,
    locale: 'en' as unknown
  }
})

export function setMainWindow(win: BrowserWindow): void {
  mainWindow = win
}

function watchConfigFile(): void {
  const configPath = join(app.getPath('userData'), 'config.json')
  const watcher = watch(configPath, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
  })
  watcher.on('change', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const raw = readFileSync(configPath, 'utf-8')
        const data = JSON.parse(raw)
        const components = data.components ?? []
        mainWindow.webContents.send(IPC_EVENTS.COMPONENTS_CHANGED, components)
      } catch { /* ignore parse errors */ }
    }
  })
}

export function registerIpcHandlers(): void {
  watchConfigFile()

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  ipcMain.handle(IPC_CHANNELS.FOLDER_OPEN, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const folderPath = result.filePaths[0]
    const recent: string[] = (store.get('recentProjects') as string[]) ?? []
    const updated = [folderPath, ...recent.filter((p) => p !== folderPath)].slice(0, 10)
    store.set('recentProjects', updated)
    return folderPath
  })

  ipcMain.handle(IPC_CHANNELS.FOLDER_GET_RECENT, () => {
    return (store.get('recentProjects') as string[]) ?? []
  })

  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_, filePath: string) => {
    return readFile(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_, filePath: string, content: string) => {
    return writeFile(filePath, content)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_LIST, async (_, dirPath: string) => {
    return listRulerMdFiles(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_CREATE, async (_, filePath: string, content?: string) => {
    return createFile(filePath, content)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_RENAME, async (_, oldPath: string, newPath: string) => {
    return renameFile(oldPath, newPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, async (_, filePath: string) => {
    return deleteFile(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_, filePath: string) => {
    return fileExists(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_WATCH, async (_, dirPath: string) => {
    watchDir(dirPath, (event: FileWatchEvent) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_EVENTS.FILE_CHANGED, event)
      }
    })
    return true
  })

  ipcMain.handle(IPC_CHANNELS.FILE_UNWATCH, async (_, dirPath: string) => {
    await unwatchDir(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.RULER_CHECK, async (_, projectRoot: string) => {
    return rulerCheck(projectRoot)
  })

  ipcMain.handle(IPC_CHANNELS.RULER_INIT, async (_, projectRoot: string) => {
    return rulerInit(projectRoot)
  })

  ipcMain.handle(IPC_CHANNELS.RULER_APPLY, async (_, projectRoot: string, options?: Record<string, unknown>) => {
    const result = await rulerApply(projectRoot, options)
    return {
      ...result,
      diff: parseRulerOutput(result.output)
    }
  })

  ipcMain.handle(IPC_CHANNELS.RULER_APPLY_STREAM, async (event, projectRoot: string, options?: Record<string, unknown>) => {
    const sender = event.sender
    const cancel = rulerApplyStreaming(projectRoot, options, (chunk, type, done) => {
      if (sender.isDestroyed()) return
      if (done) {
        sender.send(IPC_EVENTS.RULER_STREAM_DONE, { line: chunk, type })
      } else if (type === 'stderr') {
        sender.send(IPC_EVENTS.RULER_STREAM_ERROR, { line: chunk, type })
      } else {
        sender.send(IPC_EVENTS.RULER_STREAM_OUTPUT, { line: chunk, type })
      }
    })
    return { cancel }
  })

  ipcMain.handle(IPC_CHANNELS.RULER_DRY_RUN, async (_, projectRoot: string, options?: Record<string, unknown>) => {
    const result = await rulerDryRun(projectRoot, options)
    return {
      ...result,
      diff: parseRulerOutput(result.output)
    }
  })

  ipcMain.handle(IPC_CHANNELS.RULER_REVERT, async (_, projectRoot: string, options?: Record<string, unknown>) => {
    return rulerRevert(projectRoot, options)
  })

  ipcMain.handle(IPC_CHANNELS.RULER_VERSION, async () => {
    return getCliVersion()
  })

  ipcMain.handle(IPC_CHANNELS.TOML_READ, async (_, filePath: string) => {
    return readTomlConfig(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.TOML_WRITE, async (_, filePath: string, data: Record<string, unknown>) => {
    return writeToml(filePath, data)
  })

  ipcMain.handle(IPC_CHANNELS.STORE_GET, async (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle(IPC_CHANNELS.STORE_SET, async (_, key: string, value: unknown) => {
    store.set(key, value)
  })

  ipcMain.handle(IPC_CHANNELS.COMPONENTS_LIST, async () => {
    return (store.get('components') as unknown[]) ?? []
  })

  ipcMain.handle(IPC_CHANNELS.COMPONENTS_CREATE, async (_, comp: unknown) => {
    const list = ((store.get('components') as unknown[]) ?? []) as unknown[]
    list.push(comp)
    store.set('components', list)
    return comp
  })

  ipcMain.handle(IPC_CHANNELS.COMPONENTS_DELETE, async (_, id: string) => {
    const list = ((store.get('components') as unknown[]) ?? []) as unknown[]
    const filtered = (list as { id: string }[]).filter((c) => c.id !== id)
    store.set('components', filtered)
  })

  ipcMain.handle(IPC_CHANNELS.COMPONENTS_SAVE, async (_, components: unknown[]) => {
    store.set('components', components)
  })

  ipcMain.handle(IPC_CHANNELS.STORE_DELETE, async (_, key: string) => {
    store.delete(key)
  })

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_PATH, async (_, dirPath: string) => {
    shell.openPath(dirPath)
  })
}
