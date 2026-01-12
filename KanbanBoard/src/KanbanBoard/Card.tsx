import { useEffect, useMemo, useRef, useState } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { KanbanCard } from './types'

type CardProps = {
  card: KanbanCard
  autoEdit?: boolean
  onDelete: (cardId: string) => void
  onUpdateTitle: (cardId: string, nextTitle: string) => void
}

export function Card({ card, autoEdit, onDelete, onUpdateTitle }: CardProps) {
  const [isEditing, setIsEditing] = useState(Boolean(autoEdit))
  const [draft, setDraft] = useState(card.title)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
    }),
    [transform, transition, isDragging],
  )

  useEffect(() => {
    if (!isEditing) return
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }, [isEditing])

  useEffect(() => {
    setDraft(card.title)
  }, [card.title])

  const commit = () => {
    const next = draft.trim()
    if (next.length === 0) {
      setDraft(card.title)
      setIsEditing(false)
      return
    }
    if (next !== card.title) onUpdateTitle(card.id, next)
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(card.title)
    setIsEditing(false)
  }

  return (
    <div ref={setNodeRef} className="kb-card" style={style}>
      <div>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="kb-cardTitleEdit"
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                commit()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                cancel()
              }
            }}
          />
        ) : (
          <p className="kb-cardTitle" onDoubleClick={() => setIsEditing(true)}>
            {card.title}
          </p>
        )}
      </div>

      <div className="kb-cardActions">
        <button
          ref={setActivatorNodeRef}
          className="kb-iconBtn"
          type="button"
          title="Drag"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>

        <button
          className="kb-iconBtn kb-iconBtnDanger"
          type="button"
          title="Delete"
          onClick={() => onDelete(card.id)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}


