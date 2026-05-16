## 2024-06-25 - Group Independent Operations Concurrently
**Learning:** Sequential await loops inside endpoints fetching related, independent project data drastically impact response time due to sequential database roundtrips. Additionally, creating default rows (e.g., project milestones) sequentially suffers the same additive latency if the `IStorage` interface lacks batch operations.
**Action:** Use `Promise.all` to parallelize data-fetching operations and sequential writes that do not depend on each other, turning O(N) database latency roundtrips into ~O(1) total latency.
