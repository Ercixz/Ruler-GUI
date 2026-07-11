import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAppStore } from './store/appStore'
import { TitleBar } from './components/layout'
import { ComponentPool, ProjectView, ProjectTabs } from './components/pool'
import { ToastContainer, Button } from './components/common'
import type { Component } from './store/appStore'

function App(): React.ReactElement {
  const { theme, projects, activeProjectPath, addProject, removeProject, setActiveProject, t, poolCollapsed, components } = useAppStore()
  const [poolWidth, setPoolWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(280)
  const resizing = useRef<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startW = useRef(0)

  const onMouseDown = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    resizing.current = side
    startX.current = e.clientX
    startW.current = side === 'left' ? poolWidth : rightWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [poolWidth, rightWidth])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onWheel = () => {
      document.documentElement.classList.add('is-scrolling')
      clearTimeout(timer)
      timer = setTimeout(() => document.documentElement.classList.remove('is-scrolling'), 600)
    }
    document.addEventListener('wheel', onWheel, { passive: true })
    return () => { document.removeEventListener('wheel', onWheel); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const load = async () => {
      const saved = (await window.rulerApi.store.get('projects')) as string[] | undefined
      if (saved && saved.length > 0) {
        for (const p of saved) addProject(p)
      }
    }
    load()
  }, [])

  useEffect(() => {
    window.rulerApi.store.set('projects', projects.map((p) => p.path))
  }, [projects])

  useEffect(() => {
    const load = async () => {
      const saved = (await window.rulerApi.components.list()) as Component[]
      if (saved && saved.length > 0) {
        useAppStore.getState().setComponents(saved)
      }
    }
    load()
  }, [])

  useEffect(() => {
    window.rulerApi.components.save(components)
  }, [components])

  const handleOpenFolder = async () => {
    const path = await window.rulerApi.folder.open()
    if (path) addProject(path)
  }

  if (projects.length === 0) {
    return (
      <div className="app" data-theme={theme === 'system' ? undefined : theme}>
        <TitleBar />
        <main className="main-content">
          <div className="welcome">
            <h1>{t.app.title}</h1>
            <p>{t.app.subtitle}</p>
            <Button size="lg" onClick={handleOpenFolder}>{t.welcome.openFolder}</Button>
          </div>
        </main>
        <ToastContainer />
      </div>
    )
  }

  return (
    <div className="app" data-theme={theme === 'system' ? undefined : theme}>
      <TitleBar />
      <main className="main-content">
        <div className="workspace">
          {!poolCollapsed && (
            <div className="pool-container" style={{ width: poolWidth }}>
              <ComponentPool />
            </div>
          )}
          <div className="splitter" onMouseDown={onMouseDown('left')} />
          <div className="projects-area">
            <div className="proj-content">
              <ProjectView />
            </div>
          </div>
          <div className="splitter" onMouseDown={onMouseDown('right')} />
          <div style={{ width: rightWidth, flexShrink: 0, overflow: 'hidden' }}>
            <ProjectTabs />
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default App

