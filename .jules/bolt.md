## 2024-06-04 - Eliminate Repetitive Array Filtering in Render Loops
**Learning:** React render loops with `.filter()` inside mapping loops cause O(N*M) bottlenecks. For example, `statuses.map(status => data.filter(item => item.status === status))` results in multiple iterations over the `data` array for every render.
**Action:** Always refactor these O(N*M) bottlenecks by grouping items into a dictionary for O(1) lookups using `useMemo` with `Array.prototype.reduce()`. Ensure `useMemo` is placed at the top level to comply with React's Rules of Hooks.
