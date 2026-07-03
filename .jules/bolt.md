## 2024-07-03 - O(N*M) Filter Bottlenecks
**Learning:** Repetitive array .filter() calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Group items into a dictionary using useMemo and Array.prototype.reduce() for O(1) lookups.
