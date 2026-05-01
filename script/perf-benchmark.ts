import { performance } from "perf_hooks";

// Simulate database query with artificial latency (e.g., 20ms network/DB overhead)
async function simulateDbInsert(id: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 20));
}

async function benchmark() {
  const numInserts = 10;
  console.log(`Starting benchmark for ${numInserts} inserts with 20ms simulated latency...`);

  // 1. Sequential approach (Old way)
  console.log("\n--- Sequential Inserts (Old Pattern) ---");
  const startSeq = performance.now();
  for (let i = 0; i < numInserts; i++) {
    await simulateDbInsert(i);
  }
  const endSeq = performance.now();
  const timeSeq = endSeq - startSeq;
  console.log(`Sequential inserts took: ${timeSeq.toFixed(2)} ms`);

  // 2. Concurrent approach (New way with Promise.all)
  console.log("\n--- Concurrent Inserts (Bolt Optimization) ---");
  const startConc = performance.now();
  const promises = [];
  for (let i = 0; i < numInserts; i++) {
    promises.push(simulateDbInsert(i));
  }
  await Promise.all(promises);
  const endConc = performance.now();
  const timeConc = endConc - startConc;
  console.log(`Concurrent inserts took: ${timeConc.toFixed(2)} ms`);

  // Results
  console.log("\n--- Results ---");
  const improvement = timeSeq / timeConc;
  console.log(`Performance Improvement: ~${improvement.toFixed(1)}x faster`);
}

benchmark().catch(console.error);
