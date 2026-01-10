# Kingdom Planner

A medieval colony management game inspired by Universal Paperclips. Built with React, TypeScript, and PixiJS.

## Quick Start

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm or yarn

### Installation

```bash
# Clone or create your project directory
mkdir kingdom-planner
cd kingdom-planner

# Initialize git (optional but recommended)
git init

# Install dependencies
npm install
```

### Development

```bash
# Start dev server (opens automatically at http://localhost:3000)
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Building

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
kingdom-planner/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Main game component
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html           # HTML template
└── [config files]
```

## VSCode Extensions

When you open the project, VSCode will suggest installing recommended extensions:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **Error Lens**: Inline error highlighting
- **Path Intellisense**: Auto-complete file paths
- **TODO Highlight/Tree**: Track TODOs in code

## Features (Current MVP)

- ✅ Real-time resource management
- ✅ Labor allocation system
- ✅ Tool-limited production
- ✅ Happiness system
- ✅ Hex map with fog of war
- ✅ Tab-based UI

## Roadmap

- [ ] Save/Load system (localStorage)
- [ ] Expedition mechanics
- [ ] Season/calendar system
- [ ] Supply chains (stone → tools)
- [ ] Random events
- [ ] Multiple biomes on map
- [ ] Steam packaging (Electron)

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **PixiJS**: 2D rendering for map
- **Tailwind CSS**: Styling
- **ESLint**: Code quality

## Future: Steam Build

When ready to package for Steam:

```bash
# Install Electron dependencies
npm install --save-dev electron electron-builder

# Create electron/main.js wrapper
# Add build scripts to package.json
```

See docs/STEAM_PACKAGING.md for details (coming soon).

## Contributing

This is a personal project, but feel free to fork and experiment!

## License

MIT (or choose your own)