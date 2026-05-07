## 2025-01-28 - Push Database Filtering to the Edge
**Learning:** In Drizzle ORM, reading entire tables into application memory (e.g., `db.select().from(table).all()`) and filtering them via JavaScript arrays (`.find()`) causes severe memory overhead and CPU latency, particularly for unbounded queries like `projects` or large tables.
**Action:** Always utilize Drizzle's `where()` clause with operators such as `and()`, `eq()` to push query filtering directly to the database. This significantly reduces I/O parsing latency and network payload size by limiting results at the source.
