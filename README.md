# EstateHub

> A unified real estate marketplace and society management platform for India.
> Built with Next.js 15, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

This is the starter scaffold for EstateHub — a Phase 0 build that gets you from zero to a working, deployed web app.

## What's Already Built

- ✅ Next.js 15 (App Router) + TypeScript + Tailwind
- ✅ Prisma schema covering 14 core entities (User, Property, Society, Flat, Visit, VisitorPass, MaintenanceBill, …)
- ✅ Seed data with sample listings
- ✅ Homepage with featured properties
- ✅ Properties list page (`/properties`) with filter scaffolding
- ✅ Property detail page (`/properties/[id]`)
- ✅ Reference API route (`/api/properties` GET + POST) with Zod validation

## What's Not Built Yet

Almost everything else from the PRD. See [`docs/PROMPT_GUIDE.md`](./docs/PROMPT_GUIDE.md) for ready-to-use prompts to build features one at a time with Claude Code.

---

## Prerequisites

You'll need:

- **Node.js 20+** — install from [nodejs.org](https://nodejs.org) or use [`nvm`](https://github.com/nvm-sh/nvm)
- **A GitHub account** — sign up at [github.com](https://github.com)
- **Git** — install from [git-scm.com](https://git-scm.com)
- **VS Code** — install from [code.visualstudio.com](https://code.visualstudio.com)
- **Claude Code extension** — already installed per the user
- **A Postgres database** — easiest free option is [Neon](https://neon.tech) (recommended) or [Supabase](https://supabase.com)
- **A Vercel account** for deploying — [vercel.com](https://vercel.com) (free, sign in with GitHub)

---

## First-Time Setup (15 minutes)

### Step 1 — Get the code on your laptop

```bash
# Unzip the starter kit you downloaded, or clone the repo if you've already pushed it.
cd estatehub
```

### Step 2 — Install dependencies

```bash
npm install
```

This will take 2–3 minutes the first time.

### Step 3 — Create your free Postgres database

1. Go to [neon.tech](https://neon.tech) → sign in with GitHub → "Create a project".
2. Name it `estatehub`, region closest to you (e.g., `ap-southeast-1` for India).
3. Copy the connection string it gives you — looks like `postgresql://user:pwd@host.neon.tech/estatehub?sslmode=require`.

### Step 4 — Configure environment variables

```bash
# Copy the example file to a real one (this one is gitignored)
cp .env.example .env
```

Open `.env` in VS Code and paste your Neon connection string into `DATABASE_URL`. Leave the other variables blank for now — you'll fill them in as you add features.

### Step 5 — Set up the database

```bash
# Push the Prisma schema to your Neon database (creates all tables)
npm run db:push

# Generate the typed Prisma client
npx prisma generate

# Add some sample data
npm run db:seed
```

You should see "✅ Seeded: …" if it worked.

### Step 6 — Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the EstateHub homepage with three sample properties.

🎉 **You now have EstateHub running locally.**

---

## Push to GitHub (5 minutes)

### Step 1 — Create a new GitHub repo

1. Go to [github.com/new](https://github.com/new).
2. Name: `estatehub` (or whatever you prefer).
3. Visibility: your choice (Private is fine).
4. **Do NOT** initialise with a README, .gitignore, or license — we already have those.
5. Click "Create repository".

### Step 2 — Push your local code

GitHub will show you commands. They'll look like this:

```bash
# Inside the estatehub folder:
git init
git add .
git commit -m "Initial commit: EstateHub starter scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/estatehub.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

> 🔒 **Verify before pushing:** Run `git status` first. You should NOT see `.env` in the list of files to commit. If you do, something's wrong with `.gitignore` — stop and fix it before pushing.

---

## Deploy to Vercel (5 minutes)

This is where your app actually goes live on the internet.

### Step 1 — Connect Vercel to your GitHub

1. Go to [vercel.com](https://vercel.com) → "Sign up" → use your GitHub account.
2. Click "Add New" → "Project".
3. Find `estatehub` in the list of GitHub repos and click "Import".

### Step 2 — Configure the deployment

Vercel auto-detects Next.js. You only need to add **environment variables**:

1. Expand "Environment Variables" on the deploy screen.
2. Add `DATABASE_URL` with the same Neon connection string from your `.env`.
3. Add any other variables you've set up.
4. Click "Deploy".

Wait 1–2 minutes. Vercel will give you a URL like `https://estatehub-xxxxx.vercel.app` — that's your live app.

### Step 3 — Auto-deploy on every push

From now on, every time you `git push` to the `main` branch, Vercel automatically rebuilds and redeploys. You don't need to do anything else.

---

## Daily Development Workflow

```bash
# Pull latest changes (if working with others)
git pull

# Start the dev server
npm run dev

# Make changes — Claude Code helps here
# Test in the browser at localhost:3000

# Once a feature works:
git add .
git commit -m "Add property listing wizard step 3"
git push

# Vercel auto-deploys to your live URL within ~90 seconds
```

---

## Working with Claude Code

This project is structured to work *with* Claude Code, not against it.

### The CLAUDE.md file

[`CLAUDE.md`](./CLAUDE.md) at the project root tells Claude Code:
- What we're building
- The tech stack and conventions
- What NOT to do (no `any`, no Western property terminology, no unsolicited refactors, etc.)

Claude Code reads this automatically. When you start a session, you can verify by asking:
> *"Summarise what's in CLAUDE.md."*

If it can summarise it accurately, it's set up correctly. If not, check that the file is in the project root.

### The prompt guide

[`docs/PROMPT_GUIDE.md`](./docs/PROMPT_GUIDE.md) contains 12+ ready-to-use prompts to build features. Each one is structured with `[CONTEXT] [REFERENCE] [REQUEST] [CONSTRAINTS] [ACCEPTANCE]` — copy them straight into Claude Code.

### The reference docs

- [`docs/PRD.md`](./docs/PRD.md) — the full Product Requirements Document
- [`docs/Functional_Flow.md`](./docs/Functional_Flow.md) — screen-by-screen user journeys

> 📌 **Important:** Drop your existing PRD and Functional Flow .docx files into `docs/` and convert them to Markdown (or keep them as .docx — Claude Code can read both). Claude Code will reference them when prompts cite specific sections.

---

## Project Structure

```
estatehub/
├── CLAUDE.md                 ← Read by Claude Code on every session
├── README.md                 ← This file
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.example              ← Template for your secrets
├── .gitignore                ← Prevents committing .env, node_modules
│
├── app/                      ← Next.js App Router
│   ├── layout.tsx            ← Root layout (header, footer)
│   ├── page.tsx              ← Homepage
│   ├── globals.css           ← Tailwind + custom CSS
│   ├── properties/
│   │   ├── page.tsx          ← Listings page
│   │   ├── new/page.tsx      ← (stub) Listing wizard
│   │   └── [id]/page.tsx     ← Detail page
│   ├── society/
│   │   └── page.tsx          ← (stub) Society dashboard
│   └── api/
│       └── properties/
│           └── route.ts      ← Reference API route
│
├── components/
│   └── PropertyCard.tsx
│
├── lib/
│   ├── prisma.ts             ← Singleton Prisma client
│   └── format.ts             ← Currency/area formatters
│
├── prisma/
│   ├── schema.prisma         ← Database schema (source of truth)
│   └── seed.ts               ← Sample data
│
└── docs/
    ├── PROMPT_GUIDE.md       ← Prompts for Claude Code
    ├── PRD.md                ← (drop yours in)
    └── Functional_Flow.md    ← (drop yours in)
```

---

## Useful Commands

```bash
npm run dev               # Start dev server at localhost:3000
npm run build             # Build for production (catches errors)
npm run start             # Run the production build locally
npm run lint              # Run ESLint
npm run db:push           # Apply schema changes to your DB
npm run db:studio         # Open Prisma Studio (GUI for the database)
npm run db:seed           # Re-seed sample data
npx tsc --noEmit          # Type-check the whole project
```

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run `npx prisma generate`.

### "Environment variable not found: DATABASE_URL"
Check your `.env` file exists and has `DATABASE_URL` filled in. Restart the dev server.

### Vercel build fails with Prisma error
Add this to your `package.json` `scripts`: `"postinstall": "prisma generate"`. Vercel needs to regenerate the client after install.

### Page shows "No properties yet"
Run `npm run db:seed`. If that fails, your DB connection isn't working — verify your `DATABASE_URL`.

### Pushed `.env` to GitHub by accident
1. **Rotate your secrets immediately** (regenerate the Neon connection string, etc.).
2. Remove the file from git history: `git rm --cached .env && git commit -m "Remove .env from tracking" && git push`.
3. Verify `.env` is in `.gitignore`.

---

## What to Build Next

Open [`docs/PROMPT_GUIDE.md`](./docs/PROMPT_GUIDE.md) and start with **Prompt #1 — Add Search Filters to the Properties Page**.

Build one feature, commit it, push it, see it deploy live, then move to the next.

Resist the urge to do everything at once. **A live app with 5 polished features beats a half-built one with 50.**
