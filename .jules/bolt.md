
## 2024-04-05 - Unmemoized Dashboard Aggregations
**Learning:** In heavily data-driven React components (like the `DashboardTab` and `AnalyticsTab` in `client/src/pages/Admin.tsx`), performing expensive array operations (`reduce`, `filter`, `map`) directly in the render body creates significant performance bottlenecks as the application scales. When arrays grow (e.g. tracking hundreds of projects or accounts), running these $O(n)$ or $O(n^2)$ calculations on every re-render causes unnecessary main thread blocking and input latency.
**Action:** Always wrap derived analytical state (aggregations, counts, sums, formats) in `useMemo` hooks, keeping the dependency array strictly on the input data collections.
