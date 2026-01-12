import type { DragEvent, MouseEvent } from 'react'
import type { TreeNode } from './types'

type Props = {
  node: TreeNode
  depth: number
  isExpanded: boolean
  isLoading: boolean
  isEditing: boolean
  editDraft: string
  dropHint?: 'before' | 'after' | 'inside'
  onToggleExpand: () => void
  onStartEdit: () => void
  onChangeEditDraft: (next: string) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onAddChild: () => void
  onRemove: () => void
  onDragStart: (e: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
}

function avatarColor(depth: number): string {
  const palette = ['#3B82F6', '#22C55E', '#A855F7', '#F97316', '#14B8A6', '#EF4444']
  return palette[depth % palette.length]
}

export function TreeNodeRow({
  node,
  depth,
  isExpanded,
  isLoading,
  isEditing,
  editDraft,
  dropHint,
  onToggleExpand,
  onStartEdit,
  onChangeEditDraft,
  onCommitEdit,
  onCancelEdit,
  onAddChild,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: Props) {
  const hasChevron = Boolean(node.lazy || (node.children && node.children.length > 0))
  const letter = (node.name.trim()[0] ?? '?').toUpperCase()

  const onRowDoubleClick = (e: MouseEvent) => {
    // Avoid double-click triggering during drag gestures.
    if (e.detail > 1) onStartEdit()
  }

  return (
    <div
      className={[
        'tv-row',
        dropHint ? `tv-row--drop-${dropHint}` : '',
        isLoading ? 'tv-row--loading' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDoubleClick={onRowDoubleClick}
    >
      <button
        type="button"
        className="tv-expander"
        aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
        disabled={!hasChevron}
        onClick={onToggleExpand}
      >
        {hasChevron ? (isExpanded ? '−' : '+') : ''}
      </button>

      <div className="tv-card">
        <div className="tv-avatar" style={{ background: avatarColor(depth) }}>
          {letter}
        </div>

        <div className="tv-title">
          {isEditing ? (
            <input
              className="tv-input"
              autoFocus
              value={editDraft}
              onChange={(e) => onChangeEditDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              onBlur={onCommitEdit}
            />
          ) : (
            <span className="tv-name">{node.name}</span>
          )}
        </div>

        <div className="tv-actions">
          <button type="button" className="tv-action" onClick={onAddChild} aria-label="Add child">
            +
          </button>
          <button type="button" className="tv-action" onClick={onStartEdit} aria-label="Edit name">
            ✎
          </button>
          <button type="button" className="tv-action tv-action--danger" onClick={onRemove} aria-label="Delete node">
            ×
          </button>
        </div>
      </div>
    </div>
  )
}


