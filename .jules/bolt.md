## 2026-04-10 - Concurrency over Sequential I/O in Routes
**Learning:** Found multiple routes where independent database reads (`storage.get*`) were being awaited sequentially. In Node.js server architectures, sequential I/O creates significant latency bottlenecks since each subsequent query must wait for the previous one to complete, even when they have no data dependencies on each other.
**Action:** Always group independent read operations using `Promise.all(...)` to execute them concurrently. This pattern should be proactively searched for in route controllers.
