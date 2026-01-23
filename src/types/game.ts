export type TerrainType = "field" | "forest" | "mountain" | "water";

export interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  revealed: boolean;
}

export interface GameState {
  population: number;

  policies: PoliciesState;

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

  // Terrain revealed count
  terrainUpdated: boolean;
  fieldCount: number;
  forestCount: number;
  mountainCount: number;

  // Resource Totals
  totalFood: number;
  totalFirewood: number;
  totalStores: number;
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

export interface PoliciesState {
  foodRationing: "normal" | "generous" | "strict";
  laborAllocation: "balanced" | "focusFood" | "focusWood" | "focusStone";
}

export const RATION_EFFECTS: Record<
  string,
  { consumptionMult: number; happinessModifier: number }
> = {
  normal: { consumptionMult: 1.0, happinessModifier: 0 },
  generous: { consumptionMult: 1.25, happinessModifier: 10 },
  strict: { consumptionMult: 0.75, happinessModifier: -10 },
};

export const TIME_SPEEDS = {
  paused: 0,
  slow: 8000,
  normal: 2000,
  fast: 500,
  veryFast: 250,
} as const;

export type TimeSpeed = keyof typeof TIME_SPEEDS;

// Helper functions for aggregated resources
export const calculateFirewood = (state: GameState): number => {
  return state.sticks;
};

export const calculateStores = (state: GameState): number => {
  return state.grain + state.logs + state.rocks + state.stone;
};
