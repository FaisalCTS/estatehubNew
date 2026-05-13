# EstateHub — User Guide

A step-by-step guide for using all features of the EstateHub platform.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Browsing Properties](#2-browsing-properties)
3. [Viewing a Property](#3-viewing-a-property)
4. [Listing Your Property](#4-listing-your-property)
5. [Scheduling a Property Visit](#5-scheduling-a-property-visit)
6. [Home Loan Calculator](#6-home-loan-calculator)
7. [Society Dashboard](#7-society-dashboard)
8. [Paying Maintenance Bills](#8-paying-maintenance-bills)
9. [Generating a Visitor Pass](#9-generating-a-visitor-pass)
10. [Booking a Society Amenity](#10-booking-a-society-amenity)
11. [Raising a Complaint](#11-raising-a-complaint)
12. [Viewing Society Notices](#12-viewing-society-notices)
13. [Gate Entry (Gatekeeper)](#13-gate-entry-gatekeeper)
14. [Managing Your Listings](#14-managing-your-listings)
15. [Admin — Billing Management](#15-admin--billing-management)

---

## 1. Getting Started

### Open the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to **http://localhost:3000**
3. You will land on the **EstateHub homepage**, which shows featured property listings.

### Homepage Overview
- **Browse Properties** button — takes you to the full property search page.
- **List Your Property** button — opens the property listing wizard.
- Featured properties are shown as cards with price, location, and key details.
- Two sections explain the platform's two modes: **Marketplace** (buy/rent) and **Society** (resident management).

---

## 2. Browsing Properties

### Navigate to the Properties Page
1. Click **Browse Properties** on the homepage, or click **Properties** in the navigation bar.
2. URL: `/properties`

### Using Search Filters
The filter bar at the top lets you narrow down results:

| Filter | What it does |
|--------|-------------|
| **City** | Filter by city name (e.g., Bengaluru, Mumbai) |
| **Locality** | Filter by area, locality, or address keyword |
| **BHK** | Select number of bedrooms: 1, 2, 3, 4, 5+ |
| **Intent** | Choose **Buy** (SELL) or **Rent** |
| **Min Price** | Set a minimum budget |
| **Max Price** | Set a maximum budget |
| **Furnishing** | Unfurnished / Semi-Furnished / Fully Furnished |
| **Sort By** | Newest first / Price: Low to High / Price: High to Low |

### Steps to Search
1. Enter your desired **City** (e.g., "Bengaluru").
2. Optionally enter a **Locality** keyword (e.g., "Whitefield").
3. Select **BHK** count if needed.
4. Choose **Buy** or **Rent**.
5. Set a price range if needed.
6. Click **Search** (or the filters apply automatically).
7. Results are shown in a grid — up to 48 per page.
8. The total number of matching properties is displayed above the grid.

---

## 3. Viewing a Property

### Open a Property Listing
1. Click on any property card from the homepage or properties page.
2. URL: `/properties/[id]`

### What You Will See
- **Photo gallery** — hero image with thumbnail previews. Click to view more photos.
- **Verification badge** — "Physically Verified ⭐" or "Document Verified ✓" if applicable.
- **Key facts** — BHK, carpet area, furnishing, floor, bathrooms, balconies, age, facing direction.
- **Price** — displayed prominently. "Negotiable" tag shown if applicable.
- **Price per sq ft** — calculated automatically.
- **Description** — detailed text about the property.
- **Amenities** — combined list from the property and its society.
- **Locality Score** — neighbourhood ratings (connectivity, schools, hospitals, etc.).
- **Owner Card** — owner name with KYC verified badge and a **Contact Owner** button.
- **EMI Calculator** (Buy listings only) — enter loan amount and tenure to estimate monthly EMI.
- **Maintenance** — monthly fee if applicable.

### Actions Available
- **Save** — bookmark the property for later.
- **Share** — share the listing link.
- **Schedule a Visit** — opens the visit booking page.

---

## 4. Listing Your Property

### Start a New Listing
1. Click **List Your Property** on the homepage or the navigation bar.
2. URL: `/properties/new`

### Step-by-Step Wizard

#### Step 1 — Intent & Type
- Choose **Sell** or **Rent**.
- Choose property type: **Apartment**, **Villa**, **Plot**, or **Independent House**.
- Click **Next**.

#### Step 2 — Address
- Enter: Address line, Locality, Pincode, City, State.
- Click **Next**.

#### Step 3 — Details
- **BHK**: Click the number of bedrooms (1–5+).
- **Carpet Area**: Enter area in sq ft.
- **Age**: Years since construction.
- **Bathrooms & Balconies**: Enter counts.
- **Floor & Total Floors**: Enter floor number.
- **Furnishing**: Select Unfurnished, Semi-Furnished, or Fully Furnished.
- **Amenities**: Tick all amenities available (e.g., Lift, Parking, Gym, Swimming Pool).
- Click **Next**.

#### Step 4 — Media
- **Photos**: Enter photo URLs (one per line).
- **Title**: Optional — auto-generated if left blank.
- **Description**: Write details about the property.
- Click **Next**.

#### Step 5 — Pricing
- A **suggested price range** is shown based on city, area, and furnishing.
- Enter your **asking price**.
- Tick **Negotiable** if you are open to negotiation.
- A warning appears if your price is above or below the typical range.
- Click **Next**.

#### Step 6 — Verification
- Choose your verification level:
  - **Self-declared** — Free, no inspection.
  - **Document Verified** — Submit property documents.
  - **Physically Verified (₹999)** — An agent visits the property.
- Click **Submit Listing**.

After submission you are redirected to your new listing's detail page.

---

## 5. Scheduling a Property Visit

### Book a Visit
1. Open any property detail page.
2. Click **Schedule a Visit**.
3. URL: `/properties/[id]/schedule`

### Steps
1. **Visit Type**: Choose **In-person** or **Virtual Tour**.
2. **Date**: Select from the next 7 available days.
3. **Time Slot**: Choose from available slots (10 AM, 2 PM, 4 PM, 6 PM).
4. Click **Confirm Visit**.
5. A confirmation screen shows your booked date, time, and visit type.

---

## 6. Home Loan Calculator

### Access the Loans Page
1. Click **Loans** in the navigation bar.
2. URL: `/loans`

### What You Will See
- **Eligibility banner** — estimated loan amount you may qualify for.
- **Bank comparison table** — 6 banks with interest rate, processing fee, max tenure, and estimated EMI for a ₹1 Cr / 20-year loan.
- **EMI Calculator** — enter your desired loan amount and tenure to calculate monthly EMI.
- **Documents checklist** — list of documents typically required for a home loan application.

---

## 7. Society Dashboard

### Access the Society Section
1. Click **Society** in the navigation bar.
2. URL: `/society`

### Dashboard Overview
The dashboard loads your society (demo: "Prestige Lakeside Habitat") and shows:
- Your tower and flat number.
- A **pending bill alert** with the amount due and a Pay Now link.
- **Quick actions** (8 buttons):

| Button | What it does |
|--------|-------------|
| Invite Visitor | Generate a visitor pass |
| Pay Bills | View and pay maintenance bills |
| Book Amenity | Reserve a society facility |
| Raise Complaint | Log a maintenance issue |
| Notices | View society announcements |
| Gate Log | Check recent gate entries |
| Polls | Participate in resident polls |
| Admin | Admin billing tools |

- **Active Visitor Passes** — passes currently valid for your flat.
- **Recent Notices** — latest society announcements (pinned ones appear first).
- **Society Info** — total flats, location, RERA ID, pincode.

---

## 8. Paying Maintenance Bills

### View Your Bills
1. From the Society Dashboard, click **Pay Bills**.
2. URL: `/society/bills`
3. You will see:
   - **Total Pending** amount.
   - **Paid This Year** amount.
   - A list of bills for the last 12 months with status badges (PAID / PENDING / OVERDUE).

### Pay a Bill
1. Click on any PENDING or OVERDUE bill.
2. URL: `/society/bills/[id]`
3. Review the **itemised breakdown** (e.g., CAM, Water, Sinking Fund, Vehicle charge, Late fee).
4. Select a **payment method**:
   - UPI
   - Saved Card
   - EstateHub Wallet
5. Click **Pay ₹[amount]**.
6. A **success screen** appears with your transaction reference number.

---

## 9. Generating a Visitor Pass

### Create a Pass for a Guest
1. From the Society Dashboard, click **Invite Visitor**.
2. URL: `/society/visitors/new`

### Steps
1. **Quick template** (optional): Tap Cab/Auto, Delivery, Food Delivery, or Domestic Help to pre-fill the form.
2. **Visitor Name**: Enter the visitor's name (required).
3. **Visitor Phone**: Enter phone number (optional).
4. **Vehicle**: Select None, Car, or Bike. If Car or Bike, enter the vehicle number.
5. **Validity**: Choose how long the pass is valid — 2h, 4h, 8h, 12h, or All day (24h).
6. Click **Generate Pass**.

### Sharing the Pass
After generation you will see:
- A **6-digit OTP** — share this with your visitor over phone/WhatsApp.
- The **pass validity** (exact date and time it expires).
- A **Pass ID** for reference.
- Buttons to **Copy Pass Link** or **Share on WhatsApp**.

The visitor shows this OTP or link at the gate for entry.

---

## 10. Booking a Society Amenity

### View Available Amenities
1. From the Society Dashboard, click **Book Amenity**.
2. URL: `/society/amenities`
3. Available amenities are listed with name, opening hours, fee (or "Free"), and capacity.

### Book a Slot
1. Click **Book a slot →** on any amenity.
2. URL: `/society/amenities/[id]/book`
3. **Select a date** from the next 7 days.
4. **Select a time slot** from available options for that amenity.
5. Review the **booking summary**:
   - Amenity name
   - Date and time
   - Fee (if applicable)
   - Refundable deposit (if applicable)
   - Total amount
6. Tick **"I agree to usage terms and cleanup responsibilities"**.
7. Click **Confirm Booking**.
8. A confirmation screen appears. Note: Deposits are refunded 48 hours after your slot.

---

## 11. Raising a Complaint

### Submit a New Complaint
1. From the Society Dashboard, click **Raise Complaint**.
2. URL: `/society/complaints/new`

### Steps
1. **Select a category** (each shows expected resolution time):
   - Security 🛡️ — 1 hour SLA
   - Lift 🛗 — 2 hours
   - Plumbing 🔧 / Electrical 💡 — 4 hours
   - Housekeeping 🧹 — 8 hours
   - Pest Control 🐛 — 24 hours
   - Civil 🏗️ — 48 hours
   - Other 📝 — 24 hours
2. **Describe the issue** (minimum 10 characters).
3. **Location**: Toggle between "Inside my flat" or "Common area".
4. Click **Submit Complaint**.

### Tracking a Complaint
- Click on any complaint from the dashboard or complaint list.
- URL: `/society/complaints/[id]`
- You will see:
  - Current **status badge** (Open → Assigned → In Progress → Resolved).
  - **Status timeline** showing progress.
  - **Updates** from the assigned technician.
  - **Rating option** (1–5 stars) once the complaint is resolved.

---

## 12. Viewing Society Notices

### Open the Notices Board
1. From the Society Dashboard, click **Notices**.
2. URL: `/society/notices`
3. Notices are listed with the newest first.
4. **Pinned notices** 📌 appear at the top with a highlighted border — these are important announcements.
5. Each notice shows the title, body text, and the date it was posted.

---

## 13. Gate Entry (Gatekeeper)

### Access the Gate Panel
1. URL: `/gate`
2. This interface is used by the security guard at the society entrance.

### Entry Methods

#### OTP Verification
1. Select the **OTP Entry** tab.
2. Ask the visitor for their 6-digit OTP.
3. Type the OTP into the input field.
4. Click **Verify & Allow Entry**.
5. A green ✅ screen confirms entry, or a red ❌ screen shows if the OTP is invalid/expired.

#### QR Code / Pass Link
1. Select the **QR Scan** tab.
2. Paste the visitor's pass token (from their pass link).
3. Click verify to allow or deny entry.

#### Walk-in / Cab / Delivery
1. Select the relevant tab (Walk-in, Cab/Auto, or Delivery).
2. Enter visitor name and destination flat number.
3. Click **Log Entry**.

#### Emergency
- A red **Emergency / Panic** button is at the bottom of the gate panel.
- Press in case of security emergencies.

---

## 14. Managing Your Listings

### View Your Properties
1. Click **My Listings** in the navigation bar.
2. URL: `/dashboard/listings`
3. Each listing card shows:
   - Photo thumbnail
   - Title and status (LIVE, DRAFT, PENDING VERIFICATION, SOLD, RENTED, WITHDRAWN)
   - BHK, area, locality
   - Price
   - **Metrics**: number of saves, pending visits, listing health score (0–100)

### Actions
- **View** — opens the public property detail page.
- **Edit** — opens the listing for editing.
- Click **+ List a New Property** to add another listing.

---

## 15. Admin — Billing Management

### Access Admin Billing
1. From the Society Dashboard, click **Admin**.
2. URL: `/admin/billing`

### Overview
The admin billing panel is used by society managers to generate maintenance bills for all flats.

### KPI Cards
- **Total Flats** — number of units in the society.
- **Collection Rate** — percentage of bills paid this month.
- **Total Raised** — total amount billed this cycle.
- **Defaulters** — number of flats with overdue bills.

### Step 1 — Configure Bills
1. Select the **billing month and year**.
2. Set the **due date**.
3. Set the **late fee** amount (charged after due date).
4. Configure **bill heads** — enable/disable and set amounts for:
   - CAM (Common Area Maintenance)
   - Water charges
   - Sinking Fund
   - Vehicle parking charge
5. Set up **automatic reminders** (3 days before, on due date, 3 days after, 10 days after).

### Step 2 — Preview
1. Review the invoice breakdown per flat.
2. Check the society-wide total before dispatching.

### Step 3 — Dispatch
1. Click **Dispatch Bills**.
2. Bills are sent to all flats and appear in each resident's bill list.
3. A confirmation screen shows the dispatch was successful.

---

## Quick Reference — URLs

| Feature | URL |
|---------|-----|
| Homepage | `/` |
| Browse Properties | `/properties` |
| Property Detail | `/properties/[id]` |
| New Listing | `/properties/new` |
| Schedule Visit | `/properties/[id]/schedule` |
| Home Loans | `/loans` |
| Society Dashboard | `/society` |
| Maintenance Bills | `/society/bills` |
| Bill Detail / Pay | `/society/bills/[id]` |
| Visitor Pass | `/society/visitors/new` |
| Amenities | `/society/amenities` |
| Book Amenity | `/society/amenities/[id]/book` |
| New Complaint | `/society/complaints/new` |
| Complaint Detail | `/society/complaints/[id]` |
| Notices | `/society/notices` |
| Gate Entry | `/gate` |
| My Listings | `/dashboard/listings` |
| Admin Billing | `/admin/billing` |

---

*EstateHub — Real estate marketplace and society management platform for India.*
