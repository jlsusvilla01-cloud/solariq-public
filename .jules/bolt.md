## 2024-05-24 - Avoid Committing Log Files
**Learning:** During backend testing, output redirection (e.g., `> server.log`) can accidentally pollute the git index with log files if they are not explicitly ignored.
**Action:** Always ensure temporary artifacts and log files (`*.log`) are added to `.gitignore` and are removed or kept out of staging before committing.
