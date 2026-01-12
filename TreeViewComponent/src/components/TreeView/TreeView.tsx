import type { DragEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TreeNodeRow } from './TreeNodeRow'
import type { DropDestination, TreeNode, TreeNodeId } from './types'
import { createId, findNode, moveNode, removeNode, updateNode } from './treeUtils'

type TreeViewProps = {
  value?: TreeNode[]
  defaultValue?: TreeNode[]
  onChange?: (next: TreeNode[]) => void
  loadChildren?: (nodeId: TreeNodeId) => Promise<TreeNode[]>
}

type DropHint = { targetId: TreeNodeId; hint: 'before' | 'after' | 'inside' } | null

export function TreeView({ value, defaultValue, onChange, loadChildren }: TreeViewProps) {
  const [internal, setInternal] = useState<TreeNode[]>(defaultValue ?? [])
  const nodes = value ?? internal
  const nodesRef = useRef(nodes)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  const setNodes = useCallback(
    (next: TreeNode[]) => {
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
    [onChange, value],
  )

  const [expanded, setExpanded] = useState<Set<TreeNodeId>>(() => new Set())
  const [loading, setLoading] = useState<Set<TreeNodeId>>(() => new Set())
  const [editingId, setEditingId] = useState<TreeNodeId | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [addingChildToId, setAddingChildToId] = useState<TreeNodeId | null>(null)
  const [childDraft, setChildDraft] = useState('')
  const [isAddingRoot, setIsAddingRoot] = useState(false)
  const [rootDraft, setRootDraft] = useState('')

  const [draggingId, setDraggingId] = useState<TreeNodeId | null>(null)
  const [dropHint, setDropHint] = useState<DropHint>(null)
  const [activeListDrop, setActiveListDrop] = useState<TreeNodeId | null>(null)

  const isExpanded = useCallback((id: TreeNodeId) => expanded.has(id), [expanded])
  const isLoading = useCallback((id: TreeNodeId) => loading.has(id), [loading])

  const commitEdit = useCallback(() => {
    if (!editingId) return
    const nextName = editDraft.trim()
    if (!nextName) {
      setEditingId(null)
      return
    }
    setNodes(updateNode(nodesRef.current, editingId, (n) => ({ ...n, name: nextName })))
    setEditingId(null)
  }, [editDraft, editingId, setNodes])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const startEdit = useCallback(
    (id: TreeNodeId) => {
      const node = findNode(nodesRef.current, id)
      if (!node) return
      setEditingId(id)
      setEditDraft(node.name)
    },
    [],
  )

  const ensureExpanded = useCallback((id: TreeNodeId) => {
    setExpanded((prev) => new Set(prev).add(id))
  }, [])

  const toggleExpand = useCallback(
    async (id: TreeNodeId) => {
      const next = new Set(expanded)
      const currentlyExpanded = next.has(id)
      if (currentlyExpanded) {
        next.delete(id)
        setExpanded(next)
        return
      }

      next.add(id)
      setExpanded(next)

      const node = findNode(nodesRef.current, id)
      if (!node) return
      if (!node.lazy || node.children !== undefined) return

      setLoading((prev) => new Set(prev).add(id))
      try {
        const loader = loadChildren ?? (async () => [])
        const loadedChildren = await loader(id)
        setNodes(
          updateNode(nodesRef.current, id, (n) => ({
            ...n,
            lazy: false,
            children: loadedChildren,
          })),
        )
      } finally {
        setLoading((prev) => {
          const s = new Set(prev)
          s.delete(id)
          return s
        })
      }
    },
    [expanded, loadChildren, setNodes],
  )

  const beginAddChild = useCallback(
    (parentId: TreeNodeId) => {
      setIsAddingRoot(false)
      setAddingChildToId(parentId)
      setChildDraft('')
      ensureExpanded(parentId)
    },
    [ensureExpanded],
  )

  const commitAddChild = useCallback(() => {
    if (!addingChildToId) return
    const name = childDraft.trim()
    if (!name) {
      setAddingChildToId(null)
      return
    }

    const child: TreeNode = { id: createId(), name }
    setNodes(
      updateNode(nodesRef.current, addingChildToId, (p) => ({
        ...p,
        lazy: false,
        children: [...(p.children ?? []), child],
      })),
    )
    setAddingChildToId(null)
  }, [addingChildToId, childDraft, setNodes])

  const cancelAddChild = useCallback(() => {
    setAddingChildToId(null)
  }, [])

  const remove = useCallback(
    (id: TreeNodeId) => {
      const current = nodesRef.current
      const node = findNode(current, id)
      const label = node ? `"${node.name}"` : 'this node'
      if (!window.confirm(`Delete ${label} and all its children?`)) return

      const res = removeNode(current, id)
      if (res.removed) setNodes(res.tree)
      setEditingId((prev) => (prev === id ? null : prev))
      setAddingChildToId((prev) => (prev === id ? null : prev))
      setExpanded((prev) => {
        const s = new Set(prev)
        s.delete(id)
        return s
      })
    },
    [setNodes],
  )

  const computeDropPosition = (e: DragEvent<HTMLElement>): 'before' | 'after' | 'inside' => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const third = rect.height / 3
    if (y < third) return 'before'
    if (y > 2 * third) return 'after'
    return 'inside'
  }

  const readDraggedId = (e: DragEvent): TreeNodeId | null => {
    const dt = e.dataTransfer.getData('application/x-tree-node') || e.dataTransfer.getData('text/plain')
    return dt || draggingId
  }

  const applyMove = useCallback(
    (draggedId: TreeNodeId, dest: DropDestination) => {
      if (!draggedId) return
      setNodes(moveNode(nodesRef.current, draggedId, dest))
    },
    [setNodes],
  )

  const onDropOnNode = useCallback(
    (targetId: TreeNodeId, e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const draggedId = readDraggedId(e)
      if (!draggedId || draggedId === targetId) return

      const pos = computeDropPosition(e)
      applyMove(draggedId, { type: 'node', targetId, position: pos })
      setDropHint(null)
      setActiveListDrop(null)
      setDraggingId(null)
    },
    [applyMove],
  )

  const onDropOnList = useCallback(
    (parentId: TreeNodeId | null, e: DragEvent<HTMLUListElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const draggedId = readDraggedId(e)
      if (!draggedId) return

      applyMove(draggedId, { type: 'list', parentId })
      setDropHint(null)
      setActiveListDrop(null)
      setDraggingId(null)
    },
    [applyMove],
  )

  const renderList = useCallback(
    (list: TreeNode[], parentId: TreeNodeId | null, depth: number) => {
      return (
        <ul
          className={['tv-list', depth === 0 ? 'tv-list--root' : ''].filter(Boolean).join(' ')}
          onDragOver={(e) => {
            e.preventDefault()
            setActiveListDrop(parentId)
            setDropHint(null)
          }}
          onDragLeave={() => setActiveListDrop((prev) => (prev === parentId ? null : prev))}
          onDrop={(e) => onDropOnList(parentId, e)}
        >
          {parentId !== null && addingChildToId === parentId && (
            <li className="tv-item">
              <div className="tv-addRow">
                <input
                  className="tv-input"
                  autoFocus
                  placeholder="New node name…"
                  value={childDraft}
                  onChange={(e) => setChildDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAddChild()
                    if (e.key === 'Escape') cancelAddChild()
                  }}
                  onBlur={commitAddChild}
                />
                <button type="button" className="tv-action" onMouseDown={(e) => e.preventDefault()} onClick={commitAddChild}>
                  Add
                </button>
                <button
                  type="button"
                  className="tv-action tv-action--secondary"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cancelAddChild}
                >
                  Cancel
                </button>
              </div>
            </li>
          )}

          {list.map((node) => {
            const expandedNow = isExpanded(node.id)
            const hint = dropHint?.targetId === node.id ? dropHint.hint : undefined
            return (
              <li key={node.id} className="tv-item">
                <TreeNodeRow
                  node={node}
                  depth={depth}
                  isExpanded={expandedNow}
                  isLoading={isLoading(node.id)}
                  isEditing={editingId === node.id}
                  editDraft={editingId === node.id ? editDraft : ''}
                  dropHint={hint}
                  onToggleExpand={() => void toggleExpand(node.id)}
                  onStartEdit={() => startEdit(node.id)}
                  onChangeEditDraft={setEditDraft}
                  onCommitEdit={commitEdit}
                  onCancelEdit={cancelEdit}
                  onAddChild={() => beginAddChild(node.id)}
                  onRemove={() => remove(node.id)}
                  onDragStart={(e) => {
                    setDraggingId(node.id)
                    e.dataTransfer.setData('application/x-tree-node', node.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setDropHint(null)
                    setActiveListDrop(null)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (draggingId === node.id) return
                    const pos = computeDropPosition(e)
                    setDropHint({ targetId: node.id, hint: pos })
                    setActiveListDrop(null)
                  }}
                  onDrop={(e) => onDropOnNode(node.id, e)}
                />

                {expandedNow && (
                  <div className="tv-children">
                    {isLoading(node.id) ? (
                      <div className="tv-loading">Loading…</div>
                    ) : (
                      renderList(node.children ?? [], node.id, depth + 1)
                    )}
                  </div>
                )}
              </li>
            )
          })}

          {depth === 0 && list.length === 0 && <li className="tv-empty">No nodes</li>}
        </ul>
      )
    },
    [
      addingChildToId,
      beginAddChild,
      cancelAddChild,
      cancelEdit,
      childDraft,
      commitAddChild,
      commitEdit,
      dropHint,
      editDraft,
      editingId,
      draggingId,
      isExpanded,
      isLoading,
      onDropOnList,
      onDropOnNode,
      remove,
      startEdit,
      toggleExpand,
    ],
  )

  return (
    <section className="tv">
      <div className="tv-toolbar">
        <div className="tv-toolbarLeft">
          <strong>Hierarchy</strong>
          <span className="tv-toolbarHint">Drag nodes to reorder or re-parent</span>
        </div>
        <div className="tv-toolbarRight">
          <button
            type="button"
            className="tv-primary"
            onClick={() => {
              setAddingChildToId(null)
              setChildDraft('')
              setIsAddingRoot((v) => !v)
              setRootDraft('')
            }}
          >
            Add root
          </button>
        </div>
      </div>

      {isAddingRoot && (
        <div className="tv-addRoot">
          <input
            className="tv-input"
            placeholder="New root node name…"
            value={rootDraft}
            onChange={(e) => setRootDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const name = rootDraft.trim()
                if (!name) return
                setNodes([...nodesRef.current, { id: createId(), name }])
                setRootDraft('')
                setIsAddingRoot(false)
              }
              if (e.key === 'Escape') {
                setRootDraft('')
                setIsAddingRoot(false)
              }
            }}
          />
          <button
            type="button"
            className="tv-action"
            onClick={() => {
              const name = rootDraft.trim()
              if (!name) return
              setNodes([...nodesRef.current, { id: createId(), name }])
              setRootDraft('')
              setIsAddingRoot(false)
            }}
          >
            Add
          </button>
        </div>
      )}

      <div className={['tv-canvas', activeListDrop !== null ? 'tv-canvas--drop' : ''].filter(Boolean).join(' ')}>
        {renderList(nodes, null, 0)}
      </div>
    </section>
  )
}


