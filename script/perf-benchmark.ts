import test from 'node:test';
import assert from 'node:assert';

// Simulate DB Latency
const DB_LATENCY_MS = 20;

// Mock database insert
const mockInsert = async (id: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`Inserted ${id}`);
    }, DB_LATENCY_MS);
  });
};

test('Performance Benchmark: Sequential vs Promise.all', async () => {
  const items = Array.from({ length: 10 }, (_, i) => i);

  console.log(`\n--- BENCHMARK: Inserting ${items.length} items with ${DB_LATENCY_MS}ms latency ---\n`);

  // Sequential
  const startSeq = performance.now();
  for (const item of items) {
    await mockInsert(item);
  }
  const endSeq = performance.now();
  const timeSeq = endSeq - startSeq;
  console.log(`Sequential insertion took: ${timeSeq.toFixed(2)}ms`);

  // Promise.all
  const startAll = performance.now();
  await Promise.all(items.map(item => mockInsert(item)));
  const endAll = performance.now();
  const timeAll = endAll - startAll;
  console.log(`Promise.all insertion took: ${timeAll.toFixed(2)}ms`);

  console.log(`\n--- RESULT ---`);
  console.log(`Promise.all is ${(timeSeq / timeAll).toFixed(1)}x faster.`);

  // Assert Promise.all is significantly faster (at least 5x in this case where concurrency is high)
  assert.ok(timeSeq > timeAll * 5);
});
