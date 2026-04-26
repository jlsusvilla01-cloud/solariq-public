/**
 * ⚡ Bolt: Performance Benchmark for N+1 Query Resolution
 *
 * This script simulates the database latency to demonstrate the
 * performance benefits of bulk inserting versus sequential inserting.
 *
 * Scenario: 48 solar readings to insert (mocking the `generateMockReadings` function).
 * Simulated Network/DB Latency: ~50ms per roundtrip.
 */

const LATENCY_MS = 50;
const READINGS_COUNT = 48;

// Simulate a database operation with latency
const simulatedDbOp = async () => {
  return new Promise(resolve => setTimeout(resolve, LATENCY_MS));
};

async function runBenchmark() {
  console.log(`⚡ Bolt Performance Benchmark ⚡`);
  console.log(`Simulating ${READINGS_COUNT} inserts with ~${LATENCY_MS}ms DB latency per roundtrip...\n`);

  // 1. Sequential Inserts (N+1 bottleneck)
  console.log('Testing Sequential Inserts (Old Way)...');
  const startSequential = performance.now();
  for (let i = 0; i < READINGS_COUNT; i++) {
    await simulatedDbOp(); // 1 roundtrip per insert
  }
  const endSequential = performance.now();
  const timeSequential = endSequential - startSequential;
  console.log(`❌ Sequential time: ${timeSequential.toFixed(2)}ms\n`);

  // 2. Bulk Insert (Optimized)
  console.log('Testing Bulk Insert (New Way)...');
  const startBulk = performance.now();
  // Simulate array preparation (very fast)
  const readings = new Array(READINGS_COUNT).fill({});
  if (readings.length > 0) {
    await simulatedDbOp(); // 1 roundtrip for ALL inserts combined
  }
  const endBulk = performance.now();
  const timeBulk = endBulk - startBulk;
  console.log(`✅ Bulk Insert time: ${timeBulk.toFixed(2)}ms\n`);

  // 3. Results
  const speedup = timeSequential / timeBulk;
  const timeSaved = timeSequential - timeBulk;

  console.log(`📊 Benchmark Results:`);
  console.log(`- Time saved: ${timeSaved.toFixed(2)}ms per call`);
  console.log(`- Performance improvement: ${speedup.toFixed(2)}x faster`);
  console.log(`- Roundtrips reduced from ${READINGS_COUNT} to 1`);
}

runBenchmark().catch(console.error);
