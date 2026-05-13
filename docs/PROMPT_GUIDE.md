# EstateHub — Prompt Guide for Claude Code

A library of battle-tested prompts to feed Claude Code as you build EstateHub. Use them in roughly the order listed; each one builds on the previous.

## How to Use This File

1. **Open Claude Code** in VS Code (the extension panel).
2. **Pick a prompt** from below and copy-paste it.
3. **Read the diff Claude Code produces.** Don't blindly accept.
4. **Run the app** (`npm run dev`) and test the feature manually.
5. **Commit to git** with a clear message: `git commit -m "Add property detail page"`.
6. **Move to the next prompt.**

> 💡 **Don't skip steps.** The biggest mistake is queueing up multiple prompts back-to-back without verifying each works. One broken prompt cascades into a tangled mess.

---

## Prompt Anatomy — How These Are Structured

Every prompt follows the same shape, and you should follow it for any custom prompts you write:

```
[CONTEXT]    What this feature is and why it matters
[REFERENCE]  Which doc / section this is from
[REQUEST]    What exactly to build
[CONSTRAINTS] Specific rules, edge cases, things to NOT do
[ACCEPTANCE] What "done" looks like
```

This shape forces specificity, which is the difference between great Claude Code output and mediocre output.

---

## Phase 0 — Foundation (already in starter kit)

The starter kit you cloned already includes everything in Phase 0:
- Project scaffold, Prisma schema, seed data
- Homepage, properties list, property detail
- One reference API route

Skip ahead to Phase 1.

---

## Phase 1 — Make It Real

### Prompt #1 — Add Search Filters to the Properties Page

```
[CONTEXT] The /properties page currently shows all live listings without filters.
We need users to narrow results by city, BHK, intent (buy/rent), and price range.

[REFERENCE] PRD section 5.1.2 (Search & Discovery), Functional Flow Document
Screen B2 (Search Results — List View).

[REQUEST] Add a filter sidebar on the left of the /properties page (collapsible
on mobile into a drawer triggered by a "Filters" button). Filters:
  - Intent: Buy / Rent (radio)
  - City: free-text input with debounced filtering
  - BHK: 1 / 2 / 3 / 4 / 5+ (multi-select chips)
  - Price range: two number inputs (min, max)

Filters should sync to the URL as query params so the page is shareable and
back-button-friendly. Use the existing searchParams pattern in app/properties/page.tsx.

[CONSTRAINTS]
  - Server component for the page; client component only for the interactive
    filter sidebar.
  - No new dependencies — use native form elements styled with Tailwind.
  - Empty / null filter values should not be added to the URL.
  - The result count should update live as filters change.

[ACCEPTANCE]
  - Visiting /properties?city=Bengaluru&bhk=3 pre-fills the filters.
  - Changing any filter updates results without a full page reload (use
    Next.js router.push with shallow update).
  - Mobile: filters open in a drawer with a clear close button.
```

---

### Prompt #2 — Build the Property Listing Wizard (Flow D)

```
[CONTEXT] Owners need to list a property. Currently /properties/new is a stub.

[REFERENCE] PRD section 5.1.1 (Listing Creation), Functional Flow Document
Flow D, screens D1 through D6.

[REQUEST] Build a 6-step wizard at /properties/new:
  Step 1: Intent — Sell or Rent (D1)
  Step 2: Address & Society — search/select society or enter address (D2)
  Step 3: Configuration — BHK, area, bathrooms, balconies, furnishing, age, floor (D3)
  Step 4: Photos — at least 6 photos required, max 30 (D4) — for now use URL inputs;
          actual file upload comes in a later prompt
  Step 5: Pricing & Terms — price, negotiability, possession date (D5)
  Step 6: Review & Publish — show a summary; on submit, create with status DRAFT (D6)

State should live in a single React state object (no need for Zustand or similar).
Progress bar at the top showing current step. "Back" and "Next" buttons.
Field validation per step before allowing "Next".

The submit on step 6 calls POST /api/properties (already exists).

[CONSTRAINTS]
  - Client component — needs interactive state.
  - Reuse the same Zod schema on the client that the API uses on the server.
    Move it from app/api/properties/route.ts to lib/validators/property.ts so
    both can import it.
  - Each step is its own React component file under components/listing-wizard/.
  - Don't lose form state on step navigation.
  - For now, hardcode ownerId to the seed user's ID — auth comes later.

[ACCEPTANCE]
  - Filling all 6 steps and clicking Publish creates a Property in the DB
    and redirects to /properties/<new-id>.
  - Validation errors are inline and prevent advancing.
  - Clicking Back preserves the data already entered.
```

---

### Prompt #3 — Add Authentication via Clerk

```
[CONTEXT] Right now the app has no auth. Owners listing properties is hardcoded
to the seed user. We need real users.

[REFERENCE] PRD section 11 (Security), Functional Flow Document Flow A
(Onboarding). Phone OTP is what the PRD specifies; Clerk supports this.

[REQUEST] Integrate Clerk for phone-based authentication.
  - Add @clerk/nextjs to package.json.
  - Wrap app/layout.tsx in <ClerkProvider>.
  - Add middleware.ts protecting /properties/new, /society, and any /api routes
    that mutate data. Public routes: / and /properties (read-only).
  - On first sign-up, create a corresponding User row in our Prisma DB
    (clerkId field already exists). Use a webhook OR a server action that
    runs on first authenticated request — propose both and recommend one.
  - Replace the hardcoded ownerId in the listing wizard and API with the
    real authenticated user's id.
  - Update the header in app/layout.tsx to show <SignInButton /> or
    <UserButton /> from Clerk.

[CONSTRAINTS]
  - Read CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from .env.
  - Don't break the homepage for signed-out users.
  - Don't expose user PII — only show name and avatar in the header.

[ACCEPTANCE]
  - Visiting /properties/new while signed out redirects to Clerk sign-in.
  - Signing in creates a Clerk user AND a matching row in our User table.
  - The signed-in user's name appears in the header.
  - Logging out works.
```

---

### Prompt #4 — Photo Upload with S3 / Cloudinary

```
[CONTEXT] The listing wizard takes photo URLs as input. Real users need to
upload from their device.

[REFERENCE] PRD section 5.1.1 (Listing Creation — media uploads),
section 8.1 (Object storage).

[REQUEST] Add real photo uploads to step 4 of the listing wizard.

Use Cloudinary (simpler than S3 for a Phase 1 build). Specifically:
  - Sign-upload pattern: client requests a signed upload URL from
    /api/upload/signature, then uploads directly to Cloudinary from the browser
    (no large files ever touch our server).
  - On successful upload, save the secure_url and public_id into a temp client-side
    list, attached to the listing on final submit.

[CONSTRAINTS]
  - Cloudinary credentials in .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET (the secret never goes to the client).
  - Validate file type (jpeg/png/webp), size (max 8MB per file), and count
    (min 6, max 30) on both client and server.
  - Show upload progress per file; allow drag-to-reorder.
  - First photo is the cover photo (use the `order` field on PropertyPhoto).

[ACCEPTANCE]
  - User can drag/drop or click to select 6+ photos.
  - Photos appear in a sortable grid as they upload.
  - Bad files (too big, wrong type) show a clear inline error and don't block
    other uploads.
  - On listing submit, photos are persisted as PropertyPhoto rows.
```

---

### Prompt #5 — Property Detail Page Interactions

```
[CONTEXT] /properties/[id] currently shows a property but the Save and Schedule
Visit buttons don't do anything.

[REFERENCE] Functional Flow Document Screen B3 (Property Detail Page).

[REQUEST] Wire up:
  1. Save / Unsave (heart button)
     - POST /api/saved-properties { propertyId } toggles save state.
     - Heart icon fills when saved.
     - Optimistic update; revert on failure.
  2. Schedule Visit modal (Screens B4 + B5)
     - Click "Schedule Visit" opens a modal.
     - Inside the modal: Visit type (in-person / virtual), date picker, slot picker.
     - For now, show fixed slots: 10am, 12pm, 2pm, 4pm.
     - On confirm, POST /api/visits → returns a Visit with status REQUESTED.
     - Modal closes and shows a success toast.

[CONSTRAINTS]
  - Modal must trap focus and close on Esc.
  - Both endpoints require auth — return 401 if not signed in.
  - Don't allow scheduling visits in the past or more than 30 days out.

[ACCEPTANCE]
  - Saving a property persists across page refresh.
  - The /properties page can be filtered by "saved" via a future tab — for now
    just ensure the data is there.
  - Scheduled visits appear in the user's profile (next prompt).
```

---

### Prompt #6 — User Profile / "My Account" Page

```
[CONTEXT] Users have no place to see their saved properties, scheduled visits,
or listings they own.

[REFERENCE] PRD section 6 (User Roles), Functional Flow Document personas.

[REQUEST] Build /me with three tabs:
  - "Saved" — properties the user has saved
  - "My Visits" — upcoming and past site visits
  - "My Listings" — properties the user owns (only shown if they have any)

Each tab uses server components fetching directly from Prisma scoped to the
authenticated user.

[CONSTRAINTS]
  - Protected route (auth required).
  - Empty states for each tab with a CTA to fix it ("Save some properties",
    "Browse properties to schedule a visit", "List your property").
  - Cancellation: visits in REQUESTED or CONFIRMED state can be cancelled by
    the user — adds a button that POSTs to /api/visits/[id]/cancel.

[ACCEPTANCE]
  - Visiting /me shows the user's data correctly.
  - Tabs are accessible via /me?tab=saved etc.
  - Cancelled visits move out of "upcoming" into a separate section.
```

---

## Phase 2 — Society Module

### Prompt #7 — Society Onboarding & Resident Linking

```
[CONTEXT] We need users with the RESIDENT role to link to a society and a flat.

[REFERENCE] Functional Flow Document Screen A5 (Link Your Society), PRD section 5.2.1.

[REQUEST]
  1. Add /society/link page — searchable society + flat selector.
  2. On submit, create a Residentship row with status PENDING_VERIFICATION.
  3. Add a /api/residentships POST endpoint with Zod validation.
  4. /society page now shows:
     - If no Residentship: "Link your society" CTA → /society/link
     - If Residentship exists but PENDING: "Awaiting verification" state
     - If Residentship is ACTIVE: the society dashboard (next prompts)

[CONSTRAINTS]
  - One user can have multiple Residentships (multiple homes), but only one
    "current" one. Add a `isPrimary` boolean to Residentship in the schema.
  - For Phase 0 verification, auto-approve any Residentship after 5 seconds
    (TODO: replace with real OTP / committee approval later — leave a code
    comment with this TODO).

[ACCEPTANCE]
  - Searching for "Prestige Lakeside" finds the seeded society.
  - Choosing a flat creates a Residentship.
  - The /society page transitions through the three states correctly.
```

---

### Prompt #8 — Society Home Dashboard

```
[CONTEXT] An active resident lands on /society with quick actions and a feed.

[REFERENCE] Functional Flow Document Screen E1 (My Society Home), PRD 5.2.

[REQUEST] Build the /society dashboard with:
  - Greeting with user's name and flat number
  - Four quick-action tiles: "Invite visitor", "Pay maintenance", "Book amenity",
    "Raise complaint" — for now, only "Invite visitor" is wired up
  - A "Recent activity" feed showing the last 10 events affecting this flat:
    visitor entries, bills generated, complaints, etc. For now, only show
    visitor pass events.

[CONSTRAINTS]
  - Server component for the dashboard; activity feed pulls from VisitorPass
    where exitedAt or enteredAt is recent.
  - Each tile is a Link to its dedicated route.
  - Use the brand-* palette consistently.

[ACCEPTANCE]
  - Logged-in residents see their own data.
  - Non-residents redirected to /society/link.
```

---

### Prompt #9 — Visitor Pass Generator

```
[CONTEXT] Resident's most-used feature — generate a pass for an expected visitor.

[REFERENCE] Functional Flow Document Screens E2 + E3, PRD 5.2.2.

[REQUEST]
  1. /society/visitors/new page — form matching Screen E2
     (visitor name, optional phone, valid until time, vehicle info).
  2. POST /api/visitor-passes — generates a unique 6-digit OTP and a
     cryptographically random qrToken.
  3. Success page (Screen E3) showing:
     - Big QR code of the qrToken (use the `qrcode` npm package — yes, add it
       since this is a real feature need)
     - The OTP in large readable text
     - Validity window
     - Share buttons: WhatsApp (with prefilled message), copy link
  4. Add /society/visitors page listing this resident's recent passes.

[CONSTRAINTS]
  - QR token must be a 32-char URL-safe string.
  - OTP must be unique among ACTIVE passes.
  - Pass auto-expires at validUntil (handled by a status check, not a cron).
  - Cannot create a pass with validUntil > 24 hours from now (anti-abuse).

[ACCEPTANCE]
  - Can create a pass with all fields valid.
  - QR code renders and is readable by a phone camera.
  - WhatsApp share opens with prefilled "Your EstateHub gate pass: [link]" message.
  - Pass auto-expires when validUntil passes.
```

---

### Prompt #10 — Maintenance Bills Listing & Payment Stub

```
[CONTEXT] Residents need to see and pay maintenance bills.

[REFERENCE] Functional Flow Document Flow F (screens F1–F4), PRD 5.2.4.

[REQUEST]
  1. /society/bills page listing this resident's bills (PENDING, OVERDUE, PAID).
  2. /society/bills/[id] page showing the breakdown (Screen F2).
  3. "Pay" button that for now opens a fake payment page (Screen F3 + F4) that
     marks the bill as PAID after a 2-second simulated delay. Real payment
     gateway integration is a future prompt.
  4. Seed a few sample bills for the seed flat in prisma/seed.ts.

[CONSTRAINTS]
  - Use the existing MaintenanceBill model.
  - The breakdown JSON should be displayed as a readable table.
  - Status badges: PENDING (blue), OVERDUE (red), PAID (green).
  - Generate a downloadable receipt as plain HTML for now (PDF later).

[ACCEPTANCE]
  - Resident sees only their own flat's bills.
  - Paying a bill updates status and shows a receipt.
  - Receipt has txn id, date, amount, breakdown.
```

---

## Phase 3 — Polish & Extend

### Prompt #11 — Map View on Properties Page

```
[CONTEXT] A list view alone isn't enough — buyers want to see properties on a map.

[REFERENCE] PRD 5.1.2 (Map-first search), Screen B2.

[REQUEST] Add a "Map" toggle on /properties that swaps the grid for a map view.
Use Leaflet (open-source, free) with OpenStreetMap tiles. Pins for each
property; clicking a pin opens a small popup with the PropertyCard.

[CONSTRAINTS]
  - Lazy-load leaflet (it's heavy and only needed on this page).
  - Properties without lat/lng are excluded from map view with a notice.
  - Pin clusters when zoomed out (use leaflet.markercluster).
  - State sync: switching back to list keeps filters intact.
```

---

### Prompt #12 — EMI Calculator on Property Detail

```
[CONTEXT] Buyers compare EMIs while browsing.

[REFERENCE] Functional Flow Document Screen B3.

[REQUEST] Add an EMI calculator widget on /properties/[id] for SELL listings only:
  - Loan amount slider (default: 80% of property price)
  - Tenure slider (default: 20 years, range 5–30)
  - Interest rate input (default 8.5%)
  - Output: monthly EMI, total interest, total payable

[CONSTRAINTS]
  - Pure client-side math — no API needed.
  - Use the standard EMI formula: P × r × (1+r)^n / ((1+r)^n − 1).
  - Update output instantly as sliders move.
```

---

### Prompt #13 — Saved Searches with Email Alerts

### Prompt #14 — Owner Lead CRM

### Prompt #15 — Builder/Project Pages

### Prompt #16 — Complaint Tracking (Flow H)

### Prompt #17 — Amenity Booking (Flow G)

### Prompt #18 — Society Admin Dashboard

### Prompt #19 — In-App Chat Between Buyer & Owner

### Prompt #20 — PWA Polish & Mobile-Responsive Pass

> Prompts 13–20 are stubs — write them in the same shape as 1–12 when you're ready, using the PRD section and Functional Flow screen as the reference.

---

## Generic Prompt Templates

Keep these handy for ad-hoc work:

### Add a New Database Field

```
[CONTEXT] [Why we need this field]
[REQUEST] Add a `[fieldName]` field of type [type] to the [Model] model.
Update relevant API routes, validation schemas, and UI to handle the new field.
[CONSTRAINTS]
  - Default value: [...]
  - Backfill seed data with: [...]
[ACCEPTANCE] Running `npm run db:push` applies cleanly. Existing data is not lost.
```

### Fix a Bug

```
[CONTEXT] When I do [X], I expect [Y] but I see [Z].
Steps to reproduce: 1. ... 2. ... 3. ...
Console errors (if any): [paste]
[REQUEST] Diagnose the root cause first, explain it, THEN propose the fix.
Don't just patch the symptom.
```

### Refactor

```
[CONTEXT] [The current pain point — copy-paste, hard to test, slow, etc.]
[REQUEST] Refactor [path/to/file.tsx] to [extract X / split into Y / use Z pattern].
[CONSTRAINTS]
  - No behaviour change.
  - All existing imports continue to work.
  - The diff should be minimal — don't touch unrelated code.
[ACCEPTANCE] App runs identically. The refactored code is shorter / clearer.
```

---

## Anti-Patterns to Avoid

These prompts produce bad results — don't write prompts like these:

**❌ "Build the society management module."**
Too big. Will produce a messy, half-finished blob you can't review. Break it into the prompts above.

**❌ "Make the homepage look better."**
Too vague. What does "better" mean? Better how? Compare to which reference?

**❌ "Add tests for everything."**
Phase 0 testing is a sink. Decide what's worth testing (payment flows, auth, validation logic) and write specific prompts for those.

**❌ "Fix all the TypeScript errors."**
Show Claude Code the actual errors. Often a single root cause produces 20 errors.

**❌ "Use the latest version of [library]."**
Versions change all the time. Pin specific versions in package.json and don't ask Claude Code to chase the latest.

---

## When You Hit Trouble

If Claude Code produces broken code, the fix is rarely "try the same prompt again." Instead:

1. **Show Claude Code the error** verbatim, including stack trace.
2. **Tell it what you've already tried.**
3. **Ask it to diagnose before fixing**: *"What's the root cause of this? Don't write any code yet — just explain."*
4. After it explains, *then* ask: *"Now fix it with the smallest possible change."*

This two-step approach catches surface-level patches that don't address the real issue.

---

## Final Reminder

The CLAUDE.md file at the project root tells Claude Code your conventions. The prompts in this file tell it what to build. The PRD and Functional Flow doc give it the "why".

If Claude Code is producing inconsistent or surprising output, the first thing to check is: did it actually read CLAUDE.md? You can verify by asking it: *"Summarise what's in CLAUDE.md and tell me the three most important rules."* If it can't, something's wrong with how it's loading the file.
