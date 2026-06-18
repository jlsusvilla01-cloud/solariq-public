1. **Optimize repetitive `.filter()` calls in `client/src/pages/Admin.tsx`**
   - The `LeadsTab` component currently maps over an array of statuses (`['new', 'contacted', 'quoted', 'closed']`) and calls `leads.filter(l => l.status === status)` multiple times (for length checks, condition checks, and mapping to render the UI) inside the loop. This causes repeated iterations over the `leads` array.
   - Using the `run_in_bash_session` tool to execute `sed` and rewrite the code, I will replace these multiple O(N) filtering passes with a single `useMemo` block using `Array.prototype.reduce()` to group leads by status, adding it right after the `useQuery` call (around line 1210), and modify the rendering logic (lines 1227-1260) to use this memoized grouped object. This will result in O(N) total processing time and O(1) lookups per status, preventing unnecessary computation inside the render loop. Ensure I add comments explaining the optimization.

2. **Verify changes in `client/src/pages/Admin.tsx`**
   - Use `run_in_bash_session` to execute `cat -n client/src/pages/Admin.tsx | sed -n '1208,1270p'` to output the modified line range in `client/src/pages/Admin.tsx` to confirm the changes were written successfully.

3. **Test using `run_in_bash_session`**
   - I will use `run_in_bash_session` to execute `npm ci && npm run check && node --test` and then examine standard output to ensure commands exit successfully with code 0 to make sure the app compiles and passes type checking successfully.

4. **Pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5. **Submit the PR using `run_in_bash_session`**
   - I will use `run_in_bash_session` to execute the GitHub CLI command `gh pr create` with the title `⚡ Bolt: Optimize repetitive filter calls in LeadsTab` and a detailed description formatted with '💡 What', '🎯 Why', '📊 Impact', and '🔬 Measurement'.
