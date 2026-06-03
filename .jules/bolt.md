## 2024-10-24 - Array.prototype.filter in React Render Loops
**Learning:** Repetitive inline `.filter()` calls inside a map loop in a React component cause severe O(N*M) performance bottlenecks and cause unnecessary re-renders as new array references are generated every cycle.
**Action:** Always group data into a dictionary structure with `useMemo` and `Array.prototype.reduce()` prior to rendering when you need to distribute an array's items across multiple categories or bins.
