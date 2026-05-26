
## 2024-05-18 - Replacing Sequential Iteration with Concurrent DB Operations
**Learning:** Sequential `await` in loops (like `for...of`) for DB inserts creates an N+1 latency problem (where N is the number of records). Even when batch insert methods (`insertMany`) aren't exposed by the storage interface, `Promise.all` can parallelize the standard `create*` methods.
**Action:** Use `Promise.all(items.map(async ...))` for independent batch inserts/updates when a native bulk-insert method isn't available to minimize round-trip latencies.
