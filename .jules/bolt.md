## 2024-05-03 - [Concurrent DB Query Optimization]
**Learning:** In the `GET /api/track/:token` public route, there were 7 sequential `await` calls to fetch independent database records (milestones, updates, photos, etc.) after fetching the project. Since these operations do not depend on each other, they cause an N+1 like sequence issue creating a high cumulative latency constraint.
**Action:** Always group independent, sequential data fetching calls into an `await Promise.all([...])` block to run database queries concurrently when possible, drastically reducing overall latency.
