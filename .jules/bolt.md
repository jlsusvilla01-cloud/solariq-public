## 2024-07-01 - React O(N*M) bottlenecks in render
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Fix this by using `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups. Ensure the `useMemo` hook is placed at the top level of the component, not inline within JSX IIFEs or mapping functions, to comply with React's Rules of Hooks.
