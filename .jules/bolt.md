## 2024-05-25 - React Render Loop O(N*M) Bottlenecks
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks, executing redundantly on every render pass.
**Action:** Use `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups at the top level of the component.
