## 2024-05-04 - Parallelize Sequential Database Writes
**Learning:** Found multiple instances of `for...of` loops with independent `await storage...` DB operations (e.g., milestone creation, weather updates) that caused sequential N+1 query patterns. This compounds network and DB latency linearly.
**Action:** Always replace independent sequential async loops with `Promise.all` using `.map()` over the array when the order of DB writes does not strictly matter, saving significant cumulative round-trip time.
