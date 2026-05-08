## 2024-05-08 - Optimize Independent I/O with Promise.all
**Learning:** In `server/routes.ts`, fetching multiple independent related entities (milestones, updates, etc.) using sequential `await` statements severely compounds latency, making response time the sum of all queries rather than the duration of the slowest one.
**Action:** Always group independent I/O operations using `Promise.all(...)` to parallelize database access, especially for read operations like hydrating a project with its sub-entities.
