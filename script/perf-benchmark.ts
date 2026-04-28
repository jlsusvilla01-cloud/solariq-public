import { performance } from "node:perf_hooks";

// Simulate database latency of 50ms per insert
const dbLatencyMs = 50;
const simulateDbInsert = () => new Promise(resolve => setTimeout(resolve, dbLatencyMs));

async function runBenchmark() {
  const items = Array.from({ length: 10 });

  // Measure sequential
  const startSeq = performance.now();
  for (const item of items) {
    await simulateDbInsert();
  }
  const endSeq = performance.now();

  // Measure concurrent
  const startConc = performance.now();
  await Promise.all(items.map(() => simulateDbInsert()));
  const endConc = performance.now();

  console.log(`Sequential: ${(endSeq - startSeq).toFixed(2)}ms`);
  console.log(`Concurrent: ${(endConc - startConc).toFixed(2)}ms`);
  console.log(`Improvement: ${(((endSeq - startSeq) - (endConc - startConc)) / (endSeq - startSeq) * 100).toFixed(2)}%`);
}

runBenchmark();
