import React, { useState, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'

export function ProjectTabs(): React.ReactElement {
  const { projects, activeProjectPath, addProject, removeProject, setActiveProject } = useAppStore()
  const [filter, setFilter] = useState('')
  const [pathInput, setPathInput] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)

  const filtered = filter
    ? projects.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.path.toLowerCase().includes(filter.toLowerCase()))
    : projects

  const handleAddByPath = () => {
    const trimmed = pathInput.trim()
    if (trimmed) {
      addProject(trimmed)
      setPathInput('')
    }
  }

  const handleAddFolder = async () => {
    const path = await window.rulerApi.folder.open()
    if (path) addProject(path)
  }

  const handleRightClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, path })
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return
    const all = [...projects]
    const [moved] = all.splice(dragIdx, 1)
    all.splice(idx, 0, moved)
    useAppStore.setState({ projects: all })
    setDragIdx(null)
  }

  return (
    <div className="proj-tabs-vertical">
      <div className="proj-tabs-v-header">Projects</div>

      {/* Filter */}
      <div className="proj-tabs-v-filter">
        <input
          className="proj-tabs-v-filter-input"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Global */}
      <div className={`proj-global-entry ${!activeProjectPath ? 'proj-global-entry-active' : ''}`} onClick={() => setActiveProject(null)}>
        <span className="proj-global-name">Global Rules</span>
      </div>

      {/* List */}
      <div className="proj-tabs-v-list">
        {filtered.map((p, i) => (
          <div
            key={p.path}
            className={`proj-tab-v ${p.path === activeProjectPath ? 'proj-tab-v-active' : ''} ${dragIdx === i ? 'proj-tab-v-dragging' : ''}`}
            onClick={() => setActiveProject(p.path)}
            onContextMenu={(e) => handleRightClick(e, p.path)}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDragIdx(null)}
            title={p.path}
          >
            <span className="proj-tab-v-name">{p.name}</span>
            <button
              className="proj-tab-v-close"
              onClick={(e) => { e.stopPropagation(); removeProject(p.path) }}
            >
              {'\u2715'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="proj-tab-v-empty">{filter ? 'No matches' : 'No projects'}</div>
        )}
      </div>

      {/* Add by path */}
      <div className="proj-tabs-v-add-row">
        <input
          className="proj-tabs-v-add-input"
          placeholder="Paste path..."
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddByPath() }}
        />
        <button className="proj-tab-v-add-btn" onClick={handleAddByPath} title="Add by path">+</button>
        <button className="proj-tab-v-add-btn" onClick={handleAddFolder} title="Browse folder...">{'\uD83D\uDCC2'}</button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="context-menu-backdrop" onClick={() => setContextMenu(null)} />
          <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button className="context-menu-item" onClick={() => {
              setContextMenu(null)
              window.rulerApi.shell.openPath(contextMenu.path)
            }}>
              Open in Explorer
            </button>
            <div className="context-menu-divider" />
            <button className="context-menu-item context-menu-item-danger" onClick={() => {
              setContextMenu(null)
              removeProject(contextMenu.path)
            }}>
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  )
}
