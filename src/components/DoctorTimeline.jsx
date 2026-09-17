import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Phone,
  FileText
} from 'lucide-react';
import { 
  formatTime12h, 
  timeToMinutes, 
  minutesToTime, 
  getTodayDateString 
} from '../services/clinicStore';

export default function DoctorTimeline({ 
  doctors, 
  appointments, 
  patients, 
  selectedDate, 
  setSelectedDate, 
  onOpenBookingModal, 
  onOpenCancellationModal, 
  onUpdateStatus, 
  onSelectPatient 
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL'); // 'ALL' or specific doc_id
  const [searchFilter, setSearchFilter] = useState('');

  // Generate hourly time markers (08:00 to 18:00 in 30-min intervals)
  const timeSlots = [];
  for (let m = 480; m <= 1080; m += 30) {
    timeSlots.push(minutesToTime(m));
  }

  // Filter appointments for the selected date
  const dayAppointments = appointments.filter(apt => {
    if (apt.date !== selectedDate) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const pName = apt.patientName ? apt.patientName.toLowerCase() : '';
      const pPhone = apt.patientPhone ? apt.patientPhone.toLowerCase() : '';
      const docName = apt.doctorName ? apt.doctorName.toLowerCase() : '';
      const service = apt.serviceType ? apt.serviceType.toLowerCase() : '';
      return pName.includes(q) || pPhone.includes(q) || docName.includes(q) || service.includes(q);
    }
    return true;
  });

  // Calculate stats for today
  const totalDayApts = dayAppointments.length;
  const confirmedCount = dayAppointments.filter(a => a.status === 'confirmed').length;
  const checkedInCount = dayAppointments.filter(a => a.status === 'checked-in').length;
  const completedCount = dayAppointments.filter(a => a.status === 'completed').length;
  const canceledCount = dayAppointments.filter(a => a.status === 'canceled-free' || a.status === 'canceled-late').length;
  const lateFeeCount = dayAppointments.filter(a => a.status === 'canceled-late').length;

  const activeDoctors = selectedDoctorId === 'ALL' 
    ? doctors 
    : doctors.filter(d => d.id === selectedDoctorId);

  const handleDateShift = (deltaDays) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + deltaDays);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const isToday = selectedDate === getTodayDateString(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Controls & KPI Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleDateShift(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedDate(getTodayDateString(0))}
            style={{ fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--primary)' : 'inherit' }}
          >
            Today
          </button>

          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              background: 'var(--bg-main)', 
              color: '#fff', 
              border: '1px solid var(--border-color)', 
              padding: '0.3rem 0.6rem', 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          />

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleDateShift(1)}
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Doctor View Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text"
              placeholder="Filter day schedule..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.4rem',
                paddingBottom: '0.4rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem',
                width: '220px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setSelectedDoctorId('ALL')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedDoctorId === 'ALL' ? 'var(--primary-glow)' : 'transparent',
                color: selectedDoctorId === 'ALL' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: selectedDoctorId === 'ALL' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              All Doctors ({doctors.length})
            </button>
            {doctors.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: selectedDoctorId === doc.id ? `${doc.color}25` : 'transparent',
                  color: selectedDoctorId === doc.id ? doc.color : 'var(--text-muted)',
                  fontWeight: selectedDoctorId === doc.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {doc.name.split(' ')[1]}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        
        <div className="glass-panel" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#38bdf8' }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Scheduled</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{totalDayApts}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#fbbf24' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confirmed / Checked-In</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{confirmedCount + checkedInCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#34d399' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Visits</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{completedCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#f87171' }}>
            <XCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cancellations</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>
              {canceledCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({lateFeeCount} late fee)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(20, 184, 166, 0.08)', borderColor: 'rgba(20, 184, 166, 0.3)' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '0.6rem', borderRadius: '10px', color: '#14b8a6' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 700 }}>Conflict Engine Active</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>0 Overlaps Guaranteed</div>
          </div>
        </div>

      </div>

      {/* Main Schedule Visual Grid */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${activeDoctors.length}, minmax(220px, 1fr))`, minWidth: `${80 + activeDoctors.length * 220}px` }}>
          
          {/* Header Row: Time Column Header + Doctor Headers */}
          <div style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-dim)', borderBottom: '2px solid var(--border-color)' }}>
            TIME
          </div>

          {activeDoctors.map(doc => {
            const docApts = dayAppointments.filter(a => a.doctorId === doc.id && a.status !== 'canceled-free' && a.status !== 'canceled-late');
            return (
              <div 
                key={doc.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '2px solid var(--border-color)',
                  borderLeft: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img 
                    src={doc.avatar} 
                    alt={doc.name} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${doc.color}` }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: doc.color, fontWeight: 600 }}>
                      {doc.specialty} • <span style={{ color: 'var(--text-dim)' }}>{doc.room}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  <span>Shift: {formatTime12h(doc.shiftStart)} - {formatTime12h(doc.shiftEnd)}</span>
                  <span style={{ background: `${doc.color}20`, color: doc.color, padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    {docApts.length} booked
                  </span>
                </div>
              </div>
            );
          })}

          {/* Time Rows */}
          {timeSlots.map((timeStr, timeIndex) => {
            return (
              <React.Fragment key={timeStr}>
                
                {/* Time Label */}
                <div style={{ 
                  padding: '0.6rem 0.4rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'var(--text-dim)', 
                  borderTop: '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {formatTime12h(timeStr)}
                </div>

                {/* Doctor Slot Cells */}
                {activeDoctors.map(doc => {
                  // Check if there is an appointment starting at this time for this doctor
                  const aptAtTime = dayAppointments.find(a => 
                    a.doctorId === doc.id && 
                    a.startTime === timeStr
                  );

                  return (
                    <div 
                      key={`${doc.id}-${timeStr}`}
                      style={{
                        position: 'relative',
                        minHeight: '48px',
                        borderTop: '1px solid var(--border-color)',
                        borderLeft: '1px solid var(--border-color)',
                        background: 'rgba(11, 15, 25, 0.4)',
                        padding: '0.2rem'
                      }}
                    >
                      {aptAtTime ? (
                        <div 
                          className="glass-panel"
                          style={{
                            padding: '0.5rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `4px solid ${
                              aptAtTime.status === 'canceled-late' ? '#f87171' :
                              aptAtTime.status === 'canceled-free' ? '#9ca3af' :
                              aptAtTime.status === 'completed' ? '#34d399' :
                              aptAtTime.status === 'checked-in' ? '#fbbf24' : doc.color
                            }`,
                            background: aptAtTime.status === 'canceled-late' ? 'var(--status-canceled-late-bg)' :
                                        aptAtTime.status === 'canceled-free' ? 'var(--status-canceled-free-bg)' :
                                        aptAtTime.status === 'completed' ? 'var(--status-completed-bg)' :
                                        aptAtTime.status === 'checked-in' ? 'var(--status-checkedin-bg)' : 'var(--bg-surface)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const pat = patients.find(p => p.id === aptAtTime.patientId);
                            if (pat) onSelectPatient(pat);
                          }}
                        >
                          {/* Patient Name & Time */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                              {aptAtTime.patientName}
                            </div>
                            <span className={`badge badge-${aptAtTime.status}`}>
                              {aptAtTime.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            <span>{formatTime12h(aptAtTime.startTime)} - {formatTime12h(aptAtTime.endTime)} ({aptAtTime.durationMinutes}m)</span>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.15rem', fontWeight: 600 }}>
                            {aptAtTime.serviceType}
                          </div>

                          {aptAtTime.cancellationDetails && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: '#f87171', fontWeight: 600 }}>
                              Late Fee: ${aptAtTime.cancellationDetails.feeAmount.toFixed(2)} ({aptAtTime.cancellationDetails.feeStatus.toUpperCase()})
                            </div>
                          )}

                          {/* Quick Actions Bar */}
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {aptAtTime.status === 'confirmed' && (
                              <button 
                                className="btn btn-sm btn-secondary" 
                                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', color: '#fbbf24' }}
                                onClick={() => onUpdateStatus(aptAtTime.id, 'checked-in')}
                              >
                                Check-In
                              </button>
                            )}

                            {(aptAtTime.status === 'confirmed' || aptAtTime.status === 'checked-in') && (
                              <button 
                                className="btn btn-sm btn-success" 
                                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                                onClick={() => onUpdateStatus(aptAtTime.id, 'completed')}
                              >
                                Complete
                              </button>
                            )}

                            {aptAtTime.status !== 'completed' && aptAtTime.status !== 'canceled-free' && aptAtTime.status !== 'canceled-late' && (
                              <button 
                                className="btn btn-sm btn-danger" 
                                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                                onClick={() => onOpenCancellationModal(aptAtTime)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                        </div>
                      ) : (
                        // Empty slot - Click to Book
                        <button
                          onClick={() => onOpenBookingModal({ doctorId: doc.id, date: selectedDate, startTime: timeStr })}
                          title={`Book Dr. ${doc.name.split(' ')[1]} at ${formatTime12h(timeStr)}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '40px',
                            background: 'transparent',
                            border: '1px dashed transparent',
                            borderRadius: 'var(--radius-sm)',
                            color: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                            e.currentTarget.style.color = '#38bdf8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = 'transparent';
                          }}
                        >
                          <Plus size={14} />
                          <span>Book Slot</span>
                        </button>
                      )}
                    </div>
                  );
                })}

              </React.Fragment>
            );
          })}

        </div>

      </div>

    </div>
  );
}
