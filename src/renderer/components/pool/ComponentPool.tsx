import React from 'react'
import { useAppStore, genId } from '@/store/appStore'

export function ComponentPool(): React.ReactElement {
  const { components, addComponent, removeComponent, editingComponentId, setEditingComponent, updateComponent } = useAppStore()
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
    addComponent({ id: genId(), title, content: `## ${title}\n\n`, category: cat })
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
