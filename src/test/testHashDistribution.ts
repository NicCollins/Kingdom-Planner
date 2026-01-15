/**
 * Test file to verify hash function distribution across 0-1 range
 */

// Copy of simpleNoise function from mapGeneration.ts
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

/**
 * Test distribution of hash values across 0-1 range
 */
const testHashDistribution = (
  numSamples: number = 1000,
  seed: number = 12345,
  numBuckets: number = 10
) => {
  console.log(`\n=== Hash Distribution Test ===`);
  console.log(`Samples: ${numSamples}, Seed: ${seed}, Buckets: ${numBuckets}`);
  console.log(
    `Testing values from (0,0) to (${Math.sqrt(numSamples)},${Math.sqrt(
      numSamples
    )})\n`
  );

  // Create buckets for distribution analysis
  const buckets = Array(numBuckets).fill(0);
  const bucketSize = 1 / numBuckets;
  const values: number[] = [];

  // Generate hash values
  let count = 0;
  const sqrtSamples = Math.ceil(Math.sqrt(numSamples));

  for (let i = 0; i < sqrtSamples && count < numSamples; i++) {
    for (let j = 0; j < sqrtSamples && count < numSamples; j++) {
      const val = simpleNoise(i, j, seed);
      values.push(val);

      // Put in appropriate bucket
      const bucketIndex = Math.min(
        numBuckets - 1,
        Math.floor(val / bucketSize)
      );
      buckets[bucketIndex]++;
      count++;
    }
  }

  // Calculate statistics
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2)) / values.length;
  const stdDev = Math.sqrt(variance);

  // Display results
  console.log(`Statistics:`);
  console.log(`  Min:      ${min.toFixed(4)}`);
  console.log(`  Max:      ${max.toFixed(4)}`);
  console.log(`  Mean:     ${mean.toFixed(4)} (expected: 0.5000)`);
  console.log(
    `  Std Dev:  ${stdDev.toFixed(4)} (expected: ~0.2887 for uniform)`
  );

  console.log(`\nDistribution across buckets:`);
  const expectedPerBucket = numSamples / numBuckets;
  let totalChiSquared = 0;

  for (let i = 0; i < numBuckets; i++) {
    const bucketLabel = `${(i * bucketSize).toFixed(2)}-${(
      (i + 1) *
      bucketSize
    ).toFixed(2)}`;
    const count = buckets[i];
    const percentage = ((count / numSamples) * 100).toFixed(1);
    const chiSquared =
      Math.pow(count - expectedPerBucket, 2) / expectedPerBucket;
    totalChiSquared += chiSquared;

    // Visual bar
    const barLength = Math.round((count / expectedPerBucket) * 20);
    const bar = "█".repeat(barLength) + "░".repeat(Math.max(0, 20 - barLength));

    console.log(
      `  [${bucketLabel}] ${count
        .toString()
        .padStart(4)} (${percentage}%) ${bar}`
    );
  }

  // Chi-squared test for uniformity
  const chiSquaredThreshold = 16.92; // Critical value for 10 buckets at p=0.05
  const isUniform = totalChiSquared < chiSquaredThreshold;

  console.log(`\nChi-squared test:`);
  console.log(`  χ² = ${totalChiSquared.toFixed(4)}`);
  console.log(`  Threshold (p=0.05): ${chiSquaredThreshold}`);
  console.log(
    `  Result: ${
      isUniform ? "✓ UNIFORM DISTRIBUTION" : "✗ NON-UNIFORM DISTRIBUTION"
    }`
  );
};

// Run multiple tests with different seeds
console.log("╔══════════════════════════════════════════════════════╗");
console.log("║      Hash Function Distribution Analysis            ║");
console.log("╚══════════════════════════════════════════════════════╝");

testHashDistribution(1000, 42);
testHashDistribution(1000, 12345);
testHashDistribution(1000, 999999);

console.log("\n=== Summary ===");
console.log("If all tests show uniform distribution, the hash function");
console.log("is producing even values across the 0-1 range.");
