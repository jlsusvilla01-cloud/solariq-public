## 2024-05-27 - Frontend Code Splitting with Wouter

**Learning:** The `wouter` routing library seamlessly supports `React.lazy` loaded components. The routes can be wrapped in a single `<Suspense>` boundary without requiring specialized routing wrappers. This is a critical pattern for optimizing large Vite bundles where heavy route components (like `AdminPage` which is over 2600 lines) inflate the initial JS payload.

**Action:** Whenever introducing large, feature-heavy route components (e.g. dashboards, admin portals) to a React app using `wouter`, proactively implement code splitting using `React.lazy()` and `<Suspense>` for those routes to maintain a minimal initial JS chunk size.
