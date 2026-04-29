## 2024-05-18 - [Optimizing Sequential DB calls in routes]
**Learning:** This codebase previously handled batch I/O operations (like setting up multiple default milestones or updating weather across projects) with sequential `for...of` loops, causing multiple sequential roundtrips to the DB.
**Action:** Use `Promise.all` mapped over the arrays to group independent asynchronous I/O operations whenever sequential processing is not strictly required. This mitigates latency penalties during project creation and background sync tasks.
