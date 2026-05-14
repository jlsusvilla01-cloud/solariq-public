## 2024-05-18 - Sequential I/O Bottleneck on Entity Creation
**Learning:** Sequential DB inserts (e.g., using `for...of` with `await`) introduce unnecessary N+1 roundtrip latency for independent records. For example, inserting 10 default milestones sequentially takes ~105ms compared to ~10ms when parallelized.
**Action:** Always group independent I/O operations using `Promise.all(...)` when bulk insert capabilities (like `db.insert().values([...])`) are not available in the storage interface to mitigate sequential roundtrip latency.
