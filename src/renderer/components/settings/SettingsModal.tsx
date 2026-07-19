import React from 'react'
import { Modal } from '@/components/common'
import type { UpdateStatus } from '@shared/types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let current = value
  let index = 0
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024
    index += 1
  }
  return `${current.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function statusLabel(status: UpdateStatus): string {
  switch (status.state) {
    case 'checking':
      return 'Checking for updates...'
    case 'available':
      return `Version ${status.latestVersion ?? 'unknown'} is available.`
    case 'not-available':
      return 'RuleSync is up to date.'
    case 'downloading':
      return 'Downloading update...'
    case 'downloaded':
      return `Version ${status.latestVersion ?? 'latest'} is ready to install.`
    case 'unsupported':
      return 'Updates are only available in packaged builds.'
    case 'error':
      return 'Update failed.'
    default:
      return 'Ready to check for updates.'
  }
}

export function SettingsModal({ open, onClose }: SettingsModalProps): React.ReactElement {
  const [status, setStatus] = React.useState<UpdateStatus | null>(null)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    let disposed = false
    window.rulerApi.updates.getStatus().then((next) => {
      if (!disposed) setStatus(next)
    })
    const unsubscribe = window.rulerApi.updates.onStatus((next) => setStatus(next))
    return () => {
      disposed = true
      unsubscribe()
    }
  }, [open])

  const run = async (action: () => Promise<UpdateStatus | void>) => {
    setBusy(true)
    try {
      const next = await action()
      if (next) setStatus(next)
    } finally {
      setBusy(false)
    }
  }

  const progress = status?.progress
  const percent = progress ? Math.max(0, Math.min(100, progress.percent)) : 0
  const canCheck = status?.state !== 'checking' && status?.state !== 'downloading'
  const canDownload = status?.state === 'available'
  const canInstall = status?.state === 'downloaded'

  return (
    <Modal open={open} title="Settings" onClose={onClose} width={680}>
      <div className="settings-panel">
        <aside className="settings-nav">
          <button className="settings-nav-item settings-nav-item-active">Updates</button>
        </aside>
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <h4 className="settings-section-title">Updates</h4>
              <p className="settings-section-description">Keep RuleSync current from GitHub Releases.</p>
            </div>
          </div>

          <div className="update-card">
            <div className="update-row">
              <span className="update-label">Current version</span>
              <span className="update-value">{status?.currentVersion ?? '-'}</span>
            </div>
            <div className="update-row">
              <span className="update-label">Latest version</span>
              <span className="update-value">{status?.latestVersion ?? '-'}</span>
            </div>
            <div className="update-status">{status ? statusLabel(status) : 'Loading update status...'}</div>

            {progress && (
              <div className="update-progress">
                <div className="update-progress-track">
                  <div className="update-progress-fill" style={{ width: `${percent}%` }} />
                </div>
                <div className="update-progress-meta">
                  <span>{percent.toFixed(0)}%</span>
                  <span>{formatBytes(progress.transferred)} / {formatBytes(progress.total)}</span>
                </div>
              </div>
            )}

            {status?.error && <div className="update-error" title={status.error}>{status.error}</div>}

            <div className="update-actions">
              <button className="proj-mini-btn update-action" disabled={busy || !canCheck} onClick={() => run(() => window.rulerApi.updates.check())}>
                Check for Updates
              </button>
              <button className="proj-mini-btn update-action" disabled={busy || !canDownload} onClick={() => run(() => window.rulerApi.updates.download())}>
                Download
              </button>
              <button className="proj-mini-btn update-action update-action-primary" disabled={busy || !canInstall} onClick={() => run(() => window.rulerApi.updates.install())}>
                Restart and Install
              </button>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  )
}
