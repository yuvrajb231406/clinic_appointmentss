// Express REST API Server - MediDesk Premier
import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Utility helper for pagination & sorting
function paginateAndSort(items, { page = 1, limit = 10, sortBy = 'id', order = 'asc' }) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  // Sorting
  const sorted = [...items].sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return order === 'desc' ? 1 : -1;
    if (valA > valB) return order === 'desc' ? -1 : 1;
    return 0;
  });

  // Pagination
  const total = sorted.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = sorted.slice(startIndex, startIndex + limitNum);

  return {
    data: paginatedData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  };
}

// ----------------------------------------------------
// AUTHENTICATION REST ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role = 'Front Desk Agent' } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  const data = db.read();
  const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    name,
    role,
    passwordHash: password,
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  db.write(data);

  return res.status(201).json({
    message: 'User account created successfully.',
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    token: `token_${newUser.id}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const data = db.read();

  const user = data.users.find(u => u.email.toLowerCase() === email?.toLowerCase() && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({
    message: 'Login successful.',
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token: `token_${user.id}`
  });
});

app.get('/api/auth/me', (req, res) => {
  const data = db.read();
  const user = data.users[0];
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// ----------------------------------------------------
// DOCTORS ENDPOINTS
// ----------------------------------------------------
app.get('/api/doctors', (req, res) => {
  const data = db.read();
  res.json(data.doctors);
});

// ----------------------------------------------------
// PATIENTS REST ENDPOINTS (with Search, Pagination & Sorting)
// ----------------------------------------------------
app.get('/api/patients', (req, res) => {
  const { search, page, limit, sortBy = 'name', order = 'asc' } = req.query;
  const data = db.read();
  let list = data.patients;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.mrn.toLowerCase().includes(q) || 
      p.phone.includes(q)
    );
  }

  const result = paginateAndSort(list, { page, limit, sortBy, order });
  res.json(result);
});

app.post('/api/patients', (req, res) => {
  const { name, phone, email, dob, gender, bloodType } = req.body;
  if (!name) return res.status(400).json({ error: 'Patient name is required.' });

  const data = db.read();
  const newPatient = {
    id: `pat_${Date.now()}`,
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    name,
    phone: phone || '(555) 000-0000',
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    dob: dob || '1990-01-01',
    gender: gender || 'Unspecified',
    bloodType: bloodType || 'O+',
    outstandingFees: 0
  };

  data.patients.unshift(newPatient);
  db.write(data);
  res.status(201).json(newPatient);
});

// ----------------------------------------------------
// APPOINTMENTS REST ENDPOINTS (with Conflict Engine, Search & Pagination)
// ----------------------------------------------------
app.get('/api/appointments', (req, res) => {
  const { date, doctorId, status, search, page, limit, sortBy = 'date', order = 'desc' } = req.query;
  const data = db.read();
  let list = data.appointments;

  if (date) list = list.filter(a => a.date === date);
  if (doctorId && doctorId !== 'ALL') list = list.filter(a => a.doctorId === doctorId);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a => 
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.serviceType.toLowerCase().includes(q)
    );
  }

  const result = paginateAndSort(list, { page, limit, sortBy, order });
  res.json(result);
});

// POST /api/appointments (Runs strict backend conflict check)
app.post('/api/appointments', (req, res) => {
  const { patientId, doctorId, date, startTime, durationMinutes, serviceType, notes } = req.body;
  if (!patientId || !doctorId || !date || !startTime || !durationMinutes) {
    return res.status(400).json({ error: 'Missing required appointment fields.' });
  }

  const data = db.read();

  // Helper to convert time "09:30" -> minutes
  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const minToTime = (m) => {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const newStartMin = timeToMin(startTime);
  const newEndMin = newStartMin + Number(durationMinutes);
  const endTime = minToTime(newEndMin);

  // Backend Overlap Detection: (startA < endB && endA > startB)
  const conflict = data.appointments.find(a => {
    if (a.doctorId !== doctorId || a.date !== date) return false;
    if (a.status === 'canceled-free' || a.status === 'canceled-late') return false;

    const existStart = timeToMin(a.startTime);
    const existEnd = timeToMin(a.endTime);

    return newStartMin < existEnd && newEndMin > existStart;
  });

  if (conflict) {
    return res.status(409).json({
      error: 'Doctor Double-Booking Conflict!',
      message: `Doctor is already booked with ${conflict.patientName} from ${conflict.startTime} to ${conflict.endTime}.`,
      conflictingAppointment: conflict
    });
  }

  const patient = data.patients.find(p => p.id === patientId);
  const doctor = data.doctors.find(d => d.id === doctorId);

  const newAppointment = {
    id: `apt_${Date.now()}`,
    patientId,
    patientName: patient ? patient.name : 'Unknown Patient',
    patientPhone: patient ? patient.phone : '',
    doctorId,
    doctorName: doctor ? doctor.name : 'Unknown Doctor',
    date,
    startTime,
    endTime,
    durationMinutes: Number(durationMinutes),
    serviceType: serviceType || 'General Consultation',
    status: 'confirmed',
    notes: notes || ''
  };

  data.appointments.unshift(newAppointment);
  db.write(data);
  res.status(201).json(newAppointment);
});

// POST /api/appointments/:id/cancel (Evaluates late policy and applies fee)
app.post('/api/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { isWaived, waiveReason, notes } = req.body;

  const data = db.read();
  const aptIndex = data.appointments.findIndex(a => a.id === id);
  if (aptIndex === -1) return res.status(404).json({ error: 'Appointment not found.' });

  const apt = data.appointments[aptIndex];
  const settings = data.settings;

  // Evaluate notice window
  const aptDateTime = new Date(`${apt.date}T${apt.startTime}`);
  const cancelTime = new Date(settings.simulatedTime);
  const diffHours = Math.max(0, (aptDateTime - cancelTime) / (1000 * 60 * 60));

  const isLate = diffHours < settings.cancellationWindowHours;
  const feeAmount = isLate && !isWaived ? settings.standardLateFee : 0;
  const status = isLate ? (isWaived ? 'canceled-free' : 'canceled-late') : 'canceled-free';

  const updatedApt = {
    ...apt,
    status,
    cancellationDetails: {
      canceledAt: settings.simulatedTime,
      hoursNotice: Math.round(diffHours * 10) / 10,
      feeAmount,
      feeStatus: feeAmount > 0 ? 'unpaid' : (isWaived ? 'waived' : 'none'),
      waiveReason: isWaived ? waiveReason : null,
      notes: notes || ''
    }
  };

  data.appointments[aptIndex] = updatedApt;

  // Update patient fee balance
  if (feeAmount > 0) {
    const patIndex = data.patients.findIndex(p => p.id === apt.patientId);
    if (patIndex !== -1) {
      data.patients[patIndex].outstandingFees = (data.patients[patIndex].outstandingFees || 0) + feeAmount;
    }
  }

  db.write(data);
  res.json(updatedApt);
});

// PATCH /api/appointments/:id/status
app.patch('/api/appointments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const data = db.read();
  const apt = data.appointments.find(a => a.id === id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });

  apt.status = status;
  db.write(data);
  res.json(apt);
});

// POST & PATCH /api/appointments/:id/reschedule (Level 1 — T6: Reschedule appointment conflict-free)
const handleReschedule = (req, res) => {
  const { id } = req.params;
  const { date, startTime, durationMinutes, notes } = req.body;

  const data = db.read();
  const aptIndex = data.appointments.findIndex(a => a.id === id);
  if (aptIndex === -1) return res.status(404).json({ error: 'Appointment not found.' });

  const apt = data.appointments[aptIndex];
  const targetDate = date || apt.date;
  const targetStartTime = startTime || apt.startTime;
  const targetDuration = Number(durationMinutes || apt.durationMinutes || 30);

  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const minToTime = (m) => {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const newStartMin = timeToMin(targetStartTime);
  const newEndMin = newStartMin + targetDuration;
  const targetEndTime = minToTime(newEndMin);

  // Overlap Detection for same doctor on targetDate, excluding self (a.id !== id)
  const conflict = data.appointments.find(a => {
    if (a.id === id) return false;
    if (a.doctorId !== apt.doctorId || a.date !== targetDate) return false;
    if (a.status === 'canceled-free' || a.status === 'canceled-late') return false;

    const existStart = timeToMin(a.startTime);
    const existEnd = timeToMin(a.endTime);

    return newStartMin < existEnd && newEndMin > existStart;
  });

  if (conflict) {
    return res.status(409).json({
      error: 'Doctor Double-Booking Conflict on Reschedule!',
      message: `Doctor ${apt.doctorName} is already booked with ${conflict.patientName} from ${conflict.startTime} to ${conflict.endTime}.`,
      conflictingAppointment: conflict
    });
  }

  const updatedApt = {
    ...apt,
    date: targetDate,
    startTime: targetStartTime,
    endTime: targetEndTime,
    durationMinutes: targetDuration,
    status: 'confirmed',
    notes: notes !== undefined ? notes : apt.notes
  };

  data.appointments[aptIndex] = updatedApt;
  db.write(data);
  return res.json(updatedApt);
};

app.post('/api/appointments/:id/reschedule', handleReschedule);
app.patch('/api/appointments/:id/reschedule', handleReschedule);

// PATCH /api/appointments/:id/fee
app.patch('/api/appointments/:id/fee', (req, res) => {
  const { id } = req.params;
  const { feeStatus, waiveReason } = req.body;

  const data = db.read();
  const apt = data.appointments.find(a => a.id === id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });

  if (apt.cancellationDetails) {
    apt.cancellationDetails.feeStatus = feeStatus;
    if (waiveReason) apt.cancellationDetails.waiveReason = waiveReason;
  }

  if (feeStatus === 'paid') {
    const patient = data.patients.find(p => p.id === apt.patientId);
    if (patient) {
      patient.outstandingFees = Math.max(0, (patient.outstandingFees || 0) - (apt.cancellationDetails?.feeAmount || 35.00));
    }
  }

  db.write(data);
  res.json(apt);
});

// ----------------------------------------------------
// CLOCK ENGINE & OUTBOX NOTIFICATION SERVICE (Level 2 — T1 & Level 3 — T2)
// ----------------------------------------------------
const handleClockTick = (req, res) => {
  const { datetime, date, time } = req.body || {};
  const data = db.read();
  if (!data.outbox) data.outbox = [];

  let simTimeStr = datetime || (date && time ? `${date}T${time}` : null) || data.settings?.simulatedTime || new Date().toISOString();
  data.settings.simulatedTime = simTimeStr;

  let currentDate = simTimeStr.split('T')[0];
  let currentTime = (simTimeStr.split('T')[1] || '08:00').substring(0, 5);

  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const clockMin = timeToMin(currentTime);

  let remindersSent = 0;
  let noShowsMarked = 0;

  // Level 2 — T1: Send morning reminders to /outbox
  const todayAppointments = data.appointments.filter(a => 
    a.date === currentDate && 
    a.status !== 'canceled-free' && 
    a.status !== 'canceled-late'
  );

  for (const apt of todayAppointments) {
    const alreadySent = data.outbox.some(n => n.appointmentId === apt.id && n.date === currentDate);
    if (!alreadySent) {
      const notif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        appointmentId: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientPhone: apt.patientPhone,
        doctorId: apt.doctorId,
        doctorName: apt.doctorName,
        date: apt.date,
        startTime: apt.startTime,
        type: 'REMINDER',
        message: `Reminder: Patient ${apt.patientName} has an appointment today (${apt.date}) at ${apt.startTime} with ${apt.doctorName}.`,
        sentAt: simTimeStr
      };
      data.outbox.unshift(notif);
      remindersSent++;
    }
  }

  // Level 3 — T2: Auto-mark appointments as no-show 30 min after start if not completed/checked-in
  for (const apt of data.appointments) {
    if (apt.status === 'confirmed') {
      const aptStartMin = timeToMin(apt.startTime);
      const isPastCutoff = (apt.date < currentDate) || (apt.date === currentDate && clockMin >= aptStartMin + 30);
      if (isPastCutoff) {
        apt.status = 'no-show';
        noShowsMarked++;
      }
    }
  }

  db.write(data);

  return res.json({
    message: 'Clock processed successfully.',
    simulatedTime: simTimeStr,
    remindersSent,
    noShowsMarked,
    outbox: data.outbox
  });
};

const handleGetOutbox = (req, res) => {
  const data = db.read();
  return res.json(data.outbox || []);
};

const handleClearOutbox = (req, res) => {
  const data = db.read();
  data.outbox = [];
  db.write(data);
  return res.json({ message: 'Outbox cleared', count: 0 });
};

// Registered Clock and Outbox endpoints
app.post('/clock', handleClockTick);
app.post('/api/clock', handleClockTick);

app.get('/outbox', handleGetOutbox);
app.get('/api/outbox', handleGetOutbox);

app.delete('/outbox', handleClearOutbox);
app.delete('/api/outbox', handleClearOutbox);

// ----------------------------------------------------
// FINANCIAL LEDGER & SETTINGS ENDPOINTS
// ----------------------------------------------------
app.get('/api/ledger', (req, res) => {
  const data = db.read();
  const lateCancellations = data.appointments.filter(a => a.cancellationDetails || a.status === 'canceled-late');
  
  const totalAssessed = lateCancellations.reduce((s, a) => s + (a.cancellationDetails?.feeAmount || 0), 0);
  const totalPaid = lateCancellations.filter(a => a.cancellationDetails?.feeStatus === 'paid').reduce((s, a) => s + (a.cancellationDetails?.feeAmount || 0), 0);
  const totalPending = lateCancellations.filter(a => a.cancellationDetails?.feeStatus === 'unpaid').reduce((s, a) => s + (a.cancellationDetails?.feeAmount || 0), 0);

  res.json({
    records: lateCancellations,
    stats: { totalAssessed, totalPaid, totalPending }
  });
});

app.get('/api/settings', (req, res) => {
  const data = db.read();
  res.json(data.settings);
});

app.put('/api/settings', (req, res) => {
  const data = db.read();
  data.settings = { ...data.settings, ...req.body };
  db.write(data);
  res.json(data.settings);
});

app.listen(PORT, () => {
  console.log(`MediDesk REST API server running on http://localhost:${PORT}`);
});
