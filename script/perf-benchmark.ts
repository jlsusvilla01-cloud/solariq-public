async function simulateDbCall(name: string, delayMs: number) {
  return new Promise(resolve => setTimeout(() => resolve(name), delayMs));
}

async function runSequential() {
  const start = Date.now();
  await simulateDbCall("milestones", 50);
  await simulateDbCall("updates", 50);
  await simulateDbCall("photos", 50);
  await simulateDbCall("signatures", 50);
  await simulateDbCall("quotations", 50);
  await simulateDbCall("documents", 50);
  await simulateDbCall("payments", 50);
  const end = Date.now();
  console.log(`Sequential fetch took: ${end - start}ms`);
  return end - start;
}

async function runParallel() {
  const start = Date.now();
  await Promise.all([
    simulateDbCall("milestones", 50),
    simulateDbCall("updates", 50),
    simulateDbCall("photos", 50),
    simulateDbCall("signatures", 50),
    simulateDbCall("quotations", 50),
    simulateDbCall("documents", 50),
    simulateDbCall("payments", 50),
  ]);
  const end = Date.now();
  console.log(`Parallel fetch took: ${end - start}ms`);
  return end - start;
}

async function main() {
  console.log("Simulating /api/track/:token database fetch latency (7 queries at 50ms each)...");
  const seqTime = await runSequential();
  const parTime = await runParallel();

  const improvement = ((seqTime - parTime) / seqTime * 100).toFixed(2);
  console.log(`\nPerformance Improvement: ${improvement}% faster`);
}

main().catch(console.error);
