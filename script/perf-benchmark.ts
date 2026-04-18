import { performance } from "perf_hooks";

// Simulate database latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateDbCall(name: string, duration: number) {
  await delay(duration);
  return `${name} data`;
}

async function runSequential() {
  const start = performance.now();

  // Simulating the 7 sequential calls in GET /api/track/:token
  const ms = await simulateDbCall("milestones", 50);
  const upd = await simulateDbCall("updates", 50);
  const photos = await simulateDbCall("photos", 50);
  const sigs = await simulateDbCall("signatures", 50);
  const qts = await simulateDbCall("quotations", 50);
  const docs = await simulateDbCall("documents", 50);
  const pays = await simulateDbCall("payments", 50);

  const end = performance.now();
  return end - start;
}

async function runConcurrent() {
  const start = performance.now();

  // Simulating the 7 concurrent calls
  const [ms, upd, photos, sigs, qts, docs, pays] = await Promise.all([
    simulateDbCall("milestones", 50),
    simulateDbCall("updates", 50),
    simulateDbCall("photos", 50),
    simulateDbCall("signatures", 50),
    simulateDbCall("quotations", 50),
    simulateDbCall("documents", 50),
    simulateDbCall("payments", 50),
  ]);

  const end = performance.now();
  return end - start;
}

async function main() {
  console.log("⚡ Bolt Performance Benchmark: Sequential vs Concurrent I/O");
  console.log("-----------------------------------------------------------");

  const seqTime = await runSequential();
  console.log(`Sequential execution time: ${seqTime.toFixed(2)}ms`);

  const concTime = await runConcurrent();
  console.log(`Concurrent execution time: ${concTime.toFixed(2)}ms`);

  const improvement = ((seqTime - concTime) / seqTime) * 100;
  console.log(`-----------------------------------------------------------`);
  console.log(`Performance Improvement: ${improvement.toFixed(2)}% faster!`);
  console.log(`(This mimics the impact of grouping independent DB reads in routes.ts)`);
}

main().catch(console.error);
