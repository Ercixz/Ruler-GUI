import React from 'react'
import { useAppStore } from '@/store/appStore'
import { AGENTS, AGENTS_BY_CATEGORY, CATEGORIES } from '@/constants/agents'
import type { Component } from '@/store/appStore'

export function ProjectView(): React.ReactElement {
  const { projects, activeProjectPath, components, assignComponent, unassignComponent, reorderComponents, setProjectAgents, togglePinAgent, pinnedAgentIds, updateComponent } = useAppStore()
  const project = projects.find((p) => p.path === activeProjectPath)
  const globalHead = components.filter((c) => c.globalHead)
  const globalTail = components.filter((c) => c.globalTail)
  const [dragIdx, setDragIdx] = React.useState<number | null>(null)
  const [globalDragIdx, setGlobalDragIdx] = React.useState<number | null>(null)
  const [globalDragPos, setGlobalDragPos] = React.useState<'head' | 'tail' | null>(null)
  const [agentCatOpen, setAgentCatOpen] = React.useState<Set<string>>(new Set(CATEGORIES))
  const toggleAgentCat = (cat: string) => setAgentCatOpen((prev) => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })

  const reorderGlobal = (pos: 'head' | 'tail', fromIdx: number, toIdx: number) => {
    const key = pos === 'head' ? 'globalHead' : 'globalTail'
    const store = useAppStore.getState()
    const globalItems = store.components.filter(c => c[key])
    const reordered = [...globalItems]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const reorderedIds = reordered.map(c => c.id)
    const newOrder = [
      ...store.components.filter(c => !c[key]),
      ...reorderedIds.map(id => store.components.find(c => c.id === id)!).filter(Boolean)
    ]
    useAppStore.setState({ components: newOrder })
  }

  const handleDropGlobal = (pos: 'head' | 'tail') => (e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) updateComponent(id, pos === 'head' ? { globalHead: true } : { globalTail: true })
  }

  if (!project) {
    return (
      <div className="proj-view">
        <div className="proj-view-header">
          <div>
            <h1 className="proj-view-title">Global Rules</h1>
            <div className="proj-view-path">Applied to all projects</div>
          </div>
        </div>
        {(['head', 'tail'] as const).map((pos) => {
          const items = pos === 'head' ? globalHead : globalTail
          return (
            <div key={pos} className="proj-section" onDrop={handleDropGlobal(pos)} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}>
              <div className="proj-section-header">
                {pos === 'head' ? 'Before Project Rules' : 'After Project Rules'}
                <span className="proj-section-count">({items.length})</span>
              </div>
              {items.length === 0 ? (
                <div className="proj-drop-hint">Drop components here</div>
              ) : (
                <div className="proj-hseq">
                  {items.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && <span className="proj-hseq-arrow">{'\u2192'}</span>}
                      <div
                        className={`proj-hseq-item ${globalDragIdx === i && globalDragPos === pos ? 'proj-hseq-dragging' : ''}`}
                        draggable
                        onDragStart={() => { setGlobalDragIdx(i); setGlobalDragPos(pos) }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                        onDrop={() => {
                          if (globalDragIdx !== null && globalDragIdx !== i && globalDragPos === pos) {
                            reorderGlobal(pos, globalDragIdx, i)
                          }
                          setGlobalDragIdx(null); setGlobalDragPos(null)
                        }}
                        onDragEnd={() => { setGlobalDragIdx(null); setGlobalDragPos(null) }}
                      >
                        <span className="proj-hseq-num">{i + 1}</span>
                        <span className="proj-hseq-name">{c.title}</span>
                        <button className="proj-hseq-remove" onClick={() => updateComponent(c.id, pos === 'head' ? { globalHead: false } : { globalTail: false })}>{'\u2715'}</button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const seq = project.componentIds.map((id) => components.find((c) => c.id === id)).filter(Boolean) as Component[]
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) assignComponent(project.path, id) }

  return (
    <div className="proj-view">
      <div className="proj-view-header">
        <div>
          <h1 className="proj-view-title">{project.name}</h1>
          <div className="proj-view-path">{project.path}</div>
        </div>
      </div>

      {/* Rule Sequence */}
      <div className="proj-section" onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}>
        <div className="proj-section-header">
          Rule Sequence
          <span className="proj-section-count">({seq.length})</span>
        </div>
        {seq.length === 0 ? (
          <div className="proj-drop-hint">Drop components here from the pool</div>
        ) : (
          <div className="proj-hseq">
            {seq.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <span className="proj-hseq-arrow">{'\u2192'}</span>}
                <div
                  className={`proj-hseq-item ${dragIdx === i ? 'proj-hseq-dragging' : ''}`}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== i) {
                      const next = [...project.componentIds]
                      const [moved] = next.splice(dragIdx, 1)
                      next.splice(i, 0, moved)
                      reorderComponents(project.path, next)
                    }
                    setDragIdx(null)
                  }}
                  onDragEnd={() => setDragIdx(null)}
                >
                  <span className="proj-hseq-num">{i + 1}</span>
                  <span className="proj-hseq-name">{c.title}</span>
                  <button className="proj-hseq-remove" onClick={() => unassignComponent(project.path, c.id)}>{'\u2715'}</button>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Preview Snippet */}
      <div className="proj-section">
        <div className="proj-section-header">Preview</div>
        {(() => {
          const allPreview = [...globalHead, ...seq, ...globalTail]
          return allPreview.length === 0 ? (
            <div className="proj-preview-snippet proj-preview-empty">Add components to see a preview</div>
          ) : (
            <div className="proj-preview-snippet">
              {allPreview.slice(0, 4).map((c, i) => (
                <div key={`${c.id}-${i}`} className="proj-preview-chunk">
                  <span className="proj-preview-chunk-num">{i + 1}</span>
                  <span className="proj-preview-chunk-title">{c.globalHead ? '\u2606Head' : c.globalTail ? '\u2606Tail' : c.title}</span>
                  <span className="proj-preview-chunk-text">{c.content.replace(/\n/g, ' ').slice(0, 120)}</span>
                </div>
              ))}
              {allPreview.length > 4 && <div className="proj-preview-more">+ {allPreview.length - 4} more components...</div>}
            </div>
          )
        })()}
      </div>

      {/* Agents by Category */}
      <div className="proj-section">
        <div className="proj-section-header">
          Target Agents
          <span className="proj-section-count">({project.agents.length})</span>
          <div className="proj-section-actions">
            <button className="proj-mini-btn" onClick={() => setProjectAgents(project.path, AGENTS.map((a) => a.id))}>All</button>
            <button className="proj-mini-btn" onClick={() => setProjectAgents(project.path, [])}>None</button>
          </div>
        </div>

        {/* Pinned Agents */}
        {pinnedAgentIds.length > 0 && (
          <div className="proj-pinned-section">
            <div className="proj-pinned-header">Pinned</div>
            <div className="proj-pinned-grid">
              {pinnedAgentIds.map((id) => {
                const a = AGENTS.find((x) => x.id === id)
                if (!a) return null
                return (
                  <label key={a.id} className={`proj-agent proj-agent-pinned ${project.agents.includes(a.id) ? 'proj-agent-on' : ''}`}>
                    <input type="checkbox" checked={project.agents.includes(a.id)}
                      onChange={() => setProjectAgents(project.path, project.agents.includes(a.id) ? project.agents.filter((x) => x !== a.id) : [...project.agents, a.id])} />
                    <span className="proj-agent-name">{a.name}</span>
                    <span className="proj-agent-path">{a.outputFile}</span>
                    <button className="proj-agent-star proj-agent-star-on" onClick={(e) => { e.preventDefault(); togglePinAgent(a.id) }} title="Unpin">★</button>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="proj-cat-grid">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="proj-agent-cat">
              <div className="proj-agent-cat-header" onClick={() => toggleAgentCat(cat)}>
                <span className="proj-agent-cat-arrow">{agentCatOpen.has(cat) ? '\u25BC' : '\u25B6'}</span>
                <span className="proj-agent-cat-name">{cat}</span>
                <span className="proj-agent-cat-count">{AGENTS_BY_CATEGORY[cat].length}</span>
              </div>
              {agentCatOpen.has(cat) && (
                <div className="proj-agent-cat-items">
                  {AGENTS_BY_CATEGORY[cat].map((a) => (
                    <label key={a.id} className={`proj-agent ${project.agents.includes(a.id) ? 'proj-agent-on' : ''}`}>
                      <input type="checkbox" checked={project.agents.includes(a.id)}
                        onChange={() => setProjectAgents(project.path, project.agents.includes(a.id) ? project.agents.filter((x) => x !== a.id) : [...project.agents, a.id])} />
                      <span className="proj-agent-name">{a.name}</span>
                      <span className="proj-agent-path">{a.outputFile}</span>
                      <button className={`proj-agent-star ${pinnedAgentIds.includes(a.id) ? 'proj-agent-star-on' : ''}`} onClick={(e) => { e.preventDefault(); togglePinAgent(a.id) }} title={pinnedAgentIds.includes(a.id) ? 'Unpin' : 'Pin'}>
                        {pinnedAgentIds.includes(a.id) ? '★' : '☆'}
                      </button>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
