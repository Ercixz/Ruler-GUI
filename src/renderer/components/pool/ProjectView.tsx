import React from 'react'
import { useAppStore } from '@/store/appStore'
import { AGENTS, AGENTS_BY_CATEGORY, CATEGORIES } from '@/constants/agents'
import { addToast } from '@/components/common/Toast'
import type { Component } from '@/store/appStore'

export function ProjectView(): React.ReactElement {
  const { projects, activeProjectPath, components, assignComponent, unassignComponent, reorderComponents, setProjectAgents } = useAppStore()
  const project = projects.find((p) => p.path === activeProjectPath)

  if (!project) {
    return <div className="proj-empty-state"><p>Add a project folder to get started</p></div>
  }

  const seq = project.componentIds.map((id) => components.find((c) => c.id === id)).filter(Boolean) as Component[]
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) assignComponent(project.path, id) }

  const getPreview = () => seq.length === 0 ? '# No components' : seq.map((c, i) => `<!-- ${i + 1}. ${c.title} -->\n\n${c.content}`).join('\n\n---\n\n')

  const handleApply = async () => {
    const rd = `${project.path}/.ruler`; const ap = `${rd}/AGENTS.md`
    if (!(await window.rulerApi.file.exists(rd))) await window.rulerApi.ruler.init(project.path)
    await window.rulerApi.file.write(ap, getPreview())
    if (project.agents.length > 0) {
      const tp = `${rd}/ruler.toml`; const r = await window.rulerApi.toml.read(tp)
      const ac: Record<string, { enabled: boolean }> = {}
      for (const a of project.agents) ac[a] = { enabled: true }
      await window.rulerApi.toml.write(tp, { ...(r.data || {}), agents: ac })
    }
    await window.rulerApi.ruler.apply(project.path, { agents: project.agents })
    addToast('success', `Applied to ${project.name}`)
  }

  const [dragIdx, setDragIdx] = React.useState<number | null>(null)
  const [agentCatOpen, setAgentCatOpen] = React.useState<Set<string>>(new Set(CATEGORIES))
  const toggleAgentCat = (cat: string) => setAgentCatOpen((prev) => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })

  return (
    <div className="proj-view">
      <div className="proj-view-header">
        <div>
          <h1 className="proj-view-title">{project.name}</h1>
          <div className="proj-view-path">{project.path}</div>
        </div>
        <button className="proj-btn" onClick={handleApply} disabled={seq.length === 0}>Apply Rules</button>
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
        {seq.length === 0 ? (
          <div className="proj-preview-snippet proj-preview-empty">Add components to see a preview</div>
        ) : (
          <div className="proj-preview-snippet">
            {seq.slice(0, 3).map((c, i) => (
              <div key={c.id} className="proj-preview-chunk">
                <span className="proj-preview-chunk-num">{i + 1}</span>
                <span className="proj-preview-chunk-title">{c.title}</span>
                <span className="proj-preview-chunk-text">{c.content.replace(/\n/g, ' ').slice(0, 120)}</span>
              </div>
            ))}
            {seq.length > 3 && <div className="proj-preview-more">+ {seq.length - 3} more components...</div>}
          </div>
        )}
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
        <div className="proj-agent-cats">
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
