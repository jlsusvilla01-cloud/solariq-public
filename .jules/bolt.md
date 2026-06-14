## 2026-06-14 - Render Loop Filter Bottleneck
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks. Grouping items into a dictionary for O(1) lookups reduces inline filtering overhead to an O(N) single pass grouping.
**Action:** Use `useMemo` with `Array.prototype.reduce()` to eliminate these multiple inline map/filter calls.
