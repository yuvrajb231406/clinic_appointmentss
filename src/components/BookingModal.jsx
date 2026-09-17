import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Stethoscope, 
  Calendar as CalendarIcon, 
  Plus, 
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { 
  checkDoctorConflict, 
  getAvailableSlots, 
  timeToMinutes, 
  minutesToTime, 
  formatTime12h,
  getTodayDateString 
} from '../services/clinicStore';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  doctors, 
  patients, 
  appointments, 
  initialData = {}, 
  onSaveAppointment,
  onAddNewPatient
}) {
  if (!isOpen) return null;

  const [patientId, setPatientId] = useState(initialData.patientId || (patients[0] ? patients[0].id : ''));
  const [doctorId, setDoctorId] = useState(initialData.doctorId || (doctors[0] ? doctors[0].id : ''));
  const [date, setDate] = useState(initialData.date || getTodayDateString(0));
  const [startTime, setStartTime] = useState(initialData.startTime || '09:00');
  const [durationMinutes, setDurationMinutes] = useState(initialData.durationMinutes || 30);
  const [serviceType, setServiceType] = useState(initialData.serviceType || 'General Consultation');
  const [notes, setNotes] = useState(initialData.notes || '');

  // Quick New Patient state inside modal if patient doesn't exist
  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');

  // Calculate End Time automatically
  const startMin = timeToMinutes(startTime);
  const endTime = minutesToTime(startMin + Number(durationMinutes));

  // Run Conflict Prevention Engine
  const conflictResult = checkDoctorConflict(
    appointments, 
    doctorId, 
    date, 
    startTime, 
    endTime, 
    initialData.id || null
  );

  // Find Available Slots for Suggestion Box
  const suggestedSlots = conflictResult.hasConflict
    ? getAvailableSlots(appointments, doctorId, date, Number(durationMinutes))
    : [];

  const handleQuickAddPatient = (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;
    const createdPatient = onAddNewPatient({
      name: newPatientName.trim(),
      phone: newPatientPhone.trim() || '(555) 000-0000',
      email: newPatientEmail.trim() || `${newPatientName.toLowerCase().replace(/\s+/g, '.')}@example.com`
    });
    if (createdPatient) {
      setPatientId(createdPatient.id);
      setIsAddingNewPatient(false);
      setNewPatientName('');
      setNewPatientPhone('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (conflictResult.hasConflict) return; // Strict prevention!

    const selectedPatient = patients.find(p => p.id === patientId);
    const selectedDoctor = doctors.find(d => d.id === doctorId);

    onSaveAppointment({
      id: initialData.id || `apt_${Date.now()}`,
      patientId,
      patientName: selectedPatient ? selectedPatient.name : 'Unknown Patient',
      patientPhone: selectedPatient ? selectedPatient.phone : '',
      doctorId,
      doctorName: selectedDoctor ? selectedDoctor.name : 'Unknown Doctor',
      date,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes),
      serviceType,
      status: initialData.status || 'confirmed',
      notes
    });

    onClose();
  };

  const selectedDocObj = doctors.find(d => d.id === doctorId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {initialData.id ? 'Reschedule Appointment' : 'Book New Appointment'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {initialData.id ? 'Reschedule to a new time window (Keeps same patient & doctor conflict-free)' : 'Guaranteed Conflict-Free Front Desk Scheduling'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Patient Selection Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> PATIENT {initialData.id ? '(Locked on Reschedule)' : ''}
              </label>
              {!initialData.id && (
                <button 
                  type="button"
                  onClick={() => setIsAddingNewPatient(!isAddingNewPatient)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <Plus size={12} /> {isAddingNewPatient ? 'Select Existing Patient' : 'Register New Patient'}
                </button>
              )}
            </div>

            {!isAddingNewPatient ? (
              <select
                value={patientId}
                disabled={Boolean(initialData.id)}
                onChange={(e) => setPatientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  opacity: initialData.id ? 0.7 : 1
                }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) — {p.phone} {p.outstandingFees > 0 ? `[⚠️ Fee Pending: $${p.outstandingFees.toFixed(2)}]` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Quick Register Patient</div>
                <input 
                  type="text"
                  placeholder="Full Name *"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input 
                    type="text"
                    placeholder="Phone Number"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <input 
                    type="email"
                    placeholder="Email Address"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="button" onClick={handleQuickAddPatient} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Save & Select Patient
                </button>
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Stethoscope size={14} /> ASSIGNED DOCTOR {initialData.id ? '(Locked on Reschedule)' : ''}
            </label>
            <select
              value={doctorId}
              disabled={Boolean(initialData.id)}
              onChange={(e) => setDoctorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                opacity: initialData.id ? 0.7 : 1
              }}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty} ({d.room})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Start Time & Duration Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                DATE
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                START TIME
              </label>
              <input 
                type="time"
                value={startTime}
                step="900" // 15 min steps
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                DURATION
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>

          {/* Computed Slot Preview Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>
              Scheduled Window: <strong style={{ color: '#fff' }}>{formatTime12h(startTime)} — {formatTime12h(endTime)}</strong>
            </div>
            <span className="badge badge-confirmed">
              {durationMinutes} Min Consultation
            </span>
          </div>

          {/* CONFLICT PREVENTION ENGINE DISPLAY */}
          {conflictResult.hasConflict ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>
                <ShieldAlert size={20} />
                <span>BOOKING CONFLICT DETECTED!</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                {conflictResult.reason}
              </p>
              
              {/* Suggested Alternative Conflict-Free Slots */}
              {suggestedSlots.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    SUGGESTED NEXT AVAILABLE SLOTS FOR DR. {selectedDocObj?.name.split(' ')[1].toUpperCase()}:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {suggestedSlots.slice(0, 4).map(slot => (
                      <button
                        type="button"
                        key={slot.startTime}
                        onClick={() => setStartTime(slot.startTime)}
                        className="btn btn-sm btn-secondary"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--primary)', color: 'var(--primary)', fontSize: '0.75rem' }}
                      >
                        <Sparkles size={12} /> {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              <span>Time Slot Verified Conflict-Free! Dr. {selectedDocObj?.name.split(' ')[1]} is 100% available.</span>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              SERVICE / REASON FOR VISIT
            </label>
            <input 
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Cardiology Checkup, Follow-up, Routine Exam"
              style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              CLINICAL & FRONT DESK NOTES
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add patient preferences, special accommodations, or instructions..."
              rows={2}
              style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          {/* Form Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={conflictResult.hasConflict}
              style={{ opacity: conflictResult.hasConflict ? 0.4 : 1, cursor: conflictResult.hasConflict ? 'not-allowed' : 'pointer' }}
            >
              {conflictResult.hasConflict ? '⚠️ Overlap Prevents Booking' : 'Confirm & Book Appointment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
