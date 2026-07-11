import React, { useState } from 'react'
import type { FileInfo } from '@shared/types'

interface FileTreeProps {
  files: FileInfo[]
  selectedPath: string | null
  onSelect: (file: FileInfo) => void
  onContextMenu: (e: React.MouseEvent, file: FileInfo) => void
  unsavedFiles?: Set<string>
}

interface TreeNode extends FileInfo {
  children: TreeNode[]
  depth: number
}

function buildTree(files: FileInfo[]): TreeNode[] {
  const dirs = new Map<string, TreeNode>()

  for (const file of files) {
    const node: TreeNode = { ...file, children: [], depth: 0 }
    dirs.set(file.path, node)
  }

  for (const file of files) {
    const dirPath = file.path.substring(0, file.path.lastIndexOf(file.name) - 1)
    const parent = dirs.get(dirPath)
    if (parent) {
      parent.children.push(dirs.get(file.path)!)
    }
  }

  const roots: TreeNode[] = []
  for (const file of files) {
    const dirPath = file.path.substring(0, file.path.lastIndexOf(file.name) - 1)
    if (!dirs.has(dirPath)) {
      const node = dirs.get(file.path)!
      node.depth = 0
      roots.push(node)
    }
  }

  const setDepth = (nodes: TreeNode[], depth: number): void => {
    for (const node of nodes) {
      node.depth = depth
      setDepth(node.children, depth + 1)
    }
  }
  setDepth(roots, 0)

  return roots
}

function TreeNodeComponent({
  node,
  selectedPath,
  onSelect,
  onContextMenu,
  unsavedFiles
}: {
  node: TreeNode
  selectedPath: string | null
  onSelect: (file: FileInfo) => void
  onContextMenu: (e: React.MouseEvent, file: FileInfo) => void
  unsavedFiles?: Set<string>
}): React.ReactElement {
  const [expanded, setExpanded] = useState(node.depth < 2)
  const hasChildren = node.children.length > 0

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    } else {
      onSelect(node)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e, node)
  }

  return (
    <>
      <div
        className={`tree-node ${selectedPath === node.path ? 'tree-node-selected' : ''}`}
        style={{ paddingLeft: 12 + node.depth * 16 }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {hasChildren ? (
          <span className={`tree-arrow ${expanded ? 'tree-arrow-open' : ''}`}>{'\u25B6'}</span>
        ) : (
          <span className="tree-arrow tree-arrow-empty" />
        )}
        <span className="tree-icon">{hasChildren ? '\uD83D\uDCC1' : '\uD83D\uDCC4'}</span>
        <span className="tree-name">{node.name}</span>
        {unsavedFiles?.has(node.path) && <span className="tree-unsaved-dot" />}
      </div>
      {hasChildren && expanded &&
        node.children.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              unsavedFiles={unsavedFiles}
            />
        ))}
    </>
  )
}

export function FileTree({
  files,
  selectedPath,
  onSelect,
  onContextMenu,
  unsavedFiles
}: FileTreeProps): React.ReactElement {
  const tree = buildTree(files)

  if (tree.length === 0) {
    return <div className="tree-empty">No files</div>
  }

  return (
    <div className="file-tree">
      {tree.map((node) => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            selectedPath={selectedPath}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
            unsavedFiles={unsavedFiles}
          />
      ))}
    </div>
  )
}
