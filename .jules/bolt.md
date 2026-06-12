## 2025-02-14 - React Filter Render Loop Anti-Pattern
**Learning:** Repetitive array `.filter()` calls inside React component `map()` loops cause significant O(N*M) bottlenecks during renders, specifically observed in dashboard tabs rendering grouped elements (e.g., `LeadsTab` in Admin.tsx iterating pipeline stages).
**Action:** Always replace inline `.filter()` inside loops with a dictionary-grouped approach using `useMemo` and `Array.prototype.reduce()` to achieve O(1) lookups during the render phase.
