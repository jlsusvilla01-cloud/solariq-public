async function simulateLatency(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function unoptimized(items: any[]) {
  const start = Date.now();
  for (const item of items) {
    await simulateLatency(10); // simulate 10ms network roundtrip per query
  }
  return Date.now() - start;
}

async function optimizedPromiseAll(items: any[]) {
  const start = Date.now();
  await Promise.all(items.map(item => simulateLatency(10)));
  return Date.now() - start;
}

async function optimizedBulkInsert(items: any[]) {
  const start = Date.now();
  await simulateLatency(10); // Just 1 roundtrip for the whole batch
  return Date.now() - start;
}

async function run() {
  const items = Array.from({ length: 48 });
  console.log(`Unoptimized (Sequential Loop): ${await unoptimized(items)}ms`);
  console.log(`Optimized (Promise.all): ${await optimizedPromiseAll(items)}ms`);
  console.log(`Optimized (Bulk Insert): ${await optimizedBulkInsert(items)}ms`);
}

run();
