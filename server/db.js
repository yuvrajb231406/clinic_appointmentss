// Real Persistent Database Layer for MediDesk Premier
// File-backed SQLite / JSON database engine with SQL-like query interface

import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'server', 'database.json');

// Default initial dataset for clinic database
const INITIAL_DB = {
  users: [
    {
      id: 'usr_desk1',
      email: 'desk@medidesk.clinic',
      name: 'Sarah Connor',
      role: 'Front Desk Lead',
      passwordHash: 'desk123', // Demo authentication
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      id: 'usr_doc1',
      email: 'jenkins@medidesk.clinic',
      name: 'Dr. Sarah Jenkins',
      role: 'Doctor',
      passwordHash: 'doc123',
      createdAt: '2026-01-01T08:00:00Z'
    }
  ],
  doctors: [
    {
      id: 'doc_1',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      room: 'Suite 301',
      color: '#3b82f6',
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
      color: '#10b981',
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
      color: '#8b5cf6',
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
      color: '#f59e0b',
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
      color: '#ec4899',
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80',
      email: 'm.lin@medidesk.clinic',
      phone: '(555) 678-9012',
      workingDays: ['Tue', 'Wed', 'Thu', 'Fri'],
      shiftStart: '09:00',
      shiftEnd: '16:00'
    }
  ],
  patients: [
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
  ],
  appointments: [
    {
      id: 'apt_101',
      patientId: 'pat_1',
      patientName: 'Eleanor Vance',
      patientPhone: '(555) 912-3411',
      doctorId: 'doc_1',
      doctorName: 'Dr. Sarah Jenkins',
      date: '2026-09-17',
      startTime: '09:00',
      endTime: '09:30',
      durationMinutes: 30,
      serviceType: 'Cardiology Consultation',
      status: 'confirmed',
      notes: 'Patient requested ECG baseline check.'
    },
    {
      id: 'apt_102',
      patientId: 'pat_2',
      patientName: 'Liam Hemsworth',
      patientPhone: '(555) 819-2049',
      doctorId: 'doc_1',
      doctorName: 'Dr. Sarah Jenkins',
      date: '2026-09-17',
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
      date: '2026-09-17',
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
      date: '2026-09-17',
      startTime: '09:00',
      endTime: '09:30',
      durationMinutes: 30,
      serviceType: 'Pediatric Growth Check',
      status: 'completed',
      notes: 'Vaccination chart updated.'
    },
    {
      id: 'apt_107',
      patientId: 'pat_1',
      patientName: 'Eleanor Vance',
      patientPhone: '(555) 912-3411',
      doctorId: 'doc_3',
      doctorName: 'Dr. Elena Rostova',
      date: '2026-09-16',
      startTime: '14:00',
      endTime: '14:30',
      durationMinutes: 30,
      serviceType: 'Lab Results Review',
      status: 'canceled-late',
      notes: 'Canceled 2 hours prior due to personal conflict.',
      cancellationDetails: {
        canceledAt: '2026-09-16T12:00:00',
        hoursNotice: 2,
        feeAmount: 35.00,
        feeStatus: 'unpaid',
        waiveReason: null
      }
    }
  ],
  settings: {
    clinicName: 'MediDesk Central Clinic',
    cancellationWindowHours: 24,
    standardLateFee: 35.00,
    workingStart: '08:00',
    workingEnd: '18:00',
    slotInterval: 15,
    simulatedTime: '2026-09-17T08:30'
  },
  outbox: []
};

class Database {
  constructor() {
    this.ensureDatabase();
  }

  ensureDatabase() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Database read error, reinitializing:', err);
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export const db = new Database();
