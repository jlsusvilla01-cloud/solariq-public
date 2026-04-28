## 2024-05-17 - [DB IO Concurrency]
**Learning:** Sequential DB I/O in loops is a common bottleneck. This app utilizes LibSQL.
**Action:** Replace `for (const x of items) await dbOp(x)` with `await Promise.all(items.map(x => dbOp(x)))` for independent operations, or `db.insert(table).values(items).run()` for bulk inserts.
