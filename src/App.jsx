import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DoctorTimeline from './components/DoctorTimeline';
import BookingModal from './components/BookingModal';
import CancellationModal from './components/CancellationModal';
import PatientLookup from './components/PatientLookup';
import MasterRegister from './components/MasterRegister';
import FeeLedger from './components/FeeLedger';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';

import { 
  loadClinicData, 
  saveClinicData, 
  resetToDefaultData, 
  getTodayDateString 
} from './services/clinicStore';
import { api } from './services/api';

export default function App() {
  const [data, setData] = useState(() => loadClinicData());
  const [activeTab, setActiveTab] = useState('landing'); // 'landing', 'timeline', 'patients', 'register', 'ledger', 'settings'
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString(0));

  // User Auth State
  const [user, setUser] = useState({
    id: 'usr_desk1',
    email: 'desk@medidesk.clinic',
    name: 'Sarah Connor',
    role: 'Front Desk Lead'
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Modals State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState({});

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [targetAppointmentToCancel, setTargetAppointmentToCancel] = useState(null);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync state changes with localStorage and backend server
  const updateClinicData = (newData) => {
    setData(newData);
    saveClinicData(newData);
  };

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await api.login(email, password);
    if (res.error && !res.offlineFallback) {
      return { error: res.error };
    }
    const loggedUser = res.user || {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'Front Desk Agent'
    };
    setUser(loggedUser);
    showToast(`Welcome back, ${loggedUser.name}!`);
    return { success: true };
  };

  const handleRegister = async (userData) => {
    const res = await api.register(userData);
    if (res.error && !res.offlineFallback) {
      return { error: res.error };
    }
    const newUser = res.user || {
      id: `usr_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'Front Desk Agent'
    };
    setUser(newUser);
    showToast(`Account registered for ${newUser.name}!`);
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Signed out of MediDesk.');
  };

  // Booking & Cancellation Handlers
  const handleOpenBookingModal = (initials = {}) => {
    setBookingInitialData(initials);
    setBookingModalOpen(true);
  };

  const handleSaveAppointment = async (aptData) => {
    // Try backend REST endpoint
    const res = await api.createAppointment(aptData);
    if (res.error && !res.offlineFallback) {
      showToast(res.error, 'warning');
      return;
    }

    const existingIndex = data.appointments.findIndex(a => a.id === aptData.id);
    let updatedApts = [...data.appointments];

    if (existingIndex >= 0) {
      updatedApts[existingIndex] = aptData;
      showToast(`Appointment for ${aptData.patientName} updated!`);
    } else {
      updatedApts.unshift(aptData);
      showToast(`Conflict-free appointment booked for ${aptData.patientName}!`);
    }

    updateClinicData({
      ...data,
      appointments: updatedApts
    });
  };

  const handleOpenCancellationModal = (apt) => {
    setTargetAppointmentToCancel(apt);
    setCancellationModalOpen(true);
  };

  const handleConfirmCancellation = async (appointmentId, details) => {
    // Try backend REST endpoint
    await api.cancelAppointment(appointmentId, details);

    const updatedApts = data.appointments.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: details.status,
          cancellationDetails: {
            canceledAt: details.canceledAt,
            hoursNotice: details.hoursNotice,
            feeAmount: details.feeAmount,
            feeStatus: details.feeStatus,
            waiveReason: details.waiveReason
          }
        };
      }
      return a;
    });

    let updatedPatients = [...data.patients];
    const targetApt = data.appointments.find(a => a.id === appointmentId);
    if (targetApt && details.feeAmount > 0) {
      updatedPatients = updatedPatients.map(p => {
        if (p.id === targetApt.patientId) {
          return {
            ...p,
            outstandingFees: (p.outstandingFees || 0) + details.feeAmount
          };
        }
        return p;
      });
    }

    updateClinicData({
      ...data,
      appointments: updatedApts,
      patients: updatedPatients
    });

    if (details.feeAmount > 0) {
      showToast(`Late cancellation processed. $${details.feeAmount.toFixed(2)} fee applied.`, 'warning');
    } else {
      showToast(`Appointment canceled free of charge (${details.hoursNotice}h notice).`);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    await api.updateStatus(appointmentId, newStatus);
    const updatedApts = data.appointments.map(a => {
      if (a.id === appointmentId) return { ...a, status: newStatus };
      return a;
    });
    updateClinicData({ ...data, appointments: updatedApts });
    showToast(`Appointment status updated to ${newStatus.toUpperCase()}`);
  };

  const handleSettleFee = async (appointmentId) => {
    await api.updateFeeStatus(appointmentId, 'paid');
    let targetPatientId = null;
    let feePaidAmount = 0;

    const updatedApts = data.appointments.map(a => {
      if (a.id === appointmentId && a.cancellationDetails) {
        targetPatientId = a.patientId;
        feePaidAmount = a.cancellationDetails.feeAmount || 35.00;
        return {
          ...a,
          cancellationDetails: { ...a.cancellationDetails, feeStatus: 'paid' }
        };
      }
      return a;
    });

    let updatedPatients = [...data.patients];
    if (targetPatientId) {
      updatedPatients = updatedPatients.map(p => {
        if (p.id === targetPatientId) {
          return { ...p, outstandingFees: Math.max(0, (p.outstandingFees || 0) - feePaidAmount) };
        }
        return p;
      });
    }

    updateClinicData({ ...data, appointments: updatedApts, patients: updatedPatients });
    showToast(`$${feePaidAmount.toFixed(2)} cancellation fee recorded as paid!`);
  };

  const handleUpdateFeeStatus = async (appointmentId, feeStatus, waiveReason = null) => {
    await api.updateFeeStatus(appointmentId, feeStatus, waiveReason);
    const updatedApts = data.appointments.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          cancellationDetails: {
            ...a.cancellationDetails,
            feeStatus,
            waiveReason: waiveReason || a.cancellationDetails?.waiveReason
          }
        };
      }
      return a;
    });
    updateClinicData({ ...data, appointments: updatedApts });
    showToast(`Fee status updated to ${feeStatus.toUpperCase()}`);
  };

  const handleAddNewPatient = async (newPatientData) => {
    const res = await api.createPatient(newPatientData);
    const newPatient = (res && !res.offlineFallback) ? res : {
      id: `pat_${Date.now()}`,
      mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newPatientData.name,
      phone: newPatientData.phone || '(555) 000-0000',
      email: newPatientData.email || 'patient@example.com',
      dob: '1990-01-01',
      gender: 'Unspecified',
      bloodType: 'O+',
      outstandingFees: 0
    };

    updateClinicData({
      ...data,
      patients: [newPatient, ...data.patients]
    });

    showToast(`New patient registered: ${newPatient.name} (${newPatient.mrn})`);
    return newPatient;
  };

  const handleUpdateSimulatedTime = (newISOString) => {
    updateClinicData({
      ...data,
      settings: { ...data.settings, simulatedTime: newISOString }
    });
    showToast(`Clinic Clock updated to ${newISOString.replace('T', ' @ ')}`);
  };

  const handleSaveSettings = async (newSettings) => {
    await api.updateSettings(newSettings);
    updateClinicData({ ...data, settings: newSettings });
  };

  const handleResetData = () => {
    if (window.confirm('Reset clinic dataset back to default mock state?')) {
      const reset = resetToDefaultData();
      setData(reset);
      showToast('Clinic dataset reset to default state!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      
      {/* Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={handleOpenBookingModal}
        settings={data.settings}
        onUpdateSimulatedTime={handleUpdateSimulatedTime}
        onResetData={handleResetData}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: toast.type === 'warning' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(8px)',
            animation: 'slideUp 0.2s ease-out'
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Viewport */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
        
        {activeTab === 'landing' && (
          <LandingPage 
            onLaunchApp={() => setActiveTab('timeline')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'timeline' && (
          <DoctorTimeline 
            doctors={data.doctors}
            appointments={data.appointments}
            patients={data.patients}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenCancellationModal={handleOpenCancellationModal}
            onUpdateStatus={handleUpdateStatus}
            onSelectPatient={() => setActiveTab('patients')}
          />
        )}

        {activeTab === 'patients' && (
          <PatientLookup 
            patients={data.patients}
            appointments={data.appointments}
            doctors={data.doctors}
            onBookForPatient={(patId) => handleOpenBookingModal({ patientId: patId })}
            onSettleFee={handleSettleFee}
            onOpenCancellationModal={handleOpenCancellationModal}
          />
        )}

        {activeTab === 'register' && (
          <MasterRegister 
            appointments={data.appointments}
            doctors={data.doctors}
            patients={data.patients}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenCancellationModal={handleOpenCancellationModal}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'ledger' && (
          <FeeLedger 
            appointments={data.appointments}
            onUpdateFeeStatus={handleUpdateFeeStatus}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal 
            settings={data.settings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetData}
          />
        )}

      </main>

      {/* Modals */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctors={data.doctors}
        patients={data.patients}
        appointments={data.appointments}
        initialData={bookingInitialData}
        onSaveAppointment={handleSaveAppointment}
        onAddNewPatient={handleAddNewPatient}
      />

      <CancellationModal 
        isOpen={cancellationModalOpen}
        onClose={() => setCancellationModalOpen(false)}
        appointment={targetAppointmentToCancel}
        settings={data.settings}
        onConfirmCancellation={handleConfirmCancellation}
      />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

    </div>
  );
}
