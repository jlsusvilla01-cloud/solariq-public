## 2026-06-18 - Repetitive filter calls in render loop
**Learning:** Using repetitive array `.filter()` calls inside React render loops causes O(N*M) bottlenecks, especially when filtering the same array multiple times for different states or conditions.
**Action:** Fix this by using `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups at the top level of the component.
