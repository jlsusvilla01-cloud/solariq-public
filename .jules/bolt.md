## 2024-05-18 - Repetitive .filter() in React Render Loops
**Learning:** Repeated calls to .filter() inside map render loops create an O(N*M) bottleneck as arrays grow. This can cause severe jank in kanban boards or categorized lists when the state updates.
**Action:** Use useMemo and Array.prototype.reduce() at the top of the component to pre-group items into an O(1) dictionary lookup.
