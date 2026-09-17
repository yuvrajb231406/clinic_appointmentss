// Full Stack REST API Client Layer - MediDesk Premier

const API_BASE = 'http://localhost:3001/api';

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { error: errBody.message || errBody.error || `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    console.warn(`API server offline at ${endpoint}, fallback active:`, err.message);
    return { offlineFallback: true };
  }
}

export const api = {
  // Auth REST APIs
  login: (email, password) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchApi('/auth/me'),

  // Doctors REST APIs
  getDoctors: () => fetchApi('/doctors'),

  // Patients REST APIs (Paginated & Sorted)
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/patients?${query}`);
  },
  createPatient: (patientData) => fetchApi('/patients', { method: 'POST', body: JSON.stringify(patientData) }),

  // Appointments REST APIs (Conflict Engine Verified)
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/appointments?${query}`);
  },
  createAppointment: (aptData) => fetchApi('/appointments', { method: 'POST', body: JSON.stringify(aptData) }),
  cancelAppointment: (id, cancelDetails) => fetchApi(`/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(cancelDetails) }),
  updateStatus: (id, status) => fetchApi(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateFeeStatus: (id, feeStatus, waiveReason) => fetchApi(`/appointments/${id}/fee`, { method: 'PATCH', body: JSON.stringify({ feeStatus, waiveReason }) }),

  // Financial Ledger & Settings REST APIs
  getLedger: () => fetchApi('/ledger'),
  getSettings: () => fetchApi('/settings'),
  updateSettings: (settings) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(settings) })
};
