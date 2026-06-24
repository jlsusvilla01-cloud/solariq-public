## 2025-05-18 - Optimize repetitive array filters in render loops
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Use `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups.
