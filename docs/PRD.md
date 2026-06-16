# GuardOn — Product Requirements Document (PRD)

**Document Owner:** Product Management
**Status:** Approved for MVP Development
**Version:** 1.0
**Last Updated:** 2026-06-17
**Related Documents:** TECH_ARCHITECTURE.md, SECURITY_ACCESS.md, FEATURE_BACKLOG.md, EXECUTION_TRACKER.md

---

## 1. Product Vision

GuardOn is a Security Workforce Management SaaS platform built for security guard companies — the operators who staff guards across client sites such as commercial buildings, retail locations, residential communities, construction sites, and events. GuardOn replaces the fragmented mix of spreadsheets, group chats, paper sign-in sheets, and disconnected scheduling tools that most security guard companies currently rely on.

The long-term vision is a single operational system of record that connects four groups of people who currently coordinate manually:

- **Operations Managers**, who need visibility into coverage, cost, and compliance across every client site.
- **Dispatchers**, who build schedules and need to fill gaps quickly when guards call out or reject shifts.
- **Guards**, who need a simple, mobile-first way to see their shifts, clock in/out reliably, and stay safe while working alone.
- **Clients**, who pay for security services and want assurance that contracted coverage is actually happening.

GuardOn's differentiator is not raw feature count — competitors like Connecteam, Deputy, and TrackTik already cover much of this ground — but a workflow that is purpose-built for the security guard industry specifically (open shift marketplace, GPS + selfie attendance verification, lone worker check-ins) delivered through a modern, trustworthy, "Linear/Notion-grade" interface rather than the dated, utility-grade UI common in this category.

The current phase of the product is a **sales prototype / MVP**: a polished, interactive demonstration of the core workflows, built to validate the product with design partners and secure approval/buy-in to fund full production development. It is explicitly not yet a production system.

---

## 2. User Types

| User Type | Role Summary | Primary Device |
|---|---|---|
| **Security Guard** | Front-line staff. Views assigned shifts, accepts/rejects/claims shifts, clocks in/out with GPS + selfie verification, submits activity logs, performs lone-worker check-ins. | Mobile (phone) |
| **Dispatcher** | Builds and assigns the shift schedule, manages the open shift marketplace, monitors live attendance, reviews activity logs, responds to lone-worker alerts. | Desktop (with tablet support) |
| **Supervisor** | Field-level oversight of a subset of guards/sites. Reviews activity logs, monitors attendance and lone-worker status for their assigned sites, can step in to reassign shifts. | Desktop and mobile |
| **Operations Manager** | Company-wide visibility. Owns reporting, staffing health, client satisfaction, and escalations across all sites. Manages guard roster and client roster at a high level. | Desktop |
| **Client (Site Contact)** | Represents the business paying for security services. Views scheduled vs. actual coverage at their site(s), can view activity log summaries relevant to their site. Read-only / limited-write access. | Desktop and mobile (read-heavy) |
| **System Administrator** | Manages company-wide configuration: roles, sites, integrations (future). In the MVP this is a thin layer on top of Operations Manager permissions. | Desktop |

User type detail, permissions, and the full permission matrix are defined in **SECURITY_ACCESS.md**.

---

## 3. Business Goals

1. **Win client approval.** The immediate, primary goal of this phase is a demo-able prototype that proves GuardOn's core workflows to a prospective security guard company and secures sign-off to fund a production build.
2. **Validate the workflow model.** Confirm that the scheduling → attendance → activity log → lone worker workflow chain matches how real dispatchers and guards actually operate, before any backend investment is made.
3. **Differentiate on experience.** Prove that a security workforce platform can look and feel like Linear or Notion rather than legacy enterprise software, as a competitive wedge against Connecteam, Deputy, and TrackTik.
4. **De-risk the production build.** Use the prototype to surface UX, data-model, and workflow gaps early and cheaply, before committing to backend architecture and infrastructure spend.
5. **Establish a credible foundation.** Produce architecture and documentation (this PRD and its companion documents) that a future engineering team can build on directly, minimizing throwaway work between prototype and production.

---

## 4. Functional Requirements

Functional requirements are grouped by module. Each is elaborated into individual tickets in **FEATURE_BACKLOG.md**.

### 4.1 Scheduling
- Dispatchers can create shifts against a client site, with start/end time, role requirements, and notes.
- Shifts are assigned to a specific guard or published to a shift marketplace pool.
- Guards can accept or reject an assigned shift.
- A rejected shift automatically becomes an "open shift" visible in the marketplace.
- Any eligible guard can claim an open shift; once claimed, the shift becomes confirmed.
- Dispatchers have a calendar view (week/day) of all shifts across guards and sites, built on FullCalendar.
- Conflicting shifts (double-booked guard, overlapping times) are flagged visually.

### 4.2 Open Shift Marketplace
- A guard-facing view listing all currently unassigned/open shifts they are eligible for.
- Guards can filter by site, date range, and pay differential (future).
- Claiming an open shift is a single, fast, low-friction action ("one-tap claim" pattern from Deputy/Connecteam).
- Dispatchers see marketplace activity (who claimed what, how fast shifts fill) on their dashboard.

### 4.3 Attendance & Clock In/Out
- Guards can only clock in for a shift that is currently assigned/confirmed and within an allowed time window of its scheduled start.
- Clock-in requires GPS validation (guard's location must be within an acceptable radius of the client site) and selfie verification.
- Once clocked in, the shift state becomes "Active."
- Guards clock out at the end of the shift; GPS is captured again at clock-out.
- Dispatchers see real-time attendance status across all active shifts ("who's on site right now").
- Late clock-ins, missed clock-ins, and early clock-outs are flagged automatically.

### 4.4 GPS Validation
- GPS coordinates are captured at clock-in, clock-out, periodic lone-worker check-ins, and activity log submission.
- Each client site has a defined geofence (center point + radius) used to validate proximity.
- Out-of-geofence attempts are flagged but — in the MVP — not hard-blocked, so dispatchers retain override authority (real-world GPS drift, indoor sites, etc. are common).

### 4.5 Selfie Verification
- A selfie is required at clock-in (and optionally at periodic lone-worker check-ins).
- The MVP performs **presence verification only** — confirming a photo was taken at the right time/place for dispatcher review — not automated biometric facial-recognition matching. See SECURITY_ACCESS.md for the rationale and future-state considerations.

### 4.6 Lone Worker Monitoring
- Guards on designated "lone worker" shifts receive periodic check-in prompts (configurable interval).
- Each check-in can require a selfie and/or a short activity status.
- A missed check-in beyond a grace period raises an alert to the dispatcher and supervisor.
- Dispatchers have an escalation view showing all overdue lone-worker check-ins, sorted by how overdue they are.

### 4.7 Activity Logs
- Guards can submit free-text activity log entries during a shift (e.g., "vehicle towed from north lot," "delivery received at 14:32").
- Activity logs can optionally be tagged with a category (incident, observation, routine) and attached to a specific site/shift.
- Dispatchers and supervisors review submitted logs; reviewed logs roll into a per-site operational history.
- Clients can view a filtered, client-appropriate summary of activity logs for their site(s).

### 4.8 Guard Management
- Operations Managers maintain a guard roster: profile, certifications/licenses, eligible sites, availability.
- Guard status (active, inactive, on leave) affects scheduling eligibility.

### 4.9 Client & Site Management
- Operations Managers maintain a client roster and, per client, one or more sites with geofence configuration and coverage requirements.
- Each site has designated contact(s) who receive client-level visibility.

### 4.10 Dashboard & Reporting
- Role-specific dashboards: Operations Manager (company-wide health), Dispatcher (today's schedule, open shifts, live attendance), Supervisor (assigned sites), Client (their own site coverage).
- Core metrics: shift fill rate, on-time clock-in rate, open shift count, active lone-worker alerts, recent activity logs.

### 4.11 Notifications
- In-app notification center for shift assignments, shift changes, open shift availability, lone-worker alerts, and activity log review status.
- The MVP simulates notification delivery in-app; SMS/push/email are future scope (see Section 6).

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Usability** | Guard-facing flows (schedule, clock in/out, check-in) must be completable in under 3 taps/screens for the common case. Dispatcher flows must support keyboard-and-mouse desktop efficiency. |
| **Performance (prototype)** | UI interactions should feel instant (<150ms perceived response) using local state; simulated "network" delays should be short (200–600ms) to demonstrate realistic loading states without feeling sluggish. |
| **Responsiveness** | Guard experience is mobile-first and must be fully usable on a standard phone viewport. Dispatcher/Operations Manager experience is desktop-first but must degrade gracefully on tablet. |
| **Accessibility** | Color contrast, focus states, and semantic markup should meet WCAG 2.1 AA where practical within shadcn/ui defaults; this is a direction, not a certification requirement, for the prototype phase. |
| **Reliability (prototype)** | The prototype must not crash or lose in-progress state during a guided demo. Local state should survive navigation between routes. |
| **Browser Support** | Latest two versions of Chrome, Safari, and Edge. Mobile Safari and Chrome on Android for the guard experience. |
| **Maintainability** | Code must follow the modular, state-driven architecture defined in TECH_ARCHITECTURE.md so the prototype can evolve into production without a full rewrite. |
| **Security (prototype)** | No real personal data, real GPS tracking, or real biometric data should be collected or transmitted in the prototype; all such data is simulated/mocked. See SECURITY_ACCESS.md for the full model, including the production-grade requirements that this design anticipates. |

---

## 6. Success Metrics

### 6.1 For this phase (sales prototype)
- Prototype successfully demonstrates all four core workflows (Scheduling, Attendance, Lone Worker, Activity Log) in a single guided walkthrough without breaking.
- Design partner / prospective client reviews the prototype and provides explicit approval or a defined list of changes required for approval.
- Internal stakeholders (sales, leadership) can run the demo themselves without engineering support.

### 6.2 Leading indicators for the eventual product
- **Shift fill rate:** % of open shifts claimed before shift start.
- **On-time clock-in rate:** % of shifts where clock-in occurs within the allowed time window.
- **Lone worker response rate:** % of check-ins completed before the missed-check-in threshold.
- **Activity log review latency:** time between guard submission and dispatcher review.
- **Client-visible coverage accuracy:** agreement between scheduled coverage and confirmed (clocked-in) coverage shown to clients.

These are the metrics the production system will ultimately need to report on; the MVP's dashboards are built to make these numbers visible even though the underlying data is simulated.

---

## 7. MVP Scope

In scope for this prototype:

- Full scheduling workflow including shift creation, assignment, accept/reject, and the open shift marketplace.
- Full attendance workflow including simulated GPS validation and simulated selfie capture/verification UI.
- Lone worker check-in flow with simulated missed-check-in alerting.
- Activity log submission and dispatcher review flow.
- Role-based dashboards for Guard, Dispatcher, Supervisor, Operations Manager, and Client.
- Guard, Client, and Site management screens (create/edit/list) backed by local/mock state.
- In-app notification center (simulated delivery, not real push/SMS/email).
- Responsive, role-appropriate UI: mobile-first for Guards, desktop-first for Dispatchers/Operations Managers.
- All five governing documents (PRD, Tech Architecture, Security & Access, Feature Backlog, Execution Tracker) as the foundation for production planning.

---

## 8. Future Scope

Explicitly deferred to post-MVP / production phases:

- Real backend services, persistent database, and real authentication/authorization (see TECH_ARCHITECTURE.md §9 and SECURITY_ACCESS.md).
- Real GPS capture via device hardware and true geofence enforcement (hard-blocking, not just flagging).
- Real selfie capture with secure storage, and evaluation of (optional, consent-gated) biometric matching as a stretch feature.
- Real push notifications, SMS, and email delivery.
- Native mobile apps (the prototype is a responsive web app, not iOS/Android native).
- Payroll and billing integration (timesheet export, invoicing).
- Client self-service contracting / e-signature for service agreements.
- Multi-tenant production infrastructure, company-level admin console, and white-labeling.
- Advanced analytics, predictive staffing, and AI-assisted scheduling suggestions.
- Integrations with third-party HR/payroll systems (ADP, Gusto, etc.) and access control hardware.

---

## 9. Out of Scope

Explicitly **not planned**, even long-term, unless future business needs change this:

- Equipment/asset management (radios, vehicles, uniforms) beyond what's needed to support scheduling.
- Guard licensing/certification compliance tracking as a full regulatory compliance suite (basic fields only; not a replacement for state licensing systems).
- Direct law-enforcement integration or incident escalation to 911/dispatch centers.
- Video surveillance / camera integration.
- A consumer-facing app for the general public (GuardOn is strictly B2B, for guard companies and their clients/staff).

---

## 10. Assumptions & Open Questions

- We assume the initial design partner operates a small-to-mid-size guard company (roughly 20–200 guards) staffing commercial and residential sites — typical of the Connecteam/Deputy/TrackTik customer base.
- We assume guards have personal smartphones capable of running a modern mobile browser (no company-issued hardware assumed for MVP).
- Open question: should the missed check-in escalation path notify supervisors, operations managers, or both by default? Current default (see FEATURE_BACKLOG.md) is both, configurable later.
- Open question: what is the minimum geofence radius that balances GPS accuracy (often ±10–30m on consumer phones) against false "out of geofence" flags? Flagged as a risk in EXECUTION_TRACKER.md.
