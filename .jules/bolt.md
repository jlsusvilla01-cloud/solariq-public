## 2024-03-30 - Code-Splitting Router Pages
**Learning:** Initial bundle sizes for Vite React applications can quickly become massive when multiple heavy pages are imported synchronously in the root router component. Code-splitting using `React.lazy` and `Suspense` is a low-effort, high-impact performance optimization in this codebase architecture.
**Action:** Always check `App.tsx` (or the root router) for synchronous page imports and convert them to dynamic imports (`React.lazy`) with a `<Suspense>` boundary to improve initial load times and reduce the main bundle size.
