import { performance } from 'node:perf_hooks';

const DB_LATENCY_MS = 20;

async function mockDbInsert() {
  return new Promise(resolve => setTimeout(resolve, DB_LATENCY_MS));
}

async function runBenchmark() {
  console.log("⚡ Bolt Performance Benchmark: N+1 vs Promise.all");
  console.log("Simulating 10 milestone inserts (20ms latency per insert)...\n");

  const startSeq = performance.now();
  for (let i = 0; i < 10; i++) {
    await mockDbInsert();
  }
  const endSeq = performance.now();
  console.log(`Sequential Time: ${(endSeq - startSeq).toFixed(2)} ms`);

  const startConc = performance.now();
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(mockDbInsert());
  }
  await Promise.all(promises);
  const endConc = performance.now();
  console.log(`Concurrent Time: ${(endConc - startConc).toFixed(2)} ms`);

  console.log(`\nImprovement: ${((endSeq - startSeq) / (endConc - startConc)).toFixed(2)}x faster!`);
}

runBenchmark();
