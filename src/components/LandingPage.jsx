import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Search, 
  DollarSign, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Users, 
  Zap, 
  CheckCircle2, 
  Activity,
  MessageSquare,
  Video,
  Brain,
  LogIn
} from 'lucide-react';

export default function LandingPage({ onLaunchApp, onOpenAuth }) {
  const nextFeatures = [
    {
      icon: MessageSquare,
      title: 'Automated SMS & WhatsApp Patient Reminders',
      tag: 'Q4 2026 ROADMAP',
      color: '#38bdf8',
      description: 'Sends automated 24-hour reminder texts with 1-click "CONFIRM" or "RESCHEDULE" buttons, automatically updating clinic slot statuses in real time.'
    },
    {
      icon: Video,
      title: 'Multi-Location & Telehealth Integration',
      tag: 'Q1 2027 ROADMAP',
      color: '#a855f7',
      description: 'Seamless virtual room generation for remote telehealth visits alongside multi-branch physical clinic room allocation.'
    },
    {
      icon: Brain,
      title: 'AI-Powered No-Show & Predictive Attendance Analytics',
      tag: 'Q2 2027 ROADMAP',
      color: '#14b8a6',
      description: 'Machine learning algorithms that analyze historical patient patterns to score no-show risk and dynamically suggest waitlist backfills.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      
      {/* Hero Banner Section */}
      <div 
        className="glass-panel"
        style={{
          padding: '3.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.9), rgba(11, 15, 25, 0.95))',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          <Sparkles size={14} />
          <span>REVOLUTIONIZING CLINIC FRONT DESKS</span>
        </div>

        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', maxWidth: '850px', margin: '0 auto', lineHeight: 1.2 }}>
          Never Double-Book a Doctor Again. <br />
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Enforce Fair Late Cancellation Policies.
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '1.25rem auto 2rem auto', lineHeight: 1.6 }}>
          MediDesk Premier empowers clinic front desks with an intelligent, conflict-free scheduling engine, automated 24-hour late fee enforcement, doctor day timeline grids, and instant patient lookups.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary btn-lg pulse-glow"
            onClick={onLaunchApp}
            style={{ fontWeight: 800, padding: '0.85rem 1.75rem' }}
          >
            <span>Launch Front Desk App</span>
            <ArrowRight size={18} />
          </button>

          <button 
            className="btn btn-secondary btn-lg"
            onClick={onOpenAuth}
            style={{ fontWeight: 700, padding: '0.85rem 1.5rem' }}
          >
            <LogIn size={18} />
            <span>Staff Login / Register</span>
          </button>
        </div>
      </div>

      {/* Product Overview & How It Helps */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            Built Specifically for Busy Medical Clinics
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Designed to solve the real frustrations faced by clinic receptionists every day.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1rem' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              0% Double-Booking Conflict Engine
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Strict mathematical interval checking (<code style={{ color: 'var(--primary)' }}>startA &lt; endB && endA &gt; startB</code>) prevents overlapping slots for the same doctor.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', marginBottom: '1rem' }}>
              <Clock size={26} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Dynamic 24h Late Fee Policy
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Automatically evaluates notice windows. Cancellations &lt; 24h carry a standard $35 fee with audited front-desk fee waiver logging.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1rem' }}>
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Instant Patient & MRN Lookup
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Find any patient by name, medical record number (MRN), or phone number in milliseconds with complete appointment & billing history.
            </p>
          </div>

        </div>
      </div>

      {/* Target Audience Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={22} color="var(--primary)" />
          <span>Designed For Diverse Healthcare Facilities</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Outpatient Clinics</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Cardiology, Dermatology, & Specialist Centers</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Group General Practices</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Multi-Doctor Family Practices & Pediatrics</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Dental & Urgent Care</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>High-turnover appointment schedule desks</div>
          </div>
        </div>
      </div>

      {/* TOP THREE FEATURES WE WOULD BUILD NEXT */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FUTURE PRODUCT ROADMAP</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            Top Three Features We Would Build Next
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Strategic enhancements planned for the next major releases of MediDesk Premier.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {nextFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ background: `${feat.color}20`, padding: '0.65rem', borderRadius: '12px', color: feat.color }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: feat.color, background: `${feat.color}15`, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', border: `1px solid ${feat.color}40` }}>
                    {feat.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                  {index + 1}. {feat.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
