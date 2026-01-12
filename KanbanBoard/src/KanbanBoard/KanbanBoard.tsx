import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { ColumnId, KanbanState } from './types'
import { initialKanbanState } from './mockData'
import { Column } from './Column'
import './kanban.css'

export type KanbanBoardProps = {
  initialState?: KanbanState
}

function createId(prefix: string) {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2)
  return `${prefix}-${rnd}`
}

function isColumnId(value: unknown): value is ColumnId {
  return value === 'todo' || value === 'inProgress' || value === 'done'
}

function findContainer(state: KanbanState, id: string): ColumnId | null {
  if (isColumnId(id) && state.columnCardIds[id]) return id
  const columns = Object.keys(state.columnCardIds) as ColumnId[]
  for (const colId of columns) {
    if (state.columnCardIds[colId].includes(id)) return colId
  }
  return null
}

export function KanbanBoard({ initialState = initialKanbanState }: KanbanBoardProps) {
  const [state, setState] = useState<KanbanState>(initialState)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [autoEditCardId, setAutoEditCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeCardTitle = useMemo(() => {
    if (!activeCardId) return null
    return state.cardsById[activeCardId]?.title ?? null
  }, [activeCardId, state.cardsById])

  const addCard = (columnId: ColumnId) => {
    const id = createId('c')
    setState((prev) => ({
      ...prev,
      cardsById: { ...prev.cardsById, [id]: { id, title: 'New card' } },
      columnCardIds: {
        ...prev.columnCardIds,
        [columnId]: [...prev.columnCardIds[columnId], id],
      },
    }))
    setAutoEditCardId(id)
  }

  const deleteCard = (cardId: string) => {
    setState((prev) => {
      const container = findContainer(prev, cardId)
      if (!container) return prev

      const nextCards = { ...prev.cardsById }
      delete nextCards[cardId]

      return {
        ...prev,
        cardsById: nextCards,
        columnCardIds: {
          ...prev.columnCardIds,
          [container]: prev.columnCardIds[container].filter((id) => id !== cardId),
        },
      }
    })
  }

  const updateCardTitle = (cardId: string, nextTitle: string) => {
    setState((prev) => ({
      ...prev,
      cardsById: {
        ...prev.cardsById,
        [cardId]: { ...prev.cardsById[cardId], title: nextTitle },
      },
    }))
  }

  const moveBetweenColumns = (
    prev: KanbanState,
    activeId: string,
    overId: string,
  ): KanbanState => {
    const activeContainer = findContainer(prev, activeId)
    const overContainer = findContainer(prev, overId)
    if (!activeContainer || !overContainer) return prev

    if (activeContainer === overContainer) return prev

    const source = prev.columnCardIds[activeContainer]
    const dest = prev.columnCardIds[overContainer]

    const sourceIndex = source.indexOf(activeId)
    const without = source.filter((id) => id !== activeId)

    const insertIndex = isColumnId(overId) ? dest.length : Math.max(0, dest.indexOf(overId))
    const nextDest = [...dest.slice(0, insertIndex), activeId, ...dest.slice(insertIndex)]

    if (sourceIndex === -1) return prev

    return {
      ...prev,
      columnCardIds: {
        ...prev.columnCardIds,
        [activeContainer]: without,
        [overContainer]: nextDest,
      },
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id)
    setActiveCardId(id)
    setAutoEditCardId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCardId(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    setState((prev) => {
      const activeContainer = findContainer(prev, activeId)
      const overContainer = findContainer(prev, overId)
      if (!activeContainer || !overContainer) return prev

      if (activeContainer !== overContainer) {
        return moveBetweenColumns(prev, activeId, overId)
      }

      const items = prev.columnCardIds[activeContainer]
      const oldIndex = items.indexOf(activeId)
      const newIndex = isColumnId(overId) ? items.length - 1 : items.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev

      return {
        ...prev,
        columnCardIds: {
          ...prev.columnCardIds,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        },
      }
    })
  }

  return (
    <div className="kb-shell">
      <div className="kb-header">
        <div>
          <h2 className="kb-title">Kanban Board</h2>
          <p className="kb-subtitle">
            Add/delete cards, drag &amp; drop between columns, inline edit titles
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kb-board">
          <SortableContext items={state.columns.map((c) => c.id)}>
            {state.columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                cardIds={state.columnCardIds[col.id]}
                cardsById={state.cardsById}
                autoEditCardId={autoEditCardId}
                onAddCard={addCard}
                onDeleteCard={deleteCard}
                onUpdateCardTitle={updateCardTitle}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeCardTitle ? (
            <div className="kb-card" style={{ maxWidth: 360 }}>
              <p className="kb-cardTitle">{activeCardTitle}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}


