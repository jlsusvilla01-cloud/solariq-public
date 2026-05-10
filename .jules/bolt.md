## 2024-05-10 - Concurrent Bulk Inserts Mitigate N+1 Latency
**Learning:** Sequential database operations inside loop (e.g. `for (const x of arr) { await db.insert(x) }`) for initialization like default milestones creates severe N+1 latency bottlenecks.
**Action:** Always group independent I/O operations into `Promise.all()` to execute concurrently when native batching is unavailable, ensuring significant latency reduction (up to 10x faster).
