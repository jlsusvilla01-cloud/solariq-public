## 2024-05-15 - Concurrent Database Queries
**Learning:** Grouping independent I/O operations (like fetching multiple related collections from the database sequentially) using `Promise.all(...)` executes them concurrently. This mitigates sequential latency bottlenecks, dramatically speeding up complex API endpoints that rely on gathering data from multiple sources.
**Action:** Always look for opportunities to replace sequential `await` statements on independent operations with `Promise.all` throughout the codebase, especially in data aggregation endpoints.
