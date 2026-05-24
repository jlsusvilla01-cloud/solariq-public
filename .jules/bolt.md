## 2024-05-24 - Mitigating Sequential DB Query Latency
**Learning:** In endpoints that require fetching or inserting multiple independent relational datasets (like project milestones, documents, payments, etc.), running sequential `await` calls or loops creates severe N+1 latency due to sequential DB roundtrips.
**Action:** Always group independent I/O operations (like `storage.get*ByProject` or independent `storage.createMilestone` inserts) using `Promise.all()` to execute them concurrently and significantly reduce request response time.
