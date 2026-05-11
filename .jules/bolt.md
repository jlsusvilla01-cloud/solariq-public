## 2024-06-25 - Parallelizing Entity Inserts
**Learning:** The current `storage-interface.ts` lacks dedicated batch operation methods (e.g., `createMilestones`), forcing sequential inserts when seeding data like default milestones for projects. Sequential awaits over these database calls compound latency sequentially.
**Action:** Use `Promise.all(items.map(item => storage.createEntity(item)))` as a standard pattern to mitigate DB latency for creating multiple independent entities when batch operations are unavailable.
