## 2024-05-24 - Bulk Inserts in LibSQL
**Learning:** Sequential inserts in SQLite/LibSQL over a network or file can incur significant overhead when generating multiple rows, such as IoT readings mock data.
**Action:** Instead of calling the single-insert method repeatedly inside a loop (`for (const r of readings) { await this.createReading(r); }`), use a batch insert `await db.insert(table).values(array)` or `Promise.all` when individual return values are not needed, ensuring the array is not empty before execution.
