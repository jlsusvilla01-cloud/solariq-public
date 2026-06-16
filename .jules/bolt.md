## 2026-06-16 - React Render Optimization with useMemo Hash Map
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks. Grouping items into a dictionary using `useMemo` with `Array.prototype.reduce()` provides O(1) lookups, significantly improving performance for large lists.
**Action:** When filtering a large dataset multiple times by different categories during render, pre-compute a grouped hash map with `useMemo`.
