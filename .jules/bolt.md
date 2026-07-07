## 2026-07-07 - [O(N*M) Rendering Fix in LeadsTab]
**Learning:** [Repeated array '.filter()' calls within mapping functions (e.g., LeadsTab rendering by status) cause significant O(N*M) bottlenecks during re-renders.]
**Action:** [Use 'useMemo' combined with 'Array.prototype.reduce()' to group elements into a dictionary mapping, replacing O(N) filters with O(1) property lookups.]
