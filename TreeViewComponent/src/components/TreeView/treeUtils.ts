import type { DropDestination, TreeNode, TreeNodeId } from './types'

export function createId(): string {
  // crypto.randomUUID is available in modern browsers; keep a safe fallback.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `node_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function findNode(nodes: TreeNode[], id: TreeNodeId): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function containsNode(root: TreeNode, id: TreeNodeId): boolean {
  if (root.id === id) return true
  for (const child of root.children ?? []) {
    if (containsNode(child, id)) return true
  }
  return false
}

export function updateNode(
  nodes: TreeNode[],
  id: TreeNodeId,
  updater: (node: TreeNode) => TreeNode,
): TreeNode[] {
  let changed = false
  const next = nodes.map((n) => {
    if (n.id === id) {
      changed = true
      return updater(n)
    }
    if (!n.children?.length) return n
    const nextChildren = updateNode(n.children, id, updater)
    if (nextChildren === n.children) return n
    changed = true
    return { ...n, children: nextChildren }
  })
  return changed ? next : nodes
}

export function removeNode(
  nodes: TreeNode[],
  id: TreeNodeId,
): { tree: TreeNode[]; removed: TreeNode | null } {
  let removed: TreeNode | null = null
  let changed = false

  const next: TreeNode[] = []
  for (const node of nodes) {
    if (node.id === id) {
      removed = node
      changed = true
      continue
    }

    if (!node.children?.length) {
      next.push(node)
      continue
    }

    const res = removeNode(node.children, id)
    if (res.removed) {
      removed = res.removed
      changed = true
      next.push({ ...node, children: res.tree })
    } else {
      next.push(node)
    }
  }

  return { tree: changed ? next : nodes, removed }
}

export function findParentInfo(
  nodes: TreeNode[],
  id: TreeNodeId,
  parentId: TreeNodeId | null = null,
): { parentId: TreeNodeId | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (n.id === id) return { parentId, index: i }
    if (n.children?.length) {
      const found = findParentInfo(n.children, id, n.id)
      if (found) return found
    }
  }
  return null
}

export function getChildren(nodes: TreeNode[], parentId: TreeNodeId | null): TreeNode[] {
  if (parentId === null) return nodes
  return findNode(nodes, parentId)?.children ?? []
}

export function insertNodeAt(
  nodes: TreeNode[],
  nodeToInsert: TreeNode,
  parentId: TreeNodeId | null,
  index: number,
): TreeNode[] {
  if (parentId === null) {
    const next = nodes.slice()
    const safeIndex = Math.max(0, Math.min(index, next.length))
    next.splice(safeIndex, 0, nodeToInsert)
    return next
  }

  return updateNode(nodes, parentId, (p) => {
    const nextChildren = (p.children ?? []).slice()
    const safeIndex = Math.max(0, Math.min(index, nextChildren.length))
    nextChildren.splice(safeIndex, 0, nodeToInsert)
    // If a node was marked lazy, inserting a child should make it loaded.
    return { ...p, lazy: false, children: nextChildren }
  })
}

export function moveNode(tree: TreeNode[], draggedId: TreeNodeId, dest: DropDestination): TreeNode[] {
  const removedRes = removeNode(tree, draggedId)
  const dragged = removedRes.removed
  if (!dragged) return tree

  // Prevent cycles: you can't move a node into itself or its descendants.
  if (dest.type === 'list' && dest.parentId && containsNode(dragged, dest.parentId)) return tree
  if (dest.type === 'node' && containsNode(dragged, dest.targetId)) return tree

  const treeWithout = removedRes.tree

  if (dest.type === 'list') {
    const siblings = getChildren(treeWithout, dest.parentId)
    return insertNodeAt(treeWithout, dragged, dest.parentId, siblings.length)
  }

  const targetInfo = findParentInfo(treeWithout, dest.targetId)
  if (!targetInfo) return tree

  if (dest.position === 'inside') {
    const children = getChildren(treeWithout, dest.targetId)
    return insertNodeAt(treeWithout, dragged, dest.targetId, children.length)
  }

  const targetSiblings = getChildren(treeWithout, targetInfo.parentId)
  const safeTargetIndex = Math.max(0, Math.min(targetInfo.index, targetSiblings.length))
  const insertIndex = dest.position === 'before' ? safeTargetIndex : safeTargetIndex + 1
  return insertNodeAt(treeWithout, dragged, targetInfo.parentId, insertIndex)
}


