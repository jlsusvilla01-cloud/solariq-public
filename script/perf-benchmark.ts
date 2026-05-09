import { performance } from "node:perf_hooks";

// Simulate database query latency (e.g., 20ms per insert)
const DB_LATENCY_MS = 20;

const mockDbInsert = async (id: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, DB_LATENCY_MS));
};

async function runBenchmark() {
  console.log("⚡ Bolt: Database Concurrency Benchmark");
  console.log(`Simulating 10 independent database inserts with ${DB_LATENCY_MS}ms latency each...`);
  console.log("--------------------------------------------------");

  const operations = Array.from({ length: 10 }, (_, i) => i);

  // 1. Sequential approach (Before)
  const startSequential = performance.now();
  for (const op of operations) {
    await mockDbInsert(op);
  }
  const endSequential = performance.now();
  const sequentialTime = endSequential - startSequential;
  console.log(`❌ Sequential execution time: ${sequentialTime.toFixed(2)}ms`);

  // 2. Concurrent approach (After)
  const startConcurrent = performance.now();
  await Promise.all(operations.map((op) => mockDbInsert(op)));
  const endConcurrent = performance.now();
  const concurrentTime = endConcurrent - startConcurrent;
  console.log(`✅ Concurrent execution time: ${concurrentTime.toFixed(2)}ms`);

  // 3. Results
  const improvement = ((sequentialTime - concurrentTime) / sequentialTime) * 100;
  const speedup = sequentialTime / concurrentTime;

  console.log("--------------------------------------------------");
  console.log(`📊 Impact: ${improvement.toFixed(2)}% faster (${speedup.toFixed(1)}x speedup)`);
  console.log("--------------------------------------------------");
}

runBenchmark().catch(console.error);
