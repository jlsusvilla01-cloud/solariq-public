## 2024-05-24 - Grouping Independent I/O Operations on Entity Initialization
**Learning:** Default entity generation routines (like seeding default milestones when creating a project) often use sequential `for...of` loops, causing an N+1 database roundtrip performance penalty.
**Action:** Replace sequential `await` loops with `Promise.all()` to map inserts concurrently. This reduces total latency to the duration of the slowest query rather than the sum of all queries, making initial setup steps significantly faster without large refactors.
