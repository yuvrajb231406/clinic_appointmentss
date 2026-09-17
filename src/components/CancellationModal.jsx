import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  FileText, 
  X,
  Scale
} from 'lucide-react';
import { 
  evaluateCancellation, 
  formatTime12h, 
  formatCurrency 
} from '../services/clinicStore';

export default function CancellationModal({ 
  isOpen, 
  onClose, 
  appointment, 
  settings, 
  onConfirmCancellation 
}) {
  if (!isOpen || !appointment) return null;

  const evaluation = evaluateCancellation(
    appointment,
    settings.simulatedTime,
    settings.cancellationWindowHours,
    settings.standardLateFee
  );

  const [reasonNotes, setReasonNotes] = useState('');
  const [isWaived, setIsWaived] = useState(false);
  const [waiveReason, setWaiveReason] = useState('Medical Emergency');

  const handleConfirm = (e) => {
    e.preventDefault();

    const finalFee = evaluation.isLate && !isWaived ? evaluation.feeAmount : 0;
    const finalStatus = evaluation.isLate 
      ? (isWaived ? 'canceled-free' : 'canceled-late')
      : 'canceled-free';

    onConfirmCancellation(appointment.id, {
      status: finalStatus,
      canceledAt: settings.simulatedTime,
      hoursNotice: evaluation.hoursNotice,
      feeAmount: finalFee,
      feeStatus: finalFee > 0 ? 'unpaid' : (isWaived ? 'waived' : 'none'),
      waiveReason: isWaived ? waiveReason : null,
      notes: reasonNotes
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: evaluation.isLate ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px', color: evaluation.isLate ? '#f87171' : '#34d399' }}>
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                Process Cancellation
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Late Cancellation & Fee Policy Evaluator
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Target Appointment Details Box */}
          <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
              {appointment.patientName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
              {appointment.doctorName} • {appointment.serviceType}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <Clock size={13} />
              <span>{appointment.date} @ {formatTime12h(appointment.startTime)} - {formatTime12h(appointment.endTime)}</span>
            </div>
          </div>

          {/* POLICY EVALUATION RESULT CARD */}
          {evaluation.isLate ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>
                  <ShieldAlert size={18} />
                  <span>LATE CANCELLATION TRIGGERED</span>
                </div>
                <span className="badge badge-canceled-late">
                  Fee: {formatCurrency(evaluation.feeAmount)}
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.4 }}>
                Notice given is <strong>{evaluation.hoursNotice} hours</strong> before appointment start. 
                Clinic policy requires at least <strong>{evaluation.policyWindow} hours</strong> notice.
              </p>

              {/* Fee Waiver Checkbox for Front Desk */}
              <div style={{ borderTop: '1px dashed rgba(239, 68, 68, 0.3)', paddingTop: '0.75rem', marginTop: '0.35rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  <input 
                    type="checkbox" 
                    checked={isWaived} 
                    onChange={(e) => setIsWaived(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Waive Cancellation Fee (Front Desk Discretion)</span>
                </label>

                {isWaived && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      MANDATORY WAIVER AUDIT REASON *
                    </label>
                    <select
                      value={waiveReason}
                      onChange={(e) => setWaiveReason(e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="Medical Emergency">Medical Emergency / Illness</option>
                      <option value="Severe Weather / Transport Breakdown">Severe Weather / Transport Issues</option>
                      <option value="Clinic Schedule Conflict">Clinic Mistake / Doctor Called Away</option>
                      <option value="First-Time Grace">First-Time Courtesy Grace</option>
                      <option value="Manager Special Exemption">Manager Special Exemption</option>
                    </select>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={24} color="#34d399" />
                <div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.9rem' }}>
                    FREE CANCELLATION ELIGIBLE
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Notice given ({evaluation.hoursNotice}h) meets the {evaluation.policyWindow}h advance policy.
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#34d399' }}>
                $0.00
              </div>
            </div>
          )}

          {/* Reason / Internal Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              CANCELLATION REASON / AUDIT NOTES
            </label>
            <textarea 
              value={reasonNotes}
              onChange={(e) => setReasonNotes(e.target.value)}
              placeholder="Enter patient explanation or front desk notes..."
              rows={2}
              style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Keep Appointment
            </button>
            <button 
              type="submit" 
              className={`btn ${evaluation.isLate && !isWaived ? 'btn-danger' : 'btn-primary'}`}
            >
              Confirm Cancellation {evaluation.isLate && !isWaived ? `(Charge ${formatCurrency(evaluation.feeAmount)})` : '(Free)'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
