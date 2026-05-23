## 2024-05-23 - Push Query Filtering to DB
**Learning:** In Drizzle ORM implementations like `LibSQLStorage`, fetching entire tables into memory using `.all()` and filtering via Javascript arrays (e.g., `.find()`) creates severe memory overhead and O(n) parsing latency.
**Action:** Always push query filtering down to the database level utilizing Drizzle's `where()` clause with operators like `and()` and `eq()` to minimize payload size and improve execution time.
