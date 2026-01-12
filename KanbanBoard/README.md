# Kanban Board Component

A modern, fully-featured Kanban board built with React, TypeScript, and DnD Kit. Features drag-and-drop functionality, inline editing, and responsive design.

![Kanban Board Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=Kanban+Board+Demo)

## ✨ Features

- **📋 Three Default Columns**: Todo, In Progress, Done
- **🎯 Add/Delete Cards**: Create and remove cards in any column
- **🖱️ Drag & Drop**: Move cards between columns and reorder within columns
- **✏️ Inline Editing**: Double-click any card title to edit inline
- **📱 Responsive Design**: Columns stack vertically on mobile devices
- **⚡ Type-Safe**: Built with TypeScript for better development experience
- **🎨 Clean UI**: Minimal, modern styling with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd KanbanBoard
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
├── App.tsx                 # Main application component
├── main.tsx               # React app entry point
├── style.css              # Global styles
└── KanbanBoard/
    ├── index.ts           # Main exports
    ├── KanbanBoard.tsx    # Main board component
    ├── Column.tsx         # Column component
    ├── Card.tsx           # Card component
    ├── types.ts           # TypeScript definitions
    ├── mockData.ts        # Initial demo data
    └── kanban.css         # Component-specific styles
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

### Adding Cards
- Click the **"+ Add Card"** button in any column
- Type your card title and press Enter or click away to save

### Editing Cards
- **Double-click** any card title to edit it inline
- Press **Enter** to save or **Escape** to cancel

### Moving Cards
- **Drag and drop** cards between columns or reorder within the same column
- Cards maintain their order when moved

### Deleting Cards
- Click the **"×"** button on any card to delete it

## 🔧 Customization

### Adding New Columns

Edit `src/KanbanBoard/mockData.ts`:

```typescript
export const initialKanbanState: KanbanState = {
  columns: [
    { id: 'todo', title: 'Todo' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
    { id: 'review', title: 'Review' }, // Add new column
  ],
  // ... rest of config
}
```

### Styling

- **Global styles**: `src/style.css`
- **Component styles**: `src/KanbanBoard/kanban.css`
- **Responsive breakpoint**: Mobile layout activates at `768px`

### Using as a Component

Import and use in your own project:

```typescript
import { KanbanBoard } from '@KanbanBoard'

function MyApp() {
  return <KanbanBoard />
}
```

## 🔗 Dependencies

- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **@dnd-kit/core** - Drag and drop functionality
- **@dnd-kit/sortable** - Sortable drag and drop
- **@dnd-kit/utilities** - DnD utilities

## 📋 Technical Features

- **HTML5 Drag & Drop** with DnD Kit for reliable cross-browser support
- **Clean State Management** using React hooks (useState)
- **Type-Safe** with comprehensive TypeScript definitions
- **Component Architecture**: Board → Column → Card hierarchy
- **Responsive CSS Grid** that adapts to screen size
- **Path Alias** support (`@KanbanBoard` imports)

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

If you have any questions or issues, please [open an issue](../../issues) on GitHub.

---

**Built with ❤️ using React, TypeScript, and DnD Kit**
