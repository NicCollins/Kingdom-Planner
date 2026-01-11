import { generateValidMap } from "./mapGeneration";

// Test map generation multiple times
console.log("Testing map generation...");

for (let i = 0; i < 3; i++) {
  const mapData = generateValidMap();

  // Count terrain types
  let water = 0,
    field = 0,
    forest = 0,
    mountain = 0;
  mapData.tiles.forEach((tile) => {
    if (tile.terrain === "water") water++;
    if (tile.terrain === "field") field++;
    if (tile.terrain === "forest") forest++;
    if (tile.terrain === "mountain") mountain++;
  });

  const total = mapData.tiles.size;

  console.log(`\nMap ${i + 1} (Seed: ${mapData.seed}):`);
  console.log(`  Total tiles: ${total}`);
  console.log(`  Water: ${water} (${((water / total) * 100).toFixed(1)}%)`);
  console.log(`  Field: ${field} (${((field / total) * 100).toFixed(1)}%)`);
  console.log(`  Forest: ${forest} (${((forest / total) * 100).toFixed(1)}%)`);
  console.log(
    `  Mountain: ${mountain} (${((mountain / total) * 100).toFixed(1)}%)`
  );

  // Print some tile details
  console.log("  Sample tiles:");
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      if (Math.abs(q + r) > 2) continue;
      const tile = mapData.tiles.get(`${q},${r}`);
      if (tile) {
        console.log(`    (${q},${r}): ${tile.terrain}`);
      }
    }
  }
}
