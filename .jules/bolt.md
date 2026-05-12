## $(date +%Y-%m-%d) - Parallelize Default Milestone Creation
**Learning:** Found sequential O(n) insert queries for milestone defaults blocking request latency on the project creation endpoint (`POST /api/admin/projects` and `POST /api/user/projects`).
**Action:** When creating fixed numbers of related entities simultaneously (like default milestones), use `Promise.all()` to parallelize the requests instead of a sequential `for...of` loop to prevent N+1 query scaling issues.
