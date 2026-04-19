## 2024-05-18 - Optimize Milestone Creation Concurrency
**Learning:** Sequential DB writes using `await` inside a `for...of` loop can create significant latency bottlenecks on endpoints that generate multiple default records (like seeding 10 project milestones).
**Action:** Replace sequential `for...of` loops with `Promise.all` + `.map()` for bounded batch inserts where the underlying storage layer lacks a native batch `insertMany` function.
