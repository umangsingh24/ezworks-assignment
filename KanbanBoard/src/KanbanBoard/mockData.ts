import type { KanbanState } from './types'

export const initialKanbanState: KanbanState = {
  columns: [
    { id: 'todo', title: 'Todo' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ],
  cardsById: {
    'c-1': { id: 'c-1', title: 'Create initial project plan' },
    'c-2': { id: 'c-2', title: 'Design landing page' },
    'c-3': { id: 'c-3', title: 'Review codebase structure' },
    'c-4': { id: 'c-4', title: 'Implement authentication' },
    'c-5': { id: 'c-5', title: 'Set up database schema' },
    'c-6': { id: 'c-6', title: 'Fix navbar bugs' },
    'c-7': { id: 'c-7', title: 'Organize project repository' },
    'c-8': { id: 'c-8', title: 'Write API documentation' },
  },
  columnCardIds: {
    todo: ['c-1', 'c-2', 'c-3'],
    inProgress: ['c-4', 'c-5', 'c-6'],
    done: ['c-7', 'c-8'],
  },
}
