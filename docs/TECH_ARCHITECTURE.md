# GuardOn — Technical Architecture

**Document Owner:** Lead Software Architect
**Status:** Approved for MVP Development
**Version:** 1.0
**Last Updated:** 2026-06-17
**Related Documents:** PRD.md, SECURITY_ACCESS.md, FEATURE_BACKLOG.md, EXECUTION_TRACKER.md

---

## 1. Architectural Goals

This architecture serves a prototype with one non-negotiable constraint: **everything we build now should be reusable when we replace the mock layer with a real backend.** Concretely, that means:

- Business logic and UI must never directly depend on *how* data is fetched (mock vs. real API). All data access goes through a swappable service layer.
- State shape should already look like the shape a real API would return, so swapping the transport later doesn't force a data-model rewrite.
- No premature infrastructure: no microservices, no Kubernetes, no real backend. A single Next.js application is the entire system.

---

## 2. System Architecture

GuardOn (prototype) is a **single Next.js application** with no real backend. It is conceptually layered as follows:

```
┌─────────────────────────────────────────────┐
│                  UI Layer                    │
│   App Router pages, layouts, feature views   │
└───────────────────┬───────────────────────────┘
                     │ reads/writes
┌───────────────────▼───────────────────────────┐
│              State Layer (Zustand)            │
│   Domain stores: scheduling, attendance,      │
│   guards, clients, activityLogs, loneWorker,  │
│   notifications, session/auth, ui             │
└───────────────────┬───────────────────────────┘
                     │ calls
┌───────────────────▼───────────────────────────┐
│          Mock Service Layer ("API")           │
│   Repository-style functions returning        │
│   Promises, simulated latency, fixture data    │
└───────────────────┬───────────────────────────┘
                     │ reads
┌───────────────────▼───────────────────────────┐
│              Fixture / Seed Data               │
│   Deterministic mock JSON: guards, clients,    │
│   sites, shifts, logs, etc.                    │
└─────────────────────────────────────────────────┘
```

Components never call the Mock Service Layer directly for mutations that affect shared state — they go through a store action, which calls the service layer, then updates the store. This mirrors how a real app would dispatch a request and update a client-side cache, so the migration path to a real backend (e.g., swap the Mock Service Layer for `fetch` calls to real REST/GraphQL endpoints) requires no changes to components or stores.

---

## 3. Folder Structure

```
guardon/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (guard)/                  # Mobile-first guard routes
│   │   ├── layout.tsx
│   │   ├── schedule/page.tsx
│   │   ├── shift/[shiftId]/page.tsx
│   │   ├── marketplace/page.tsx
│   │   ├── check-in/page.tsx
│   │   └── activity/page.tsx
│   ├── (dispatch)/                # Desktop-first dispatcher/supervisor/ops routes
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── scheduling/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── lone-worker/page.tsx
│   │   ├── activity-logs/page.tsx
│   │   ├── guards/page.tsx
│   │   ├── clients/page.tsx
│   │   └── clients/[clientId]/sites/[siteId]/page.tsx
│   ├── (client)/                  # Client-facing read-mostly routes
│   │   ├── layout.tsx
│   │   ├── coverage/page.tsx
│   │   └── activity/page.tsx
│   ├── layout.tsx
│   └── page.tsx                   # Role-aware landing/redirect
│
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, dialog, etc.)
│   └── shared/                    # Cross-feature composites (StatusBadge, RoleGate, EmptyState)
│
├── features/                      # Feature/domain modules (the heart of the app)
│   ├── scheduling/
│   │   ├── components/            # ShiftCard, ShiftCalendar, AssignShiftModal
│   │   ├── hooks/                 # useShiftActions, useOpenShifts
│   │   └── types.ts
│   ├── attendance/
│   │   ├── components/            # ClockInFlow, GpsValidationStep, SelfieCaptureStep
│   │   ├── hooks/
│   │   └── types.ts
│   ├── lone-worker/
│   │   ├── components/            # CheckInPrompt, EscalationList
│   │   └── types.ts
│   ├── activity-logs/
│   │   ├── components/            # ActivityLogForm, ActivityLogReviewQueue
│   │   └── types.ts
│   ├── guards/
│   │   ├── components/            # GuardRoster, GuardProfileForm
│   │   └── types.ts
│   ├── clients/
│   │   ├── components/            # ClientList, SiteForm, GeofenceEditor
│   │   └── types.ts
│   ├── notifications/
│   │   ├── components/            # NotificationBell, NotificationFeed
│   │   └── types.ts
│   ├── audit/
│   │   ├── components/            # AuditLogViewer (future; no UI in MVP)
│   │   └── types.ts
│   └── dashboard/
│       └── components/            # role-specific widgets, KpiCard, FillRateChart
│
├── store/                         # Zustand stores, one per domain
│   ├── useSchedulingStore.ts
│   ├── useAttendanceStore.ts
│   ├── useGuardStore.ts
│   ├── useClientStore.ts
│   ├── useActivityLogStore.ts
│   ├── useLoneWorkerStore.ts
│   ├── useNotificationStore.ts
│   ├── useAuditStore.ts           # append-only audit event log
│   ├── useSessionStore.ts         # current user, role, simulated auth
│   └── useUiStore.ts              # modals, toasts, global UI state
│
├── services/                      # Mock Service Layer ("API")
│   ├── scheduling.service.ts
│   ├── attendance.service.ts
│   ├── guards.service.ts
│   ├── clients.service.ts
│   ├── activityLogs.service.ts
│   ├── loneWorker.service.ts
│   ├── notifications.service.ts
│   ├── audit.service.ts           # audit event persistence (mock: in-memory)
│   └── client.ts                  # shared fetch-like helper: simulateLatency(), simulateFailure()
│
├── mocks/                         # Fixture/seed data
│   ├── guards.json
│   ├── clients.json
│   ├── sites.json
│   ├── shifts.json
│   ├── activityLogs.json
│   └── seed.ts                    # assembles fixtures into an in-memory "database"
│
├── lib/
│   ├── permissions.ts              # role → permission helpers (see SECURITY_ACCESS.md)
│   ├── geofence.ts                 # distance/geofence calculation utilities
│   ├── validation/                 # zod schemas per domain
│   └── utils.ts
│
├── types/                          # Shared cross-feature types (Role, Shift, Guard, Site, etc.)
│
├── hooks/                          # Cross-feature hooks (useCurrentUser, useRoleGuard)
│
└── docs/                           # PRD.md, TECH_ARCHITECTURE.md, SECURITY_ACCESS.md,
                                     # FEATURE_BACKLOG.md, EXECUTION_TRACKER.md
```

**Rule:** A `features/<domain>` folder owns its own components, hooks, and types. Cross-domain UI composition happens at the `app/` route level, not by features importing each other directly. Shared primitives only live in `components/ui` and `components/shared`.

---

## 4. State Management Strategy

**Zustand** is the single source of truth for all client-side state, chosen over Redux/Context for its low boilerplate and good fit for a prototype timeline, while still scaling cleanly into production.

Principles:

1. **One store per domain**, matching the modules in FEATURE_BACKLOG.md (Scheduling, Attendance, Guards, Clients, Activity Logs, Lone Worker, Notifications, Audit) plus `useSessionStore` (current user/role — simulated auth) and `useUiStore` (modals, toasts, transient UI state).
2. **Stores expose actions, not setters.** Components call `store.acceptShift(shiftId)`, not `store.setShifts(...)`. The action internally calls the relevant service function, handles loading/error state, and updates the store. This keeps business logic out of components.
3. **Derived state is computed via selectors**, not duplicated into the store. E.g., "open shifts" is derived from `shifts.filter(s => s.status === 'open')`, not maintained as a separate array that can drift out of sync.
4. **Stores never import from `app/` or `components/`.** Dependency direction is strictly: UI → Store → Service → Mock Data.
5. **Async actions follow a consistent shape:** `{ data, isLoading, error }` per resource, so loading/error UI patterns are consistent across the app and translate directly to real-world async query state (this shape is intentionally compatible with future adoption of a library like TanStack Query if desired in production).
6. **Single entity ownership.** Each domain entity type is owned by exactly one store. That store is the sole source of truth for the entity's data and status transitions. Other stores that need to trigger a status change on a foreign entity do so through a dedicated, named transition function on the owning store (via `getState()`), never by holding a duplicate copy. This pattern prevents data drift between stores and creates auditable transition points.
7. **Assignment history is first-class data.** Entities that pass through multiple actors (e.g., Shifts being assigned, rejected, reassigned) maintain an explicit event history (`ShiftAssignmentEvent[]`) alongside the current state, so the audit trail and dispatcher visibility into "who rejected this shift and when" are structurally guaranteed, not reconstructed after the fact.

---

## 5. Module Boundaries

Each module below is a `features/<name>` folder plus its corresponding store and service:

| Module | Owns | Does Not Own |
|---|---|---|
| Scheduling | **Shift entity (sole owner)**: CRUD, status transitions across the full lifecycle (Draft → Completed), assignment, accept/reject, open shift marketplace, `ShiftAssignmentEvent` history. Exposes `transitionShiftStatus(shiftId, newStatus)` as the only approved cross-store write path for shift status changes. | Attendance records (clock in/out data), guard roster data |
| Attendance | `AttendanceRecord` entity, clock in/out flows, GPS validation step, selfie capture step. Calls `useSchedulingStore.transitionShiftStatus()` to move a shift to `Active` (clock-in) or `Completed` (clock-out) — never holds or duplicates shift data. | Shift entity, shift creation/assignment |
| Lone Worker | Check-in prompts, `LoneWorkerCheckIn` entity, missed check-in detection, `LoneWorkerAlert` entity, escalation | Activity log content (check-in `statusNote` is a safety signal owned here; formal operational logs are owned by Activity Logs) |
| Activity Logs | Log submission, review queue, per-site history | Lone worker check-in scheduling |
| Guards | Guard roster, profile, eligibility/availability | Shift assignment logic (Scheduling reads guard eligibility, but Guards module doesn't assign shifts) |
| Clients | Client roster, site roster, geofence config | Attendance/GPS validation logic (Attendance reads site geofence, but doesn't own it) |
| Notifications | In-app notification feed, read/unread state | The triggering business event itself (other modules raise notifications via a shared dispatch function) |
| Audit | `AuditEntry` entity (append-only), audit event recording. Subscribes to state changes across domain stores and records who/what/when for every auditable action (see SECURITY_ACCESS.md §11). | Any source-of-truth business data; Audit is write-only from the perspective of other modules. |
| Dashboard | Aggregation/presentation of metrics from other modules | Any source-of-truth data; Dashboard is read-only across modules |

### Entity Ownership Map

To prevent ambiguity, the following table makes entity-to-store ownership explicit:

| Entity | Owning Store | Other Stores That Read It | Cross-Store Write Path |
|---|---|---|---|
| `Shift` | `useSchedulingStore` | Attendance, Lone Worker, Activity Logs, Dashboard | `transitionShiftStatus(shiftId, newStatus)` — called by Attendance on clock-in/clock-out |
| `ShiftAssignmentEvent` | `useSchedulingStore` | Audit, Dashboard | None (Scheduling writes internally on assign/accept/reject/claim) |
| `AttendanceRecord` | `useAttendanceStore` | Dashboard | None |
| `Guard` | `useGuardStore` | Scheduling (eligibility), Dashboard | None |
| `Client`, `Site` | `useClientStore` | Scheduling (site selection), Attendance (geofence), Dashboard | None |
| `ActivityLog` | `useActivityLogStore` | Dashboard | None |
| `LoneWorkerCheckIn`, `LoneWorkerAlert` | `useLoneWorkerStore` | Dashboard | None |
| `Notification` | `useNotificationStore` | None | `pushNotification()` — called by other stores after their own state updates |
| `AuditEntry` | `useAuditStore` | None | `recordEvent()` — called by other stores after auditable actions |
| `User` (session) | `useSessionStore` | All stores (for current user context) | None |

This boundary list is the basis for preventing "scattered business logic" — if a change touches scheduling rules, it should only require editing the Scheduling module's store/service/components.

---

## 6. Component Architecture

Three tiers:

1. **Primitives (`components/ui`)** — shadcn/ui components (Button, Dialog, Input, Card, Badge, Tabs, etc.), unmodified or lightly themed. No business logic.
2. **Shared composites (`components/shared`)** — cross-feature patterns built on primitives: `StatusBadge` (shift/attendance status → color+label), `RoleGate` (conditionally renders children based on current role/permission), `EmptyState`, `PageHeader`, `KpiCard`.
3. **Feature components (`features/<domain>/components`)** — domain-aware components like `ShiftCard`, `ClockInFlow`, `GeofenceEditor`. These connect to their domain's store via hooks and compose primitives/shared composites; they do not reach into another domain's store directly.

Page components in `app/` are intentionally thin: they assemble feature components and layout, and contain little to no logic of their own — **"pages render state."**

---

## 7. Route Architecture

The App Router is organized into **role-oriented route groups**, matching the mobile-first/desktop-first split in the PRD:

- `(auth)` — login/role-selection (simulated auth for the prototype).
- `(guard)` — mobile-first: schedule, shift detail, marketplace, check-in, activity submission.
- `(dispatch)` — desktop-first: dashboard, scheduling calendar, attendance monitor, lone-worker escalation, activity log review, guard roster, client/site management.
- `(client)` — desktop+mobile, read-mostly: coverage view, activity summary.

Each route group has its own `layout.tsx` providing the appropriate shell (mobile bottom-nav for guards, desktop sidebar for dispatch/ops, simplified header for clients). A shared `useRoleGuard` hook checks the current simulated session role against the route group and redirects if mismatched, anticipating real middleware-based route protection in production (see SECURITY_ACCESS.md §4).

---

## 8. Data Flow

Standard flow for any user action that mutates state:

1. User interacts with a feature component (e.g., taps "Claim Shift").
2. Component calls a store action (`useSchedulingStore.claimShift(shiftId)`).
3. Store action sets `isLoading: true`, calls the corresponding service function (`schedulingService.claimShift(shiftId)`).
4. Service function simulates network latency (`simulateLatency()`), reads/writes the in-memory mock database, and resolves with a result shaped like a real API response (`{ data, error }`).
5. Store action updates state from the result, sets `isLoading: false`, and — where relevant — pushes a notification via `useNotificationStore` and records an audit entry via `useAuditStore`.
6. Components subscribed to that store slice re-render automatically via Zustand.

This flow is intentionally identical in shape to what a real REST integration would look like, so step 4 is the only step that changes when the mock layer is replaced.

### Cross-Store Transition Flow (Clock-In Example)

When an action in one module must change an entity owned by another module, the flow extends with a controlled cross-store call:

1. Guard taps "Clock In" → component calls `useAttendanceStore.clockIn(shiftId)`.
2. Attendance store validates GPS + selfie, creates an `AttendanceRecord`.
3. Attendance store calls `useSchedulingStore.getState().transitionShiftStatus(shiftId, 'Active')` — the single approved cross-store write path.
4. Scheduling store validates the transition is legal (e.g., shift must be in `Confirmed` status), updates the shift, and appends a `ShiftAssignmentEvent` to the assignment history.
5. Both stores record audit entries via `useAuditStore.getState().recordEvent()`.
6. Components subscribed to either store re-render.

This pattern keeps entity ownership unambiguous while allowing legitimate cross-domain workflows. The `transitionShiftStatus` function is the **only** code path that can change a shift's status from outside the Scheduling module — it is auditable, type-safe, and validates the transition before applying it.

---

## 9. API Strategy

The prototype has **no real network calls**. Instead:

- Each domain has a `*.service.ts` file exposing async functions with the same signatures a real API client would have (e.g., `getShifts(filters): Promise<Shift[]>`, `claimShift(id): Promise<Shift>`).
- A shared `services/client.ts` helper provides `simulateLatency(ms?)` and `simulateFailure(rate?)` so the prototype can realistically demonstrate loading and error states without real infrastructure.
- All mock data lives in `mocks/*.json` and is loaded into an in-memory store via `mocks/seed.ts` on app start, acting as a fake "database" for the session.
- Service functions are the **only** files that know data is mocked. Stores and components only see Promises and typed results — exactly what they'd see calling a real backend.

**Migration path to production:** replacing the contents of each `*.service.ts` file with real `fetch`/API client calls (same function signatures) should require zero changes to stores, hooks, or components. This is the single most important architectural decision in this document, because it's what makes the prototype's code reusable rather than throwaway.

---

## 10. Future Scalability Notes

These are explicitly **not built now**, but the current architecture is designed not to block them:

- **Real backend:** A Node-based API (e.g., NestJS) or a managed BaaS, with PostgreSQL as the system of record. The relational shape (Guards, Clients, Sites, Shifts, Attendance Records, Activity Logs) is already implied by the mock data structures, easing schema design later.
- **Real authentication:** Replace `useSessionStore`'s simulated login with a real provider (e.g., NextAuth, Clerk, or Auth0), issuing real session tokens and enforcing role checks server-side (see SECURITY_ACCESS.md).
- **Real-time updates:** Dispatcher attendance/lone-worker views will eventually need live updates (websockets or polling) rather than local state; the store-action pattern already isolates where this would be introduced.
- **Native mobile apps:** If guard adoption demands it, the guard-facing route group's feature logic (hooks, validation) is largely portable to React Native, though components themselves are not.
- **Multi-tenancy:** Current data model assumes a single guard company; production will need a tenant boundary added to every entity (Guards, Clients, Sites, Shifts) plus tenant-scoped query enforcement at the API layer.
- **Background jobs:** Missed check-in detection is currently computed client-side on a timer for the demo; production requires a server-side scheduled job so detection doesn't depend on a dispatcher's browser tab being open.

No microservices, container orchestration, or advanced DevOps tooling are anticipated at the next stage either — the recommended next step is a single well-structured monolith with a real database, scaled vertically until there's clear evidence it's needed.
