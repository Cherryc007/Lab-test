# GuardOn — Feature Backlog

**Document Owner:** Product Management / Technical Lead
**Status:** Approved for MVP Development
**Version:** 1.0
**Last Updated:** 2026-06-17
**Related Documents:** PRD.md, TECH_ARCHITECTURE.md, SECURITY_ACCESS.md, EXECUTION_TRACKER.md

> Priority scale: **P0** (blocks the core demo), **P1** (required for a complete MVP), **P2** (valuable but can slip past the first demo). Status values: `Not Started`, `In Progress`, `Blocked`, `Done`. All tickets below begin at `Not Started` as of this document's creation — see EXECUTION_TRACKER.md for live status.

---

## Module: Scheduling

### FEATURE-001 — Shift Creation
**Description:** Allow a Dispatcher to create a new shift against a client site, specifying date/time, role requirement, and notes.
**User Story:** As a Dispatcher, I want to create a shift for a specific site and time so that I can build out coverage for my clients.
**Acceptance Criteria:**
- Dispatcher can select a client site, start time, end time, and optional notes.
- Shift is created in `Draft` or `Unassigned` status by default.
- Validation prevents end time before start time.
- New shift appears immediately on the scheduling calendar.
**Dependencies:** Client/Site data must exist (FEATURE-019).
**Priority:** P0
**Status:** Not Started

### FEATURE-002 — Shift Assignment to Guard
**Description:** Allow a Dispatcher to assign an unassigned shift to a specific eligible guard.
**User Story:** As a Dispatcher, I want to assign a shift to a specific guard so that coverage is planned in advance.
**Acceptance Criteria:**
- Dispatcher can select an eligible guard for a given shift (eligibility per FEATURE-015).
- Assigning a shift moves it to `Assigned` status and notifies the guard (FEATURE-033).
- Double-booking the same guard at overlapping times is visually flagged before confirming.
**Dependencies:** FEATURE-001, FEATURE-013, FEATURE-015.
**Priority:** P0
**Status:** Not Started

### FEATURE-003 — Guard Accept/Reject Shift
**Description:** Allow a Guard to accept or reject a shift that has been assigned to them.
**User Story:** As a Guard, I want to accept or reject an assigned shift so that I only work shifts I can actually cover.
**Acceptance Criteria:**
- Guard sees pending assigned shifts clearly marked as needing a response.
- Accepting moves the shift to `Confirmed`.
- Rejecting moves the shift to `Open` and triggers FEATURE-004.
- Dispatcher is notified of the accept/reject outcome.
**Dependencies:** FEATURE-002.
**Priority:** P0
**Status:** Not Started

### FEATURE-004 — Open Shift Marketplace (Auto-Publish)
**Description:** Automatically publish a rejected (or originally unassigned) shift into the open shift marketplace pool.
**User Story:** As a Dispatcher, I want rejected shifts to automatically become open shifts so that I don't have to manually re-route every rejection.
**Acceptance Criteria:**
- A rejected shift's status changes to `Open` with no manual dispatcher action required.
- Open shifts are visible to all guards eligible for that site/role.
- Dispatcher dashboard reflects the current open shift count in real time (within the prototype's local-state model).
**Dependencies:** FEATURE-003.
**Priority:** P0
**Status:** Not Started

### FEATURE-005 — Claim Open Shift
**Description:** Allow an eligible Guard to claim an open shift from the marketplace in a single low-friction action.
**User Story:** As a Guard, I want to claim an available open shift quickly so that I can pick up extra work without a multi-step process.
**Acceptance Criteria:**
- Marketplace list/filter view shows open shifts the guard is eligible for (by site/role).
- Claiming a shift is a single confirm action; once claimed, shift status becomes `Confirmed` and it's removed from the marketplace for other guards.
- If two guards attempt to claim simultaneously (simulated race in the prototype), the first claim wins and the second sees a clear "already claimed" state.
**Dependencies:** FEATURE-004.
**Priority:** P0
**Status:** Not Started

### FEATURE-006 — Dispatcher Calendar View
**Description:** A week/day calendar view (FullCalendar) showing all shifts across guards and sites, with visual conflict flagging.
**User Story:** As a Dispatcher, I want to see all shifts on a calendar so that I can plan coverage and spot scheduling conflicts at a glance.
**Acceptance Criteria:**
- Calendar supports day and week views at minimum.
- Shifts are color-coded by status (Unassigned, Assigned, Confirmed, Open, Active, Completed).
- Overlapping shifts for the same guard are visually flagged.
- Clicking a shift opens its detail/edit view.
**Dependencies:** FEATURE-001, FEATURE-002.
**Priority:** P1
**Status:** Not Started

---

## Module: Attendance

### FEATURE-007 — GPS Validation at Clock-In/Out
**Description:** Capture (simulated) GPS coordinates at clock-in and clock-out and validate proximity to the site's configured geofence.
**User Story:** As a Guard, I want my location checked when I clock in so that my attendance is verifiable for the client and my employer.
**Acceptance Criteria:**
- Clock-in/out flow captures a (simulated) coordinate and compares it to the site's geofence center + radius.
- Within-geofence attempts proceed normally; out-of-geofence attempts are flagged but not hard-blocked, with a clear explanation shown to the guard (per PRD.md §4.4).
- Flagged events are visible to the Dispatcher in the attendance monitor (FEATURE-011).
**Dependencies:** FEATURE-020 (site geofence must be configured).
**Priority:** P0
**Status:** Not Started

### FEATURE-008 — Selfie Capture at Clock-In
**Description:** Require a selfie capture step as part of the clock-in flow, for dispatcher presence verification.
**User Story:** As a Guard, I want to confirm my identity with a selfie at clock-in so that my attendance is trustworthy without extra paperwork.
**Acceptance Criteria:**
- Clock-in flow includes a camera/selfie step before completion (simulated capture acceptable for the prototype, per SECURITY_ACCESS.md §10).
- Captured selfie is associated with that specific clock-in event only.
- Selfie is visible only to Dispatcher/Supervisor/Ops Manager roles per the permission matrix (SECURITY_ACCESS.md §2), never to Client Contacts.
**Dependencies:** None beyond the Attendance module shell.
**Priority:** P0
**Status:** Not Started

### FEATURE-009 — Clock In Action
**Description:** The complete clock-in action chaining shift validation, GPS validation, and selfie capture, resulting in an `Active` shift.
**User Story:** As a Guard, I want a single guided clock-in flow so that starting my shift is fast and unambiguous.
**Acceptance Criteria:**
- Clock-in is only available for a shift in `Confirmed` status within the allowed time window of its scheduled start.
- Flow proceeds: GPS check → selfie capture → confirmation → shift status becomes `Active`.
- Attempting to clock in outside the allowed window shows a clear explanation rather than a silent failure.
**Dependencies:** FEATURE-003, FEATURE-007, FEATURE-008.
**Priority:** P0
**Status:** Not Started

### FEATURE-010 — Clock Out Action
**Description:** Allow a Guard to end an active shift, capturing GPS at clock-out and finalizing the attendance record.
**User Story:** As a Guard, I want to clock out at the end of my shift so that my attendance record is complete and accurate.
**Acceptance Criteria:**
- Clock-out only available for shifts in `Active` status.
- GPS captured at clock-out (FEATURE-007 logic reused).
- Shift status becomes `Completed`; attendance summary (scheduled vs. actual time) is generated.
- Early clock-out (before scheduled end time, beyond a small grace period) is flagged for dispatcher visibility.
**Dependencies:** FEATURE-009.
**Priority:** P0
**Status:** Not Started

### FEATURE-011 — Live Attendance Monitor (Dispatcher)
**Description:** A dispatcher-facing view showing real-time (within prototype constraints) attendance status across all active shifts.
**User Story:** As a Dispatcher, I want to see who's currently on site right now so that I can react quickly to no-shows or issues.
**Acceptance Criteria:**
- View lists all shifts scheduled for the current day with current status (Upcoming, Active, Completed, Flagged).
- Flagged attendance events (late clock-in, out-of-geofence, early clock-out) are visually distinguished and filterable.
- Clicking an entry shows attendance detail including captured GPS/selfie metadata (subject to role visibility per SECURITY_ACCESS.md §2).
**Dependencies:** FEATURE-009, FEATURE-010, FEATURE-012.
**Priority:** P1
**Status:** Not Started

### FEATURE-012 — Late / Missed Clock-In Flagging
**Description:** Automatically flag shifts where the guard has not clocked in within an allowed grace period after the scheduled start time.
**User Story:** As a Dispatcher, I want to be automatically alerted when a guard hasn't clocked in on time so that I can react before the client notices a coverage gap.
**Acceptance Criteria:**
- A configurable grace period (default value defined in seed config) determines when a `Confirmed` shift becomes `Late — Not Clocked In`.
- Flag is visible on the calendar (FEATURE-006), attendance monitor (FEATURE-011), and dispatcher dashboard (FEATURE-036).
- Flag clears automatically once the guard clocks in (still noting it was late).
**Dependencies:** FEATURE-009.
**Priority:** P1
**Status:** Not Started

---

## Module: Guards

### FEATURE-013 — Guard Roster List
**Description:** A list view of all guards with key status info, searchable/filterable.
**User Story:** As an Operations Manager, I want to see all guards in one place so that I can manage staffing across the company.
**Acceptance Criteria:**
- List shows name, status (active/inactive/on leave), eligible site count, and upcoming shift count.
- Searchable by name; filterable by status.
- Row click opens guard profile (FEATURE-014).
**Dependencies:** None.
**Priority:** P1
**Status:** Not Started

### FEATURE-014 — Guard Profile Create/Edit
**Description:** Create and edit a guard's profile, including basic info and licensing/certification fields.
**User Story:** As an Operations Manager, I want to maintain accurate guard profiles so that scheduling and compliance information stays current.
**Acceptance Criteria:**
- Form supports name, contact info, license/certification fields (basic fields only, per PRD.md §9 — not a full compliance suite), and status.
- Validation prevents saving incomplete required fields.
- Edits are reflected immediately in the roster list and anywhere the guard's name/status is displayed.
**Dependencies:** FEATURE-013.
**Priority:** P1
**Status:** Not Started

### FEATURE-015 — Guard Eligibility & Site Assignment
**Description:** Define which client sites a guard is eligible to work, used to filter shift assignment and marketplace visibility.
**User Story:** As an Operations Manager, I want to define which sites a guard can work so that scheduling and the open shift marketplace only ever show valid options.
**Acceptance Criteria:**
- A guard profile includes a list of eligible site associations.
- Shift assignment (FEATURE-002) and marketplace claiming (FEATURE-005) both respect this eligibility list.
- Removing a site eligibility does not retroactively affect already-confirmed shifts.
**Dependencies:** FEATURE-014, FEATURE-019.
**Priority:** P1
**Status:** Not Started

### FEATURE-016 — Guard Availability
**Description:** Allow a guard to indicate general availability (days/times willing to work), used as a soft signal for scheduling.
**User Story:** As a Guard, I want to set my general availability so that dispatchers don't assign me shifts I can't work.
**Acceptance Criteria:**
- Guard can set recurring weekly availability blocks.
- Dispatcher sees availability as a visual hint (not a hard block) when assigning shifts.
**Dependencies:** FEATURE-014.
**Priority:** P2
**Status:** Not Started

### FEATURE-017 — Guard Status Management
**Description:** Allow Operations Managers to set a guard's status to active, inactive, or on leave, affecting scheduling eligibility.
**User Story:** As an Operations Manager, I want to mark a guard inactive or on leave so that they stop appearing as schedulable without deleting their record.
**Acceptance Criteria:**
- Status field with the three defined values, editable from the guard profile.
- Inactive/on-leave guards are excluded from assignment (FEATURE-002) and marketplace claiming (FEATURE-005) eligibility checks.
- Status change does not affect already-confirmed future shifts automatically; dispatcher is shown a warning to manually reassign if needed.
**Dependencies:** FEATURE-014.
**Priority:** P1
**Status:** Not Started

---

## Module: Clients

### FEATURE-018 — Client Roster
**Description:** A list view of all client companies with basic info and site count.
**User Story:** As an Operations Manager, I want to see all clients in one place so that I can manage the business relationship and site coverage together.
**Acceptance Criteria:**
- List shows client name, number of active sites, and primary contact.
- Row click opens client detail with its sites.
**Dependencies:** None.
**Priority:** P1
**Status:** Not Started

### FEATURE-019 — Client Site Management
**Description:** Create and edit individual sites under a client, including address and coverage requirements.
**User Story:** As an Operations Manager, I want to manage a client's individual sites so that scheduling can target the right location.
**Acceptance Criteria:**
- Site form includes name, address, and basic coverage notes.
- A client can have multiple sites.
- Site selection is required when creating a shift (FEATURE-001).
**Dependencies:** FEATURE-018.
**Priority:** P0
**Status:** Not Started

### FEATURE-020 — Geofence Configuration
**Description:** Define a geofence (center coordinate + radius) per site, used for GPS validation at clock-in/out.
**User Story:** As an Operations Manager, I want to configure each site's geofence so that attendance validation is accurate for that location.
**Acceptance Criteria:**
- Site form includes a geofence editor (center point, radius).
- Saved geofence is used by FEATURE-007's GPS validation logic.
- Reasonable default radius is pre-filled to reduce setup friction, per the open question in PRD.md §10.
**Dependencies:** FEATURE-019.
**Priority:** P0
**Status:** Not Started

### FEATURE-021 — Client Site Contact Management
**Description:** Assign one or more named contacts to a client/site who will have Client Contact role access.
**User Story:** As an Operations Manager, I want to designate which client-side people can log in so that the right people see coverage visibility.
**Acceptance Criteria:**
- A site can have one or more associated contacts.
- Contacts are scoped to see only their associated site(s), per SECURITY_ACCESS.md §2.
**Dependencies:** FEATURE-019.
**Priority:** P1
**Status:** Not Started

### FEATURE-022 — Client Coverage View
**Description:** A client-facing view showing scheduled vs. confirmed coverage at their site(s).
**User Story:** As a Client Contact, I want to see whether my contracted coverage is actually happening so that I have confidence in the service I'm paying for.
**Acceptance Criteria:**
- View shows today's (and optionally upcoming) shifts for the client's site(s) with status (Scheduled, Confirmed, Active, Completed, Flagged-generic — without exposing internal guard-identifying detail beyond what's appropriate).
- No access to raw GPS coordinates or selfie images, per SECURITY_ACCESS.md §10.
**Dependencies:** FEATURE-021, FEATURE-009, FEATURE-010.
**Priority:** P1
**Status:** Not Started

---

## Module: Activity Logs

### FEATURE-023 — Activity Log Submission
**Description:** Allow a Guard to submit a free-text activity log entry during an active shift.
**User Story:** As a Guard, I want to log notable events during my shift so that there's a record of what happened.
**Acceptance Criteria:**
- Available only during an `Active` shift.
- Free-text entry with a reasonable character limit and basic input sanitization (per SECURITY_ACCESS.md §8).
- Entry is timestamped and associated with the shift/site automatically.
**Dependencies:** FEATURE-009.
**Priority:** P0
**Status:** Not Started

### FEATURE-024 — Activity Log Categorization
**Description:** Allow a guard to optionally tag a log entry as Incident, Observation, or Routine.
**User Story:** As a Guard, I want to categorize my log entry so that dispatchers can prioritize review.
**Acceptance Criteria:**
- Category selector with the three defined values; defaults to Routine if unselected.
- Category is visible and filterable in the dispatcher review queue (FEATURE-025).
**Dependencies:** FEATURE-023.
**Priority:** P1
**Status:** Not Started

### FEATURE-025 — Dispatcher Activity Log Review Queue
**Description:** A queue view for Dispatchers/Supervisors to review submitted activity logs and mark them reviewed.
**User Story:** As a Dispatcher, I want to review incoming activity logs so that nothing falls through the cracks, especially incidents.
**Acceptance Criteria:**
- Queue lists unreviewed logs first, filterable by category and site.
- Marking a log "Reviewed" moves it into the per-site operational history.
- Incident-category logs are visually prioritized at the top regardless of submission time.
**Dependencies:** FEATURE-023, FEATURE-024.
**Priority:** P1
**Status:** Not Started

### FEATURE-026 — Client Activity Log Summary View
**Description:** A filtered view of reviewed activity logs relevant to a client's site, appropriate for external visibility.
**User Story:** As a Client Contact, I want to see a relevant summary of activity at my site so that I stay informed without seeing internal-only operational detail.
**Acceptance Criteria:**
- Only `Reviewed` logs are visible to Client Contacts (unreviewed logs stay internal).
- View is scoped to the contact's own site(s) only.
**Dependencies:** FEATURE-025, FEATURE-021.
**Priority:** P2
**Status:** Not Started

---

## Module: Lone Worker

### FEATURE-027 — Lone Worker Shift Designation
**Description:** Allow a shift to be flagged as a "lone worker" shift, enabling periodic check-in requirements.
**User Story:** As a Dispatcher, I want to mark certain shifts as lone-worker shifts so that those guards get extra safety check-ins.
**Acceptance Criteria:**
- Shift creation/edit includes a lone-worker toggle.
- Toggling it on requires/exposes a check-in interval setting (FEATURE-028).
**Dependencies:** FEATURE-001.
**Priority:** P1
**Status:** Not Started

### FEATURE-028 — Periodic Check-In Prompt
**Description:** Prompt a guard on an active lone-worker shift to check in at a configured interval.
**User Story:** As a Guard working alone, I want to be reminded to check in periodically so that someone knows I'm okay.
**Acceptance Criteria:**
- While a lone-worker shift is `Active`, the guard's app surfaces a check-in prompt at the configured interval.
- Prompt is dismissible only by completing the check-in (FEATURE-029), not by simple dismissal.
**Dependencies:** FEATURE-027, FEATURE-009.
**Priority:** P0
**Status:** Not Started

### FEATURE-029 — Check-In Selfie/Status Submission
**Description:** The actual check-in action: optional selfie and/or short status update.
**User Story:** As a Guard, I want to quickly confirm I'm okay during a check-in so that the process doesn't interrupt my work for long.
**Acceptance Criteria:**
- Check-in flow supports a quick "I'm okay" confirmation, optionally with a selfie and short status note.
- Completing a check-in resets the timer for the next prompt (FEATURE-028).
- Completed check-ins are visible in the shift's timeline for dispatcher review.
**Dependencies:** FEATURE-028.
**Priority:** P0
**Status:** Not Started

### FEATURE-030 — Missed Check-In Detection
**Description:** Detect when a guard has not completed a check-in within a grace period after the prompt, and raise an alert.
**User Story:** As a Dispatcher, I want to be alerted automatically if a lone worker misses a check-in so that I can respond quickly to a possible safety issue.
**Acceptance Criteria:**
- A configurable grace period after a missed prompt triggers an alert.
- Alert severity increases the longer the check-in remains missed (e.g., visually escalating after a second missed interval).
- Detection logic runs client-side for the prototype (per TECH_ARCHITECTURE.md §10's noted future requirement for server-side scheduling in production).
**Dependencies:** FEATURE-028.
**Priority:** P0
**Status:** Not Started

### FEATURE-031 — Escalation View for Dispatcher/Supervisor
**Description:** A dedicated view listing all current missed-check-in alerts, sorted by severity/overdue time.
**User Story:** As a Dispatcher, I want a single place to see every overdue lone-worker check-in so that I can prioritize my response.
**Acceptance Criteria:**
- View lists active alerts sorted by how overdue they are.
- Dispatcher/Supervisor can acknowledge an alert (logged with who/when, per SECURITY_ACCESS.md §11) and optionally trigger a follow-up action (e.g., contact guard).
- Acknowledged alerts are removed from the active list but retained in history.
**Dependencies:** FEATURE-030.
**Priority:** P0
**Status:** Not Started

---

## Module: Notifications

### FEATURE-032 — In-App Notification Center
**Description:** A persistent notification feed/bell icon accessible from any page, showing recent relevant notifications.
**User Story:** As any user, I want a single place to see my recent notifications so that I don't miss important updates.
**Acceptance Criteria:**
- Notification bell shows unread count.
- Feed lists notifications newest-first, with read/unread state.
- Notifications are scoped to the current user's role/relevant events only.
**Dependencies:** None (shell can be built independently; content depends on other modules raising events).
**Priority:** P1
**Status:** Not Started

### FEATURE-033 — Shift Assignment / Change Notifications
**Description:** Raise a notification when a guard is assigned a shift, or when a shift they're involved in changes status.
**User Story:** As a Guard, I want to be notified when I'm assigned a new shift so that I don't have to keep checking the app.
**Acceptance Criteria:**
- Notification raised on assignment, accept/reject, and open-shift claim outcomes.
- Notification includes enough context (site, date/time) to act without navigating first.
**Dependencies:** FEATURE-002, FEATURE-003, FEATURE-005, FEATURE-032.
**Priority:** P1
**Status:** Not Started

### FEATURE-034 — Lone Worker Alert Notifications
**Description:** Raise a high-priority notification to Dispatcher/Supervisor when a missed check-in alert is created.
**User Story:** As a Dispatcher, I want an immediate notification when a lone worker misses a check-in so that I notice it even if I'm not actively viewing the escalation list.
**Acceptance Criteria:**
- Notification is visually distinct (highest priority styling) from routine notifications.
- Notification links directly to the escalation view (FEATURE-031).
**Dependencies:** FEATURE-030, FEATURE-032.
**Priority:** P0
**Status:** Not Started

### FEATURE-035 — Activity Log Review Status Notifications
**Description:** Notify a guard when their submitted activity log has been reviewed.
**User Story:** As a Guard, I want to know my activity log was reviewed so that I have confirmation it was seen.
**Acceptance Criteria:**
- Notification raised when a log moves from unreviewed to reviewed.
- Incident-category logs (FEATURE-024) trigger the notification immediately on review; routine logs may batch (lower priority).
**Dependencies:** FEATURE-025, FEATURE-032.
**Priority:** P2
**Status:** Not Started

---

## Module: Dashboard

### FEATURE-036 — Dispatcher Dashboard
**Description:** A dispatcher-facing home view summarizing today's schedule, open shifts, live attendance, and active alerts.
**User Story:** As a Dispatcher, I want a single home screen that shows me everything I need to act on today so that I don't have to hunt across multiple pages.
**Acceptance Criteria:**
- Surfaces today's shift count, open shift count, late/flagged attendance, and active lone-worker alerts.
- Each widget links through to its full view (calendar, marketplace, attendance monitor, escalation list).
**Dependencies:** FEATURE-006, FEATURE-004, FEATURE-011, FEATURE-031.
**Priority:** P1
**Status:** Not Started

### FEATURE-037 — Operations Manager Dashboard
**Description:** A company-wide dashboard summarizing staffing health, fill rates, and client coverage across all sites.
**User Story:** As an Operations Manager, I want company-wide visibility so that I can spot systemic issues, not just today's individual problems.
**Acceptance Criteria:**
- Surfaces shift fill rate, on-time clock-in rate, and active alert count across the whole company (metrics defined in PRD.md §6.2).
- Supports filtering by client or date range at a basic level.
**Dependencies:** FEATURE-036.
**Priority:** P1
**Status:** Not Started

### FEATURE-038 — Supervisor Dashboard
**Description:** A scoped dashboard for Supervisors showing only their assigned sites' schedule, attendance, and alerts.
**User Story:** As a Supervisor, I want a dashboard scoped to just my sites so that I'm not overwhelmed by company-wide noise.
**Acceptance Criteria:**
- Same widget types as the Dispatcher dashboard, filtered to the supervisor's assigned sites only.
**Dependencies:** FEATURE-036.
**Priority:** P2
**Status:** Not Started

### FEATURE-039 — Guard Dashboard / Home
**Description:** A guard-facing home screen showing their next shift, pending shift responses, and recent notifications.
**User Story:** As a Guard, I want to open the app and immediately see what I need to know or do next.
**Acceptance Criteria:**
- Surfaces next upcoming shift, any pending accept/reject actions, and a shortcut to the open shift marketplace.
- Mobile-first layout per PRD.md §5.
**Dependencies:** FEATURE-003, FEATURE-005, FEATURE-032.
**Priority:** P0
**Status:** Not Started

### FEATURE-040 — Client Dashboard
**Description:** A client-facing home view summarizing current coverage status at their site(s).
**User Story:** As a Client Contact, I want to immediately see whether my site is currently covered so that I have quick reassurance without digging.
**Acceptance Criteria:**
- Surfaces current coverage status (e.g., "Guard on site since 08:02") for each of the contact's sites.
- Links through to the fuller coverage view (FEATURE-022).
**Dependencies:** FEATURE-022.
**Priority:** P1
**Status:** Not Started

---

## Summary

| Module | Ticket Count | P0 | P1 | P2 |
|---|---|---|---|---|
| Scheduling | 6 | 5 | 1 | 0 |
| Attendance | 6 | 4 | 2 | 0 |
| Guards | 5 | 0 | 4 | 1 |
| Clients | 5 | 2 | 3 | 0 |
| Activity Logs | 4 | 1 | 2 | 1 |
| Lone Worker | 5 | 4 | 1 | 0 |
| Notifications | 4 | 1 | 2 | 1 |
| Dashboard | 5 | 1 | 3 | 1 |
| **Total** | **40** | **18** | **18** | **4** |

P0 tickets represent the minimum set required for a guided demo to function end-to-end across the four core workflows in the PRD (Scheduling, Attendance, Lone Worker, Activity Log). Sequencing of this backlog into sprints is maintained in EXECUTION_TRACKER.md.
