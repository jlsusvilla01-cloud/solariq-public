
## 2024-05-24 - Grouping Independent I/O Operations
**Learning:** In backend architecture containing numerous independent sequential database calls (e.g. retrieving milestones, updates, photos sequentially for a single request), the execution time scales linearly with latency per operation. This sequential latency becomes a significant bottleneck.
**Action:** Always map independent database collections (or batch inserts like default milestones) to `Promise.all()` to execute them concurrently. This pattern ensures latency is capped largely at the slowest individual query rather than the sum of all queries.
