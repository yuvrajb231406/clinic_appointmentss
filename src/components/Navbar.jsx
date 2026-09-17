import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  DollarSign, 
  PlusCircle, 
  Sliders, 
  Activity,
  RotateCcw,
  Zap,
  Globe,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { formatTime12h, getTodayDateString } from '../services/clinicStore';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenBookingModal, 
  settings, 
  onUpdateSimulatedTime,
  onResetData,
  user,
  onOpenAuth,
  onLogout
}) {
  const [isEditingClock, setIsEditingClock] = useState(false);
  const [simDate, setSimDate] = useState(settings?.simulatedTime ? settings.simulatedTime.split('T')[0] : getTodayDateString(0));
  const [simTime, setSimTime] = useState(settings?.simulatedTime ? settings.simulatedTime.split('T')[1] : '08:30');

  const handleSimTimeSubmit = (e) => {
    e.preventDefault();
    onUpdateSimulatedTime(`${simDate}T${simTime}`);
    setIsEditingClock(false);
  };

  const navItems = [
    { id: 'landing', label: 'Product Landing', icon: Globe },
    { id: 'timeline', label: "Doctor's Day Schedule", icon: Calendar },
    { id: 'patients', label: 'Patient Lookup', icon: Users },
    { id: 'register', label: 'Master Register', icon: FileText },
    { id: 'ledger', label: 'Cancellation Ledger', icon: DollarSign },
    { id: 'settings', label: 'Settings & Policy', icon: Sliders },
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.75rem 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #0284c7, #14b8a6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
          }}>
            <Activity size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MediDesk <span style={{ color: '#38bdf8', WebkitTextFillColor: '#38bdf8', fontSize: '0.8rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', marginLeft: '0.25rem' }}>PREMIER</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Clinic Desk & Conflict-Free Scheduler
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: User Session, Clinic Clock & Quick Book */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Simulated Clinic Clock Badge */}
          <div style={{ position: 'relative' }}>
            {!isEditingClock ? (
              <button
                onClick={() => setIsEditingClock(true)}
                title="Click to adjust simulated clinic clock for testing late cancellation rules"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-teal)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Clock size={14} />
                <span>{simDate} @ {formatTime12h(simTime)}</span>
                <span style={{ fontSize: '0.625rem', background: 'var(--accent-teal)', color: '#000', padding: '0.05rem 0.3rem', borderRadius: '3px', fontWeight: 800 }}>LIVE</span>
              </button>
            ) : (
              <form onSubmit={handleSimTimeSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-teal)' }}>
                <input 
                  type="date" 
                  value={simDate} 
                  onChange={(e) => setSimDate(e.target.value)}
                  style={{ background: 'var(--bg-main)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                />
                <input 
                  type="time" 
                  value={simTime} 
                  onChange={(e) => setSimTime(e.target.value)}
                  style={{ background: 'var(--bg-main)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>Save</button>
                <button type="button" onClick={() => setIsEditingClock(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>✕</button>
              </form>
            )}
          </div>

          {/* User Auth Status Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <UserCheck size={16} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <button 
                onClick={onLogout} 
                title="Sign Out" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuth}>
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Book Button */}
          <button 
            className="btn btn-primary pulse-glow" 
            onClick={() => onOpenBookingModal()}
            style={{ fontWeight: 700, padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
          >
            <PlusCircle size={16} />
            <span>Book Appointment</span>
          </button>
          
        </div>

      </div>
    </header>
  );
}
