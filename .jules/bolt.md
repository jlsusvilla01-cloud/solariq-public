## 2024-05-19 - React Hook Imports and Implicit Types
**Learning:** In this project's setup, `React` is not available as a UMD global, causing `TS2686` errors when using `React.useMemo`. Additionally, using implicit parameters in `.map()` loops can trigger `TS7006` ('implicitly has an any type') during compilation.
**Action:** Always import hooks directly from `react` (e.g., `import { useMemo } from 'react'`) instead of using `React.useMemo`, and explicitly type parameters in inline mapped functions (e.g., `(lead: Lead) =>`).
