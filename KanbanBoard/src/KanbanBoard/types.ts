export type ColumnId = 'todo' | 'inProgress' | 'done'

export type KanbanColumn = {
  id: ColumnId
  title: string
}

export type KanbanCard = {
  id: string
  title: string
}

export type KanbanState = {
  columns: KanbanColumn[]
  cardsById: Record<string, KanbanCard>
  columnCardIds: Record<ColumnId, string[]>
}


