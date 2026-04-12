## 2024-04-12 - Concurrent Database Query Execution
**Learning:** In the project dashboard data aggregation endpoints, executing 7 individual `await storage.get...` commands sequentially causes a noticeable I/O latency bottleneck where each query waits for the previous one to complete, even though the queries are completely independent.
**Action:** Group independent database read operations using `Promise.all(...)` to execute them concurrently, mitigating sequential I/O latency bottlenecks.
