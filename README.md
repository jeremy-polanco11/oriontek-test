# OrionTek · Clients & Addresses

> **Senior Frontend Challenge** — A small SPA to manage OrionTek's clients, where each client owns N addresses. Built with the exact stack listed in the job posting.

---

## Stack

| Concern         | Choice                                     | Why                                                                          |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| UI framework    | **React 18 + TypeScript 5**                | Required by the post.                                                        |
| Bundler         | **Webpack 5** + Babel (env/react/ts)       | Required by the post — full custom config (no CRA, no Vite).                 |
| State           | **Redux Toolkit + React Redux**            | Required. `createAsyncThunk` for all API calls, memoized selectors.          |
| Routing         | **React Router DOM v6**                    | Required. Pages architecture, nested layout, lazy routes.                    |
| UI components   | **MUI v5 + @emotion**                      | Required. Theme tuned to brand palette.                                      |
| Utility CSS     | **Tailwind CSS** (Preflight off)           | Required. Coexists with MUI by disabling Preflight.                          |
| HTTP client     | **Axios** with interceptors                | Required. `/api` proxied to json-server via webpack devServer.               |
| Forms           | React Hook Form + Zod (`@hookform/resolvers`) | Senior-level validation — typed, reactive, single source of truth.           |
| Mock backend    | **json-server**                            | Real REST endpoints to demonstrate Axios + thunks against an actual API.     |
| Linting         | **ESLint** flat config + react/hooks/refresh plugins | Required.                                                                    |
| Type-safety     | `fork-ts-checker-webpack-plugin`           | Async type-check during dev, full check on build.                            |

---

## Quick start

Requires **Node 18+** and **bun** (or `npm`/`pnpm`).

```bash
bun install                # install deps
bun run dev                # web :3000  +  json-server :3010  (concurrently)
```

Open **http://localhost:3000** — the app redirects to `/clients`.

Other scripts:

```bash
bun run build         # production build → dist/
bun run preview       # serve dist/ locally
bun run lint          # ESLint over src/**
bun run type-check    # tsc --noEmit
bun run test          # vitest run — 57 tests, ~6s
bun run test:watch    # vitest watch mode
bun run test:coverage # coverage report (v8 provider)
bun run dev:api       # only json-server
bun run dev:web       # only webpack dev server
```

**Note:** Tests run on Vitest with jsdom. If your local Node has macOS hardened
runtime / library validation enabled (e.g. Node bundled inside a hardened-runtime
app), Rollup's native binary may fail to load. In that case use a normal Node
install (nvm/asdf/Homebrew) — `nvm use && bun run test`.

---

## Project structure (Pages architecture)

```
src/
├── app/                          # Redux store + typed hooks
│   ├── store.ts
│   └── hooks.ts
├── components/
│   ├── common/
│   │   └── ConfirmDialog.tsx     # Reusable confirm modal
│   ├── layout/
│   │   ├── AppLayout.tsx         # Header + <Outlet/>
│   │   └── Header.tsx
│   └── clients/
│       ├── ClientsTable.tsx
│       ├── ClientFormDialog.tsx  # Create / edit client (RHF + Zod)
│       ├── AddressList.tsx
│       └── AddressFormDialog.tsx # Create / edit address (RHF + Zod)
├── features/clients/             # Feature slice (data layer + state)
│   ├── types.ts
│   ├── clientsService.ts         # Axios calls
│   ├── clientsThunks.ts          # createAsyncThunk wrappers
│   ├── clientsSlice.ts           # Reducers + extraReducers
│   └── clientsSelectors.ts       # Memoized selectors
├── pages/
│   ├── ClientsPage/              # /clients
│   ├── ClientDetailPage/         # /clients/:id
│   └── NotFoundPage/
├── routes/
│   └── AppRoutes.tsx             # React.lazy + Suspense per route
├── services/
│   └── api.ts                    # Axios instance + error normalization
├── styles/
│   ├── index.scss                # Tailwind directives + globals
│   └── theme.ts                  # MUI createTheme
├── utils/
│   └── validators.ts             # Zod schemas (client, address)
├── App.tsx                       # Provider + ThemeProvider + Router
└── main.tsx                      # React 18 createRoot
```

---

## Data model

The core entities are simple: **a client owns N addresses**.

```ts
interface Address {
  id: string;
  label?: string;        // e.g. "Headquarters"
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;     // ISO 8601
  addresses: Address[];
}
```

Addresses are **embedded** inside the client document. CRUD operations on addresses go through `PUT /clients/:id` with a rebuilt `addresses[]`. This is what you'd do against any nested-resource API where the server doesn't expose a dedicated `/clients/:id/addresses` endpoint.

---

## Mock API

`mock/db.json` is served by `json-server` on port **3010**. The webpack dev server proxies `/api/*` to it (see `webpack.config.cjs › devServer.proxy`), so the app calls a relative `/api` URL in both dev and production — change only the proxy target / `baseURL` for a real API.

| Method | Path             | Purpose          |
| ------ | ---------------- | ---------------- |
| GET    | `/api/clients`   | List clients     |
| GET    | `/api/clients/:id` | Get client      |
| POST   | `/api/clients`   | Create           |
| PATCH  | `/api/clients/:id` | Update top-level fields |
| PUT    | `/api/clients/:id` | Replace (used for addresses) |
| DELETE | `/api/clients/:id` | Delete client + its addresses |

---

## Key design decisions

### MUI + Tailwind together

`tailwind.config.cjs` disables **Preflight** (`corePlugins.preflight = false`) so Tailwind's reset doesn't override MUI typography. `<CssBaseline/>` is mounted **before** Tailwind directives load, so MUI sets the baseline and Tailwind only adds utilities. This keeps both libraries happy with no class collisions.

### Redux Toolkit slice — three status flags

`clientsSlice` tracks three independent statuses:

- `status` — list fetch (`fetchClients`).
- `detailStatus` — single-client fetch (`fetchClientById`).
- `mutationStatus` — any in-flight mutation (create / update / delete + addresses).

Why three? So the list spinner doesn't fire when you're saving an address, and vice versa. Senior UIs care about this.

### Lazy routes

Routes are split via `React.lazy` + `Suspense` in `AppRoutes.tsx`. Initial bundle drops because MUI Dialog code only loads when a page that uses it renders.

### Form validation — RHF + Zod

Schemas live in `src/utils/validators.ts` and feed both forms via `zodResolver`. Errors are wired through MUI's `error`/`helperText` props. Submit is disabled until the form is valid.

### Error handling

`src/services/api.ts › toApiError()` normalizes any axios failure into a `{ status, message }` shape. Every thunk uses `rejectWithValue(toApiError(err))`, so the UI always gets a consistent error payload regardless of network/server fault.

---

## Test suite

5 files, 57 tests, ~6s on a fresh run:

| File | What it covers |
|---|---|
| `src/features/clients/clientsSlice.test.ts` | Reducer + extraReducers for every thunk's pending/fulfilled/rejected. Three status flags isolation. clearError. |
| `src/features/clients/clientsSelectors.test.ts` | Plain selectors (field access). Memoized selectors (`selectClientById`, `selectFilteredClients`) with case-insensitive name/email/phone search. Empty-search short-circuit. |
| `src/features/clients/clientsThunks.test.ts` | Each thunk dispatches correct action with mocked `clientsService`. Network error path normalizes to `ApiErrorPayload`. |
| `src/utils/validators.test.ts` | Zod schemas accept valid input, reject malformed (table-driven), trim whitespace before validating. |
| `src/components/clients/ClientsTable.test.tsx` | RTL: empty state, row rendering, `onEdit` / `onDelete` callback wiring, breadcrumb-style links to detail. |

Tests are written **service-mocked** rather than HTTP-mocked: thunk tests stub `clientsService` so we test orchestration without coupling to Axios. Component tests use `@testing-library/react` + `@testing-library/user-event` — interaction-based, no implementation details.

## Verification checklist

- [x] `bun install` installs cleanly
- [x] `bun run dev` runs both servers, app loads at `http://localhost:3000`
- [x] Listed clients come from the mock API (3 seeded entries)
- [x] Search filters by name / email / phone in real time
- [x] Create / edit / delete client works and persists across browser refresh
- [x] Detail page shows the addresses sub-resource
- [x] Add / edit / remove address works (writes back to `mock/db.json`)
- [x] Form validation errors render under each field, submit stays disabled
- [x] `bun run build` — clean production bundle in `dist/`
- [x] `bun run lint` — zero errors
- [x] `bun run type-check` — zero errors

---

## Out of scope (consciously)

- Authentication / authorization — the challenge specifies CRUD only.
- E2E tests (Playwright/Cypress) — unit + integration cover the contract; full E2E adds runtime cost without proportional signal at this size.
- Pagination / server-side filtering — list is small, json-server doesn't really shine here. The selector pattern (`selectFilteredClients`) is ready to swap to server-side.
- Dark mode, i18n, deployment.

---

## Author's note

Built in line with the job posting's exact stack to demonstrate fluency with each tool. The MUI + Tailwind hybrid is a deliberate pick: MUI for components (Dialog, Table, form controls — accessibility comes for free), Tailwind for layout and spacing utilities — the best of both, with Preflight disabled to avoid conflicts.
# oriontek-test
