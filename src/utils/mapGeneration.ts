import { TerrainType, HexTile } from "../types/game";

// Simple hash function for pseudo-random generation
const hashCoords = (q: number, r: number, seed: number): number => {
  let hash = seed;
  hash = (hash << 5) - hash + q;
  hash = (hash << 5) - hash + r;
  hash = hash & hash;
  return Math.abs(hash);
};

// Generate procedural terrain using improved noise-like function
export const generateTerrain = (
  q: number,
  r: number,
  seed: number
): TerrainType => {
  // Multi-scale noise for more natural patterns
  const scale1 =
    hashCoords(Math.floor(q / 2), Math.floor(r / 2), seed) / 0xffffffff;
  const scale2 = hashCoords(q, r, seed + 1000) / 0xffffffff;
  const scale3 = hashCoords(q * 2, r * 2, seed + 2000) / 0xffffffff;

  // Blend different scales for more organic look
  const value = scale1 * 0.5 + scale2 * 0.3 + scale3 * 0.2;

  // Distance from center affects terrain (less water near spawn)
  const distFromCenter = Math.sqrt(q * q + r * r);
  const centerBias = Math.max(0, 1 - distFromCenter / 8);

  const adjustedValue = value * (1 - centerBias * 0.3);

  // Adjusted thresholds to reduce water
  if (adjustedValue < 0.12) return "water";
  if (adjustedValue < 0.35) return "mountain";
  if (adjustedValue < 0.65) return "forest";
  return "field";
};

// Validate that a map has playable terrain ratios
export const validateMapRatios = (tiles: Map<string, HexTile>): boolean => {
  let water = 0,
    field = 0,
    forest = 0,
    mountain = 0;

  tiles.forEach((tile) => {
    if (tile.terrain === "water") water++;
    if (tile.terrain === "field") field++;
    if (tile.terrain === "forest") forest++;
    if (tile.terrain === "mountain") mountain++;
  });

  const total = tiles.size;
  const waterPct = water / total;
  const fieldPct = field / total;
  const forestPct = forest / total;
  const mountainPct = mountain / total;

  return (
    waterPct >= 0.05 &&
    waterPct <= 0.2 &&
    fieldPct >= 0.25 &&
    forestPct >= 0.2 &&
    mountainPct >= 0.1
  );
};

// Generate a complete map with validation
export const generateValidMap = (): {
  tiles: Map<string, HexTile>;
  seed: number;
  colonyLocation: { q: number; r: number };
} => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const seed = Math.floor(Math.random() * 1000000);
    const tiles = new Map<string, HexTile>();

    // Generate all tiles
    for (let q = -7; q <= 7; q++) {
      for (let r = -7; r <= 7; r++) {
        if (Math.abs(q + r) > 7) continue;
        const key = `${q},${r}`;
        const terrain = generateTerrain(q, r, seed);

        tiles.set(key, { q, r, terrain, revealed: false });
      }
    }

    // Validate ratios
    if (validateMapRatios(tiles)) {
      let colonyLocation = { q: 0, r: 0 };

      // Try to find a field near origin
      for (let q = -1; q <= 1; q++) {
        for (let r = -1; r <= 1; r++) {
          if (Math.abs(q + r) > 1) continue;
          const tile = tiles.get(`${q},${r}`);
          if (tile && tile.terrain === "field") {
            colonyLocation = { q, r };
            break;
          }
        }
      }

      // If no field found, find any non-water
      if (colonyLocation.q === 0 && colonyLocation.r === 0) {
        const centerTile = tiles.get("0,0");
        if (centerTile && centerTile.terrain === "water") {
          for (let q = -1; q <= 1; q++) {
            for (let r = -1; r <= 1; r++) {
              if (Math.abs(q + r) > 1) continue;
              const tile = tiles.get(`${q},${r}`);
              if (tile && tile.terrain !== "water") {
                colonyLocation = { q, r };
                break;
              }
            }
          }
        }
      }

      // Force colony location to be a field if it's water
      const colonyTile = tiles.get(`${colonyLocation.q},${colonyLocation.r}`);
      if (colonyTile && colonyTile.terrain === "water") {
        colonyTile.terrain = "field";
      }

      return { tiles, seed, colonyLocation };
    }

    attempts++;
  }

  // Fallback: create a guaranteed playable map
  console.warn(
    "Could not generate valid map after 100 attempts, using fallback"
  );
  const seed = 42;
  const tiles = new Map<string, HexTile>();

  for (let q = -7; q <= 7; q++) {
    for (let r = -7; r <= 7; r++) {
      if (Math.abs(q + r) > 7) continue;
      const key = `${q},${r}`;

      let terrain: TerrainType = "field";
      const dist = Math.sqrt(q * q + r * r);
      if (dist > 6) terrain = "water";
      else if (Math.abs(q) > 4 || Math.abs(r) > 4) terrain = "forest";
      else if (Math.abs(q) < 2 && Math.abs(r) < 2) terrain = "field";
      else if ((q + r) % 3 === 0) terrain = "mountain";
      else if ((q + r) % 3 === 1) terrain = "forest";

      tiles.set(key, { q, r, terrain, revealed: false });
    }
  }

  return { tiles, seed, colonyLocation: { q: 0, r: 0 } };
};
