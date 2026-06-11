
## 2025-02-12 - Optimized Array Reduction in React Components
**Learning:** Repetitive array `.filter().reduce()` calls inside React render loops cause `O(N*M)` bottlenecks. Grouping logic with single-pass `.reduce()` inside `useMemo()` reduces it to `O(N)`, drastically cutting down CPU overhead on large lists during re-renders.
**Action:** Always prefer `useMemo` combined with a single-pass `.reduce()` to group items into dictionary structures instead of chaining multiple `.filter()` and `.reduce()` operations on the same array inside render blocks.
