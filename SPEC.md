# System Specification: Hotel & Restaurant Management System (POS & KDS)

## 1. System Overview
The **Hotel & Restaurant Management System** is a real-time, touch-optimized Point of Sale (POS) and Kitchen Display System (KDS) engineered for fast-paced dining environments. It facilitates seamless communication between front-of-house staff (Waiters/Captains), kitchen personnel (Chefs/Cooks), and management (Admin/Cashiers) to minimize order turnaround times, prevent order slippage, and streamline billing operations.

---

## 2. User Roles & Permissions

### 2.1. Admin / Manager
- **Table & Section Setup:** Create, edit, re-arrange, and delete tables across multiple dining sections (e.g., Indoor, Rooftop, Patio, AC Hall).
- **Menu Management:** Configure categories, items, pricing, tax rates (GST/VAT), variant options, inventory status (in-stock/86'd), and add-on groups.
- **Staff Management:** Create and manage user credentials, assign roles (Admin, Waiter, Kitchen Staff), and manage access PINs.
- **Security & Void PIN:** Dedicated master Void PIN for authorizing voided orders, item cancellations (specifically items already in `Preparing` status), and custom manager discounts.
- **Analytics & Reporting:** Access sales summaries, category-wise breakdowns, shift closeouts (Z-Reports), cashier reconciliations, tax summaries, and average kitchen turnaround times.

### 2.2. Waiter / Captain
- **Table Grid Overview:** Live visual status grid of tables with seating capacities, occupancy time elapsed, and current bill subtotals.
- **Order Placement:** Fast, touch-friendly order creation with instant search, category filtering, and item modifiers.
- **Kitchen Notes:** Add special instructions per item or per order (e.g., "Less spicy", "No onion/garlic", "Gluten allergy").
- **Add-on Processing:** Append new items to already active, seated tables. Add-ons are automatically identified and pushed to the kitchen with explicit "ADD-ON / ROUND 2+" badges.
- **Bill Request & Table Transfer:** Request bills on behalf of customers, initiate table transfers, and merge active tables.
- **Notifications:** Receive instant real-time alerts when kitchen marks orders or items as `Ready to Serve`.

### 2.3. Kitchen Staff / Chef (KDS)
- **Order Queue:** Real-time chronological ticket stream of pending tickets with persistent elapsed timers.
- **Color-Coded Aging:** Visual timer indicators (Green: < 10 mins, Amber: 10–20 mins, Red: > 20 mins) to track ticket age.
- **Status Progression:** Update tickets/items across operational states: `Pending` ➔ `Preparing` ➔ `Ready to Serve`.
- **Add-on Highlighting:** Instant audio-visual cues when add-on items arrive for an existing table ticket.

---

## 3. Table Management

### 3.1. Dynamic Table Configuration
- Admin can dynamically add tables specifying: Table Number/Name, Section/Zone, Seating Capacity (e.g., 2-seater, 4-seater, 8-seater), and visual display coordinates.

### 3.2. Table Status Lifecycle
Each table transitions through clearly defined statuses:
1. **`Available` (Green / Neutral):** Table is clean and ready to seat guests.
2. **`Occupied` (Blue / Primary):** Table is seated with an active order or session. Displays elapsed time and current run-rate bill total.
3. **`Bill Requested` (Yellow / Amber):** Waiter or guest has requested the check. No further items may be ordered without reopening or manager authorization.
4. **`Cleaning` (Purple / Orange):** Payment completed; table is undergoing clearing and sanitization before being released back to `Available`.

### 3.3. Table Operations
- **Table Transfer:** Move an entire active order from Table A to Table B (e.g., guest moves from Outdoor T3 to Indoor T12). Auto-updates table statuses and informs staff.
- **Table Merge:** Combine two or more tables (e.g., T4 and T5 merged for large party). Unified order and billing under the primary table identifier with merged guest counts.

---

## 4. Ordering & Add-ons Flow

### 4.1. Menu Navigation & Item Search
- Search bar with instant fuzzy search by item code or name.
- Category filtering with quick horizontal tabs (Starters, Main Course, Beverages, Desserts, Combos).
- Out-of-Stock ("86'd") indicator preventing ordering of unavailable items.

### 4.2. Kitchen Notes & Customizations
- Freeform and quick-preset kitchen notes per item (e.g., "Extra spicy", "No cheese", "Serve after starters").
- Order-level priorities (e.g., "Rush Order", "VIP Guest").

### 4.3. Incremental Ordering (Add-ons)
- Waiters can open an already active order and add subsequent rounds of items.
- In KDS, new items are flagged with **`[ADD-ON]`** tags, showing round numbers (Round 2, Round 3) to prevent confusion with items already cooked or served.

### 4.4. Voiding & Cancellation Policy
- **Pending Items:** If an item is still `Pending` (not yet started in kitchen), the waiter can remove/void it with an optional cancellation reason.
- **Preparing Items:** Once an item status moves to `Preparing` or `Ready to Serve`, system locks cancellation behind an **Admin Void PIN**.
- Every voided item is logged with timestamp, user ID, authorizing manager ID, and reason for audit trails.

---

## 5. Kitchen Display System (KDS)

### 5.1. Queue & Ticket Presentation
- Real-time ticket board arranged chronologically (FIFO: First-In, First-Out) or by dining priority.
- Header contains Table Number, Waiter Name, Elapsed Time counter, Order Type (Dine-In, Takeaway), and Ticket ID.
- Add-on tickets display parent reference: e.g., `Table 4 - Add-on #2`.

### 5.2. Item & Order Status Workflow
- **`Pending`:** Order submitted by front-of-house, awaiting kitchen acknowledgment.
- **`Preparing`:** Kitchen acknowledges and begins food prep. Timer continues counting.
- **`Ready to Serve`:** Prep complete. Waiter receives instant sound/push notification with Table number and item details.
- Completed tickets can be archived with a single tap, with a 30-minute recall buffer for accidental bumps.

---

## 6. Billing & Settlements

### 6.1. Financial Computations
- **Subtotal:** Sum of all active, non-voided item prices.
- **Taxes (GST/VAT):** Configurable split taxes (e.g., CGST 2.5% + SGST 2.5% or custom service charges).
- **Discounts:**
  - Flat discount amount or percentage discount.
  - Requires Admin PIN if discount exceeds pre-set waiter threshold (e.g., > 10%).
- **Round-off:** Standard currency round-off to nearest whole unit.

### 6.2. Bill Splitting
- **Equal Split:** Split total bill evenly across *N* guests.
- **Item-based Split:** Separate individual items or seats into distinct invoices.

### 6.3. Payment Methods
- Support for multi-tender split payments combining:
  - **Cash:** Includes cash-tendered and change-return calculation.
  - **UPI / QR Code:** Dynamic or static QR display with reference transaction code entry.
  - **Card:** POS EDC machine reference/batch number logging.

### 6.4. Receipts & Table Reset
- Thermal printer compatible digital receipt formatting (80mm / 58mm).
- Printable digital receipts and instant WhatsApp/SMS receipt link generation (optional).
- Upon successful payment settlement, table automatically shifts from `Bill Requested` / `Occupied` to `Cleaning` (or straight to `Available` based on restaurant preferences).
