## 2024-05-14 - Prevent O(N*M) Array Filtering Inside React Render Loops
**Learning:** Repetitive array `.filter()` inside a JSX `.map()` block (e.g., mapping over statuses and filtering the primary list inside each) can lead to O(N*M) operations on every single render. This is particularly noticeable with larger datasets fetched via React Query that may trigger multiple lifecycle renders.
**Action:** Use `useMemo` to group or transform data structures outside the render loop when possible, mapping properties dynamically instead of constantly recalculating subsets during render.
