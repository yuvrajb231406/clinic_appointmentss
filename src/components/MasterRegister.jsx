import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  PlusCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatTime12h } from '../services/clinicStore';

export default function MasterRegister({ 
  appointments, 
  doctors, 
  patients, 
  onOpenBookingModal, 
  onOpenCancellationModal, 
  onUpdateStatus 
}) {
  const [search, setSearch] = useState('');
  const [docFilter, setDocFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState('date'); // date, patientName, doctorName, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc or desc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filtered = appointments.filter(a => {
    if (docFilter !== 'ALL' && a.doctorId !== docFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.patientName.toLowerCase().includes(q) ||
             a.doctorName.toLowerCase().includes(q) ||
             a.serviceType.toLowerCase().includes(q) ||
             a.date.includes(q);
    }
    return true;
  });

  // Apply Sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  // Apply Pagination
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedItems = sorted.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.1rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem', width: '220px' }}
            />
          </div>

          <select
            value={docFilter}
            onChange={(e) => { setDocFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked-In</option>
            <option value="completed">Completed</option>
            <option value="canceled-free">Canceled (Free)</option>
            <option value="canceled-late">Canceled (Late Fee)</option>
          </select>

        </div>

        <button className="btn btn-primary" onClick={() => onOpenBookingModal()}>
          <PlusCircle size={16} />
          <span>New Booking</span>
        </button>

      </div>

      {/* Table with Clickable Sorting Headers */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
              <th onClick={() => handleSort('date')} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>DATE & TIME</span>
                  <ArrowUpDown size={14} color={sortBy === 'date' ? 'var(--primary)' : 'inherit'} />
                </div>
              </th>

              <th onClick={() => handleSort('patientName')} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>PATIENT</span>
                  <ArrowUpDown size={14} color={sortBy === 'patientName' ? 'var(--primary)' : 'inherit'} />
                </div>
              </th>

              <th onClick={() => handleSort('doctorName')} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>DOCTOR</span>
                  <ArrowUpDown size={14} color={sortBy === 'doctorName' ? 'var(--primary)' : 'inherit'} />
                </div>
              </th>

              <th style={{ padding: '0.75rem' }}>SERVICE TYPE</th>

              <th onClick={() => handleSort('status')} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>STATUS</span>
                  <ArrowUpDown size={14} color={sortBy === 'status' ? 'var(--primary)' : 'inherit'} />
                </div>
              </th>

              <th style={{ padding: '0.75rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No appointments found matching filters.
                </td>
              </tr>
            ) : (
              paginatedItems.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>
                    {a.date} @ {formatTime12h(a.startTime)} ({a.durationMinutes}m)
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{a.patientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.patientPhone}</div>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {a.doctorName}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {a.serviceType}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge badge-${a.status}`}>
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      {a.status === 'confirmed' && (
                        <button className="btn btn-sm btn-secondary" onClick={() => onUpdateStatus(a.id, 'checked-in')}>
                          Check-In
                        </button>
                      )}
                      {(a.status === 'confirmed' || a.status === 'checked-in') && (
                        <button className="btn btn-sm btn-success" onClick={() => onUpdateStatus(a.id, 'completed')}>
                          Complete
                        </button>
                      )}
                      {a.status !== 'completed' && a.status !== 'canceled-free' && a.status !== 'canceled-late' && (
                        <button className="btn btn-sm btn-danger" onClick={() => onOpenCancellationModal(a)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '0.2rem 0.4rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(validPage - 1)}
                style={{ opacity: validPage <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontWeight: 700, color: '#fff' }}>Page {validPage} of {totalPages}</span>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(validPage + 1)}
                style={{ opacity: validPage >= totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
