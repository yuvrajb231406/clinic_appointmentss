# 🧠 Architectural & Business Logic Reasoning — MediDesk Premier

This document outlines the technical reasoning, architectural decisions, mathematical models, and design trade-offs made while building **MediDesk Premier**.

---

## 1. Problem Statement & Core Objectives

Clinic front desks frequently face three major operational bottlenecks:
1. **Accidental Double-Booking**: Overlapping appointments scheduled for the same doctor due to manual calendar entries or multi-agent booking.
2. **Revenue Loss from Short-Notice No-Shows**: Lack of automated enforcement for cancellation policies leads to uncompensated empty clinic slots.
3. **Desk Friction & Slow Lookups**: Outdated EHR/EPR systems requiring multi-click navigation just to check patient history or doctor room availability.

**MediDesk Premier** addresses these issues with a zero-friction, conflict-free scheduling engine and an intuitive front-desk command center.

---

## 2. Technical Stack & Architectural Rationale

### ⚛️ Frontend: React 19 + Vite + Custom CSS
- **React 19 & Vite**: Chosen for lightning-fast build speeds, instant HMR (Hot Module Replacement), and minimal overhead. React 19's optimized rendering keeps the 15-minute resolution timeline grid smooth.
- **Vanilla CSS with HSL Tokens**: Avoided heavy component frameworks (like Material UI or Bootstrap) to maintain full control over styling. Built a glassmorphic design system using CSS variables, custom scrollbars, and dynamic HSL colors for doctor avatars.
- **Lucide Icons**: Lightweight SVG icons for consistent visual cues across status tags, patient records, and navigation tabs.

### ⚡ Backend: Node.js + Express 5 + Atomic File Persistence
- **Express 5**: Handles REST API requests with improved async error handling and low latency.
- **Atomic JSON Store (`database.json`)**: Simple, zero-dependency persistence layer designed for zero configuration setup. Implements atomic writes to guarantee data safety during state mutations.

---

## 3. Key Algorithmic Implementations

### 🛡️ 1. Conflict-Free Double-Booking Prevention Algorithm

#### Mathematical Model
Two time intervals $[S_A, E_A)$ and $[S_B, E_B)$ overlap if and only if:
$$\text{Overlap} = (S_A < E_B) \land (E_A > S_B)$$

```javascript
function checkConflict(newAppt, existingAppts) {
  const newStart = parseTimeToMinutes(newAppt.startTime);
  const newEnd = newStart + newAppt.durationMinutes;

  return existingAppts.some(existing => {
    if (existing.doctorId !== newAppt.doctorId) return false;
    if (existing.date !== newAppt.date) return false;
    if (existing.status === 'canceled') return false;

    const existStart = parseTimeToMinutes(existing.startTime);
    const existEnd = parseTimeToMinutes(existing.endTime);

    return (newStart < existEnd && newEnd > existStart);
  });
}
```

#### Dual-Layer Validation Strategy
1. **Client-side Proactive Alerting**: As the receptionist selects a doctor, date, time, and duration, the interface evaluates conflicts in real-time. If a conflict exists, submission is blocked and alternative open slots are suggested.
2. **Server-side Concurrency Lock**: The Express endpoint re-evaluates the interval check before writing to disk, preventing race conditions when two desk agents submit simultaneously.

---

### 🔄 2. Level 1 — T6: Reschedule Lifecycle Algorithm
- **Constraint Enforcement**: Rescheduling preserves patient identity (`patientId`) and doctor assignment (`doctorId`).
- **Conflict Exclusion**: The interval intersection re-evaluator excludes the target appointment ID (`a.id !== currentId`) during verification to prevent self-conflict while blocking overlap with other appointments.
- **REST Endpoints**: `POST /api/appointments/:id/reschedule` and `PATCH /api/appointments/:id/reschedule`.

---

### 📬 3. Level 2 — T1: Morning Notification Dispatcher & `/outbox`
- **Automated Morning Reminders**: Upon advancing the clinic clock via `POST /clock` (or `/api/clock`), the scheduler scans today's active appointments and dispatches reminder objects to the `/outbox` queue.
- **Idempotency Guarantee**: Notifications track `appointmentId` and `date` to prevent duplicate reminder dispatches.
- **REST Endpoints**: `POST /clock` (triggers morning batch) and `GET /outbox` (returns JSON outbox array).

---

### ⏰ 4. Level 3 — T2: Automated 30-Minute No-Show Marking Job
- **Automation Logic**: Triggered dynamically during clock evaluation (`POST /clock`). Any appointment with status `confirmed` whose scheduled start time is $\ge 30$ minutes in the past relative to current clock time is automatically updated to `status = 'no-show'`.
- **Status Integrity**: Preserves completed, checked-in, or canceled appointments while automatically identifying absent patients.

---

### ⏱️ 2. Dynamic 24-Hour Late Cancellation Fee Evaluator

#### Notice Period Calculation
Notice given is computed by comparing the appointment date/time against the current timestamp at the moment of cancellation:
$$\text{Notice Hours} = \frac{T_{\text{appointment}} - T_{\text{cancellation}}}{3,600,000\text{ ms}}$$

#### Fee Rules & Waiver Governance
- **$\ge 24$ Hours Notice**: $\$0.00$ fee assessed. Status marked as `canceled`.
- **$< 24$ Hours Notice**: Automatic $\$35.00$ late fee charged to the patient's outstanding balance account.
- **Front-Desk Fee Waiver Audit**: Front-desk staff or managers can waive late fees by toggling `isWaived = true` and logging a mandatory audit reason (e.g., *Medical emergency*, *Staff scheduling error*).

---

### 📅 3. Multi-Column Doctor Timeline View

#### Design Rationale
Traditional calendar views force receptionists to switch between daily, weekly, and doctor views. 
- **Side-by-Side Doctor Columns**: Displays all active doctors in parallel columns for the selected date.
- **15-Minute Grid Scale**: Time slots are rendered from 08:00 to 17:00 at 15-minute granularity, providing visual alignment of doctor schedules and instant identification of open gaps.

---

## 4. Data Modeling & MRN Generation Strategy

- **Patient MRN (Medical Record Number)**: Auto-generated using a deterministic `MRN-XXXXX` format to ensure unique indexing across clinic databases.
- **Normalized Relationships**:
  - `Appointments` contain references to `patientId` and `doctorId` while embedding snapshot fields (`patientName`, `doctorName`) for high-performance tabular rendering without excessive joins.
  - `FeeLedger` dynamically aggregates fees by querying non-waived cancellation records.

---

## 5. Security & Front-Desk UX Decisions

1. **Role-Based Access Control (RBAC)**:
   - `Front Desk Lead`: Full booking, checking-in, and patient editing access.
   - `Clinic Manager`: Admin-level fee waiver approvals, clinic policy settings configuration.
   - `Doctor`: Read-only view of patient queues and assigned daily timelines.
2. **Debounced Search**: Patient searches across MRN, Name, Phone, and Email execute with a 300ms debounce to prevent API thrashing while delivering instant results.
3. **Glassmorphic Responsive Theme**: High contrast dark theme with vibrant color-coded status badges (`Confirmed`, `Checked-In`, `Completed`, `Canceled`) reduces eye strain during 8-hour front-desk shifts.

---

## 6. Future Expansion Roadmap

1. **Automated SMS/WhatsApp Confirmations**: Integrate Twilio API to send 24-hour reminder texts with 1-click confirmation links.
2. **Telehealth & Multi-Branch Support**: Add room location tags (`Suite 301`, `Virtual Video Room`) to dynamically generate video call URLs.
3. **AI Predictive Attendance Engine**: Machine learning model trained on patient attendance history to score no-show risk and recommend waitlist backfills.
