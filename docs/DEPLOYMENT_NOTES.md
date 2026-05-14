# EstateHub — Deployment Notes

> This document covers the complete deployment pipeline for EstateHub:
> from committing code locally → GitHub → Supabase database → Vercel hosting.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Accounts](#2-prerequisites--accounts)
3. [Local Development Setup](#3-local-development-setup)
4. [Committing & Pushing Code to GitHub](#4-committing--pushing-code-to-github)
5. [Supabase — Database Setup](#5-supabase--database-setup)
6. [Vercel — Hosting Setup & GitHub Integration](#6-vercel--hosting-setup--github-integration)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Day-to-Day Deployment Workflow](#8-day-to-day-deployment-workflow)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                       │
│                                                             │
│   Your Laptop          GitHub             Vercel            │
│  ┌──────────┐   push  ┌────────┐  auto  ┌─────────┐       │
│  │ VS Code  │ ──────► │  Repo  │ ──────► │  Build  │       │
│  │ + Claude │         │(main)  │ deploy  │ & Host  │       │
│  └──────────┘         └────────┘         └────┬────┘       │
│                                               │             │
│                                          reads│env vars     │
│                                               │             │
│                                          ┌────▼────┐       │
│                                          │Supabase │       │
│                                          │Postgres │       │
│                                          │   DB    │       │
│                                          └─────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**How it works:**
- You write code locally and commit changes using Git
- Git push sends the code to your GitHub repository
- Vercel watches the GitHub repository and automatically rebuilds on every push to `main`
- The live app on Vercel connects to Supabase (PostgreSQL) for all data

---

## 2. Prerequisites & Accounts

Before deploying, make sure you have accounts at:

| Service | URL | Purpose | Cost |
|---------|-----|---------|------|
| GitHub | github.com | Code repository | Free |
| Supabase | supabase.com | PostgreSQL database | Free tier |
| Vercel | vercel.com | Hosting & deployment | Free tier |

And locally installed:
- **Node.js 20+** — check with `node --version`
- **Git** — check with `git --version`
- **VS Code** with Claude Code extension

---

## 3. Local Development Setup

### 3.1 Project Folder Structure

```
estatehub-starter/
└── estatehub-starter/       ← Work inside this folder
    ├── app/                  ← Next.js pages & API routes
    ├── components/           ← Reusable React components
    ├── prisma/
    │   ├── schema.prisma     ← Database schema (source of truth)
    │   └── seed.ts           ← Sample data script
    ├── lib/                  ← Utilities (Prisma client, formatters)
    ├── docs/                 ← This file lives here
    ├── .env                  ← Your secrets (NEVER committed to Git)
    ├── .env.example          ← Template showing required variables
    ├── package.json          ← Dependencies & scripts
    └── next.config.js        ← Next.js configuration
```

### 3.2 Install Dependencies

Open a terminal inside the project folder and run:

```bash
npm install
```

> **Screenshot placeholder:** Terminal showing `npm install` completing with "added X packages"

### 3.3 Create Your `.env` File

```bash
cp .env.example .env
```

Then open `.env` and fill in your database URL (obtained from Supabase — see Section 5).

### 3.4 Run Locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Screenshot placeholder:** Browser showing EstateHub homepage at localhost:3000

---

## 4. Committing & Pushing Code to GitHub

### 4.1 GitHub Repository

**Repository URL:** https://github.com/FaisalCTS/estatehubNew

> **Screenshot placeholder:** GitHub repository page showing the `estatehubNew` repo with all files listed

### 4.2 First-Time Setup (already done)

The repository was initialised with these commands:

```bash
# Step 1 — Initialise Git in the project folder
git init

# Step 2 — Stage all files
git add .

# Step 3 — Create the first commit
git commit -m "Initial commit: EstateHub starter scaffold"

# Step 4 — Rename branch to main
git branch -M main

# Step 5 — Link to GitHub repository
git remote add origin https://github.com/FaisalCTS/estatehubNew.git

# Step 6 — Push code to GitHub
git push -u origin main
```

> **Screenshot placeholder:** GitHub showing the first commit "Initial commit: EstateHub starter scaffold" in the commit history

### 4.3 Everyday Workflow — Making Changes & Pushing

Every time you make a change and want it live:

```bash
# Step 1 — Check what files changed
git status
```

> **Screenshot placeholder:** Terminal showing `git status` with modified files listed in red

```bash
# Step 2 — Stage the changed files
git add .
```

> **Screenshot placeholder:** Terminal showing `git add .` with no output (success)

```bash
# Step 3 — Commit with a descriptive message
git commit -m "Add search filters to properties page"
```

> **Screenshot placeholder:** Terminal showing commit created with hash e.g. `[main a3f9c12] Add search filters...`

```bash
# Step 4 — Push to GitHub
git push origin main
```

> **Screenshot placeholder:** Terminal showing `main -> main` confirming successful push

### 4.4 What Happens on GitHub After a Push

1. Go to **https://github.com/FaisalCTS/estatehubNew**
2. Click the **Commits** tab to see your commit history

> **Screenshot placeholder:** GitHub commits page showing list of commits with messages, dates, and commit hashes

3. Each commit shows:
   - The commit message
   - The author and timestamp
   - A unique hash (e.g., `be9356c`)

### 4.5 Important: Never Commit `.env`

The `.gitignore` file prevents `.env` from being committed. Verify before pushing:

```bash
git status
```

You should **NOT** see `.env` in the list. If you do, stop — your database password would become public on GitHub.

> **Screenshot placeholder:** Terminal showing `git status` with `.env` NOT in the file list

---

## 5. Supabase — Database Setup

### 5.1 Create a Supabase Account & Project

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with your GitHub account

> **Screenshot placeholder:** Supabase homepage with "Start your project" button highlighted

3. Click **New project**
4. Fill in the project details:
   - **Name:** `estatehub`
   - **Database Password:** Create a strong password and save it (you'll need it for the connection string)
   - **Region:** Choose closest to your users — for India, select `Southeast Asia (Singapore)` or `Northeast Asia (Tokyo)`
5. Click **Create new project** — this takes about 1–2 minutes

> **Screenshot placeholder:** Supabase "Create new project" form filled out with name "estatehub"

> **Screenshot placeholder:** Supabase dashboard showing project being provisioned with a loading indicator

### 5.2 Get the Connection String

1. Once the project is ready, go to **Settings** (gear icon in the left sidebar)
2. Click **Database**

> **Screenshot placeholder:** Supabase left sidebar with Settings → Database highlighted

3. Scroll down to the **Connection string** section
4. Click the **URI** tab
5. Copy the connection string

> **Screenshot placeholder:** Supabase Database settings page showing the Connection String section with URI tab selected and the string visible

6. The string looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with your actual database password.

> **⚠️ Important — Special characters in password:**
> If your password contains `@`, it must be URL-encoded as `%40`.
> Example: password `Supabase12@` becomes `Supabase12%40` in the URL.

### 5.3 Get the Pooler Connection String (Recommended for Vercel)

For production use with Vercel, use the **connection pooler** which handles multiple simultaneous connections better.

1. On the same **Database** settings page, scroll to **Connection pooling**
2. Copy the **Session mode** URL — it uses the pooler host on port **5432**

> **Screenshot placeholder:** Supabase "Connection pooling" section showing Session mode URL with port 5432

The pooler URL format is:
```
postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres
```

**This project uses:**
```
postgresql://postgres.hlomxcpgindfjdhwuckp:Supabase12%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### 5.4 Push the Database Schema

After setting up `.env` with the connection string, create all the database tables:

```bash
# Create all tables from prisma/schema.prisma
npm run db:push
```

Expected output:
```
✔ Your database is now in sync with your Prisma schema. Done in 19.05s
```

> **Screenshot placeholder:** Terminal showing successful `npm run db:push` output

```bash
# Generate the typed Prisma client
npx prisma generate
```

```bash
# Add sample data to the database
npm run db:seed
```

Expected output:
```
🌱 Seeding database...
✅ Seeded: { societies: 1, flats: 1, users: 1, properties: 3, bills: 1, notices: 2 }
```

> **Screenshot placeholder:** Terminal showing successful seed output

### 5.5 Verify Data in Supabase Dashboard

1. In Supabase, click **Table Editor** in the left sidebar
2. You should see tables like `Property`, `Society`, `User`, `Flat`, etc.
3. Click `Property` — you should see 3 sample property rows

> **Screenshot placeholder:** Supabase Table Editor showing the Property table with 3 rows of sample data

---

## 6. Vercel — Hosting Setup & GitHub Integration

### 6.1 Create a Vercel Account

1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Choose **Continue with GitHub** — this links Vercel to your GitHub account

> **Screenshot placeholder:** Vercel sign-up page with "Continue with GitHub" button highlighted

> **Screenshot placeholder:** GitHub OAuth permission screen asking to authorize Vercel

### 6.2 Import the GitHub Repository

1. From the Vercel dashboard, click **Add New…** → **Project**

> **Screenshot placeholder:** Vercel dashboard with "Add New" button and "Project" option highlighted

2. Under **Import Git Repository**, find `FaisalCTS/estatehubNew` and click **Import**

> **Screenshot placeholder:** Vercel import screen showing the `estatehubNew` repository listed with an "Import" button

### 6.3 Configure the Project

Vercel auto-detects Next.js — no build settings need to change. You only need to add environment variables.

1. Expand the **Environment Variables** section
2. Add the following variables one by one:

> **Screenshot placeholder:** Vercel deployment configuration screen showing the "Environment Variables" section expanded

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | `postgresql://postgres.hlomxcpgindfjdhwuckp:Supabase12%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` *(update after first deploy)* |

> **Screenshot placeholder:** Vercel environment variables form with DATABASE_URL filled in (password masked)

3. Click **Deploy**

> **Screenshot placeholder:** Vercel deployment progress screen showing "Building" status with logs streaming

### 6.4 First Deployment Logs

Vercel runs these steps automatically:
1. **Clone** — pulls latest code from GitHub
2. **Install** — runs `npm install` (the `postinstall` script also runs `prisma generate`)
3. **Build** — runs `npm run build`
4. **Deploy** — makes the app live

> **Screenshot placeholder:** Vercel build logs showing all 4 steps completing successfully

### 6.5 Your Live URL

Once deployed, Vercel gives you a URL like:
```
https://estatehub-new-faisalcts.vercel.app
```

> **Screenshot placeholder:** Vercel deployment success screen showing the live URL with a "Visit" button

Click **Visit** — your app is now live on the internet.

> **Screenshot placeholder:** Live EstateHub app in browser showing the homepage at the Vercel URL

### 6.6 GitHub ↔ Vercel Integration (Auto-Deploy)

This is the most powerful part of the setup. Once connected:

- Every `git push` to the `main` branch **automatically triggers a new Vercel deployment**
- You never need to manually deploy again
- Vercel shows the deployment status in GitHub (green checkmark on commits)

> **Screenshot placeholder:** GitHub commits list showing green checkmarks next to each commit (Vercel deployment status)

> **Screenshot placeholder:** Vercel dashboard showing deployment history with each commit listed

**How to see deployments in Vercel:**
1. Go to your Vercel dashboard
2. Click on the `estatehubNew` project
3. Click the **Deployments** tab
4. Each row is one deployment — click any to see its build logs

> **Screenshot placeholder:** Vercel Deployments tab showing a list of deployments with commit messages, status badges, and timestamps

---

## 7. Environment Variables Reference

### Local (`.env` file — never commit this)

```env
DATABASE_URL="postgresql://postgres.hlomxcpgindfjdhwuckp:Supabase12%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Vercel (set in Project Settings → Environment Variables)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Supabase pooler connection string | Same as `.env` but with production URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your actual Vercel domain |

### How to Update Environment Variables on Vercel

1. Go to **Vercel Dashboard** → your project → **Settings**
2. Click **Environment Variables** in the left menu
3. Click the variable you want to edit → update the value → **Save**
4. **Redeploy** the app for the change to take effect (Vercel does not auto-redeploy on env var changes)

> **Screenshot placeholder:** Vercel Project Settings → Environment Variables page showing the list of configured variables

---

## 8. Day-to-Day Deployment Workflow

### Standard flow (code change → live in ~2 minutes)

```
1. Make code changes in VS Code
         ↓
2. Test locally:  npm run dev
         ↓
3. Verify build:  npm run build
         ↓
4. Stage files:   git add .
         ↓
5. Commit:        git commit -m "Your change description"
         ↓
6. Push:          git push origin main
         ↓
7. Vercel auto-detects push → builds → deploys
         ↓
8. Live at your Vercel URL in ~90 seconds
```

### Checking Deployment Status

After pushing, you can watch the deployment:
1. Go to **https://vercel.com/dashboard**
2. Click your project → **Deployments** tab
3. The latest deployment shows "Building…" then "Ready"

> **Screenshot placeholder:** Vercel showing a deployment in "Building" state transitioning to "Ready"

### Database Schema Changes

If you edit `prisma/schema.prisma`:

```bash
# 1. Push schema changes to Supabase
npm run db:push

# 2. Regenerate Prisma client
npx prisma generate

# 3. Commit and push (Vercel will regenerate the client via postinstall)
git add prisma/schema.prisma
git commit -m "Update schema: add X field to Y model"
git push
```

> ⚠️ `npm run db:push` runs against Supabase directly from your laptop — it does NOT go through Vercel.

---

## 9. Troubleshooting

### Vercel build fails: "Type error: ..."

Run the build locally first to catch errors before pushing:

```bash
npm run build
```

Fix all errors shown, then push again.

### "Cannot reach database server" (P1001)

**Cause:** Corporate firewall blocking the database port, or Supabase project is paused.

**Fix options:**
1. Check if your Supabase project is paused — log in to supabase.com and click "Resume" if shown
2. Use the **connection pooler URL** (port 5432 on pooler host) instead of the direct connection URL

> **Screenshot placeholder:** Supabase dashboard showing a paused project with a "Resume" button

### "Environment variable not found: DATABASE_URL"

**Cause:** The `.env` file is missing or `DATABASE_URL` is not set.

**Fix:**
```bash
# Check the file exists
ls -la .env

# Check the variable is set (should print the URL)
grep DATABASE_URL .env
```

### Vercel build fails: "prisma generate" error

**Cause:** The `postinstall` script is missing from `package.json`.

**Fix:** Ensure `package.json` has:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### "No properties yet" on the homepage

**Cause:** Database is empty — seed data was not loaded.

**Fix:**
```bash
npm run db:seed
```

### Pushed `.env` to GitHub by accident

**Act immediately:**
1. Rotate your Supabase password (Settings → Database → Reset password)
2. Update your `.env` and Vercel environment variable with the new password
3. Remove from git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   git push
   ```

---

## Commit History (Key Deployments)

| Commit | Description | Date |
|--------|-------------|------|
| `bcb0eda` | Initial commit: EstateHub starter scaffold | 2026-05-13 |
| `b5c59ef` | Add step-by-step user guide | 2026-05-13 |
| `0b773bb` | Switch DB to PostgreSQL (Supabase) + postinstall script | 2026-05-14 |
| `be9356c` | Fix TypeScript build errors blocking Vercel deployment | 2026-05-14 |

---

> 📸 **Note on screenshots:** Replace each "Screenshot placeholder" above with an actual screenshot
> taken from your browser. Tools like Snipping Tool (Windows), Cmd+Shift+4 (Mac), or
> the browser's built-in screenshot feature work well. Save images to `docs/screenshots/`
> and update the placeholders with: `![Description](screenshots/filename.png)`
--
Environment Variable
DATABASE_URL="postgresql://postgres.hlomxcpgindfjdhwuckp:Supabase12%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
JWT_SECRET="estatehub-local-dev-jwt-secret-change-for-production"