# Product Admin Dashboard

Small admin dashboard to log in and manage products. Built with **Next.js (App Router) + React + TypeScript + Tailwind CSS + Axios**, on top of the free **DummyJSON API**. All API calls go through one shared Axios client.

**Live demo:** https://product-admin-dashboard-beta.vercel.app

## Demo credentials

- Username: `emilys`
- Password: `emilyspass`

## Getting started

Prerequisites: **Node.js 20+** and **npm**.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script          | What it does                              |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start the dev server (Turbopack)          |
| `npm run build` | Production build (also runs type checks)  |
| `npm run start` | Serve the production build                |
| `npm run lint`  | ESLint (Next + React Hooks rules)         |
| `npx tsc --noEmit` | TypeScript check                       |

No environment variables are needed. The API base URL lives in `src/services/api.ts`.

## What is finished

- [x] Login page (`POST /auth/login`), field + API error states, protected `/products*` routes, logout button
- [x] Product list: image, title, category, price, rating, stock — table on desktop, cards on mobile
- [x] Server-side pagination (`limit`/`skip`): page numbers with ellipsis, Previous/Next, page size 10/20/50, "Showing X–Y of Z"
- [x] Search (`/products/search?q=`) with 400 ms debounce; resets to page 1
- [x] Category filter (`/products/categories`) and sort (price, rating, title, asc/desc)
- [x] Product details at `/products/[id]`: gallery, description, price, stock, reviews; dedicated `not-found` page
- [x] Add (`/products/new`) / edit (`/products/[id]/edit`) form with validation; delete with confirm popup
- [x] Loading, empty and error states everywhere, with Retry
- [x] URL holds page, search, category and sort — refresh and shared links reproduce the view; invalid values (`?page=abc`, `?page=999`) are sanitized/clamped
- [x] One shared Axios instance (token interceptor + centralized errors); no React Query/SWR/table/pagination libraries; small components; API code separated from UI

## Engineering decisions

### Stale search responses (race condition)

Typing fast fires overlapping requests; a slow earlier response must never overwrite a newer one. Every fetch in `useProducts` / details / edit runs with its own `AbortController` (previous request is aborted on change/unmount) **plus** a monotonic `requestId` — late responses with a stale id are ignored. Reproduce with `&delay=2000` on the API URL: results always match the latest query.

### Search vs. category (API limitation)

DummyJSON cannot combine `/products/search` with a category filter in one request. Decision: **search wins**; the category stays in the URL (and a hint explains it is temporarily ignored) so it applies again once the search is cleared. Rationale: filtering the search response client-side would break server-side `total`/`limit`/`skip` pagination.

### Fake persistence (add/edit/delete)

DummyJSON acknowledges writes but never stores them. Approach: the UI still calls the real endpoints through the shared client, then stages the result in a client-side overlay (`src/store/productStore.tsx`: `added[]`, `updated{}`, `deletedIds[]`). The list merges the overlay via `useMemo` (no refetch flash); details/edit resolve the overlay before hitting the API. New items get a client-side `Date.now()` id because the API reuses ids across calls. Totals are approximate by design — documented in code.

### Invalid URL values

`parseProductUrlState` coerces everything (`?page=abc` → page 1, bad `limit`/`sort` → defaults) and the list clamps out-of-range pages to the last available page once `total` is known. The page never breaks on hand-edited URLs.

### Double submits

Login, save and delete handlers early-return on `isSubmitting`/`isDeleting` and disable their buttons — rapid clicks or Enter-mashing send exactly one request.

### Images

Plain `<img>` instead of `next/image` to avoid remote-loader config for the DummyJSON CDN (accepted ESLint `no-img-element` warnings, documented in code). New products use an inline SVG data-URI placeholder since the form has no upload.

## Problem solving

**Preventing stale search results.** The risky interleaving is: type "iphone" (request A) → quickly type "iphone 15" (request B) → B resolves first, A resolves later and paints the wrong list. Fixed with the AbortController + requestId combination described above, and verified by throttling the API with `delay=2000` while typing fast. The same discipline (abort on cleanup, ignore-after-abort) is applied to the details and edit pages.

## AI usage

AI tools were used for: exploring implementation alternatives, reviewing code for edge cases (invalid URLs, race windows, lint rule friction), and improving this documentation. Every file was reviewed line by line, all decisions above were made deliberately, and the code is walkthrough-ready — including a live change on request.

## Project structure

```
src/
├── app/
│   ├── login/page.tsx            # login form
│   └── products/
│       ├── layout.tsx            # AuthGuard + store provider + header
│       ├── page.tsx              # list: toolbar, table/cards, pagination
│       ├── new/page.tsx          # add product
│       └── [id]/page.tsx         # details
│       └── [id]/edit/page.tsx    # edit product
│       └── [id]/not-found.tsx    # wrong-id page
├── components/
│   ├── auth/                     # AuthGuard, LogoutButton
│   ├── products/                 # table, cards, search, filter, sort, form, delete
│   ├── pagination/               # hand-rolled pagination
│   └── ui/                       # loader, empty, error, confirm dialog
├── services/                     # api.ts (shared Axios), auth + products services
├── hooks/                        # useProducts, useCategories, useDebounce
├── store/                        # local CRUD overlay (fake persistence)
├── types/                        # auth + product models
└── utils/                        # url-state, pagination, format, placeholder
```

## Deploy

Standard Next.js app — deploy as-is on Vercel (`vercel` or `vercel --prod`) or Netlify. No env vars required.
