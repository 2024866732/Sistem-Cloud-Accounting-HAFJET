# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

# HAFJET Cloud Frontend Testing Guide

The project uses two testing layers:

1. **Unit / Component Tests**: Vitest + React Testing Library (jsdom)
2. **End-to-End (E2E) Tests**: Playwright

## 1. Unit & Component Tests

Location:
- Spec files: `src/**/*.test.tsx` or `src/**/__tests__/*.test.tsx`
- Setup file: `src/test/setup.ts`

Run all tests (headless):
```bash
npm run test
```
Watch/UI mode (interactive):
```bash
npm run test:ui
```
Coverage report:
```bash
npm run test:coverage
```

Key features tested now:
- `Layout` navigation rendering
- Active link highlighting via `aria-current`
- Sidebar collapse/expand + localStorage persistence
- Mobile menu open/close logic

Add a new component test example:
```bash
# Example filename:
src/components/__tests__/MyComponent.test.tsx
```
Use React Testing Library patterns (`render`, `screen`, `fireEvent`, semantic queries).

## 2. End-to-End (Playwright)

Config: `playwright.config.ts`
Specs: `e2e/*.spec.ts`
Current smoke test: `e2e/smoke.spec.ts` (loads app shell, checks sidebar, mobile menu).

Install/update browsers (already done once):
```bash
npx playwright install
```

Run all e2e tests (headless):
```bash
npm run test:e2e
```
Run only responsive layout tests:
```bash
npm run test:e2e:responsive
```
Filter by @responsive tag (equivalent):
```bash
npx playwright test --grep @responsive
```
Open interactive UI mode:
```bash
npm run test:e2e:ui
```

Recommended workflow:
1. Start backend API (port 3000 assumed) & frontend dev (5173 default).
2. Run `npm run test:e2e` in another terminal.
3. Use `--grep` to focus a subset, e.g.:
```bash
npx playwright test --grep @smoke
```

Tagging tests:
```ts
import { test } from '@playwright/test'

test('@smoke loads dashboard', async ({ page }) => { /* ... */ })
```

Artifacts:
- On first retry: traces recorded (`trace.zip`)
- On failures: screenshots & videos stored in Playwright default output (`test-results/`)

## 3. Selecting the Right Layer
| Goal | Layer | Notes |
| ---- | ----- | ----- |
| Pure UI logic, render states | Vitest | Fast feedback |
| User flows across pages | Playwright | Real browser semantics |
| Performance or visual regression | Playwright (extend) | Add assertions on timings / snapshots |

## 4. Common Patterns

Mocking network in unit tests: wrap component in a mock provider or stub fetch using `vi.spyOn(global, 'fetch')`.

For E2E auth flows (future):
- Add helper in `e2e/utils/auth.ts` to perform login via UI or API.
- Use `storageState` to persist session between tests.

## 5. Troubleshooting

| Issue | Cause | Fix |
| ----- | ----- | --- |
| `Cannot find module '@playwright/test'` | Dependency missing | `npm i -D @playwright/test` |
| Test hangs on navigation | Backend not running | Start backend server first |
| Flaky timing-dependent test | Animations / transitions | Use `await expect(...).toBeVisible()` w/ built-in retries |
| Sidebar tests fail in e2e | Viewport size mismatch | Use `page.setViewportSize` to force width |

## 6. Next Suggestions
- Add auth/login test after implementing secured routes.
- Integrate with CI (GitHub Actions) caching Playwright browsers.
- Add accessibility scans (axe) in component tests.
- Visual regression (e.g., `@playwright/test` + `pixelmatch`) if UI stability required.

## 7. Clean Up Nested Duplicate Package
There is a nested `frontend/frontend` directory with a minimal `package.json` that can cause confusion. Remove it to avoid accidentally running tests without scripts.

```
# From repo root (Windows PowerShell):
Remove-Item -Recurse -Force .\frontend\frontend
```

(Ensure nothing important lives inside before deleting.)

---

Happy testing! Reach out if you want CI workflow YAML or advanced mocking examples added next.
