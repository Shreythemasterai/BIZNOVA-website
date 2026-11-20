# 🏪 BizNova — AI-Powered Local Shop E-Commerce & Smart Retail Management Platform

> **"Your Local Store. Now Online."**  
> *Shop Local. Get It Delivered in 15–25 Minutes.*

---

## 🌟 Executive Summary

**BizNova** is an end-to-end, high-performance quick-commerce web application engineered specifically for neighborhood retail and kirana stores. Designed to bridge the gap between traditional local shops and modern ultra-fast commerce (like Blinkit, Zepto, and Instamart), BizNova combines an intuitive, mobile-first shopping experience with deep store management tools and an **AI Business Advisor** that delivers evidence-based retail insights directly from live transactional and inventory data.

Initially tailored for a flagship pilot—**BizNova SuperStore, Indiranagar, Bengaluru**—the platform features realistic grocery data across 8 daily essentials categories, complete inventory tracking with out-of-stock prevention, order fulfillment lifecycle workflows, role-specific interfaces, and automated stock restoration.

---

## 🚀 Key Architectural Pillars

### 1. 🛒 Customer Fast-Commerce Storefront (`/`)
- **Real-Time Neighborhood Catalog:** 50+ realistic Indian grocery items across Staples & Atta, Dairy, Bread & Eggs, Fresh Vegetables & Fruits, Snacks & Munchies, Beverages & Tea, Personal Care, and Household & Cleaning.
- **Intelligent Search & Filter:** Instant search with query logging (which feeds the AI demand-gap engine), category quick pills, and dynamic sorting (Popularity, Price, Discount, In-Stock Only).
- **Interactive Stepper Controls:** Adding an item to basket instantly transforms the button into a quantity stepper `[-] qty [+]` with live stock limit guardrails.
- **Smart Cart Drawer & Checkout:** Real-time subtotal, savings banner, coupon discounts (`BIZFIRST` for 15% off, `FREEDEL` for free delivery), minimum order rules (₹99), and delivery fees.
- **Payment Flexibility:** Simulated Instant UPI / QR payment and Cash on Delivery (COD).
- **Celebration & Tracking:** Confetti celebration upon order confirmation, order number generation (`BN-#####`), and instant transition to the live tracking page.

### 2. 📍 Live Order Status & Tracking (`/orders`)
- **6-Stage Status Journey:** Visual, animated stepper tracking:  
  `Placed → Confirmed → Preparing → Ready for Pickup → Out for Delivery → Delivered`.
- **Rider Assignment Card:** Live details of the assigned delivery partner with one-click direct calling simulation.
- **Concurrency-Safe Cancellation:** Customers can cancel eligible orders (`placed`, `confirmed`, `preparing`), which atomically restores reserved stock back to store inventory.
- **Printable Tax Invoice:** Clean invoice generation for accounting and customer records.

### 3. 👑 Store Owner Control Center (`/admin`)
- **Overview Analytics:** Live KPI cards for Total Delivered Revenue, Today's Sales, Average Order Value (AOV), Pending Orders, and Low Stock Alerts.
- **Interactive Visualizations:** Weekly revenue trend bar chart and category sales distribution pie charts powered by Recharts.
- **Full Products CRUD:** Add new items, update prices, apply promotional discounts, modify stock levels, set low-stock thresholds, and archive items (soft deletion).
- **Inventory Audit Trail:** Timestamped chronological ledger of every single stock change (Customer Purchases, Manual Restocks, and Cancellation Returns).
- **Order Lifecycle Management:** Filter orders by status, verify payments, transition states, and assign delivery riders.

### 4. 🧠 BizNova AI Business Advisor (`/admin` → Tab: "BizNova AI Advisor")
*The primary differentiator of the BizNova platform.*
- **Dual-Engine Architecture:** Connects to live LLM APIs (`GEMINI_API_KEY` / `OPENAI_API_KEY`) when configured, and falls back seamlessly to the built-in **Rule-Based Store Analysis Engine** using real database numbers.
- **Interactive Chat Assistant:** Evaluates real database figures to answer high-impact queries:
  - *"Which products should I restock today?"*
  - *"What are my bestsellers?"*
  - *"What customer searches returned 0 results?"*
  - *"What seasonal summer trends are emerging?"*
  - *"Which slow-moving items need a discount?"*
- **Actionable Proposals with Owner Approval Gate:** The AI generates structured proposals (e.g., restock 30 units of Amul Milk, apply 18% clearance discount to slow-moving Nutella, add high-demand Oat Milk to catalog). The owner retains full control with single-click "Approve & Execute Action" or "Dismiss" buttons.
- **External Market Demand Intelligence:** Contextualizes regional FMCG insights (e.g., Summer hydration surge, festive sweets demand) with clear citation labels, research dates, and confidence ratings kept distinct from internal store metrics.

### 5. 📦 Store Associate Prep Queue (`/staff`)
- Isolated operational interface for packaging personnel.
- Interactive pick checklist to tick off items as they are selected from aisles.
- Single-click action to stage bags and mark them `Ready for Pickup`.

### 6. 🛵 Delivery Partner Dispatch Console (`/delivery`)
- Mobile-optimized view for delivery riders.
- Displays assigned orders, customer address, delivery instructions, and phone call trigger.
- Status progression: `Pick Up Bag & Start Route` → `Delivered to Doorstep` or `Report Issue` (which returns items to store stock).

---

## 👥 Evaluator Role Switcher

For evaluation, grading, and testing, a **Persona Switcher** is pinned directly in the top navigation bar:

| Persona | Name | Role | Default Access |
|---|---|---|---|
| **Customer** | Ananya Iyer | `customer` | Shopping storefront, cart, checkout, order tracking |
| **Store Owner** | Vikram Sharma | `owner` | Admin dashboard, catalog CRUD, analytics, AI Advisor |
| **Store Staff** | Ramesh Kumar | `staff` | Order packaging queue, pick checklists, readiness staging |
| **Delivery Partner** | Rahul Verma | `delivery` | Assigned delivery console, route addresses, drop completion |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 & custom animations
- **Icons:** Lucide React
- **Analytics Charts:** Recharts
- **Celebration Effects:** Canvas Confetti
- **Database Engine:**
  - Dual Mode: Full Supabase PostgreSQL schema with Row Level Security (`supabase/schema.sql`).
  - Out-of-the-box Persistent In-Memory / LocalStorage adapter (`src/lib/db.ts`) for zero-configuration local execution.

---

## 📦 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Run Automated Tests
```bash
npm test
```
Executes the native test suite verifying:
- Database initialization with 50+ products & 8 categories.
- Cart subtotal, coupon deduction (`BIZFIRST`), and atomic checkout stock decrement.
- Out-of-stock purchase rejection.
- Concurrency-safe order cancellation and inventory restoration.
- Illegal status transition rejection.
- AI Advisor recommendation approval and execution.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema & Supabase Deployment

For production deployments on Supabase:
1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository and run the script.
4. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. All Row Level Security (RLS) policies, foreign keys, triggers, and indices will be automatically applied.

---

## 📄 License & Attribution

Designed and engineered for college entrepreneurship and modern retail digitization initiatives.  
© 2026 BizNova Retail Platform.
