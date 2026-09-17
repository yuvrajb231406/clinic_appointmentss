import React, { useState } from 'react';
import { Sliders, Clock, DollarSign, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../services/clinicStore';

export default function SettingsModal({ settings, onSaveSettings, onResetData }) {
  const [windowHours, setWindowHours] = useState(settings.cancellationWindowHours || 24);
  const [lateFee, setLateFee] = useState(settings.standardLateFee || 35.00);
  const [workingStart, setWorkingStart] = useState(settings.workingStart || '08:00');
  const [workingEnd, setWorkingEnd] = useState(settings.workingEnd || '18:00');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      cancellationWindowHours: Number(windowHours),
      standardLateFee: Number(lateFee),
      workingStart,
      workingEnd
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
      
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
            <Sliders size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              Clinic Settings & Policy Rules
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure late cancellation fee thresholds, cutoff windows, and working hours.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span>Clinic Settings Successfully Saved & Applied!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Cancellation Rule Config */}
          <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary)" />
              <span>Cancellation Policy Configuration</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  LATE NOTICE CUTOFF WINDOW (HOURS)
                </label>
                <input 
                  type="number"
                  min="1"
                  max="168"
                  value={windowHours}
                  onChange={(e) => setWindowHours(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                  Cancellations within {windowHours}h of appointment start trigger late fee.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  STANDARD LATE CANCELLATION FEE ($)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                  Fee automatically billed to patient: {formatCurrency(Number(lateFee))}
                </span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
              Clinic Timeline Schedule Hours
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  DAY START TIME
                </label>
                <input 
                  type="time"
                  value={workingStart}
                  onChange={(e) => setWorkingStart(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  DAY END TIME
                </label>
                <input 
                  type="time"
                  value={workingEnd}
                  onChange={(e) => setWorkingEnd(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onResetData}
            >
              <RotateCcw size={16} />
              <span>Reset Demo Dataset</span>
            </button>

            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} />
              <span>Save Policy Settings</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
