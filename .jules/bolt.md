
## 2024-05-18 - Resolving N+1 Sequential Inserts with Promise.all
**Learning:** The `IStorage` interface in this application's backend architecture typically lacks native bulk insert methods for relational entities like milestones. Previously, default milestone creation upon project initialization ran sequential loops (`for...of` with `await storage.createMilestone`), leading to an N+1 performance bottleneck.
**Action:** When inserting multiple independent entities without strict dependencies, group independent I/O operations using `Promise.all(...)` instead of sequential `for...of` loops, cutting total latency from `O(N)` roundtrips to roughly `O(1)` parallel roundtrip time.
