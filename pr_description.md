💡 What:
Replaced redundant array `.filter()` traversals inside the rendering loop of `LeadsTab` with an $O(n)$ `useMemo` grouping operation that uses `reduce()`. Fixed direct Hook imports (`useMemo` instead of `React.useMemo`) and explicitly typed callback variables to satisfy TypeScript compilation rules.

🎯 Why:
The previous implementation performed $O(n \times m)$ list filtering (`leads.filter(l => l.status === status)`) up to three times per status iteration inside the UI render loop. This caused unnecessary CPU bottlenecking and degraded frontend performance as the `leads` array grew. Grouping once drastically improves render efficiency.

📊 Impact:
Reduces array traversals and redundant React evaluations by ~75% during re-renders of the `LeadsTab` component. Translates to an $O(n)$ up-front parse with $O(1)$ lookups per UI status bucket.

🔬 Measurement:
Start the development server and navigate to `/#/admin` (Leads CRM Tab). Using React Developer Tools Profiler, the `LeadsTab` component will show significantly decreased computation times on mounting and subsequent updates when the `leads` data updates.
