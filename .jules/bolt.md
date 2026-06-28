## 2024-06-28 - Optimize array .filter() in render functions
**Learning:** Found O(N*M) bottlenecks in React components (like LeadsTab) where arrays are repeatedly filtered in render loops based on static categories.
**Action:** Group data ahead of time using `useMemo` and `Array.prototype.reduce()` to convert O(N*M) operations into O(1) dictionary lookups.
