export type TreeNodeId = string

export type TreeNode = {
  id: TreeNodeId
  name: string
  /**
   * When undefined and `lazy` is true, children are fetched only when expanded.
   * When defined, the node is considered loaded.
   */
  children?: TreeNode[]
  /**
   * Indicates children should be loaded on first expand.
   */
  lazy?: boolean
}

export type DropDestination =
  | { type: 'node'; targetId: TreeNodeId; position: 'before' | 'after' | 'inside' }
  | { type: 'list'; parentId: TreeNodeId | null }


