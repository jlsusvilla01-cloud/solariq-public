## 2024-05-25 - React.lazy and Suspense for Component Code Splitting
**Learning:** Utilizing React.lazy() and Suspense to dynamically import large page-level components (e.g., Admin Dashboard) significantly reduces the main chunk size in Vite/Rollup builds.
**Action:** When a Vite build warns of chunk sizes exceeding 500kB, default to assessing the routing configuration for opportunities to apply `React.lazy()` instead of tweaking manual Rollup chunking configurations.
