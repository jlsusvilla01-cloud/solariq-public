## 2024-06-07 - React useMemo for array grouping in Admin.tsx LeadsTab
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks. `client/src/pages/Admin.tsx` maps over statuses and repeatedly calls `.filter()` on the same array.
**Action:** Use `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups. Ensure `useMemo` is placed at the top level of the component, not inline within JSX.
