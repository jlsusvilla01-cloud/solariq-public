## 2026-06-25 - Optimization: Grouping repeated filters inside React loops
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Fix this by using `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups.
