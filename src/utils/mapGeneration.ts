import { TerrainType, HexTile } from "../types/game";

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Noise function using direct hash lookup (avoids interpolation bias)
const simpleNoise = (q: number, r: number, seed: number): number => {
  // Use the hash directly for uniform distribution
  // Convert to unsigned 32-bit to ensure we get full range
  let h = seed >>> 0;
  h = (h ^ (Math.floor(q * 10000) >>> 0)) >>> 0;
  h = ((h << 13) | (h >>> 19)) >>> 0; // Proper 32-bit rotate left
  h = (h ^ (Math.floor(r * 10000) >>> 0)) >>> 0;
  h = ((h << 13) | (h >>> 19)) >>> 0;

  // More mixing
  h = (h * 2654435761) >>> 0;
  h = ((h >>> 16) ^ h) >>> 0;

  // Return normalized 0-1 value using unsigned 32-bit division
  return (h >>> 0) / 4294967296;
};

// Generate procedural terrain matching Godot's approach
export const generateTerrain = (
  q: number,
  r: number,
  seed: number
): TerrainType => {
  const val = simpleNoise(q, r, seed);

  // Thresholds for normalized 0-1 range
  // Water: bottom 15%, Forest: top 35%, Field: middle 50%
  if (val < 0.15) return "water";
  if (val > 0.65) return "forest";

  // Default to field (grass in Godot)
  return "field";
};

// Validate that a map has playable terrain ratios
export const validateMapRatios = (tiles: Map<string, HexTile>): boolean => {
  let water = 0,
    field = 0,
    forest = 0,
    mountain = 0,
    reason = "none";

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

  switch (true) {
    case water === 0:
      reason = "no water";
      break;
    case field === 0:
      reason = "no field";
      break;
    case forest === 0:
      reason = "no forest";
      break;
    case mountain === 0:
      reason = "no mountain";
      break;
    case waterPct < 0.05:
      reason = "water too low";
      break;
    case waterPct > 0.2:
      reason = "water too high";
      break;
    case fieldPct < 0.2:
      reason = "field too low";
      break;
    case forestPct < 0.15:
      reason = "forest too low";
      break;
    case mountainPct < 0.05:
      reason = "mountain too low";
      break;
    default:
      break;
  }

  const isValid =
    water > 0 &&
    field > 0 &&
    forest > 0 &&
    mountain > 0 &&
    waterPct >= 0.05 &&
    waterPct <= 0.2 &&
    fieldPct >= 0.2 &&
    forestPct >= 0.15 &&
    mountainPct >= 0.05;

  if (!isValid) {
    console.debug(
      `Map validation failed: Water=${water}(${(waterPct * 100).toFixed(
        1
      )}%), Field=${field}(${(fieldPct * 100).toFixed(
        1
      )}%), Forest=${forest}(${(forestPct * 100).toFixed(
        1
      )}%), Mountain=${mountain}(${(mountainPct * 100).toFixed(
        1
      )}%), Reason=${reason}`
    );
  }

  return isValid;
};

// Generate a complete map with validation
export const generateValidMap = (
  initialSeed?: number
): {
  tiles: Map<string, HexTile>;
  seed: number;
  colonyLocation: { q: number; r: number };
} => {
  let attempts = 0;
  const maxAttempts = 1000;
  const mapSize = 15; // Hex radius

  while (attempts < maxAttempts) {
    const seed =
      initialSeed !== undefined
        ? initialSeed
        : Math.floor(Math.random() * 1000000);
    const tiles = new Map<string, HexTile>();
    const rng = new SeededRandom(seed);

    // Generate all tiles with larger map size for better distribution matching
    // Keep viewport the same (-7 to 7) but generate larger map overall
    for (let q = -mapSize; q <= mapSize; q++) {
      for (let r = -mapSize; r <= mapSize; r++) {
        if (Math.abs(q + r) > mapSize) continue;
        const key = `${q},${r}`;
        let terrain = generateTerrain(q, r, seed);

        // Post-process: Add mountains randomly (like Godot adds mines)
        // Only on non-water tiles, with 6% chance
        if (terrain !== "water" && rng.next() > 0.94) {
          terrain = "mountain";
        }

        tiles.set(key, { q, r, terrain, revealed: false });
      }
    }

    // Validate ratios
    if (validateMapRatios(tiles)) {
      let colonyLocation = { q: 0, r: 0 };

      // Try to find a field near origin (matching Godot's validate_landing_site)
      const startPos = { q: 0, r: 0 };
      const centerTile = tiles.get("0,0");

      if (centerTile && centerTile.terrain === "water") {
        // Find nearest non-water tile in expanding radius
        let found = false;
        for (let radius = 1; radius <= 20 && !found; radius++) {
          for (let dq = -radius; dq <= radius && !found; dq++) {
            for (let dr = -radius; dr <= radius && !found; dr++) {
              const testPos = { q: startPos.q + dq, r: startPos.r + dr };
              const tile = tiles.get(`${testPos.q},${testPos.r}`);
              if (tile && tile.terrain !== "water") {
                colonyLocation = testPos;
                found = true;
              }
            }
          }
        }
      } else {
        // Center is already non-water
        colonyLocation = startPos;
      }

      // Ensure colony location is a field (prefer field over other terrain)
      const colonyTile = tiles.get(`${colonyLocation.q},${colonyLocation.r}`);
      if (colonyTile) {
        if (colonyTile.terrain !== "field") {
          // Only convert to field if it's not water
          if (colonyTile.terrain !== "water") {
            const oldTerrain = colonyTile.terrain;
            colonyTile.terrain = "field";
            console.debug(
              `Colony location (${colonyLocation.q},${colonyLocation.r}): converted ${oldTerrain} -> field`
            );
          }
        }
      }

      // Final validation after colony placement
      const finalValid = validateMapRatios(tiles);
      if (finalValid) {
        console.log(
          `✓ Valid map generated (seed: ${seed}, attempt: ${attempts + 1})`
        );
        return { tiles, seed, colonyLocation };
      } else {
        console.debug(`Map became invalid after colony placement`);
      }
    }

    attempts++;
  }

  // Fallback: create a guaranteed playable map
  console.warn(
    `Could not generate valid map after ${maxAttempts} attempts, using fallback`
  );
  const fallbackSeed =
    initialSeed !== undefined
      ? initialSeed
      : Math.floor(Math.random() * 1000000);
  const fallbackMap = createFallbackMap(fallbackSeed);

  // Validate fallback map
  const fallbackValid = validateMapRatios(fallbackMap.tiles);
  if (!fallbackValid) {
    console.error("Fallback map is also invalid!");
  }

  return fallbackMap;
};

// Create a deterministic fallback map
const createFallbackMap = (seed: number = 42) => {
  const tiles = new Map<string, HexTile>();
  const rng = new SeededRandom(seed);

  for (let q = -7; q <= 7; q++) {
    for (let r = -7; r <= 7; r++) {
      if (Math.abs(q + r) > 7) continue;
      const key = `${q},${r}`;

      let terrain = generateTerrain(q, r, seed);

      // Post-process: Add mountains randomly
      if (terrain !== "water" && rng.next() > 0.98) {
        terrain = "mountain";
      }

      tiles.set(key, { q, r, terrain, revealed: false });
    }
  }

  return { tiles, seed, colonyLocation: { q: 0, r: 0 } };
};
