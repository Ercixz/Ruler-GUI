import React from 'react'
import { useAppStore } from '@/store/appStore'
import type { ThemeMode } from '@shared/types'

export function TitleBar(): React.ReactElement {
  const { theme, setTheme, togglePoolCollapsed, poolCollapsed } = useAppStore()

  const cycleTheme = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }

  const themeIcons: Record<ThemeMode, string> = { system: '\u2699', light: '\u2600', dark: '\u263D' }

  return (
    <header className="titlebar">
      <div className="titlebar-left">
        <button className="titlebar-btn" onClick={togglePoolCollapsed} title={poolCollapsed ? 'Show Pool' : 'Hide Pool'}>
          {poolCollapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>
      <div className="titlebar-center" />
      <div className="titlebar-right">
        <button className="titlebar-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
          {themeIcons[theme]}
        </button>
        <div className="traffic-lights">
          <button className="traffic-light tl-minimize" onClick={() => window.rulerApi.window.minimize()} title="Minimize">{'\u2500'}</button>
          <button className="traffic-light tl-maximize" onClick={() => window.rulerApi.window.maximize()} title="Maximize">{'\u25A1'}</button>
          <button className="traffic-light tl-close" onClick={() => window.rulerApi.window.close()} title="Close">{'\u2715'}</button>
        </div>
      </div>
    </header>
  )
}
