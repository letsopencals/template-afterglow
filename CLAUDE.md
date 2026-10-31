# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/coaches/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx`: `<Button variant size fullWidth loading>`. Variants:
  `primary` (ink slab, red lip), `chalk` (on rubber), `outline`, `outline-chalk`,
  `ghost`, `plate` (yellow, the booking action: "Load the bar"). Sizes `sm|md|lg`.
  Square (2px) slabs with a 2px bottom "plate lip"; no pills. Links that look like
  buttons use `buttonClasses({ variant, size, fullWidth, className })`.
- `components/ui/input.tsx` — `<Input>`, `<Textarea>`, `<Select>`, `<FieldLabel>`.
- `components/ui/segmented.tsx` — plain radio-button rows (tier, site, length).
- `components/ui/overlay.tsx` — the one overlay: `kind="drawer"` (the Bar, the menu)
  or `kind="sheet"` (phone session panel, cancel dialog). Focus trap + scroll lock.
- Brand pieces live in `components/brand/*` (plate, calibration strip, LED readout,
  places meter, section head, logo). Never import a motion library.

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones.

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (default non-primitive props) to module-level `const`s
  instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/floor/session-block.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is never
  in the initial bundle: it loads on demand inside
  `components/checkout/checkout-view.tsx`.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## AFTERGLOW

See the section below once the build lands (TODO).

## Verifying changes

- `npm run typecheck`, `npm run lint` and `npm test` (vitest: timetable,
  catalog, floor, rack, bar, log, guards) must pass.
- `npm run build` must pass before release. Don't `next build` while a
  `next dev` runs in this folder (shared `.next`); build in a copy.
- Smoke test against a seeded `boutique_gym` store: the Floor shows today's
  lanes with places and some Full blocks pointing to "next with space"; a class
  and a 60-min PT load onto the Bar; checkout with pay-at-the-desk lands on the
  bib; the log shows the sessions and moves one.
