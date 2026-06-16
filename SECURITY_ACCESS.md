# GuardOn — Security & Access Model

**Document Owner:** Security Architect
**Status:** Approved for MVP Development
**Version:** 1.0
**Last Updated:** 2026-06-17
**Related Documents:** PRD.md, TECH_ARCHITECTURE.md, FEATURE_BACKLOG.md, EXECUTION_TRACKER.md

> **Scope note:** The current build phase is a prototype using local/mock state and no real backend, real GPS hardware capture, or real selfie storage. This document specifies the access model as it applies *now* (simulated, low-risk) and the model the architecture is designed to grow into for production (where real location and biometric-adjacent data is genuinely sensitive). Both are documented together so the prototype is never accidentally treated as "secure enough to hold real data" before production controls exist.

---

## 1. User Roles

| Role | Description |
|---|---|
| **Guard** | Field staff. Can view and act on their own assigned shifts and submissions only. |
| **Dispatcher** | Builds schedules, manages the open shift marketplace, monitors attendance, reviews activity logs and lone-worker alerts across the sites they're responsible for. |
| **Supervisor** | Field oversight for an assigned subset of sites/guards. Read access plus limited write (reassign, acknowledge alerts) scoped to their assignment. |
| **Operations Manager** | Company-wide visibility and management of guards, clients, sites, and reporting. Highest internal role in the MVP. |
| **Client Contact** | External user representing a paying client. Scoped strictly to their own site(s); read-mostly. |
| **System Administrator** | Manages roles, company configuration, and (future) integrations. In the MVP, a thin superset of Operations Manager; kept as a distinct role now so production can separate "runs the business" from "configures the system" later. |

---

## 2. Permission Matrix

Legend: **F** = Full (create/read/update/delete within scope), **R** = Read only, **S** = Scoped to self/assigned, **–** = No access.

| Capability | Guard | Dispatcher | Supervisor | Ops Manager | Client Contact | Sys Admin |
|---|---|---|---|---|---|---|
| View own shifts | S | – | – | – | – | – |
| View/build full schedule | – | F | R (assigned sites) | F | R (own site) | F |
| Assign/reassign shifts | – | F | S (assigned sites) | F | – | F |
| Accept/reject own shift | S | – | – | – | – | – |
| Claim open shift | S (eligible) | – | – | – | – | – |
| Clock in/out | S | – | – | – | – | – |
| View live attendance | – | F | R (assigned sites) | F | R (own site, confirmed-only) | F |
| Lone worker check-in | S | – | – | – | – | – |
| View/respond to lone-worker alerts | – | F | F (assigned sites) | F | – | F |
| Submit activity log | S | – | – | – | – | – |
| Review activity logs | – | F | F (assigned sites) | F | R (filtered, own site) | F |
| Manage guard roster | – | R | R | F | – | F |
| Manage client/site roster | – | R | R | F | – | F |
| View dashboards/reports | S (own) | F (operational) | R (assigned sites) | F (company-wide) | R (own site) | F |
| Manage roles/permissions | – | – | – | R (view only) | – | F |
| Manage system configuration | – | – | – | – | – | F |

"Scoped" entries (S) mean the system must enforce row-level scoping (a Guard's queries are implicitly filtered to `guardId = currentUser.id`; a Client Contact's queries are filtered to their assigned `siteId(s)`), not just hide UI elements. UI-level hiding is a usability convenience, not a security control — actual enforcement happens at the data-access layer.

---

## 3. Authentication Strategy

**Prototype (current phase):**
- Authentication is simulated via `useSessionStore`: a role-selection/login screen sets a mock "current user" in client-side state from seeded fixture users. No real credentials, password storage, or identity verification occurs.
- This is acceptable *only* because no real personal, location, or biometric data is collected or persisted in this phase (see §9).

**Production (required before real data is handled):**
- Real authentication via a managed identity provider (e.g., NextAuth, Clerk, or Auth0) or a custom service backed by salted/hashed credentials (e.g., bcrypt/argon2) — passwords are **never** to be stored in plaintext or reversible encryption.
- Multi-factor authentication should be available, and required by default for Operations Manager and System Administrator roles given their broad access scope.
- Account lockout / backoff after repeated failed login attempts.
- Client Contacts authenticate the same way as internal users; external-user accounts get the same credential hygiene requirements, not a lighter standard.

---

## 4. Authorization Strategy

- **Role-Based Access Control (RBAC)** as the baseline model, using the roles in §1 and the matrix in §2.
- Authorization checks happen in two places, and both are required in production (the second does not exist yet in the prototype and is flagged as such):
  1. **UI-level gating** (`RoleGate` component, route-group guards) — improves UX by not showing actions a user can't perform. Implemented in the prototype.
  2. **Data-access-level enforcement** — every query/mutation is scoped server-side to what the authenticated user is allowed to see/touch (e.g., a Guard's shift query is always filtered by their own ID server-side, never trusted from a client-supplied parameter). **Not implemented in the prototype** (there is no server to enforce it against) — this is a hard requirement before any real backend goes live, and is tracked as a foundational production ticket, not an enhancement.
- **Site-scoped authorization** for Supervisors and Client Contacts is modeled as an explicit assignment relationship (`supervisorAssignments`, `clientSiteAccess`), not inferred from naming conventions or convention-based queries.
- Future consideration: move from pure RBAC toward attribute-based rules where useful (e.g., a Supervisor's access to a site can change dynamically based on active assignment dates) — noted as a future scope item, not required for MVP.

---

## 5. Security Principles

1. **Least privilege by default.** New roles/features default to the narrowest access; broadening access is an explicit decision, not an oversight.
2. **Defense in depth.** UI gating, data-access scoping, and (in production) infrastructure-level controls are layered; no single control is treated as sufficient on its own.
3. **Data minimization.** Collect only what each workflow actually needs (e.g., GPS precision sufficient for geofence validation, not continuous background tracking; see §9).
4. **Secure by default.** New fields, especially location/biometric-adjacent ones, default to the most restrictive visibility until explicitly opened up.
5. **Auditability.** Sensitive actions are logged with who/what/when, not just what changed (see §10).
6. **No silent trust of client input.** All inputs — including role/identity claims — are treated as untrusted until verified server-side in production; the prototype's client-only "trust" model is explicitly called out as non-production-safe (§3).

---

## 6. Session Handling

**Prototype:** Session is an in-memory Zustand store (`useSessionStore`), reset on full page reload by design — there is no persistent session token because there is no real identity to protect yet.

**Production requirements:**
- Session tokens (e.g., short-lived JWT access token + longer-lived refresh token, or provider-managed session) stored in **httpOnly, secure, SameSite cookies** — never in `localStorage`/`sessionStorage`, to reduce XSS-based token theft risk.
- Reasonable session timeout for desktop dispatcher/admin sessions; shorter idle timeout recommended for shared-device scenarios (e.g., a guard using a shared site tablet to clock in).
- Ability to revoke sessions (e.g., on role change, account deactivation, or suspected compromise).
- Re-authentication required for high-sensitivity actions (e.g., changing another user's role) even within an active session — a step-up auth pattern, not a hard requirement for MVP but recommended for the Operations Manager/System Administrator roles in production.

---

## 7. Rate Limiting Requirements

Not applicable to the prototype (no real network endpoints). Required from the first production backend release:

- Authentication endpoints (login, password reset): aggressive per-IP and per-account rate limiting to resist credential stuffing/brute force.
- Clock-in/clock-out and check-in endpoints: rate-limited per guard account to prevent automated/spam check-ins (a guard should not be able to fire dozens of check-ins per minute).
- Selfie/photo upload endpoints: rate- and size-limited to prevent storage abuse and denial-of-service via large/repeated uploads.
- General API rate limiting (per authenticated user and per IP) as a baseline defensive measure against scripting/scraping.
- Rate limit violations should be logged for security monitoring, not just silently rejected.

---

## 8. Input Validation Rules

- All form input is validated with a schema library (Zod, matching the stack) on the client for UX, and **must be re-validated server-side in production** — client-side validation is never trusted as the sole control.
- Free-text fields (activity logs, shift notes) are length-limited and sanitized to prevent injection when eventually rendered or stored (defense against stored XSS once there's a real persistence/rendering pipeline).
- GPS coordinates are validated to be within plausible numeric ranges (latitude −90..90, longitude −180..180) and, where applicable, checked for impossible jumps (e.g., a clock-out location implausibly far from clock-in within a short time) as a soft fraud signal for dispatcher review, not an automatic block.
- Selfie/photo uploads (production) are validated for file type (image formats only), size limits, and dimension sanity before storage; rejected uploads return a clear error rather than failing silently.
- Numeric/date fields (shift times, geofence radius) are range- and type-validated to prevent malformed schedule data (e.g., a shift ending before it starts).

---

## 9. OWASP Considerations

Mapped against the OWASP Top 10, as a design checklist for production hardening (the prototype is exempt from most of these by virtue of having no real backend, but the design must not preclude them):

| OWASP Category | GuardOn Consideration |
|---|---|
| **Broken Access Control** | The single highest-priority item given GuardOn's role/site-scoped data model (§4). Every endpoint must enforce server-side scoping; this is the most likely real-world vulnerability class for a multi-role workforce app. |
| **Cryptographic Failures** | GPS history and selfie images are sensitive; production must encrypt at rest and in transit (TLS everywhere, encrypted storage for media). |
| **Injection** | Standard parameterized queries/ORM usage in production; activity log free text is the most likely injection-adjacent surface to harden. |
| **Insecure Design** | Addressed by this document existing before implementation — role model, data scoping, and retention rules are designed up front rather than retrofitted. |
| **Security Misconfiguration** | Production deployment must avoid default credentials, verbose error messages leaking stack traces, and overly permissive CORS; mock-layer "always succeed" behavior must never ship to production. |
| **Vulnerable & Outdated Components** | Standard dependency-scanning practice recommended once a real backend/dependency tree exists. |
| **Identification & Authentication Failures** | Covered in §3 — no plaintext/reversible password storage, MFA for high-privilege roles, lockout policies. |
| **Software & Data Integrity Failures** | Relevant once attendance/GPS data is used for client billing disputes — production should consider tamper-evidence (e.g., append-only audit log, §10) for attendance records given their evidentiary value. |
| **Security Logging & Monitoring Failures** | Covered in §10 — sensitive actions (location/selfie access, role changes, data exports) must be logged, and logs must be monitored, not just collected. |
| **Server-Side Request Forgery** | Low relevance until third-party integrations (payroll, mapping APIs) are added in future scope; flagged for re-review at that point. |

---

## 10. GPS & Selfie Data Handling

This is the most sensitive data category GuardOn touches, because location and selfie-at-work-location data, even though collected for a legitimate workplace-attendance purpose, is personal data (and in some jurisdictions, selfie/biometric-adjacent data carries additional legal obligations, e.g., Illinois' BIPA and similar state biometric privacy laws, as well as general data protection regimes like GDPR/CCPA depending on where guards and clients are located). The following principles govern both the prototype's design intent and production requirements:

**Purpose limitation**
- GPS is captured **only** to validate attendance proximity (clock-in/out, lone-worker check-ins) — never for continuous background tracking of a guard's location outside these discrete events.
- Selfies are captured **only** to support dispatcher verification that the right person clocked in at the right time/place — the MVP performs presence verification by human review, not automated facial recognition matching. Any future move toward automated biometric matching is flagged as requiring its own legal/consent review and is explicitly **not** assumed or designed for in this phase (see PRD.md §8).

**Consent & disclosure**
- Production rollout requires guards to be clearly informed (e.g., at onboarding, with explicit acknowledgment) of what location and photo data is collected, when, and why, before the feature is used — this is both an ethical baseline and, in many jurisdictions, a legal requirement for workplace biometric/location monitoring.
- Client Contacts should never see a guard's selfie images directly; their visibility is limited to coverage status (e.g., "confirmed," "in progress") per §2's permission matrix, not the underlying verification artifact.

**Data minimization**
- Store only the GPS point and timestamp needed for each discrete event (clock-in, clock-out, check-in) — not a continuous location trail.
- Selfie images are captured at defined moments only, never as continuous/ambient capture.

**Access control**
- Access to raw GPS coordinates and selfie images is restricted to Dispatcher, Supervisor (for their assigned sites), and Operations Manager roles — and every access should be auditable (§10/§11). Guards can see their own submitted data; Client Contacts cannot see raw location/selfie data at all.

**Retention**
- Production should define an explicit retention window for selfie images and granular GPS points (e.g., a fixed number of days/months sufficient for dispute resolution and compliance, after which raw images/points are deleted while higher-level attendance records — e.g., "clocked in at 08:02, confirmed" — are retained for payroll/billing history). The exact window is a business/legal decision to be finalized before production launch, not assumed by this document.

**Encryption**
- In production: TLS in transit for all GPS/selfie data; encryption at rest for stored selfie images and location records.

**Prototype-specific note**
- Because the prototype uses simulated GPS and simulated/placeholder selfie capture (no real camera roll or live camera upload of real users is persisted anywhere outside the local browser session), none of the retention/encryption-at-rest requirements above are technically active yet — but the UI and data model are deliberately built *as if* they were, so the transition to production doesn't require redesigning these flows.

---

## 11. Audit Trail Requirements

Production must maintain an audit trail — separate from regular application data — covering at minimum:

- **Attendance events:** clock-in, clock-out, missed check-in, and any dispatcher override of a flagged GPS/attendance anomaly (who overrode, when, and why).
- **Schedule changes:** shift creation, assignment, reassignment, accept/reject, and open-shift claims, with actor and timestamp.
- **Access to sensitive data:** any time a user views another user's raw GPS coordinates or selfie image, that access itself should be logged (access-to-sensitive-data logging, not just data-change logging).
- **Permission/role changes:** any change to a user's role or site assignment, including who made the change.
- **Activity log review actions:** who reviewed/approved a guard's activity log entry and when.

Audit log entries should be **append-only** (not editable or deletable through normal application flows) given their evidentiary role in client billing disputes and potential compliance inquiries. The prototype does not yet implement a real audit log (there's no persistent backend to write one to), but the Mock Service Layer's action-logging pattern (see TECH_ARCHITECTURE.md §9) is structured so that adding real audit persistence later is additive, not a redesign.
