
## 2024-05-18 - Push Filtering to Database
**Learning:** Full table fetches into memory using `db.select().from(table).all()` followed by Javascript-level `.find()` or `.filter()` introduce massive memory overhead and I/O parsing latency for growing tables. Drizzle's `where()` with logical operators `and()`/`or()`/`eq()` should be aggressively leveraged instead.
**Action:** When searching for specific records, always use `db.select().from(table).where(and(...))` to ensure the database engine handles the filtering before sending data over the wire.
