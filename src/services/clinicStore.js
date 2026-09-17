// Clinic Store Service - MediDesk Premier
// Centralized state management with localStorage persistence and robust conflict detection

const STORAGE_KEY = 'medidesk_clinic_data_v1';

// Initial Mock Data
const INITIAL_DOCTORS = [
  {
    id: 'doc_1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    room: 'Suite 301',
    color: '#3b82f6', // blue
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    email: 's.jenkins@medidesk.clinic',
    phone: '(555) 234-5678',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shiftStart: '08:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc_2',
    name: 'Dr. Marcus Vance',
    specialty: 'Pediatrics',
    room: 'Suite 104',
    color: '#10b981', // emerald
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'm.vance@medidesk.clinic',
    phone: '(555) 345-6789',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shiftStart: '08:30',
    shiftEnd: '16:30'
  },
  {
    id: 'doc_3',
    name: 'Dr. Elena Rostova',
    specialty: 'General Practice',
    room: 'Suite 202',
    color: '#8b5cf6', // purple
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a3961d0c?w=150&auto=format&fit=crop&q=80',
    email: 'e.rostova@medidesk.clinic',
    phone: '(555) 456-7890',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    shiftStart: '08:00',
    shiftEnd: '18:00'
  },
  {
    id: 'doc_4',
    name: 'Dr. Aris Thorne',
    specialty: 'Neurology',
    room: 'Suite 405',
    color: '#f59e0b', // amber
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    email: 'a.thorne@medidesk.clinic',
    phone: '(555) 567-8901',
    workingDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    shiftStart: '09:00',
    shiftEnd: '17:00'
  },
  {
    id: 'doc_5',
    name: 'Dr. Maya Lin',
    specialty: 'Dermatology',
    room: 'Suite 108',
    color: '#ec4899', // pink
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80',
    email: 'm.lin@medidesk.clinic',
    phone: '(555) 678-9012',
    workingDays: ['Tue', 'Wed', 'Thu', 'Fri'],
    shiftStart: '09:00',
    shiftEnd: '16:00'
  }
];

const INITIAL_PATIENTS = [
  {
    id: 'pat_1',
    mrn: 'MRN-90210',
    name: 'Eleanor Vance',
    phone: '(555) 912-3411',
    email: 'eleanor.vance@example.com',
    dob: '1985-04-12',
    gender: 'Female',
    bloodType: 'A+',
    outstandingFees: 35.00
  },
  {
    id: 'pat_2',
    mrn: 'MRN-84319',
    name: 'Liam Hemsworth',
    phone: '(555) 819-2049',
    email: 'liam.h@example.com',
    dob: '1992-08-25',
    gender: 'Male',
    bloodType: 'O+',
    outstandingFees: 0.00
  },
  {
    id: 'pat_3',
    mrn: 'MRN-75102',
    name: 'Sophia Martinez',
    phone: '(555) 743-9182',
    email: 'smartinez@example.com',
    dob: '1998-11-03',
    gender: 'Female',
    bloodType: 'B-',
    outstandingFees: 0.00
  },
  {
    id: 'pat_4',
    mrn: 'MRN-61928',
    name: 'Marcus Brody',
    phone: '(555) 628-1930',
    email: 'brody.m@example.com',
    dob: '1976-02-18',
    gender: 'Male',
    bloodType: 'AB+',
    outstandingFees: 0.00
  },
  {
    id: 'pat_5',
    mrn: 'MRN-55201',
    name: 'Hannah Abbott',
    phone: '(555) 554-3210',
    email: 'hannah.a@example.com',
    dob: '2001-09-30',
    gender: 'Female',
    bloodType: 'O-',
    outstandingFees: 0.00
  },
  {
    id: 'pat_6',
    mrn: 'MRN-44910',
    name: 'David Beckham',
    phone: '(555) 442-1829',
    email: 'david.b@example.com',
    dob: '1975-05-02',
    gender: 'Male',
    bloodType: 'A-',
    outstandingFees: 0.00
  }
];

// Helper to get today's date in YYYY-MM-DD
export function getTodayDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayStr = getTodayDateString(0);
const tomorrowStr = getTodayDateString(1);
const yesterdayStr = getTodayDateString(-1);

const INITIAL_APPOINTMENTS = [
  {
    id: 'apt_101',
    patientId: 'pat_1',
    patientName: 'Eleanor Vance',
    patientPhone: '(555) 912-3411',
    doctorId: 'doc_1',
    doctorName: 'Dr. Sarah Jenkins',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    serviceType: 'Cardiology Consultation',
    status: 'confirmed', // confirmed, checked-in, completed, canceled-free, canceled-late
    notes: 'Patient requested ECG baseline check.'
  },
  {
    id: 'apt_102',
    patientId: 'pat_2',
    patientName: 'Liam Hemsworth',
    patientPhone: '(555) 819-2049',
    doctorId: 'doc_1',
    doctorName: 'Dr. Sarah Jenkins',
    date: todayStr,
    startTime: '09:30',
    endTime: '10:15',
    durationMinutes: 45,
    serviceType: 'Echocardiogram Follow-up',
    status: 'checked-in',
    notes: 'Review ultrasound results.'
  },
  {
    id: 'apt_103',
    patientId: 'pat_3',
    patientName: 'Sophia Martinez',
    patientPhone: '(555) 743-9182',
    doctorId: 'doc_1',
    doctorName: 'Dr. Sarah Jenkins',
    date: todayStr,
    startTime: '11:00',
    endTime: '11:30',
    durationMinutes: 30,
    serviceType: 'Routine BP Check',
    status: 'confirmed',
    notes: ''
  },
  {
    id: 'apt_104',
    patientId: 'pat_4',
    patientName: 'Marcus Brody',
    patientPhone: '(555) 628-1930',
    doctorId: 'doc_2',
    doctorName: 'Dr. Marcus Vance',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    serviceType: 'Pediatric Growth Check',
    status: 'completed',
    notes: 'Vaccination chart updated.'
  },
  {
    id: 'apt_105',
    patientId: 'pat_5',
    patientName: 'Hannah Abbott',
    patientPhone: '(555) 554-3210',
    doctorId: 'doc_2',
    doctorName: 'Dr. Marcus Vance',
    date: todayStr,
    startTime: '10:00',
    endTime: '10:30',
    durationMinutes: 30,
    serviceType: 'General Wellness',
    status: 'confirmed',
    notes: ''
  },
  {
    id: 'apt_106',
    patientId: 'pat_6',
    patientName: 'David Beckham',
    patientPhone: '(555) 442-1829',
    doctorId: 'doc_3',
    doctorName: 'Dr. Elena Rostova',
    date: todayStr,
    startTime: '10:00',
    endTime: '10:45',
    durationMinutes: 45,
    serviceType: 'Annual Physical Exam',
    status: 'confirmed',
    notes: 'Requires blood lab work.'
  },
  // Late Canceled sample appointment for demonstration
  {
    id: 'apt_107',
    patientId: 'pat_1',
    patientName: 'Eleanor Vance',
    patientPhone: '(555) 912-3411',
    doctorId: 'doc_3',
    doctorName: 'Dr. Elena Rostova',
    date: yesterdayStr,
    startTime: '14:00',
    endTime: '14:30',
    durationMinutes: 30,
    serviceType: 'Lab Results Review',
    status: 'canceled-late',
    notes: 'Canceled 2 hours prior due to personal conflict.',
    cancellationDetails: {
      canceledAt: `${yesterdayStr}T12:00:00`,
      hoursNotice: 2,
      feeAmount: 35.00,
      feeStatus: 'unpaid', // unpaid, paid, waived
      waiveReason: null
    }
  },
  {
    id: 'apt_108',
    patientId: 'pat_2',
    patientName: 'Liam Hemsworth',
    patientPhone: '(555) 819-2049',
    doctorId: 'doc_4',
    doctorName: 'Dr. Aris Thorne',
    date: tomorrowStr,
    startTime: '10:00',
    endTime: '10:45',
    durationMinutes: 45,
    serviceType: 'Neurology Consultation',
    status: 'confirmed',
    notes: 'Migraine evaluation.'
  }
];

const INITIAL_SETTINGS = {
  clinicName: 'MediDesk Central Clinic',
  cancellationWindowHours: 24, // Standard 24h notice window
  standardLateFee: 35.00, // $35.00 fee
  workingStart: '08:00',
  workingEnd: '18:00',
  slotInterval: 15,
  simulatedTime: `${todayStr}T08:30` // Clinic clock simulator
};

// Utilities for time parsing
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

// Load data from LocalStorage or initialize
export function loadClinicData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load clinic data from storage:', err);
  }
  
  const initialData = {
    doctors: INITIAL_DOCTORS,
    patients: INITIAL_PATIENTS,
    appointments: INITIAL_APPOINTMENTS,
    settings: INITIAL_SETTINGS
  };
  saveClinicData(initialData);
  return initialData;
}

export function saveClinicData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save clinic data to storage:', err);
  }
}

export function resetToDefaultData() {
  const initialData = {
    doctors: INITIAL_DOCTORS,
    patients: INITIAL_PATIENTS,
    appointments: INITIAL_APPOINTMENTS,
    settings: {
      ...INITIAL_SETTINGS,
      simulatedTime: `${getTodayDateString(0)}T08:30`
    }
  };
  saveClinicData(initialData);
  return initialData;
}

// Core Algorithm: Check for Doctor Conflict
// Overlap condition: startA < endB && endA > startB
export function checkDoctorConflict(appointments, doctorId, date, startTime, endTime, excludeAppointmentId = null) {
  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  const activeAppointments = appointments.filter(apt => {
    if (apt.id === excludeAppointmentId) return false;
    if (apt.doctorId !== doctorId) return false;
    if (apt.date !== date) return false;
    // Canceled appointments do not block the schedule
    if (apt.status === 'canceled-free' || apt.status === 'canceled-late') return false;
    return true;
  });

  for (const existing of activeAppointments) {
    const existStartMin = timeToMinutes(existing.startTime);
    const existEndMin = timeToMinutes(existing.endTime);

    if (newStartMin < existEndMin && newEndMin > existStartMin) {
      return {
        hasConflict: true,
        conflictingAppointment: existing,
        reason: `Overlap detected with ${existing.patientName} (${formatTime12h(existing.startTime)} - ${formatTime12h(existing.endTime)})`
      };
    }
  }

  return { hasConflict: false, conflictingAppointment: null, reason: null };
}

// Algorithm: Find nearest suggested available slots
export function getAvailableSlots(appointments, doctorId, date, durationMinutes = 30, workingStart = '08:00', workingEnd = '18:00') {
  const slots = [];
  const startMin = timeToMinutes(workingStart);
  const endMin = timeToMinutes(workingEnd);

  for (let current = startMin; current + durationMinutes <= endMin; current += 15) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + durationMinutes);
    const conflictResult = checkDoctorConflict(appointments, doctorId, date, slotStart, slotEnd);

    if (!conflictResult.hasConflict) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        display: `${formatTime12h(slotStart)} - ${formatTime12h(slotEnd)}`
      });
    }
  }

  return slots;
}

// Cancellation Rule Evaluation Engine
export function evaluateCancellation(appointment, simulatedTimeISO, cancellationWindowHours = 24, standardLateFee = 35.00) {
  const aptDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
  const cancelTime = new Date(simulatedTimeISO);

  const diffMs = aptDateTime - cancelTime;
  const hoursNotice = Math.max(0, diffMs / (1000 * 60 * 60));

  const isLate = hoursNotice < cancellationWindowHours;
  const fee = isLate ? standardLateFee : 0;

  return {
    isLate,
    hoursNotice: Math.round(hoursNotice * 10) / 10,
    feeAmount: fee,
    policyWindow: cancellationWindowHours,
    message: isLate
      ? `Notice is ${Math.round(hoursNotice * 10) / 10} hours (< ${cancellationWindowHours}h policy). Late cancellation fee of $${fee.toFixed(2)} applies.`
      : `Notice is ${Math.round(hoursNotice * 10) / 10} hours (>= ${cancellationWindowHours}h policy). Cancellation is free of charge.`
  };
}
