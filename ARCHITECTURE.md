# OrionTek · Architecture & Build Notes

> Companion document to `README.md`. The README explains **how to run it**; this one explains **how it was built and why each decision was made**. Written for reviewers who want to read the story behind the code.

---

## 1. The Challenge

> *"Se desea tener el control de todos los clientes pertenecientes a la empresa OrionTek donde cada cliente puede tener N cantidad de direcciones."*

Two artefacts framed the work:

1. The **technical challenge** — a CRUD for clients with N addresses each, delivered as a public Git repo.
2. The **job posting** for **React Senior Frontend** — a very specific stack: React 18, TypeScript 5, Webpack 5, Redux Toolkit, React Router DOM v6, MUI v5 + Emotion, SCSS / Tailwind CSS, Axios, ESLint, "arquitectura por pages".

The challenge isn't just "make a CRUD that works". It's **prove you can deliver senior-level frontend in the exact stack the team uses**. Using Vite when the post asks for Webpack 5 = filtered before the code is read.

That framing drove every decision below.

---

## 2. Decision log

### 2.1 Stack alignment over speed

The starting point was a fresh **Vite + React 19** scaffold — fast to spin up but not in line with the post. We **wiped it** and rebuilt the foundation from scratch with **Webpack 5 + Babel + React 18**. More work upfront, but it demonstrates fluency with the build tool the team has chosen.

### 2.2 Mock backend: `json-server`

We needed a REST API to demonstrate Axios + thunks against real network calls (not faked Promises). Three options were considered:

| Option | Verdict |
|---|---|
| `json-server` | ✅ Picked. Real REST endpoints, persists to disk, zero config |
| MSW (service worker mock) | ❌ Heavier setup, hides Network tab activity from reviewers |
| Real backend (Node + DB) | ❌ Eats half the time-box; the post is for **Frontend Senior** |

`json-server` runs on a separate port (`3010`) and is proxied through `webpack devServer` so the app calls a relative `/api/*` path in both dev and production.

### 2.3 UI: MUI v5 + Tailwind CSS, hybrid

The post explicitly lists both **MUI v5 + Emotion** and **SCSS / Tailwind CSS**. Rather than picking one, we use them together:

- **MUI** owns the *components* — Dialog, Table, TextField, Tooltip. Accessibility, focus management, keyboard nav come for free.
- **Tailwind** owns *layout and spacing* — `grid grid-cols-[248px_1fr]`, gap utilities, flex helpers.
- They coexist by **disabling Tailwind's Preflight** (`corePlugins.preflight: false`). Otherwise Preflight's CSS reset would clobber MUI's typography defaults and break the design system.

Result: each tool does what it's best at, with no class collisions.

### 2.4 Forms: React Hook Form + Zod

Not in the job post, but a senior developer wouldn't ship manual validation in 2026. The schemas in `src/utils/validators.ts` are the single source of truth — reused by both forms, fed into MUI's `error`/`helperText` props via `zodResolver`. The submit button is bound to `formState.isValid`, so it stays disabled until the schema is satisfied.

### 2.5 Routing: lazy-loaded routes

`React.lazy` + `Suspense` per route. Initial entrypoint dropped from **612 KiB → 330 KiB** because each page (and its MUI Dialog code) loads on demand. The Suspense fallback is a small `CircularProgress` inside the layout — no flash of empty content.

### 2.6 Brand alignment: OrionTek Design System

The OrionTek design package was imported wholesale into the MUI theme:

- Brand gradient (`#6868b8 → #2888c8 → #0898d8`) applied **only** to primary CTAs, brand mark, avatar circles, and active sidebar indicator. **Never** as full backgrounds.
- Outfit (variable, brand-supplied) for sans, JetBrains Mono for IDs/phones/dates.
- Cool blue-tinted neutrals (`#F7F9FC` bg, `#0F1B2D` highest-emphasis ink) so shadows stay clean.
- Navy sidebar (`#0F1B2D`) — the design's signature shell.
- Spanish DO copy throughout, formal *usted*, sentence case (no Title Case).

### 2.7 Strict TypeScript

`tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitAny`. `fork-ts-checker-webpack-plugin` runs the full type-check in a separate process during dev — no slowdowns in the main bundle, full type-check on every save.

---

## 3. Build pipeline

```
src/main.tsx ──▶ Babel ──▶ Webpack ──▶ HtmlWebpackPlugin
                  │           │
                  │           ├── style-loader / MiniCssExtract  (dev / prod)
                  │           ├── css-loader (modules + global)
                  │           ├── postcss-loader  ──▶ Tailwind + autoprefixer
                  │           ├── sass-loader   ──▶ SCSS
                  │           └── asset/resource (.png .svg .ttf)
                  │
                  ├── @babel/preset-env       (target: esmodules)
                  ├── @babel/preset-react     (runtime: automatic)
                  ├── @babel/preset-typescript
                  └── react-refresh/babel     (dev only)
```

Key webpack concerns covered in `webpack.config.cjs`:

- **dev/prod modes** in a single config (env-aware), so we don't fragment configs.
- **Code splitting**: `optimization.splitChunks: { chunks: 'all' }` in prod, `runtimeChunk: 'single'`, deterministic moduleIds for stable hashes.
- **Source maps**: `cheap-module-source-map` in dev, `source-map` (full) in prod.
- **dev server**: `historyApiFallback` (so deep links survive refresh), `hot: true` with React Refresh, **proxy `/api → http://localhost:3010`** with path rewrite stripping `/api`.
- **Asset pipeline**: explicit rule for `.ttf|.woff|.woff2` so the Outfit font in `src/assets/fonts/` resolves through the SCSS `url()`.
- **Type-check off the critical path**: `ForkTsCheckerWebpackPlugin` runs in parallel.

`bun run build` produces a `dist/` with hashed filenames, MiniCssExtract'd CSS, and HtmlWebpackPlugin's compiled `index.html`. Output bundle: **330 KiB** entrypoint after lazy routes — within the recommended ceiling for an MUI app of this size.

---

## 4. State management

```
┌─────────────────────────────────────────────────────────────────┐
│ UI (pages, components)                                          │
│   useAppSelector(selectAllClients)                              │
│   useAppDispatch()(createClient(...))                           │
└──────────────┬─────────────────────────────────────▲────────────┘
               │ dispatch                            │ state
               ▼                                     │
┌─────────────────────────────────────────────────────────────────┐
│ Redux Toolkit slice (clientsSlice)                              │
│   reducers: clearError                                          │
│   extraReducers: handle each thunk's pending/fulfilled/rejected │
└──────────────┬──────────────────────────────────────────────────┘
               │ dispatch async
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Thunks (clientsThunks.ts) — createAsyncThunk wrappers           │
│   fetchClients · fetchClientById                                │
│   createClient · updateClient · deleteClient                    │
│   addAddress · updateAddress · removeAddress                    │
└──────────────┬──────────────────────────────────────────────────┘
               │ await
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Service (clientsService.ts) — pure HTTP, no Redux knowledge     │
└──────────────┬──────────────────────────────────────────────────┘
               │ axios
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Axios instance (services/api.ts) — baseURL '/api', interceptors │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
   webpack devServer proxy  →  json-server (mock/db.json on :3010)
```

### 4.1 Three independent status flags

The slice tracks **three** statuses, not one:

```ts
status:         'idle' | 'loading' | 'succeeded' | 'failed'   // list fetch
detailStatus:   'idle' | 'loading' | 'succeeded' | 'failed'   // single fetch
mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed'   // any mutation
```

Why? So saving an address doesn't show the **list** spinner, and editing a client doesn't show the **detail** spinner. Senior UIs care about granularity.

### 4.2 Memoized selectors — without identity warnings

`createSelector` warns when the result function returns its input unchanged (no transformation = wasted memoization). Two patterns are used:

- **Plain selectors** for field access (`selectAllClients`, `selectClientsStatus`) — no memoization.
- **Memoized selectors** for real transforms (`selectFilteredClients`, `selectClientById`) — but they **short-circuit to the plain input selector** when there's nothing to filter, so memoization never wraps an identity function.

### 4.3 Address CRUD on a flat resource

`json-server` doesn't support nested REST endpoints idiomatically. So address operations are implemented as:

```
PUT /clients/:id  body: { ...client, addresses: [...rebuiltArray] }
```

The thunks (`addAddress`, `updateAddress`, `removeAddress`) read the current client, mutate the `addresses[]` array, and PUT the whole document back. This mirrors how you'd build against a real API where the server doesn't expose `/clients/:id/addresses/:addressId`.

---

## 5. Folder structure (Pages architecture)

```
src/
├── app/                          # Redux store + typed hooks
│   ├── store.ts
│   └── hooks.ts
├── components/
│   ├── common/
│   │   └── ConfirmDialog.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx         # 2-col grid: sidebar + main (sticky topbar)
│   │   └── Sidebar.tsx           # Navy sidebar, brand mark, nav items
│   └── clients/
│       ├── ClientsTable.tsx
│       ├── ClientFormDialog.tsx
│       ├── AddressList.tsx
│       └── AddressFormDialog.tsx
├── features/clients/             # Feature slice (data + state, no UI)
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
│   ├── index.scss                # CSS vars + @font-face + Tailwind
│   └── theme.ts                  # MUI createTheme + brand tokens
├── utils/
│   └── validators.ts             # Zod schemas (client, address)
├── assets/
│   ├── fonts/Outfit-VariableFont_wght.ttf
│   ├── oriontek-logo.png
│   └── circuit-bg.png
├── App.tsx                       # Provider + ThemeProvider + Router
└── main.tsx                      # createRoot, StrictMode
```

Why this structure?

- **`features/`** isolates business logic. The `clients` feature owns its types, service, thunks, slice, and selectors — easy to extract into a separate module later, or to add `features/users/` without polluting the existing folder.
- **`pages/`** matches what the post asks for: "Arquitectura por pages". Each route lives in its own folder so it can grow (add `ClientsPage.module.scss`, sub-components) without restructuring.
- **`components/`** holds shared UI. `clients/` are domain components used by `pages/clients*`; `common/` is generic; `layout/` is shell.

---

## 6. Visual identity

Implemented straight from the **OrionTek Design System** package:

| Token | Value | Where it shows |
|---|---|---|
| Brand gradient | `linear-gradient(120deg, #6868b8, #2888c8, #0898d8)` | Primary CTAs, brand mark, avatar circles, active nav indicator |
| Sidebar navy | `#0F1B2D` | Sidebar background |
| Surface bg | `#F7F9FC` | App background (cool blue-tinted, not pure grey) |
| Ink scale | `#0F1B2D` / `#2A3A52` / `#5A6A82` / `#8A98AD` | High-emphasis → tertiary text |
| Outfit | Variable, brand-supplied (100–900) | All UI text |
| JetBrains Mono | 400 / 500 | IDs, phones, dates |
| Shadow recipe | `rgba(15, 27, 45, …)` | Soft shadows that don't muddy on the bg |
| Focus ring | `0 0 0 3px rgba(8, 152, 216, 0.18)` | Inputs, buttons |

The MUI theme overrides every component (`MuiButton`, `MuiPaper`, `MuiTableCell`, `MuiOutlinedInput`, `MuiDialog`, `MuiChip`, ...) so MUI components inherit these tokens automatically — no inline `sx` overrides for normal cases.

---

## 7. What was deliberately left out

| Out | Why |
|---|---|
| Authentication / login | Not in the challenge spec |
| Unit / E2E tests | Time-box decision. Architecture is test-ready (thin components, pure service layer, typed selectors) |
| Real backend | Job is **Frontend Senior**; mock API is the right level |
| Pagination / server-side filtering | Dataset is small; the selector pattern is ready to swap to server-side without component changes |
| Dark mode | Out of scope; theme is structured to support it (just need a second `createTheme` call) |
| i18n | Single locale (Spanish DO) is consistent with brand voice |
| Deployment | Outside the time-box; `bun run build && serve dist` runs anywhere |

---

## 8. Verification checklist

Run from the repo root:

```bash
bun install         # install deps
bun run lint        # ESLint — should be 0 errors
bun run type-check  # tsc --noEmit — should be 0 errors
bun run build       # webpack prod build — should compile cleanly
bun run dev         # webpack-dev-server :3000 + json-server :3010
```

End-to-end:

- App loads at `http://localhost:3000`, redirects to `/clients`.
- 3 seed clients render (Acme Corporation, Globex S.A., Initech Ltd.) with their address counts.
- Search filters in real time by name, email, phone.
- New / edit / delete client persists to `mock/db.json`.
- Click a client → detail page with addresses, kv contact info, breadcrumbs.
- Add / edit / delete address persists.
- Browser refresh keeps the data (json-server writes to file).
- All interactions Spanish DO, no console errors, focus rings on every interactive element.

---

## 9. Time-box summary

The deliverable was framed as 24–48 hours. Roughly how the time was spent:

| Phase | Outcome |
|---|---|
| **Foundation** | Wipe Vite scaffold, write Webpack 5 / Babel / PostCSS / Tailwind / ESLint configs from scratch |
| **State & data** | Types, Axios instance, service layer, thunks, slice with three status flags, memoized selectors |
| **Routing & shell** | Lazy routes with Suspense, layout |
| **Pages** | ClientsPage (table + filters + dialogs), ClientDetailPage (header + kv + addresses), NotFoundPage |
| **Forms** | RHF + Zod schemas, integrated into MUI components |
| **Brand pass** | Imported OrionTek design tokens into theme, navy sidebar, gradient CTAs, Outfit font, Spanish copy |
| **Polish & verification** | React Router future flags, identity-selector cleanup, lint clean, type-check clean, lazy-route bundle |

---

*Written by the implementing engineer. The decisions reflect a senior-level read of the brief: build the stack the team uses, not the stack you find easiest.*
