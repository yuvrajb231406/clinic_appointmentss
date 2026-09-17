import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  FileText, 
  Filter,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, formatTime12h } from '../services/clinicStore';

export default function FeeLedger({ appointments, onUpdateFeeStatus }) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, unpaid, paid, waived

  // Extract all appointments that have cancellationDetails
  const lateCancellations = appointments.filter(a => 
    a.cancellationDetails || a.status === 'canceled-late'
  );

  const totalAssessed = lateCancellations.reduce((sum, a) => sum + (a.cancellationDetails?.feeAmount || 0), 0);
  const totalPaid = lateCancellations
    .filter(a => a.cancellationDetails?.feeStatus === 'paid')
    .reduce((sum, a) => sum + (a.cancellationDetails?.feeAmount || 0), 0);
  const totalWaived = lateCancellations
    .filter(a => a.cancellationDetails?.feeStatus === 'waived')
    .length * 35.00; // Estimated value protected
  const totalPending = lateCancellations
    .filter(a => a.cancellationDetails?.feeStatus === 'unpaid')
    .reduce((sum, a) => sum + (a.cancellationDetails?.feeAmount || 0), 0);

  const filteredList = lateCancellations.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.cancellationDetails?.feeStatus === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Financial Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LATE FEES ASSESSED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
            {formatCurrency(totalAssessed)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            {lateCancellations.length} total late cancellations
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>COLLECTED / PAID</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            {formatCurrency(totalPaid)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Settled by front desk
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>PENDING OUTSTANDING</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
            {formatCurrency(totalPending)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Awaiting patient settlement
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>AUDITED WAIVERS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.2rem' }}>
            {formatCurrency(totalWaived)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Waived with documented reasons
          </div>
        </div>

      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Late Cancellation Financial Ledger
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {['ALL', 'unpaid', 'paid', 'waived'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: filterStatus === st ? 'var(--bg-surface)' : 'transparent',
                  color: filterStatus === st ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: filterStatus === st ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No cancellation fee records match the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>DATE & TIME</th>
                  <th style={{ padding: '0.75rem' }}>PATIENT</th>
                  <th style={{ padding: '0.75rem' }}>DOCTOR</th>
                  <th style={{ padding: '0.75rem' }}>NOTICE GIVEN</th>
                  <th style={{ padding: '0.75rem' }}>FEE AMOUNT</th>
                  <th style={{ padding: '0.75rem' }}>FEE STATUS</th>
                  <th style={{ padding: '0.75rem' }}>AUDIT REASON</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(a => {
                  const details = a.cancellationDetails || {};
                  const status = details.feeStatus || 'unpaid';

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>
                        {a.date} @ {formatTime12h(a.startTime)}
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{a.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.patientPhone}</div>
                      </td>

                      <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {a.doctorName}
                      </td>

                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                        {details.hoursNotice != null ? `${details.hoursNotice} hrs notice` : '< 24 hrs'}
                      </td>

                      <td style={{ padding: '0.75rem', fontWeight: 800, color: status === 'paid' ? '#34d399' : status === 'unpaid' ? '#f87171' : 'var(--text-muted)' }}>
                        {formatCurrency(details.feeAmount || 35.00)}
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${
                          status === 'paid' ? 'badge-completed' :
                          status === 'unpaid' ? 'badge-canceled-late' : 'badge-canceled-free'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {details.waiveReason || 'Standard Late Policy ($35)'}
                      </td>

                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {status === 'unpaid' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => onUpdateFeeStatus(a.id, 'paid')}
                            >
                              Settle $35
                            </button>
                          )}
                          {status !== 'waived' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => onUpdateFeeStatus(a.id, 'waived', 'Medical Emergency')}
                            >
                              Waive Fee
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
