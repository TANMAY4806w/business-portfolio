# 🧪 Manual Testing Guide

This guide walks through every feature of the application with **exact sample inputs** so anyone can test the full workflow.

> **Prerequisites:** Both servers running (`npm start` in backend, `npm run dev` in frontend). Open **http://localhost:5173** in your browser.

---

## Test 1: Register a Business Account

1. Click **Register** in the navbar
2. Fill in:

| Field | Value |
|-------|-------|
| Full Name | `Digital Forge Studios` |
| Email | `forge@test.com` |
| Password | `Forge@123` |
| Confirm Password | `Forge@123` |
| Role | Click **Business** card |

3. Click **Create Account**
4. ✅ **Expected:** Redirected to `/dashboard`. Toast: "Account created successfully!"

---

## Test 2: Setup Business Profile

1. In the dashboard sidebar, click **Profile**
2. Fill in:

| Field | Value |
|-------|-------|
| Company Name | `Digital Forge Studios` |
| Description | `We craft stunning digital experiences — from brand identity to full-stack web apps. Our team of designers and developers deliver pixel-perfect results.` |
| Industry | `Technology` |
| Logo URL | *(leave blank)* |

3. Click **Create Profile**
4. ✅ **Expected:** Success message. Profile created.

### Add Portfolio Projects

5. Scroll to "Portfolio Projects" and add:

**Project 1:**

| Field | Value |
|-------|-------|
| Title | `Shopify E-Commerce Redesign` |
| Description | `Redesigned the entire storefront for a fashion brand, boosting conversions by 40%` |

6. Click **+ Add Project**

**Project 2:**

| Field | Value |
|-------|-------|
| Title | `SaaS Dashboard UI` |
| Description | `Designed and built a real-time analytics dashboard for a fintech startup` |

7. Click **+ Add Project**
8. ✅ **Expected:** Both projects appear in the portfolio list.

---

## Test 3: Add Services

1. Click **Add Service** in sidebar (or **Services** → **+ Add Service**)

**Service 1:**

| Field | Value |
|-------|-------|
| Title | `Custom Web Application` |
| Description | `Full-stack web application built with React, Node.js, and MongoDB. Includes responsive design, authentication, and deployment.` |
| Price | `1200` |
| Delivery Time | `14-21 days` |

2. Click **Create Service**

**Service 2:**

| Field | Value |
|-------|-------|
| Title | `UI/UX Design Package` |
| Description | `Complete UI/UX design including wireframes, mockups, design system, and interactive prototypes in Figma.` |
| Price | `600` |
| Delivery Time | `7-10 days` |

3. Click **Create Service**

**Service 3:**

| Field | Value |
|-------|-------|
| Title | `Logo & Brand Identity` |
| Description | `Professional logo design with complete brand guidelines, color palette, typography, and social media kit.` |
| Price | `350` |
| Delivery Time | `5-7 days` |

4. Click **Create Service**
5. ✅ **Expected:** All 3 services visible in **Services** page.

---

## Test 4: Register a Client Account

1. Click the **logout icon** (top right)
2. Click **Register**
3. Fill in:

| Field | Value |
|-------|-------|
| Full Name | `Priya Sharma` |
| Email | `priya@test.com` |
| Password | `Priya@123` |
| Confirm Password | `Priya@123` |
| Role | Click **Client** card |

4. Click **Create Account**
5. ✅ **Expected:** Redirected to homepage. Can see 3 services from Digital Forge Studios.

---

## Test 5: Browse Marketplace & Test Filters

### 5a. Search by Keyword
1. Type `logo` in the Search box
2. Click **Apply Filters**
3. ✅ **Expected:** Only "Logo & Brand Identity" shows up.
4. Click **Reset**

### 5b. Filter by Price Range
1. Set **Min Price:** `500` and **Max Price:** `1000`
2. Click **Apply Filters**
3. ✅ **Expected:** Only "UI/UX Design Package" ($600) shows up.
4. Click **Reset**

### 5c. Filter by Industry
1. Select **Technology** from Industry dropdown
2. Click **Apply Filters**
3. ✅ **Expected:** All 3 services show (all from a Technology business).

---

## Test 6: Hire a Business

1. While logged in as `priya@test.com` (Client)
2. On the marketplace, find **"Custom Web Application"** ($1200)
3. Click **Hire Now**
4. ✅ **Expected:** Toast: "Hire request sent successfully!"
5. Try clicking **Hire Now** again on the same service
6. ✅ **Expected:** Toast: "You already have an active hire request for this service"

---

## Test 7: View Business Profile

1. Click **View Profile** on any service card
2. ✅ **Expected:** Business profile page with 3 tabs:
   - **Services** — Lists all 3 services with hire buttons
   - **Portfolio** — Shows both portfolio projects
   - **Reviews** — Shows "No reviews yet"

---

## Test 8: Check Hire Requests (Client Side)

1. Click **Requests** in the navbar
2. ✅ **Expected:** One hire request showing:
   - Service: "Custom Web Application"
   - Status: **pending** (yellow badge)
   - Business name as a link

---

## Test 9: Accept Hire Request (Business Side)

1. **Logout** → **Login** with:

| Field | Value |
|-------|-------|
| Email | `forge@test.com` |
| Password | `Forge@123` |

2. Click **Requests** in the navbar
3. ✅ **Expected:** One pending hire request from "Priya Sharma"
4. Click **Accept**
5. ✅ **Expected:** Status changes to **accepted** (blue badge). "Chat" and "Mark Completed" buttons appear.

---

## Test 10: Real-Time Chat

### 10a. Send message as Business
1. On the hire request, click **Chat**
2. Type: `Hi Priya! I've started working on your web application. I'll share the wireframes soon.`
3. Press **Enter** or click the send button
4. ✅ **Expected:** Message appears on the right side (gradient purple bubble).

### 10b. Reply as Client
1. Open a **new browser tab** (or incognito window) → Go to `http://localhost:5173/login`
2. Login with: `priya@test.com` / `Priya@123`
3. Click **Requests** → Click **Chat**
4. ✅ **Expected:** You can see the business's message on the left.
5. Type: `Great, looking forward to it! Can we schedule a call tomorrow?`
6. Press **Enter**
7. ✅ **Expected:** Message appears. If both tabs are open, messages show in **real-time** in both.

### 10c. Typing Indicator
1. Start typing in one tab
2. ✅ **Expected:** Other tab shows "___ is typing..." indicator.

---

## Test 11: Complete the Hire

1. Login as **Business** (`forge@test.com`)
2. Go to **Requests**
3. Click **Mark Completed**
4. ✅ **Expected:** Status changes to **completed** (green badge).

---

## Test 12: Leave a Review (Client)

1. Login as **Client** (`priya@test.com`)
2. Go to **Requests**
3. On the completed hire, click **Review**
4. Fill in:

| Field | Value |
|-------|-------|
| Rating | Click **5th star** ⭐⭐⭐⭐⭐ |
| Review Text | `Absolutely phenomenal work! Digital Forge delivered a top-notch web application ahead of schedule. The code quality was excellent and communication was seamless throughout the project. Highly recommend!` |

5. Click **Submit Review**
6. ✅ **Expected:** Toast: "Review submitted!" Review form closes.

### Verify the Review
7. Go to the business profile (click **View Profile** on any service card)
8. Click the **Reviews** tab
9. ✅ **Expected:** Review visible with 5 stars and the review text. Average rating shows 5.0.

---

## Test 13: 404 Page

1. Navigate to `http://localhost:5173/random-page`
2. ✅ **Expected:** Styled 404 page with "Page Not Found" and navigation buttons.

---

## Test 14: Input Validation

### 14a. Register Validation
1. Go to `/register` and try submitting with empty fields
2. ✅ **Expected:** Error messages under each field.

### 14b. Email Validation
1. Type `notanemail` in the Email field and submit
2. ✅ **Expected:** "Please enter a valid email address"

### 14c. Password Strength
1. Type `123` → ✅ Shows **Weak** (red bar)
2. Type `abc123` → ✅ Shows **Fair** (yellow bar)
3. Type `Abc12345` → ✅ Shows **Good** (blue bar)
4. Type `Abc@12345` → ✅ Shows **Strong** (green bar)

### 14d. Password Mismatch
1. Password: `Test@123`, Confirm: `Test@456`
2. Click **Create Account**
3. ✅ **Expected:** "Passwords do not match"

---

## Test 15: Toast Notifications

Throughout the testing you should have seen these toasts:

| Action | Toast Type | Message |
|--------|-----------|---------|
| Register | ✅ Green | "Account created successfully!" |
| Login | ✅ Green | "Welcome back, [name]!" |
| Hire | ✅ Green | "Hire request sent successfully!" |
| Duplicate hire | ⚠️ Red | "You already have an active hire request..." |
| Review | ✅ Green | "Review submitted!" |
| Guest hire | ⚠️ Yellow | "Please login to hire a service" |

---

## Quick Reference — All Test Accounts

| Role | Name | Email | Password |
|------|------|-------|----------|
| Business | Digital Forge Studios | `forge@test.com` | `Forge@123` |
| Client | Priya Sharma | `priya@test.com` | `Priya@123` |

---

## ✅ Testing Checklist

- [ ] Business registration
- [ ] Business profile setup
- [ ] Portfolio project management
- [ ] Service creation (3 services)
- [ ] Client registration
- [ ] Marketplace search & filters
- [ ] Hire request creation
- [ ] Duplicate hire prevention
- [ ] Business accepts hire
- [ ] Real-time chat (both sides)
- [ ] Typing indicator
- [ ] Business completes hire
- [ ] Client leaves review
- [ ] Review visible on profile
- [ ] 404 page
- [ ] Input validation
- [ ] Toast notifications
- [ ] Business profile public view
