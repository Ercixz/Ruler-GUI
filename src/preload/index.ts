import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, IPC_EVENTS } from '../shared/types'
import type {
  FileInfo,
  FileWatchEvent,
  RulerResult,
  RulerStreamChunk,
  RulerDiffEntry,
  TomlReadResult,
  ProjectInfo
} from '../shared/types'

const rulerApi = {
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED) as Promise<boolean>
  },

  folder: {
    open: () => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_OPEN) as Promise<string | null>,
    getRecent: () => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_GET_RECENT) as Promise<string[]>
  },

  file: {
    read: (filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath) as Promise<string>,
    write: (filePath: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, filePath, content) as Promise<void>,
    list: (dirPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST, dirPath) as Promise<FileInfo[]>,
    create: (filePath: string, content?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE, filePath, content) as Promise<void>,
    rename: (oldPath: string, newPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_RENAME, oldPath, newPath) as Promise<void>,
    delete: (filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, filePath) as Promise<void>,
    exists: (filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_EXISTS, filePath) as Promise<boolean>,
    watch: (dirPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_WATCH, dirPath) as Promise<boolean>,
    unwatch: (dirPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_UNWATCH, dirPath) as Promise<void>,

    onChanged: (callback: (event: FileWatchEvent) => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, event: FileWatchEvent) => callback(event)
      ipcRenderer.on(IPC_EVENTS.FILE_CHANGED, handler)
      return () => ipcRenderer.removeListener(IPC_EVENTS.FILE_CHANGED, handler)
    }
  },

  ruler: {
    check: (projectRoot: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.RULER_CHECK, projectRoot) as Promise<boolean>,
    init: (projectRoot: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.RULER_INIT, projectRoot) as Promise<RulerResult>,
    apply: (projectRoot: string, options?: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.RULER_APPLY, projectRoot, options) as Promise<
        RulerResult & { diff: RulerDiffEntry[] }
      >,
    applyStream: (
      projectRoot: string,
      options: Record<string, unknown> | undefined,
      onOutput: (chunk: RulerStreamChunk) => void,
      onError: (chunk: RulerStreamChunk) => void,
      onDone: (chunk: RulerStreamChunk) => void
    ): { cancel: () => void } => {
      const cleanups: (() => void)[] = []

      const handlerOut = (_: Electron.IpcRendererEvent, chunk: RulerStreamChunk) => onOutput(chunk)
      ipcRenderer.on(IPC_EVENTS.RULER_STREAM_OUTPUT, handlerOut)
      cleanups.push(() => ipcRenderer.removeListener(IPC_EVENTS.RULER_STREAM_OUTPUT, handlerOut))

      const handlerErr = (_: Electron.IpcRendererEvent, chunk: RulerStreamChunk) => onError(chunk)
      ipcRenderer.on(IPC_EVENTS.RULER_STREAM_ERROR, handlerErr)
      cleanups.push(() => ipcRenderer.removeListener(IPC_EVENTS.RULER_STREAM_ERROR, handlerErr))

      const handlerDone = (_: Electron.IpcRendererEvent, chunk: RulerStreamChunk) => {
        onDone(chunk)
        cleanups.forEach((fn) => fn())
      }
      ipcRenderer.once(IPC_EVENTS.RULER_STREAM_DONE, handlerDone)
      cleanups.push(() => ipcRenderer.removeListener(IPC_EVENTS.RULER_STREAM_DONE, handlerDone))

      ipcRenderer.invoke(IPC_CHANNELS.RULER_APPLY_STREAM, projectRoot, options)

      return {
        cancel: () => cleanups.forEach((fn) => fn())
      }
    },
    dryRun: (projectRoot: string, options?: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.RULER_DRY_RUN, projectRoot, options) as Promise<
        RulerResult & { diff: RulerDiffEntry[] }
      >,
    revert: (projectRoot: string, options?: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.RULER_REVERT, projectRoot, options) as Promise<RulerResult>,
    version: () => ipcRenderer.invoke(IPC_CHANNELS.RULER_VERSION) as Promise<string | null>
  },

  toml: {
    read: (filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOML_READ, filePath) as Promise<TomlReadResult>,
    write: (filePath: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOML_WRITE, filePath, data) as Promise<boolean>
  },

  store: {
    get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key) as Promise<unknown>,
    set: (key: string, value: unknown) =>
      ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value) as Promise<void>,
    delete: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE, key) as Promise<void>
  },

  shell: {
    openPath: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_PATH, dirPath)
  },

  components: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.COMPONENTS_LIST) as Promise<unknown[]>,
    create: (comp: unknown) => ipcRenderer.invoke(IPC_CHANNELS.COMPONENTS_CREATE, comp) as Promise<unknown>,
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.COMPONENTS_DELETE, id) as Promise<void>,
    save: (components: unknown[]) => ipcRenderer.invoke(IPC_CHANNELS.COMPONENTS_SAVE, components) as Promise<void>
  }
}

contextBridge.exposeInMainWorld('rulerApi', rulerApi)

export type RulerApi = typeof rulerApi
