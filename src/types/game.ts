export type TerrainType = "field" | "forest" | "mountain" | "water";

export interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  revealed: boolean;
}

export interface GameState {
  population: number;

  // Food resources
  rations: number;
  berries: number;
  smallGame: number;
  largeGame: number;
  grain: number;

  // Wood resources
  sticks: number;
  logs: number;

  // Stone resources
  rocks: number;
  stone: number;

  tools: number;
  happiness: number;

  // Labor allocation
  gatherers: number;
  hunters: number;
  farmers: number;
  woodcutters: number;
  stoneWorkers: number;
  idle: number;

  // Time
  day: number;
  season: string;
}

export interface ChronicleEntry {
  day: number;
  message: string;
  type: "info" | "warning" | "danger";
}

export interface Expedition {
  id: string;
  targetQ: number;
  targetR: number;
  workers: number;
  startDay: number;
  arrivalDay: number;
  status: "in-progress" | "completed" | "lost";
}

export const TIME_SPEEDS = {
  paused: 0,
  slow: 2000,
  normal: 1000,
  fast: 500,
  veryFast: 250,
} as const;

export type TimeSpeed = keyof typeof TIME_SPEEDS;

// Helper functions for aggregated resources
export const calculateTotalFood = (state: GameState): number => {
  return Math.floor(
    state.rations * 1.0 +
      state.berries * 0.3 +
      state.smallGame * 0.8 +
      state.largeGame * 2.0 +
      state.grain * 0.5
  );
};

export const calculateFirewood = (state: GameState): number => {
  return state.sticks;
};

export const calculateStores = (state: GameState): number => {
  return state.grain + state.logs + state.rocks + state.stone;
};
