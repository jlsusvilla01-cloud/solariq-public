## 2025-06-01 - Avoid Render-Loop `filter` Bottlenecks
**Learning:** Repetitive array `.filter()` calls inside React render loops, especially mapping over an array of statuses to filter an array of entities, cause unnecessary O(N*M) bottlenecks.
**Action:** When filtering a dataset into distinct categories inside a render loop, group the items into a dictionary using `useMemo` with `Array.prototype.reduce()` to provide O(1) lookups instead.
