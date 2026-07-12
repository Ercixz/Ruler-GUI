import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAppStore } from './store/appStore'
import { TitleBar } from './components/layout'
import { ComponentPool, ProjectView, ProjectTabs } from './components/pool'
import { ToastContainer, Button } from './components/common'
import type { Component } from './store/appStore'

function App(): React.ReactElement {
  const { theme, projects, activeProjectPath, addProject, removeProject, setActiveProject, t, poolCollapsed, components, pinnedAgentIds } = useAppStore()
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
      const store = useAppStore.getState()
      let saved = (await window.rulerApi.store.get('projectStates')) as { path: string; componentIds: string[]; agents: string[] }[] | undefined
      if (!saved || saved.length === 0) {
        const old = (await window.rulerApi.store.get('projects')) as string[] | undefined
        if (old && old.length > 0) saved = old.map((p) => ({ path: p, componentIds: [], agents: [] }))
      }
      if (saved && saved.length > 0) {
        for (const ps of saved) store.loadProjectState(ps)
      }
      const pins = (await window.rulerApi.store.get('pinnedAgentIds')) as string[] | undefined
      if (pins && pins.length > 0) useAppStore.setState({ pinnedAgentIds: pins })
    }
    load()
  }, [])

  useEffect(() => {
    window.rulerApi.store.set('projectStates', projects.map((p) => ({
      path: p.path,
      componentIds: p.componentIds,
      agents: p.agents
    })))
  }, [projects])

  useEffect(() => {
    window.rulerApi.store.set('pinnedAgentIds', pinnedAgentIds)
  }, [pinnedAgentIds])

  useEffect(() => {
    const load = async () => {
      const saved = (await window.rulerApi.components.list()) as Component[]
      if (saved && saved.length > 0) {
        const migrated = saved.map((c) => {
          const comp = c as Component & { globalPosition?: string }
          const gh = 'globalHead' in comp ? comp.globalHead : (comp as { globalPosition?: string }).globalPosition === 'head'
          const gt = 'globalTail' in comp ? comp.globalTail : (comp as { globalPosition?: string }).globalPosition === 'tail'
          return { id: comp.id, title: comp.title, content: comp.content, category: comp.category, globalHead: gh || false, globalTail: gt || false }
        })
        useAppStore.getState().setComponents(migrated)
      }
    }
    load()
  }, [])

  useEffect(() => {
    window.rulerApi.components.save(components)
  }, [components])

  useEffect(() => {
    const unsub = window.rulerApi.components.onChanged((updated) => {
      useAppStore.getState().setComponents(updated as Component[])
    })
    return unsub
  }, [])

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

