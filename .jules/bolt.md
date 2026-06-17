## 2024-05-18 - Code Splitting Routes
**Learning:** Synchronous imports for all wouter route components cause the entire application to be bundled together, creating a massive initial payload.
**Action:** Wrap wouter routes in a single `<Suspense>` boundary and use `React.lazy` to dynamically load components only when their path is hit.
