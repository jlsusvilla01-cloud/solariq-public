## 2024-05-24 - Group Independent DB I/O
**Learning:** Sequential `for...await` loops over database insert/update methods cause a linear accumulation of I/O network roundtrip latencies (the N+1 query problem applied to writes).
**Action:** When a bulk batch method (e.g. `db.insert().values(array)`) is not exposed by the storage interface, use `Promise.all(array.map(item => dbOp(item)))` to dispatch operations concurrently.
