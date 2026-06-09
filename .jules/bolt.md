## 2025-05-15 - Array filter optimization in React
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks. Grouping items into dictionaries via `reduce()` or single loops is a proven optimization.
**Action:** Always optimize repetitive `.filter()` loops inside renders to use O(1) dictionary lookups or grouped arrays instead.
