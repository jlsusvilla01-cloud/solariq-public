## 2024-05-15 - Concurrent Database Fetching with Promise.all
**Learning:** Sequential database queries for independent data collections (like fetching milestones, documents, and payments after retrieving a project) create an unnecessary latency bottleneck, especially on endpoints like client portal login or project details.
**Action:** Group independent I/O operations using `Promise.all(...)` to execute them concurrently, reducing total wait time.
