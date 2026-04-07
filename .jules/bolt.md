## 2024-10-26 - Eliminate database query waterfalls on polled endpoints
**Learning:** Found sequential independent database queries (waterfalls) in high-traffic endpoints (`/api/track/:token`, `/api/client/login`). In serverless environments, sequential remote DB calls add up to significant latency, tying up DB connections and increasing response time.
**Action:** Use `Promise.all` to fetch independent data concurrently where applicable, especially in endpoints queried often or via polling.
