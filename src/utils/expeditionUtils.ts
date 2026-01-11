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

// Get all hexes along the path from origin to destination using line interpolation
export const getPathHexes = (
  q0: number,
  r0: number,
  q1: number,
  r1: number
): Array<{ q: number; r: number }> => {
  const path: Array<{ q: number; r: number }> = [];

  // Calculate number of steps needed (use cube distance for accuracy)
  const N = Math.max(
    Math.abs(q1 - q0),
    Math.abs(r1 - r0),
    Math.abs(q1 + r1 - (q0 + r0))
  );

  // Linear interpolation along the path
  for (let i = 0; i <= N; i++) {
    const t = N === 0 ? 0 : i / N;

    // Interpolate in axial coordinates
    const q = q0 * (1 - t) + q1 * t;
    const r = r0 * (1 - t) + r1 * t;

    // Convert to cube coordinates for proper rounding
    const s = -q - r;

    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(s);

    // Fix rounding errors
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }

    path.push({ q: rq, r: rr });
  }

  return path;
};

// Reveal tiles along path and in radius 1 around destination
export const revealExpeditionArea = (
  mapTiles: Map<string, HexTile>,
  originQ: number,
  originR: number,
  targetQ: number,
  targetR: number
): number => {
  let revealedCount = 0;

  // Reveal the path from origin to target
  const pathHexes = getPathHexes(originQ, originR, targetQ, targetR);
  pathHexes.forEach(({ q, r }) => {
    const tile = mapTiles.get(`${q},${r}`);
    if (tile && !tile.revealed) {
      tile.revealed = true;
      revealedCount++;
    }
  });

  // Reveal radius 1 around the destination
  for (let q = -1; q <= 1; q++) {
    for (let r = -1; r <= 1; r++) {
      // Skip if outside radius 1 (using cube distance)
      if (Math.abs(q) + Math.abs(r) + Math.abs(q + r) > 2) continue;

      const targetTileQ = targetQ + q;
      const targetTileR = targetR + r;
      const tile = mapTiles.get(`${targetTileQ},${targetTileR}`);

      if (tile && !tile.revealed) {
        tile.revealed = true;
        revealedCount++;
      }
    }
  }

  return revealedCount;
};

// Old function kept for compatibility - now uses new reveal logic
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
