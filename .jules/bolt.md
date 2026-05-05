## 2025-05-05 - Parallelizing Database Inserts
**Learning:** Sequential `await` in `for...of` loops introduces severe N+1 query performance hits, causing each DB operation's latency to stack up linearly (O(N)). In this application, newly created projects require the insertion of 10 default milestones. By inserting sequentially, it compounds network roundtrips.
**Action:** When multiple database entities need to be inserted or updated independently, always refactor sequential `for...of` loops using `await Promise.all()` to execute operations concurrently, reducing latency overhead from O(N) back to roughly O(1).

## 2025-05-05 - In-Memory Filtering vs Database Queries
**Learning:** Fetching an entire database table to filter it in-memory (`await db.select().from(table).all()` followed by `Array.find`) creates significant memory overhead and unnecessary I/O parsing, especially as data grows over time.
**Action:** Always push query filters down to the database level using `where(and(...))` clauses in Drizzle ORM to fetch only the necessary data.