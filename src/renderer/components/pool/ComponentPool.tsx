import React from 'react'
import { useAppStore, genId } from '@/store/appStore'

export function ComponentPool(): React.ReactElement {
  const { components, addComponent, removeComponent, editingComponentId, setEditingComponent, updateComponent, projects } = useAppStore()
  const [newTitle, setNewTitle] = React.useState('')
  const [newCategory, setNewCategory] = React.useState('')
  const [catOpen, setCatOpen] = React.useState<Set<string>>(new Set())

  const editing = components.find((c) => c.id === editingComponentId)

  const grouped = new Map<string, typeof components>()
  for (const c of components) {
    const cat = c.category || 'Uncategorized'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(c)
  }
  for (const cat of grouped.keys()) {
    if (!catOpen.has(cat)) setCatOpen((prev) => new Set([...prev, cat]))
  }

  const handleAdd = () => {
    const title = newTitle.trim() || 'Untitled'
    const cat = newCategory.trim() || 'Uncategorized'
    addComponent({ id: genId(), title, content: `## ${title}\n\n`, category: cat, globalPosition: 'none' })
    setNewTitle('')
    setNewCategory('')
    setCatOpen((prev) => new Set([...prev, cat]))
  }

  const toggleCat = (cat: string) => {
    setCatOpen((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  return (
    <div className="pool">
      <div className="pool-header">
        <span className="pool-title">Components</span>
      </div>

      <div className="pool-add-bar">
        <input className="pool-add-input" placeholder="Title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }} />
        <input className="pool-add-input" placeholder="Category..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }} style={{ flex: '0 0 90px' }} />
        <button className="pool-add-btn" onClick={handleAdd}>+</button>
      </div>

      {editing && (
        <div className="pool-editor-panel">
          <div className="pool-editor-header">
            <input className="pool-editor-title" value={editing.title} onChange={(e) => updateComponent(editing.id, { title: e.target.value })} />
            <button className="pool-editor-close" onClick={() => setEditingComponent(null)}>{'\u2715'}</button>
          </div>
          <textarea className="pool-editor-textarea" value={editing.content} onChange={(e) => updateComponent(editing.id, { content: e.target.value })} />
          <div className="pool-editor-meta">
            <div className="pool-editor-meta-row">
              <span className="pool-editor-meta-label">Category</span>
              <span className="pool-editor-meta-value">{editing.category}</span>
            </div>
            <div className="pool-editor-meta-row">
              <span className="pool-editor-meta-label">Global</span>
              <span className="pool-editor-meta-value">{editing.globalPosition === 'none' ? 'Off' : editing.globalPosition === 'head' ? 'Before all projects' : 'After all projects'}</span>
            </div>
            {(() => {
              const refs = projects.filter((p) => p.componentIds.includes(editing.id))
              if (refs.length === 0) return null
              return (
                <div className="pool-editor-meta-row pool-editor-refs">
                  <span className="pool-editor-meta-label">Used in</span>
                  <div className="pool-editor-refs-list">
                    {refs.map((p) => {
                      const idx = p.componentIds.indexOf(editing.id)
                      return (
                        <span key={p.path} className="pool-editor-ref">
                          {p.name} <span className="pool-editor-ref-pos">#{idx + 1}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      <div className="pool-body">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <div key={cat} className="pool-group">
            <div className="pool-group-header" onClick={() => toggleCat(cat)}>
              <span className="pool-group-arrow">{catOpen.has(cat) ? '\u25BC' : '\u25B6'}</span>
              <span className="pool-group-name">{cat}</span>
              <span className="pool-group-count">{items.length}</span>
            </div>
            {catOpen.has(cat) && (
              <div className="pool-group-items">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className={`pool-card ${editingComponentId === c.id ? 'pool-card-editing' : ''}`}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('text/plain', c.id) }}
                    onClick={() => setEditingComponent(c.id)}
                  >
                    <div className="pool-card-title">{c.title}</div>
                    <div className="pool-card-preview">{c.content.slice(0, 80).replace(/\n/g, ' ')}</div>
                    <button className={`pool-card-global ${c.globalPosition !== 'none' ? 'pool-card-global-on' : ''}`} onClick={(e) => { e.stopPropagation(); const next = c.globalPosition === 'none' ? 'head' : c.globalPosition === 'head' ? 'tail' : 'none'; updateComponent(c.id, { globalPosition: next }) }} title={`Global: ${c.globalPosition === 'none' ? 'Off' : c.globalPosition}`}>
                      {c.globalPosition === 'tail' ? '\u2726' : c.globalPosition === 'head' ? '\u2605' : '\u2606'}
                    </button>
                    <button className="pool-card-del" onClick={(e) => { e.stopPropagation(); removeComponent(c.id) }}>{'\u2715'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {components.length === 0 && <div className="pool-empty">No components yet.<br/>Type a title and press Enter.</div>}
      </div>
    </div>
  )
}
