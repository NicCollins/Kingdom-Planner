import { HexTile } from "../types/game";

// Calculate hex distance (axial coordinates)
export const hexDistance = (
  q1: number,
  r1: number,
  q2: number,
  r2: number
): number => {
  return (
    (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2
  );
};

// Calculate expedition duration based on distance
export const calculateExpeditionDuration = (distance: number): number => {
  // Base: 1 day per hex distance, minimum 2 days
  return Math.max(2, Math.ceil(distance));
};

// Reveal tiles in a radius around a center point
export const revealTilesInRadius = (
  mapTiles: Map<string, HexTile>,
  centerQ: number,
  centerR: number,
  radius: number
): void => {
  for (let q = -radius; q <= radius; q++) {
    for (
      let r = Math.max(-radius, -q - radius);
      r <= Math.min(radius, -q + radius);
      r++
    ) {
      const targetQ = centerQ + q;
      const targetR = centerR + r;
      const tile = mapTiles.get(`${targetQ},${targetR}`);
      if (tile) {
        tile.revealed = true;
      }
    }
  }
};

// Check if an expedition might get lost (random chance based on distance)
export const checkExpeditionLoss = (distance: number): boolean => {
  // 2% base chance, +1% per hex of distance
  const lossChance = 0.02 + distance * 0.01;
  return Math.random() < lossChance;
};
