## 2024-06-10 - Avoid repetitive array \`.filter()\` calls inside React render loops
**Learning:** Repetitive array \`.filter()\` calls inside React render loops cause O(N*M) bottlenecks. Grouping items into a dictionary for O(1) lookups reduces this overhead.
**Action:** Use \`useMemo\` with \`Array.prototype.reduce()\` to group items into a dictionary, ensuring the hook is placed at the top level of the component to comply with React's Rules of Hooks.
