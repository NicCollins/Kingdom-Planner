# Kingdom Planner - Project Summary

## Project Overview

A medieval colony management game inspired by Universal Paperclips. Built with React, TypeScript, PixiJS, and Vite. The game features semi-idle mechanics, procedural map generation, labor allocation, and expedition-based exploration.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Map Rendering**: PixiJS v8
- **Target Platform**: Web (with future Electron packaging for Steam)

## Current Features

### 1. Colony Charter Screen

- Flavor text with royal decree theme
- Lists starting resources (50 population, 100 grain, 50 wood, 20 stone, 5 tools)
- "Begin Your Venture" button to start game

### 2. Game State Management

- **Resources**: Grain, Wood, Stone, Tools
- **Population**: Farmers, Woodcutters, Gatherers, Idle workers
- **Hidden Happiness**: Affects production efficiency, shown only in debug
- **Time System**: Day counter with seasons (currently only Spring)
- **Time Controls**: Pause, Slow (2s), Normal (1s), Fast (0.5s), Very Fast (0.25s)

### 3. Labor Allocation System

- Distribute population among jobs
- +/- buttons for fine control (+1/-1, +5/-5)
- Production limited by both workers AND available tools
- Terrain-based production multipliers

### 4. Procedural Map Generation

- **Hex-based map** (15-tile radius, axial coordinates)
- **Seed-based generation** for reproducible maps
- **4 Terrain Types**:
  - Fields (brown): Required for grain farming
  - Forest (green): Needed for wood production
  - Mountains (gray): Source of stone
  - Water (blue): Currently non-traversable
- **Validated ratios** ensure playable maps:
  - Water: 5-20%
  - Fields: ≥25%
  - Forest: ≥20%
  - Mountains: ≥10% (added post-generation at 6% chance)
- **Fog of War**: Only starting area (2-hex radius) visible initially
- **Colony marker**: Gold circle indicates starting location

### 5. Expedition System

- **Click-to-select**: Click unexplored hex to target
- **Confirmation required**: Must click "Send Expedition" button
- **Visual feedback**: Orange crosshair marks selected target
- **Duration**: Based on distance (minimum 2 days)
- **Risk**: 2% base + 1% per hex distance of expedition loss
- **Rewards**: Reveals 2-hex radius around target on success
- **Worker recovery**: Survivors return to idle pool
- **Active expedition tracking**: Shows target coordinates and return day

### 6. Resource Production

- **Terrain-dependent**:
  - Grain requires fields (need 10 for 100% efficiency)
  - Wood requires forests (need 5 for 100% efficiency)
  - Stone requires mountains (need 3 for 100% efficiency)
- **Tool bottleneck**: Woodcutters limited by available axes
- **Happiness multiplier**: Low morale reduces production
- **Consumption**: Population consumes 0.1 grain per person per day

### 7. Chronicle System (Event Log)

- **Scrollable log** with auto-scroll to bottom
- **Color-coded messages**:
  - Red: Danger (starvation, lost expeditions)
  - Yellow: Warnings (low morale)
  - Gray: Info (general updates)
- **Smart logging**: Only important events, no daily spam
- **Flavor text**: Every 10 days based on happiness level

### 8. Debug Panel

- **Toggle**: D key or top-right button
- **Displays**:
  - All resources including hidden happiness
  - Labor allocation with mismatch warnings
  - Production rates with terrain multipliers
  - Full map statistics and terrain distribution
  - Current seed with regeneration controls
  - Chronicle stats
  - Performance metrics (FPS, ticks/sec)
- **Map controls**: Generate new random map or load specific seed
- **No scroll jumping**: Fixed in refactor

## File Structure

```
src/
├── types/
│   └── game.ts              # TypeScript interfaces & constants
├── utils/
│   ├── mapGeneration.ts     # Procedural map generation & validation
│   └── expeditionUtils.ts   # Hex distance, duration, reveal logic
├── hooks/
│   └── useGameState.ts      # Main game state hook
├── components/
│   ├── ColonyCharter.tsx    # Startup screen
│   ├── HexMap.tsx           # PixiJS map rendering
│   └── DebugPanel.tsx       # Debug overlay
├── App.tsx                  # Main app component
├── main.tsx                 # React entry point
└── index.css                # Tailwind directives
```

## Key Algorithms

### Hex Coordinate System

- **Axial coordinates** (q, r) for storage
- **Cube coordinates** for accurate pixel-to-hex conversion
- **Proper rounding** to handle edge cases at hex boundaries

### Map Generation

- **Noise-based terrain**: Direct hash lookup with proper seeding
- **Multi-attempt validation**: Up to 1000 attempts to find playable map
- **Post-processing**: Mountains added after initial generation
- **Colony placement**: Finds non-water tile, converts to field if needed

### Expedition Mechanics

- **Distance calculation**: Axial hex distance formula
- **Duration formula**: `max(2, ceil(distance))`
- **Loss chance**: `0.02 + (distance * 0.01)`
- **Reveal radius**: 2 hexes using cube coordinate iteration

## Design Decisions

### Why This Tech Stack?

1. **React + TypeScript**: Type safety, component modularity, fast iteration
2. **PixiJS**: Hardware-accelerated 2D rendering for hex map
3. **Vite**: Lightning-fast dev server, minimal config
4. **Tailwind**: Rapid UI iteration without CSS files
5. **Electron path**: Allows web → Steam with minimal changes

### Why Separate Components?

- **Maintainability**: Each file has single responsibility
- **Testability**: Isolated functions easier to test
- **Reusability**: Components can be used elsewhere
- **Debugging**: Clear error locations

### Why Click-to-Confirm Expeditions?

- **Performance**: No constant map redraws on mouse movement
- **User control**: Prevents accidental sends
- **Clear intent**: Select target, review, confirm
- **Better UX**: See exactly where expedition will go

## Known Issues & Future Work

### Current Limitations

- Map size fixed at 15-tile radius (viewport is -7 to 7)
- No save/load system yet
- No supply chains (can't craft tools from stone yet)
- Seasons don't affect gameplay
- Water is decorative only
- No population growth/death (except expedition loss)

### Planned Features (From Design Docs)

1. **Save/Load System**: localStorage persistence
2. **Supply Chains**: Stone → Tools crafting
3. **Season System**:
   - Autumn harvest bonus
   - Winter farming stops, increased consumption
4. **Additional Tabs**: Trade, Manor, Tech Tree
5. **Events System**: Random events beyond current chronicle
6. **Prestige Mechanic**: "Dynasty" system with resets and bonuses
7. **Water Management**: Wells required if no river nearby
8. **Tool Durability**: Tools break over time, need replacement

### Path to Steam

1. Continue building features in web version
2. Add save/load with localStorage
3. Implement supply chains and tech tree
4. Polish UI and add juice (animations, sounds)
5. Package with Electron
6. Integrate Steamworks API (achievements, cloud saves)
7. Add Steam-exclusive content (portraits, relics, etc.)

## Performance Optimizations Applied

- Map only redraws on: initial load, target selection, tile reveals
- Chronicle auto-scroll uses ref, not constant re-renders
- Debug panel properly scoped to avoid re-creation
- Expedition system uses confirmation to avoid accidental sends
- PixiJS graphics reused, not recreated on each frame

## Debugging Tips

- Press **D** to toggle debug panel
- Check "Map Statistics" for terrain distribution validation
- Use seed field to reproduce specific maps
- Monitor "Labor Allocation" for math mismatches
- Watch production rates to verify terrain multipliers

## Notable Fixes During Development

1. **Map generation**: Switched from Perlin noise to direct hash for better distribution
2. **Debug scroll**: Component refactor fixed scope issues
3. **Hex alignment**: Improved pixel-to-hex using cube coordinates
4. **Map flickering**: Separated rendering from state updates
5. **Chronicle duplicates**: Added ref-based deduplication
6. **Expedition auto-send**: Changed to click-to-select + confirm button

## Code Conventions

- **Naming**: camelCase for variables/functions, PascalCase for components
- **State**: React hooks in custom hooks, not scattered in components
- **Types**: All in `types/game.ts` for central reference
- **Comments**: Explain "why" not "what"
- **Exports**: Named exports for utilities, default for components

## Testing Workflow

1. Generate new map (check terrain distribution in debug)
2. Test labor allocation (verify idle math is correct)
3. Send expedition (verify duration, check for loss chance)
4. Wait for return (verify tiles reveal, workers return)
5. Test starvation (remove farmers, watch happiness drop)
6. Test time controls (pause, fast-forward)

## Resources for Future Developers

- **Hex Grid Guide**: https://www.redblobgames.com/grids/hexagons/
- **PixiJS Docs**: https://pixijs.com/8.x/guides
- **React Hooks**: https://react.dev/reference/react/hooks
- **Tailwind Classes**: https://tailwindcss.com/docs

## Credits & Inspiration

- **Universal Paperclips**: Core idle game inspiration
- **Godot prototype**: Original map generation reference
- **Design docs**: AI Recommendations.md, AI Summary.md (see project files)

---

**Last Updated**: Session ending January 11, 2026
**Project Status**: MVP Complete - Ready for feature expansion
**Next Priority**: Save/Load system or Supply Chains
