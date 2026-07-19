import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC_EVENTS } from '../../shared/types'
import type { UpdateStatus } from '../../shared/types'

let status: UpdateStatus = {
  state: app.isPackaged ? 'idle' : 'unsupported',
  currentVersion: app.getVersion(),
  error: app.isPackaged ? undefined : 'Updates are available only in packaged builds.'
}

let configured = false
let windowRef: BrowserWindow | null = null

function emit(): void {
  if (windowRef && !windowRef.isDestroyed()) {
    windowRef.webContents.send(IPC_EVENTS.UPDATES_STATUS, status)
  }
}

function setStatus(next: Partial<UpdateStatus>): UpdateStatus {
  status = {
    ...status,
    ...next,
    currentVersion: app.getVersion()
  }
  emit()
  return status
}

export function configureUpdates(win: BrowserWindow): void {
  windowRef = win
  if (configured) return
  configured = true

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    setStatus({ state: 'checking', error: undefined, progress: undefined })
  })

  autoUpdater.on('update-available', (info) => {
    setStatus({
      state: 'available',
      latestVersion: info.version,
      releaseName: info.releaseName ?? undefined,
      releaseDate: info.releaseDate ?? undefined,
      error: undefined
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    setStatus({
      state: 'not-available',
      latestVersion: info.version,
      releaseName: info.releaseName ?? undefined,
      releaseDate: info.releaseDate ?? undefined,
      error: undefined
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    setStatus({
      state: 'downloading',
      progress: {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond
      },
      error: undefined
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    setStatus({
      state: 'downloaded',
      latestVersion: info.version,
      releaseName: info.releaseName ?? undefined,
      releaseDate: info.releaseDate ?? undefined,
      downloadedFile: info.downloadedFile,
      error: undefined
    })
  })

  autoUpdater.on('error', (error) => {
    setStatus({ state: 'error', error: error.message || String(error) })
  })
}

export function getUpdateStatus(): UpdateStatus {
  return status
}

export async function checkForUpdates(): Promise<UpdateStatus> {
  if (!app.isPackaged) {
    return setStatus({
      state: 'unsupported',
      error: 'Updates are available only in packaged builds.'
    })
  }
  setStatus({ state: 'checking', error: undefined, progress: undefined })
  await autoUpdater.checkForUpdates()
  return status
}

export async function downloadUpdate(): Promise<UpdateStatus> {
  if (!app.isPackaged) {
    return setStatus({
      state: 'unsupported',
      error: 'Updates are available only in packaged builds.'
    })
  }
  setStatus({ state: 'downloading', error: undefined })
  await autoUpdater.downloadUpdate()
  return status
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}
