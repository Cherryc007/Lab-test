# GuardOn — Execution Tracker

**Document Owner:** Technical Lead
**Status:** Living Document — Update Continuously
**Version:** 1.0
**Last Updated:** 2026-06-17
**Related Documents:** PRD.md, TECH_ARCHITECTURE.md, SECURITY_ACCESS.md, FEATURE_BACKLOG.md

> This is the single source of truth for where the GuardOn prototype actually stands. Unlike the other four documents (which describe the plan), this one describes reality as of the last update and must be kept current throughout development — out-of-date status here is worse than no tracker at all.

---

## 1. Current Status

### Completed
- [x] Project initialization and scope definition.
- [x] PRD.md — Product Requirements Document.
- [x] TECH_ARCHITECTURE.md — Technical Blueprint.
- [x] SECURITY_ACCESS.md — Security & Permission Model.
- [x] FEATURE_BACKLOG.md — 40 tickets across 8 modules.
- [x] EXECUTION_TRACKER.md — this document.

### In Progress
- _Nothing yet — documentation phase just closed out._

### Blocked
- _Nothing currently blocked._

### Upcoming (next up, in order)
1. Project scaffold: Next.js + TypeScript + Tailwind + shadcn/ui initialization, folder structure per TECH_ARCHITECTURE.md §3.
2. Mock data layer: seed fixtures for guards, clients, sites, shifts (`mocks/*.json`, `mocks/seed.ts`).
3. Session/role simulation shell (`useSessionStore`, login/role-select screen, route-group guards).
4. Sprint 1 feature work — see §6 Sprint Planning.

---

## 2. Architecture Decisions

Recorded in lightweight ADR form: decision, rationale, and what it rules out. These are binding until explicitly revisited here.

| # | Decision | Rationale | Rules Out (for now) |
|---|---|---|---|
| AD-001 | Single Next.js app, no real backend, for the prototype phase. | Matches the "sales prototype, not production infra" objective; fastest path to a demoable product. | Real persistence, real auth, real GPS/selfie storage. |
| AD-002 | Zustand for all client state, one store per domain. | Low boilerplate, good fit for prototype timeline, scales acceptably into early production. | Redux, plain React Context for cross-cutting state. |
| AD-003 | Mock Service Layer with repository-style function signatures matching a real future API. | Makes the eventual swap to a real backend additive rather than a rewrite (see TECH_ARCHITECTURE.md §9). | Calling mock data directly from components or stores. |
| AD-004 | Feature-folder module boundaries aligned 1:1 with FEATURE_BACKLOG.md modules. | Keeps business logic from scattering; makes backlog tickets map cleanly to code locations. | Cross-feature direct imports between domain folders. |
| AD-005 | Selfie verification is presence-verification-by-human-review only; no automated facial recognition matching in MVP or near-term roadmap. | Avoids biometric-matching legal/consent complexity before it's justified by a real business need; keeps prototype scope honest. | Any automated face-match feature without a dedicated legal/consent review first. |
| AD-006 | GPS out-of-geofence events are flagged, not hard-blocked, in the MVP. | Real-world GPS drift and indoor sites make hard-blocking likely to create false negatives that erode dispatcher trust in the system. | Hard geofence enforcement, pending real-world accuracy data. |
| AD-007 | Role-based route groups `(guard)`, `(dispatch)`, `(client)`, `(auth)` in the App Router. | Cleanly separates mobile-first vs. desktop-first experiences per PRD.md §5, and maps directly to RBAC boundaries in SECURITY_ACCESS.md. | A single unified shell serving all roles identically. |

---

## 3. Risks

| Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|
| Geofence radius tuning: too tight produces false "out of geofence" flags from normal GPS drift (±10–30m typical); too loose defeats the purpose. | Medium — undermines trust in attendance data during the demo. | Medium | Default to a conservative radius (configurable per site) and treat all out-of-geofence events as flags, not blocks (AD-006), reviewed with the design partner during the demo. | Technical Lead |
| Prototype's client-only auth/data model could be mistaken for "production-ready" by stakeholders unfamiliar with the architecture. | High — could lead to real PII/biometric data being entered into a system not built to protect it. | Medium | This tracker, the PRD, and SECURITY_ACCESS.md all explicitly flag the prototype/production boundary; demo script should state this verbally up front. | Product Management |
| Missed check-in detection runs client-side (browser timer) in the prototype. | Medium — won't work if a dispatcher's tab isn't open; not a real concern for a guided demo, but a real one if anyone tries to "soft-launch" the prototype operationally. | Low (for demo) / High (if misused as a real tool) | Documented explicitly in TECH_ARCHITECTURE.md §10 as a production-blocking gap; do not allow the prototype to be used for real lone-worker safety monitoring. | Technical Lead |
| Scope creep from "just one more feature before the demo." | Medium — threatens timeline to client approval. | Medium | FEATURE_BACKLOG.md priority tiers (P0/P1/P2) exist precisely to draw this line; new requests get triaged into the backlog, not built ad hoc. | Product Management |
| 40-ticket backlog is sized for a confident estimate but not yet validated against actual team velocity. | Medium — sprint plan in §6 may need rebalancing after Sprint 1. | Medium | Treat Sprint 1 as a calibration sprint; revisit §6 after it closes. | Technical Lead |

---

## 4. Technical Debt

No technical debt yet — implementation has not started. This section will track intentional shortcuts taken during the prototype build that must be revisited before/during production. Anticipated entries once work begins (pre-registered here so they don't get forgotten):

- Mock Service Layer's "always eventually succeeds" happy-path bias will need deliberate failure-mode testing once replaced by a real API.
- Client-side-only authorization (no server enforcement) is acceptable now (AD-001) but is the single largest piece of debt to retire before any real data touches the system (see SECURITY_ACCESS.md §4).
- Lone-worker missed-check-in detection (client-side timer) will need to move server-side (TECH_ARCHITECTURE.md §10) before any real operational use.

---

## 5. Next Steps

1. Stakeholder review/sign-off on the five governing documents (this set).
2. Scaffold the Next.js project per TECH_ARCHITECTURE.md §3 folder structure.
3. Build the mock data seed layer and the Mock Service Layer pattern for one module first (Scheduling) as a template for the rest.
4. Implement Sprint 1 tickets (see §6).
5. Internal dry-run of the guided demo script before external client demo.

---

## 6. Sprint Planning

Sprints are scoped to deliver a coherent, demoable slice each time, prioritizing P0 tickets from FEATURE_BACKLOG.md first so the four core workflows (Scheduling, Attendance, Lone Worker, Activity Log) are demoable as early as possible.

### Sprint 0 — Documentation & Foundation (Complete)
- All five governing documents.
- Project scaffold, mock data architecture, session/role simulation shell.

### Sprint 1 — Scheduling Core
- FEATURE-001 Shift Creation
- FEATURE-002 Shift Assignment to Guard
- FEATURE-003 Guard Accept/Reject Shift
- FEATURE-004 Open Shift Marketplace (Auto-Publish)
- FEATURE-005 Claim Open Shift
- FEATURE-019 Client Site Management (needed as a dependency for shift creation)
- FEATURE-020 Geofence Configuration (needed ahead of Sprint 2's Attendance work)

### Sprint 2 — Attendance Core
- FEATURE-007 GPS Validation at Clock-In/Out
- FEATURE-008 Selfie Capture at Clock-In
- FEATURE-009 Clock In Action
- FEATURE-010 Clock Out Action
- FEATURE-013 / FEATURE-014 / FEATURE-015 Guard roster, profile, and eligibility (needed as dependencies)
- FEATURE-039 Guard Dashboard / Home

### Sprint 3 — Lone Worker & Activity Logs
- FEATURE-027 Lone Worker Shift Designation
- FEATURE-028 Periodic Check-In Prompt
- FEATURE-029 Check-In Selfie/Status Submission
- FEATURE-030 Missed Check-In Detection
- FEATURE-031 Escalation View for Dispatcher/Supervisor
- FEATURE-023 Activity Log Submission

### Sprint 4 — Operational Visibility & Polish
- FEATURE-006 Dispatcher Calendar View
- FEATURE-011 Live Attendance Monitor
- FEATURE-012 Late/Missed Clock-In Flagging
- FEATURE-025 Dispatcher Activity Log Review Queue
- FEATURE-032 / FEATURE-033 / FEATURE-034 Notification center and core notification triggers
- FEATURE-036 Dispatcher Dashboard

### Sprint 5 — Client Experience & Remaining P1/P2
- FEATURE-021 Client Site Contact Management
- FEATURE-022 Client Coverage View
- FEATURE-040 Client Dashboard
- FEATURE-037 Operations Manager Dashboard
- Remaining P1/P2 tickets (FEATURE-016, FEATURE-017, FEATURE-024, FEATURE-026, FEATURE-035, FEATURE-038), prioritized based on demo feedback from earlier sprints.

This plan will be revised at the close of each sprint based on actual velocity (see Risk: backlog sizing, §3). Sprint boundaries are guidance, not a fixed contract — the rule from the project brief still applies: workflow first, documentation driven, avoid overengineering.
