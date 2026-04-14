import { performance } from "perf_hooks";

// Simulate a database fetch with some latency
const simulateFetch = (name: string, delayMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${name} data`);
    }, delayMs);
  });
};

async function runSequential() {
  const start = performance.now();

  // 7 sequential queries (simulated)
  await simulateFetch("milestones", 20);
  await simulateFetch("updates", 15);
  await simulateFetch("photos", 25);
  await simulateFetch("signatures", 10);
  await simulateFetch("quotations", 30);
  await simulateFetch("documents", 20);
  await simulateFetch("payments", 15);

  const end = performance.now();
  return end - start;
}

async function runConcurrent() {
  const start = performance.now();

  // 7 concurrent queries (simulated)
  await Promise.all([
    simulateFetch("milestones", 20),
    simulateFetch("updates", 15),
    simulateFetch("photos", 25),
    simulateFetch("signatures", 10),
    simulateFetch("quotations", 30),
    simulateFetch("documents", 20),
    simulateFetch("payments", 15)
  ]);

  const end = performance.now();
  return end - start;
}

async function runBenchmark() {
  console.log("Starting benchmark for data fetching...");

  let totalSeq = 0;
  let totalConc = 0;
  const runs = 5;

  for (let i = 0; i < runs; i++) {
    totalSeq += await runSequential();
    totalConc += await runConcurrent();
  }

  const avgSeq = totalSeq / runs;
  const avgConc = totalConc / runs;

  console.log(`\nResults (average of ${runs} runs):`);
  console.log(`Sequential Fetching: ${avgSeq.toFixed(2)} ms`);
  console.log(`Concurrent Fetching (Promise.all): ${avgConc.toFixed(2)} ms`);

  const improvement = ((avgSeq - avgConc) / avgSeq) * 100;
  console.log(`\nPerformance Improvement: ${improvement.toFixed(2)}% faster`);
  console.log(`Theoretical Max Latency (Concurrent): ~30 ms (bottlenecked by slowest query)`);
  console.log(`Theoretical Max Latency (Sequential): ~135 ms (sum of all queries)`);
}

runBenchmark().catch(console.error);
