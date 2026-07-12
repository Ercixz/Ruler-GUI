import React, { useEffect, useRef, useState } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

interface Props {
  value: string
}

export function MarkdownPreview({ value }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    try {
      const state = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          markdown(),
          syntaxHighlighting(defaultHighlightStyle),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.editable.of(false),
          EditorState.readOnly.of(true)
        ]
      })
      const view = new EditorView({ state, parent: containerRef.current })
      viewRef.current = view
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load preview')
    }
    return () => { viewRef.current?.destroy(); viewRef.current = null }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    try {
      const current = view.state.doc.toString()
      if (current !== value) {
        view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }, [value])

  if (error) {
    return <div className="proj-cm-editor" style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11 }}>{value || error}</div>
  }

  return <div ref={containerRef} className="proj-cm-editor" />
}
