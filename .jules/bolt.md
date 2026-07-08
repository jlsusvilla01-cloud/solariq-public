## 2024-05-15 - [Example]
**Learning:** This is an example learning.
**Action:** Always check the memory.
## 2024-05-15 - [O(N*M) React Render Loop Bottlenecks]
**Learning:** Repetitive array `.filter()` calls inside React render loops cause O(N*M) bottlenecks.
**Action:** Use `useMemo` with `Array.prototype.reduce()` to group items into a dictionary for O(1) lookups.
