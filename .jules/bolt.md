## 2026-06-23 - O(1) Lookup Optimization in Render Loops
**Learning:** Repetitive array .filter() calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Use useMemo with Array.prototype.reduce() to group items into a dictionary for O(1) lookups.
