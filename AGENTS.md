# AGENTS.md — Workspace Guidelines & Rules

## 1. Project Overview & Architecture
This workspace hosts the full-stack **Hotel & Restaurant Management System (POS & KDS)**. All agents and developers working in this repository must strictly adhere to the standards and rules defined in this document.

---

## 2. Core Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Radix UI / Lucide React icons
- **State & Data Fetching:** TanStack Query (React Query) / Zustand for local UI state
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Real-Time Layer:** Socket.io (or WebSockets) for real-time kitchen updates, table state sync, and waiter notifications
- **Validation:** Zod for client and server runtime schema validation
- **Testing & Verification:** Vitest / Playwright for integration & verification

---

## 3. Mandatory Workspace Rules

### Rule 1: Implementation Plan Required
> **Always generate an implementation plan before modifying database schemas or core routing.**
- Before running any Prisma migrations, editing `schema.prisma`, or altering core application routes (e.g., `/api/*`, `/pos/*`, `/kds/*`, `/admin/*`), formulate and document a step-by-step implementation plan.
- The plan must analyze data dependencies, breaking changes, backward compatibility, and client-side impacts.

### Rule 2: Modular UI Architecture (< 200 Lines Per Component)
> **Keep UI components modular (under 200 lines) with a dark, high-contrast, touch-friendly aesthetic.**
- Break down monolithic screens into composable, isolated child components:
  - *Example:* Instead of one giant POS screen, split into `TableCard`, `TableGrid`, `CategoryBar`, `MenuItemCard`, `CartDrawer`, `VoidModal`, and `ReceiptModal`.
- Files exceeding 200 lines must be refactored into smaller sub-components or custom hooks.
- **Design System:**
  - High-contrast, dark mode first theme (`#0F172A`, `#1E293B`, vibrant status accents: emerald green, amber yellow, sky blue, rose red).
  - Touch targets must be generous (minimum 44x44px, preferably 48px+ for mobile/tablet terminals).
  - Clear typography with strong legibility in dimly lit restaurant or bright kitchen lighting conditions.

### Rule 3: Verification & Quality Gate
> **After implementing any UI or API feature, run build/type checks and verify in the browser before finishing.**
- Always run static typing and lint checks (`pnpm run lint`, `npx tsc --noEmit`, or `npm run build`) to ensure zero type errors.
- Test endpoint responses and UI workflows visually or via automated browser tests before marking a task complete.
- Verify real-time socket events propagate correctly across Waiter and KDS views.

---

## 4. Coding Conventions & Best Practices

### 4.1. Real-Time Socket Event Naming
Use strict domain-namespaced event strings:
- `table:status_changed` (payload: `{ tableId, status, updatedBy }`)
- `order:created` (payload: `{ orderId, tableId, items, isAddon }`)
- `order:item_status_updated` (payload: `{ orderId, itemId, status }`)
- `kds:ticket_bumped` (payload: `{ ticketId, completedAt }`)
- `bill:requested` (payload: `{ tableId, orderId }`)

### 4.2. Security & Void PIN Handling
- Never hardcode the Admin Void PIN or expose it in client bundles.
- Validate Void PINs exclusively on the server (`/api/orders/void-item`).
- Rate-limit failed PIN attempts to prevent brute-force entry.

### 4.3. Financial Calculations
- All monetary amounts (Subtotals, GST, Discounts, Grand Total) must be calculated on the server to prevent client-side manipulation.
- Store currency amounts in standard smallest currency units (e.g., paise/cents) or use exact decimal precision types to avoid floating-point drift.

---

## 5. Directory Structure Standard
```text
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── (admin)/admin/   # Admin dashboard (Menu, Tables, Staff, Reports)
│   │   ├── (pos)/pos/       # Front-of-House POS & Table Grid
│   │   ├── (kds)/kds/       # Kitchen Display System
│   │   └── api/             # REST endpoints / Webhook handlers
│   ├── components/          # Reusable UI components (< 200 lines each)
│   │   ├── ui/              # Base primitives (Button, Dialog, Badge, Input)
│   │   ├── pos/             # POS-specific modular components
│   │   ├── kds/             # KDS-specific modular components
│   │   └── admin/           # Admin-specific modular components
│   ├── hooks/               # Custom hooks (e.g., useSocket, useOrderCart)
│   ├── lib/                 # Shared utilities, Prisma client, calculation helpers
│   ├── server/              # Socket.io server handlers & backend services
│   └── types/               # TypeScript interfaces & Zod schemas
├── prisma/                  # Prisma schema & migrations
├── SPEC.md                  # Complete system requirements and functional spec
└── AGENTS.md                # Workspace engineering rules & guidelines
```
