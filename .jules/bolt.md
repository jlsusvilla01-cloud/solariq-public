## 2024-05-24 - [Array Filter Bottleneck]
**Learning:** Found multiple array filter bottlenecks in loops in client/src/pages/Admin.tsx.
**Action:** Replace repetitious filter with useMemo and reduce
## 2026-07-05 - [Array Filter Bottleneck]
**Learning:** Array `.filter()` calls inside mapping loops cause severe O(N*M) bottlenecks.
**Action:** Use `useMemo` and `.reduce()` at the component level to group arrays by key into an O(1) dictionary lookup.
