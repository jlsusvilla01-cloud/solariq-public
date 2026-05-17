## 2024-05-24 - Parallelizing Sequential Storage Operations
**Learning:** The `IStorage` interface currently lacks batch operation methods (like bulk inserting milestones).
**Action:** When multiple independent database inserts/updates are required in an API route (e.g. initial project setup), use `Promise.all` with `.map()` instead of sequential `for...await` loops to parallelize network I/O and significantly reduce API response time.
