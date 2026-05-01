## 2026-05-01 - Parallelize Default Milestone Initialization
**Learning:** Initializing default data (like milestones) inside a `for` loop with sequential `await` operations creates an N+1 latency bottleneck against the database. Because these inserts don't depend on each other, waiting for one roundtrip to complete before starting the next scales latency linearly, O(n).
**Action:** Use `Promise.all` alongside array map operations to dispatch independent database queries concurrently. This reduces the latency penalty from O(n) down to roughly O(1) network roundtrip latency.
