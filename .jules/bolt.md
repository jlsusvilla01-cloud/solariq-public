## 2024-06-02 - Repetitive O(N) array filtering in React renders
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks. Calling `array.filter(item => item.type === type)` multiple times for each mapping of types (M types, N items) results in redundant iteration.
**Action:** Fix this by using `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups. Ensure the `useMemo` hook is placed at the top level of the component, not inline within JSX IIFEs or mapping functions.
