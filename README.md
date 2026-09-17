# 🏥 MediDesk Premier — Clinic Front Desk & Conflict-Free Scheduler

**MediDesk Premier** is a full-stack clinic front desk management application designed to eliminate doctor double-booking, enforce fair 24-hour late cancellation fee policies, render visual doctor day timelines, and provide instant patient lookups.

---

## 🌟 Key Features

1. **0% Double-Booking Conflict Engine**: Enforces strict interval intersection checking (`startA < endB && endA > startB`) for every doctor on a given date. Overlapping time slots trigger real-time conflict alert banners, block submission, and suggest open slots.
2. **Dynamic 24h Late Cancellation Fee Evaluator**: Evaluates notice given. Cancellations within <24 hours carry a $35 fee automatically billed to the patient account, with front-desk audit-compliant fee waiver logging.
3. **Doctor's Day Schedule Timeline**: Side-by-side multi-column timeline grid for doctors with 15-minute slot precision.
4. **Instant Patient Search & History**: Global debounced search across patient name, MRN (Medical Record Number), phone, and email with complete visit & billing history.
5. **Pagination & Sorting**: Server/client pagination controls (`Page X of Y`, limit per page) and clickable column headers (Date, Patient, Doctor, Status) on all major table views.
6. **1-Page Product Landing Page**: High-converting marketing landing page featuring product specifications, target audience, business value, and the top 3 features to build next.
7. **User Registration & Login**: Staff authentication with role-based access badges (`Front Desk Lead`, `Clinic Manager`, `Doctor`).
8. **Level 1 — T6 (Reschedule Lifecycle)**: Reschedule existing appointments to a new date/time slot while re-evaluating conflict-free interval overlap, maintaining patient & doctor assignment.
9. **Level 2 — T1 (Morning Notification Service & /outbox)**: Automated morning notification dispatcher sending appointment reminders to `/outbox` upon `POST /clock` progression.
10. **Level 3 — T2 (Automated 30-Min No-Show Job)**: Automated background job triggered via `POST /clock` that auto-marks appointments as `no-show` if not completed/checked-in 30 minutes after scheduled start time.

---

## 📡 REST API Documentation

The Node/Express REST API server runs on port `3001` (`http://localhost:3001/api`).

| HTTP Method | Endpoint Route | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{ email, password }` | Authenticates staff credentials and returns session token. |
| `POST` | `/api/auth/register` | `{ email, password, name, role }` | Registers a new clinic staff / desk agent account. |
| `GET` | `/api/auth/me` | — | Returns current authenticated user session details. |
| `GET` | `/api/doctors` | — | Returns full list of clinic doctors with working hours & rooms. |
| `GET` | `/api/patients` | `search`, `page`, `limit`, `sortBy`, `order` | Returns paginated & sorted patient records matching search. |
| `POST` | `/api/patients` | `{ name, phone, email, dob, gender, bloodType }` | Registers a new patient record with generated MRN. |
| `GET` | `/api/appointments` | `date`, `doctorId`, `status`, `search`, `page`, `limit`, `sortBy`, `order` | Returns paginated & sorted appointments filtered by date or doctor. |
| `POST` | `/api/appointments` | `{ patientId, doctorId, date, startTime, durationMinutes, serviceType }` | Creates appointment after running backend double-booking conflict check. |
| `POST` | `/api/appointments/:id/reschedule` | `{ date, startTime, durationMinutes }` | **Level 1 (T6)**: Reschedules appointment keeping same patient/doctor, ensuring conflict-free slot. |
| `POST` | `/api/appointments/:id/cancel` | `{ isWaived, waiveReason, notes }` | Processes cancellation, evaluates 24h window, and applies $35 fee or waiver. |
| `PATCH` | `/api/appointments/:id/status` | `{ status }` | Updates appointment status (`checked-in`, `completed`, `no-show`). |
| `PATCH` | `/api/appointments/:id/fee` | `{ feeStatus, waiveReason }` | Updates cancellation fee status (`paid`, `waived`). |
| `POST` | `/clock` (or `/api/clock`) | `{ datetime }` | **Level 2 (T1) & Level 3 (T2)**: Advances clock, dispatches morning reminders to `/outbox`, & auto-marks >30m no-shows. |
| `GET` | `/outbox` (or `/api/outbox`) | — | **Level 2 (T1)**: Returns dispatched patient notification outbox array. |
| `GET` | `/api/ledger` | — | Returns financial summary of cancellation fees assessed, paid, and pending. |
| `GET` | `/api/settings` | — | Fetches clinic settings (notice cutoff hours, default fee amount). |
| `PUT` | `/api/settings` | `{ cancellationWindowHours, standardLateFee, workingStart, workingEnd }` | Updates clinic policy settings. |

---

## 🗄️ Database Schemas (SQLite / Persistence Layer)

### 1. `users` Table
```json
{
  "id": "usr_desk1",
  "email": "desk@medidesk.clinic",
  "name": "Sarah Connor",
  "role": "Front Desk Lead",
  "passwordHash": "desk123",
  "createdAt": "2026-01-01T08:00:00Z"
}
```

### 2. `doctors` Table
```json
{
  "id": "doc_1",
  "name": "Dr. Sarah Jenkins",
  "specialty": "Cardiology",
  "room": "Suite 301",
  "color": "#3b82f6",
  "avatar": "https://...",
  "email": "s.jenkins@medidesk.clinic",
  "phone": "(555) 234-5678",
  "shiftStart": "08:00",
  "shiftEnd": "17:00"
}
```

### 3. `patients` Table
```json
{
  "id": "pat_1",
  "mrn": "MRN-90210",
  "name": "Eleanor Vance",
  "phone": "(555) 912-3411",
  "email": "eleanor.vance@example.com",
  "dob": "1985-04-12",
  "gender": "Female",
  "bloodType": "A+",
  "outstandingFees": 35.00
}
```

### 4. `appointments` Table
```json
{
  "id": "apt_101",
  "patientId": "pat_1",
  "patientName": "Eleanor Vance",
  "doctorId": "doc_1",
  "doctorName": "Dr. Sarah Jenkins",
  "date": "2026-09-17",
  "startTime": "09:00",
  "endTime": "09:30",
  "durationMinutes": 30,
  "serviceType": "Cardiology Consultation",
  "status": "confirmed",
  "notes": "ECG baseline check.",
  "cancellationDetails": {
    "canceledAt": "2026-09-16T12:00:00",
    "hoursNotice": 2,
    "feeAmount": 35.00,
    "feeStatus": "unpaid",
    "waiveReason": null
  }
}
```

---

## 🚀 Top Three Features to Build Next

1. 📱 **Automated SMS & WhatsApp Patient Reminders**: Sends automated 24-hour reminder text messages with 1-click "CONFIRM" or "RESCHEDULE" buttons that instantly update the clinic schedule status.
2. 📹 **Multi-Location & Telehealth Integration**: Seamless virtual consultation room link generation alongside multi-branch physical clinic room allocation.
3. 🤖 **AI-Powered No-Show & Predictive Attendance Analytics**: Machine learning models analyzing historical patient attendance to score no-show probability and dynamically suggest waitlist backfills.

---

## 🛠️ How to Run the Application

### 1. Start Express REST API Backend
```bash
node server/index.js
```
*Runs on `http://localhost:3001`*

### 2. Start Frontend Dev Server
```bash
npm run dev
```
*Runs on `http://localhost:5173`*

### 3. Production Build
```bash
npm run build
```
