## 2026-04-14 - Grouping independent queries with Promise.all
**Learning:** Sequential await calls for independent data significantly bottleneck performance, as the total latency becomes the sum of all individual query latencies.
**Action:** When fetching multiple independent collections (like milestones, updates, photos for a project), always group them using Promise.all to execute concurrently and bound latency to the slowest single query.
