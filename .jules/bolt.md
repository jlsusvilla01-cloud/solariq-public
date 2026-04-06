## 2026-04-06 - Array Reductions Bottleneck
**Learning:** React components containing multiple chained array operations (e.g., `.filter(...).reduce(...)` or `.filter(...).length`) on large query results are a significant source of main thread blocking and unnecessary re-renders when not memoized.
**Action:** When finding complex derivations from array data in React, consolidate them into a single pass loop and wrap them in `useMemo` to prevent expensive O(N) calculations on every render cycle.
