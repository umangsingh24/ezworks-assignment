import { useMemo, useState } from 'react'
import { TreeView } from './components/TreeView/TreeView'
import type { TreeNode } from './components/TreeView/types'
import { createMockTree, mockLoadChildren } from './mock/treeApi'

export function App() {
  const initial = useMemo(() => createMockTree(), [])
  const [nodes, setNodes] = useState<TreeNode[]>(initial)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Tree View</h1>
          <p className="app-subtitle">
            Expand/collapse, add/edit/delete, drag & drop, lazy loading
          </p>
        </div>
      </header>

      <main className="app-main">
        <TreeView value={nodes} onChange={setNodes} loadChildren={mockLoadChildren} />
      </main>
    </div>
  )
}

