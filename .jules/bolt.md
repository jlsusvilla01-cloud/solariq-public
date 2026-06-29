## 2024-05-15 - React Component Render Optimization
**Learning:** Repetitive array `.filter()` inside React JSX mapping functions causes performance bottlenecks during rendering because the filtering iterates over the entire array for each mapped item (O(N*M) complexity).
**Action:** Use `useMemo` in combination with `reduce` to group array items by a specific key into a dictionary-like object (O(N) time). Then access groups in O(1) time within the mapping loop.
