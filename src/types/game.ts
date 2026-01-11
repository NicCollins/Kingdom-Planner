// Terrain types
export type TerrainType = "field" | "forest" | "mountain" | "water";

export interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  revealed: boolean;
}

export interface GameState {
  population: number;
  grain: number;
  wood: number;
  stone: number;
  tools: number;
  happiness: number;

  // Labor allocation
  farmers: number;
  woodcutters: number;
  gatherers: number;
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
