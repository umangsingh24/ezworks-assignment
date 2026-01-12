import type { TreeNode, TreeNodeId } from '../components/TreeView/types'
import { createId } from '../components/TreeView/treeUtils'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function makeChildren(seed: string, count: number, depth: number): TreeNode[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const base = seed.toUpperCase().slice(0, 1) || 'N'
  return Array.from({ length: count }).map((_, i) => {
    const name = `Level ${letters[(depth + i) % letters.length]}`
    const lazy = depth < 3 && i % 2 === 0
    return {
      id: createId(),
      name: `${base}-${i + 1} ${name}`,
      lazy,
      children: lazy ? undefined : [],
    }
  })
}

export function createMockTree(): TreeNode[] {
  return [
    {
      id: createId(),
      name: 'A',
      lazy: true,
    },
    {
      id: createId(),
      name: 'B',
      children: [
        { id: createId(), name: 'C', lazy: true },
        { id: createId(), name: 'C-2', children: [{ id: createId(), name: 'D' }] },
      ],
    },
    {
      id: createId(),
      name: 'B-2',
      lazy: true,
    },
  ]
}

export async function mockLoadChildren(nodeId: TreeNodeId): Promise<TreeNode[]> {
  // Simulate an API call with jitter.
  const ms = 450 + Math.round(Math.random() * 650)
  await delay(ms)

  const count = 2 + (nodeId.charCodeAt(0) % 3)
  const depth = 1 + (nodeId.charCodeAt(nodeId.length - 1) % 4)
  return makeChildren(nodeId, count, depth)
}


