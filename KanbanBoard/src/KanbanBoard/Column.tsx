import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnId, KanbanCard, KanbanColumn } from './types'
import { Card } from './Card'

type ColumnProps = {
  column: KanbanColumn
  cardIds: string[]
  cardsById: Record<string, KanbanCard>
  autoEditCardId?: string | null
  onAddCard: (columnId: ColumnId) => void
  onDeleteCard: (cardId: string) => void
  onUpdateCardTitle: (cardId: string, nextTitle: string) => void
}

export function Column({
  column,
  cardIds,
  cardsById,
  autoEditCardId,
  onAddCard,
  onDeleteCard,
  onUpdateCardTitle,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <section
      ref={setNodeRef}
      className="kb-column"
      style={{
        outline: isOver ? '2px solid rgba(100, 108, 255, 0.55)' : 'none',
        outlineOffset: 2,
      }}
    >
      <header className="kb-columnHeader">
        <div className="kb-columnTitleRow">
          <strong>{column.title}</strong>
          <span className="kb-badge">{cardIds.length}</span>
        </div>

        <button className="kb-btn" type="button" onClick={() => onAddCard(column.id)}>
          + Add Card
        </button>
      </header>

      <div className="kb-list">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cardIds.length === 0 ? (
            <div className="kb-emptyHint">Drop a card here</div>
          ) : (
            cardIds.map((cardId) => (
              <Card
                key={cardId}
                card={cardsById[cardId]}
                autoEdit={autoEditCardId === cardId}
                onDelete={onDeleteCard}
                onUpdateTitle={onUpdateCardTitle}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}


