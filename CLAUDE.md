# EstateHub — Project Brief for Claude Code

> **You are working on EstateHub, a unified real estate marketplace and society management platform for India.**
> Read this file at the start of every session. It tells you what we're building, how we work, and what NOT to do.

---

## 1. Product in One Paragraph

EstateHub combines two product categories that are usually separate apps: a **property marketplace** (like Square Yards — buy/sell/rent listings, search, virtual tours, home loans) and a **society management suite** (like NoBrokerHood — visitor passes, maintenance billing, amenity booking, complaints). The thesis is that the home buyer of today becomes the resident of tomorrow, so they should live in one app for life.

Full product spec: see [`docs/PRD.md`](./docs/PRD.md)
Screen-by-screen flows: see [`docs/Functional_Flow.md`](./docs/Functional_Flow.md)

---

## 2. Where We Are Right Now

This is a solo-developer Phase 0 build. What's already in the repo:

- ✅ Next.js 15 + TypeScript + Tailwind CSS scaffold
- ✅ Prisma schema covering core entities (User, Property, Society, Flat, Visit, VisitorPass, MaintenanceBill, etc.)
- ✅ Database seed script with sample listings
- ✅ Homepage with featured listings
- ✅ Properties list page (`/properties`)
- ✅ Property detail page (`/properties/[id]`)
- ✅ One reference API route (`/api/properties` GET + POST) — this is THE TEMPLATE for new endpoints
- ✅ Reusable PropertyCard component, formatting helpers
- ⏳ Most of the rest of the PRD

What's NOT built yet (and what we'll build next, in order):

1. Property listing wizard (`/properties/new`) — Flow D in the FFD
2. Authentication via Clerk
3. Property detail page interactions (save, schedule visit)
4. Society module home (`/society`) — Flow E
5. Visitor pass generator
6. Maintenance billing
7. Search filters and sorting
8. Photo upload to S3 / Cloudinary
9. Map view of listings
10. Mobile-responsive polish pass

---

## 3. Tech Stack — STICK TO THIS

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | One framework for FE + API |
| Language | **TypeScript strict** | Catch errors at compile-time |
| DB | **PostgreSQL** via **Prisma** | Type-safe queries |
| Styling | **Tailwind CSS** with custom `brand-*` palette | Already configured in `tailwind.config.js` |
| Validation | **Zod** | Runtime + compile-time type safety |
| Auth | **Clerk** (planned) | Don't roll our own auth |
| Hosting | **Vercel** | Auto-deploys from `main` branch |
| Database host | **Neon** or **Supabase** Postgres free tier | |

**Do not introduce new dependencies without asking first.** If you think a library is needed, propose it in your response and wait for confirmation. The `package.json` is intentionally lean.

---

## 4. Coding Conventions

### File structure
```
app/                  # Next.js App Router pages and API routes
  api/<resource>/route.ts
  <route>/page.tsx
components/           # Reusable React components, PascalCase filenames
lib/                  # Pure utilities (formatting, prisma client, etc.)
prisma/               # Schema + seeds + migrations
docs/                 # PRD, Flow doc, prompt guide
```

### Naming
- React components: `PascalCase.tsx`
- Hooks: `useThing.ts`
- Utilities: `kebab-case.ts` or `camelCase.ts`
- Database tables: `PascalCase` singular (Prisma convention)
- API routes: `/api/resource` (plural noun, kebab-case)
- URL params: `[id]` for entity IDs

### TypeScript
- **No `any`.** Use `unknown` and narrow, or define a type.
- Prefer `type` over `interface` unless you need declaration merging.
- Use Prisma-generated types — don't redefine entity shapes manually.

### Components
- Server components by default. Add `"use client"` only when you need state, effects, or browser APIs.
- Fetch data in server components via `prisma` directly. Don't make a fetch call to your own API route from a server component — that's an extra hop.
- Client components fetch data via `fetch` from API routes.

### Styling
- Use Tailwind utility classes.
- Use the `brand-*` colour palette, never raw hex values.
- Reuse `.btn-primary`, `.btn-secondary`, `.card` from `globals.css` — extend rather than duplicate.

### API routes
- Always validate input with Zod (see `app/api/properties/route.ts` for the pattern).
- Always wrap Prisma calls in try/catch and log errors with a tagged prefix: `console.error("[POST /api/x]", err)`.
- Return JSON shapes: `{ data: ... }` on success, `{ error: "...", details?: ... }` on failure.
- Use proper status codes: 200/201 success, 400 validation, 401 auth, 404 not found, 500 server error.

### Database changes
- Edit `prisma/schema.prisma` first.
- Run `npx prisma db push` for local dev.
- Run `npx prisma generate` after every schema change so types update.
- For production migrations later: `npx prisma migrate dev --name <descriptive_name>`.

### Forms
- Validate the same Zod schema on both client and server.
- Show inline errors per field.
- Disable submit while pending.
- Use optimistic updates only when failure is visible to the user.

### Error handling
- Never let a UI crash on missing data. Use `??`, optional chaining, and fallback UI.
- Log errors server-side with context.
- User-facing error messages are friendly; technical details go to logs.

---

## 5. What I Want You to Do

When asked to build a feature:

1. **Confirm scope.** Restate what you're about to build in 1–2 sentences. If the task is bigger than ~150 lines of new code, propose breaking it down before starting.
2. **Reference the docs.** If the feature is in `docs/PRD.md` or `docs/Functional_Flow.md`, cite the section / screen number.
3. **Show the file list first.** Tell me which files you'll create or modify before generating code.
4. **Use the patterns already in the repo.** Look at how existing code does it before inventing a new pattern.
5. **Write production-ready code, not toy code.** Validation, error handling, accessibility — all of it.
6. **Explain trade-offs.** If you make a non-obvious choice (e.g., "I used a server action here instead of an API route because…"), say so.

---

## 6. What I DO NOT Want You to Do

- ❌ **Don't add features I didn't ask for.** Build exactly what was requested. If you spot something that should also be built, mention it at the end of your response — don't silently include it.
- ❌ **Don't refactor unrelated code.** If you notice a problem elsewhere, flag it; don't fix it as part of an unrelated PR.
- ❌ **Don't introduce new dependencies without permission.** Especially: no Redux, no react-query, no UI component libraries (we want to keep the bundle lean).
- ❌ **Don't write tests unless I ask for them.** We'll add testing later — it's not Phase 0.
- ❌ **Don't bypass TypeScript with `any` or `@ts-ignore`.** If something doesn't typecheck, fix the actual issue.
- ❌ **Don't commit secrets or API keys.** Anything secret goes in `.env` (gitignored) and is referenced via `process.env.X`.
- ❌ **Don't generate placeholder lorem-ipsum content.** Use realistic Indian property data — Bengaluru localities, Indian rupee amounts, real-sounding names.
- ❌ **Don't use Western property conventions.** This is an Indian product: BHK (not "bedrooms"), carpet area in sqft, prices in lakhs/crores, pincodes (6 digits), Indian states.
- ❌ **Don't use moment.js or lodash.** Use native Date / Intl APIs and built-in array methods.

---

## 7. Indian Real Estate — Domain Notes

So you don't make embarrassing mistakes:

- **BHK** = "Bedroom-Hall-Kitchen". A "3 BHK" = 3 bedrooms + 1 hall + 1 kitchen.
- **Carpet area** is the actual usable floor area. **Built-up area** includes walls. **Super built-up area** includes shared spaces.
- Prices are quoted in **lakhs (1L = ₹100,000)** and **crores (1Cr = ₹10,000,000 = 100L)**.
- **RERA** = Real Estate Regulatory Authority — every under-construction project must be registered.
- **Pincode** is 6 digits (not "ZIP code"). Bengaluru pincodes start with 56.
- **Society** = the residential complex / housing society. Has a managing committee.
- **Maintenance** = monthly society fees collected from residents (electricity for common areas, security, cleaning, etc.).
- **AGM** = Annual General Meeting of the society.

---

## 8. Useful Commands

```bash
# Start dev server
npm run dev

# Apply schema changes to local DB
npm run db:push

# Open Prisma Studio (GUI for the database)
npm run db:studio

# Re-seed the database
npm run db:seed

# Type-check the whole project
npx tsc --noEmit

# Lint
npm run lint
```

---

## 9. When You're Stuck

If a request is ambiguous, ASK before coding. A 30-second clarification beats 30 minutes of wrong code. Examples of good clarifying questions:

- "Should the visitor pass be valid only for a single entry, or multiple entries until expiry?"
- "Should I use an enum or a free-text field for property amenities? Enum is more validated, free-text is more flexible."
- "Should anonymous users see the full property detail or only a teaser?"

If you genuinely cannot decide and the user is unavailable, pick the simpler option and explicitly call out the assumption at the top of your response so I can correct you.
