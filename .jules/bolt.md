## 2024-06-19 - Optimize Array Iteration
**Learning:** Repetitive array .filter().reduce() calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Use useMemo with Array.prototype.reduce() to group items into a dictionary for O(1) lookups.
