import React, { useEffect, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
  duration: number
}

let nextId = 0

const listeners = new Set<() => void>()
let toasts: ToastItem[] = []

function emit() {
  listeners.forEach((fn) => fn())
}

export function addToast(type: ToastType, message: string, duration: number = 3000): void {
  toasts = [...toasts, { id: nextId++, type, message, duration }]
  emit()
}

export function removeToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function ToastContainer(): React.ReactElement {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const update = () => forceUpdate((n) => n + 1)
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  )
}

function ToastItem({ id, type, message, duration }: ToastItem): React.ReactElement {
  const [visible, setVisible] = useState(true)

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => removeToast(id), 200)
  }, [id])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(dismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, dismiss])

  const icons: Record<ToastType, string> = {
    success: '\u2713',
    error: '\u2717',
    warning: '\u26A0',
    info: '\u2139'
  }

  return (
    <div className={`toast toast-${type} ${visible ? 'toast-enter' : 'toast-exit'}`} onClick={dismiss}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
    </div>
  )
}
