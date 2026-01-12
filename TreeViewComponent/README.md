# Tree View Component

A powerful, interactive tree view component built with React and TypeScript. Features drag-and-drop reordering, inline editing, lazy loading, and comprehensive tree operations.

![Tree View Screenshot](https://via.placeholder.com/800x500/059669/ffffff?text=Interactive+Tree+View+Demo)

## ✨ Features

- **🌳 Hierarchical Display**: Visual tree structure with expand/collapse functionality
- **✏️ Inline Editing**: Edit node names directly with keyboard shortcuts
- **🎯 Add/Delete Nodes**: Create child nodes or remove existing ones
- **🖱️ Drag & Drop**: Reorder nodes and change parent-child relationships
- **⚡ Lazy Loading**: Load child nodes on-demand for better performance
- **⌨️ Keyboard Navigation**: Full keyboard support for accessibility
- **📱 Responsive Design**: Works smoothly on desktop and mobile
- **🎨 Clean UI**: Modern, minimal design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TreeViewComponent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── App.tsx                          # Main application
├── main.tsx                        # React entry point
├── style.css                       # Global styles
├── components/
│   └── TreeView/
│       ├── TreeView.tsx            # Main tree component
│       ├── TreeNodeRow.tsx         # Individual node component
│       ├── treeUtils.ts            # Tree manipulation utilities
│       └── types.ts                # TypeScript definitions
└── mock/
    └── treeApi.ts                  # Mock API for lazy loading
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

### Basic Operations

- **Expand/Collapse**: Click the arrow icon or press Space
- **Add Root Node**: Click "Add root" button in toolbar
- **Add Child Node**: Click the "+" icon next to any node
- **Edit Node**: Double-click node name or press F2
- **Delete Node**: Click the "×" icon (confirms before deletion)

### Drag & Drop

- **Reorder Siblings**: Drag node above/below siblings
- **Change Parent**: Drag node onto another node
- **Move to Root**: Drag node to empty space at bottom

### Keyboard Shortcuts

- **Enter**: Confirm edit/add operation
- **Escape**: Cancel edit/add operation
- **F2**: Start editing selected node
- **Space**: Toggle expand/collapse
- **Delete**: Remove node (with confirmation)

### Lazy Loading

Nodes marked as "lazy" will load children when first expanded. The demo includes:
- Simulated API delay (450-1100ms)
- Loading indicators
- Dynamic child generation

## 🔧 Customization

### Using Your Own Data

Replace the mock data in `src/mock/treeApi.ts`:

```typescript
import type { TreeNode } from '../components/TreeView/types'

export function createMyTree(): TreeNode[] {
  return [
    {
      id: 'root-1',
      name: 'My Root Node',
      children: [
        { id: 'child-1', name: 'Child Node 1' },
        { id: 'child-2', name: 'Child Node 2', lazy: true }
      ]
    }
  ]
}
```

### Custom Lazy Loading

Implement your own `loadChildren` function:

```typescript
async function loadFromAPI(nodeId: string): Promise<TreeNode[]> {
  const response = await fetch(`/api/nodes/${nodeId}/children`)
  return response.json()
}

<TreeView loadChildren={loadFromAPI} />
```

### Styling

The component uses CSS custom properties for easy theming:

```css
.tv {
  --tv-border-color: #e5e7eb;
  --tv-bg-hover: #f9fafb;
  --tv-text-color: #374151;
  --tv-accent-color: #3b82f6;
}
```

### Component Props

```typescript
interface TreeViewProps {
  value?: TreeNode[]              // Controlled mode
  defaultValue?: TreeNode[]       // Uncontrolled mode
  onChange?: (nodes: TreeNode[]) => void
  loadChildren?: (nodeId: string) => Promise<TreeNode[]>
}
```

## 📋 API Reference

### TreeNode Type

```typescript
interface TreeNode {
  id: string                    // Unique identifier
  name: string                  // Display name
  children?: TreeNode[]         // Child nodes (undefined for lazy)
  lazy?: boolean               // Load children on expand
}
```

### Tree Operations

```typescript
// Find a node by ID
const node = findNode(tree, 'node-id')

// Update a node
const updated = updateNode(tree, 'node-id', node => ({ 
  ...node, 
  name: 'New Name' 
}))

// Move a node
const moved = moveNode(tree, 'source-id', {
  type: 'node',
  targetId: 'target-id',
  position: 'inside'
})

// Remove a node
const { tree: remaining, removed } = removeNode(tree, 'node-id')
```

## 🔗 Dependencies

- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server

## 📋 Technical Features

- **HTML5 Drag & Drop** with custom drop zones and visual feedback
- **Optimized Rendering** with React hooks and memoization  
- **Tree Utilities** for immutable tree operations
- **Accessible Design** with proper ARIA labels and keyboard navigation
- **Type-Safe** with comprehensive TypeScript definitions
- **Performance Optimized** with lazy loading and virtual rendering support

## 🎯 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Virtual scrolling for large trees
- [ ] Multi-select support
- [ ] Copy/paste operations
- [ ] Undo/redo functionality
- [ ] Search/filter capabilities
- [ ] Export/import tree data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

If you have any questions or issues, please [open an issue](../../issues) on GitHub.

---

**Built with ❤️ using React and TypeScript**
