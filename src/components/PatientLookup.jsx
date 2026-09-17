import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  ChevronLeft,
  ArrowUpDown
} from 'lucide-react';
import { 
  formatTime12h, 
  formatCurrency 
} from '../services/clinicStore';

export default function PatientLookup({ 
  patients, 
  appointments, 
  doctors, 
  onBookForPatient, 
  onSettleFee, 
  onOpenCancellationModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0] ? patients[0].id : null);
  
  // Pagination & Sorting State for Patient List
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           p.mrn.toLowerCase().includes(q) || 
           p.phone.toLowerCase().includes(q) ||
           (p.email && p.email.toLowerCase().includes(q));
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  const totalItems = sortedPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedPatients = sortedPatients.slice(startIndex, startIndex + itemsPerPage);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || paginatedPatients[0] || patients[0];

  // Get appointments for selected patient
  const patientAppointments = selectedPatient
    ? appointments.filter(a => a.patientId === selectedPatient.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const totalLateFeesPending = patientAppointments
    .filter(a => a.cancellationDetails && a.cancellationDetails.feeStatus === 'unpaid')
    .reduce((sum, a) => sum + (a.cancellationDetails.feeAmount || 0), 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem', alignItems: 'start' }}>
      
      {/* Left Column: Patient Search & List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Search Input Box & Sort */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="var(--primary)" />
              <span>Find Patient by Name / MRN</span>
            </div>

            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 700 }}
            >
              <ArrowUpDown size={12} />
              <span>{sortOrder.toUpperCase()}</span>
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              placeholder="Search by name, MRN-XXXX, or phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Showing {paginatedPatients.length} of {totalItems} patient records
          </div>
        </div>

        {/* Patient Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {paginatedPatients.map(p => {
            const isSelected = selectedPatient && selectedPatient.id === p.id;
            const pApts = appointments.filter(a => a.patientId === p.id);
            const hasUnpaidFee = pApts.some(a => a.cancellationDetails && a.cancellationDetails.feeStatus === 'unpaid');

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className="glass-panel"
                style={{
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--primary)' : '#fff' }}>
                    {p.name}
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {p.mrn}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  <span>{p.phone}</span>
                  <span>•</span>
                  <span>{pApts.length} Visits</span>
                </div>

                {hasUnpaidFee && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.725rem', color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={12} />
                    <span>Late Cancellation Fee Pending</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PAGINATION BAR FOR PATIENTS */}
        <div className="glass-panel" style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Page {validPage} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage(validPage - 1)}
              style={{ opacity: validPage <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={12} />
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage(validPage + 1)}
              style={{ opacity: validPage >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Selected Patient Profile & History */}
      {selectedPatient ? (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Patient Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {selectedPatient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  {selectedPatient.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPatient.mrn}</span>
                  <span>•</span>
                  <span>DOB: {selectedPatient.dob}</span>
                  <span>•</span>
                  <span>Gender: {selectedPatient.gender}</span>
                  <span>•</span>
                  <span style={{ color: '#ec4899', fontWeight: 700 }}>Blood: {selectedPatient.bloodType}</span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onBookForPatient(selectedPatient.id)}
            >
              <PlusCircle size={15} />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Contact & Outstanding Balance Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            
            <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Phone size={14} /> <span>{selectedPatient.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Mail size={14} /> <span>{selectedPatient.email}</span>
              </div>
            </div>

            <div style={{ background: totalLateFeesPending > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${totalLateFeesPending > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CANCELLATION FEE BALANCE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalLateFeesPending > 0 ? '#f87171' : '#34d399' }}>
                {formatCurrency(totalLateFeesPending)}
              </div>
            </div>

          </div>

          {/* Appointment History Timeline */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <span>Appointment History & Lookup ({patientAppointments.length})</span>
            </h3>

            {patientAppointments.length === 0 ? (
              <div style={{ padding: '2rem', textTransform: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                No appointments booked for this patient yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patientAppointments.map(apt => (
                  <div 
                    key={apt.id}
                    style={{
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                          {apt.date}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatTime12h(apt.startTime)} - {formatTime12h(apt.endTime)}
                        </span>
                        <span className={`badge badge-${apt.status}`}>
                          {apt.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                        {apt.doctorName} — {apt.serviceType}
                      </div>

                      {apt.cancellationDetails && (
                        <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>
                          Late Fee: ${apt.cancellationDetails.feeAmount.toFixed(2)} | Notice: {apt.cancellationDetails.hoursNotice}h | Status: <strong>{apt.cancellationDetails.feeStatus.toUpperCase()}</strong>
                          {apt.cancellationDetails.waiveReason && ` (${apt.cancellationDetails.waiveReason})`}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {apt.cancellationDetails && apt.cancellationDetails.feeStatus === 'unpaid' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onSettleFee(apt.id)}
                        >
                          Mark Fee Paid ($35)
                        </button>
                      )}

                      {apt.status === 'confirmed' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onOpenCancellationModal(apt)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Select a patient to view details and appointment history.
        </div>
      )}

    </div>
  );
}
