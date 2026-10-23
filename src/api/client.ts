import { Patient, VitalSignReading, ClinicalNote, PhysicianOrder } from '../types/clinical';
import { INITIAL_PATIENTS } from '../data/mockPatients';

export const clinicalApi = {
  // Fetch all patients from backend
  async getPatients(): Promise<Patient[]> {
    try {
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Clinical API] Falling back to local state:', err);
      return INITIAL_PATIENTS;
    }
  },

  // Admit patient
  async admitPatient(patient: Patient): Promise<Patient> {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('[Clinical API] Admit failed on backend, storing locally:', err);
      return patient;
    }
  },

  // Record vitals
  async recordVitals(patientId: string, reading: VitalSignReading): Promise<void> {
    try {
      await fetch(`/api/patients/${patientId}/vitals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reading),
      });
    } catch (err) {
      console.warn('[Clinical API] Record vitals network error:', err);
    }
  },

  // Administer medication
  async administerMed(patientId: string, medId: string): Promise<void> {
    try {
      await fetch(`/api/patients/${patientId}/administer-med`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medId }),
      });
    } catch (err) {
      console.warn('[Clinical API] Administer med network error:', err);
    }
  },

  // Transfer bed
  async transferBed(patientId: string, newWard: Patient['ward'], newBed: string, reason?: string): Promise<void> {
    try {
      await fetch(`/api/patients/${patientId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newWard, newBed, reason }),
      });
    } catch (err) {
      console.warn('[Clinical API] Transfer bed network error:', err);
    }
  },

  // Discharge patient
  async dischargePatient(patientId: string, disposition: string, instructions: string): Promise<void> {
    try {
      await fetch(`/api/patients/${patientId}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposition, instructions }),
      });
    } catch (err) {
      console.warn('[Clinical API] Discharge network error:', err);
    }
  },

  // Add clinical note
  async addNote(patientId: string, note: Omit<ClinicalNote, 'id'>): Promise<ClinicalNote> {
    try {
      const res = await fetch(`/api/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Clinical API] Add note network error:', err);
      return { id: `note-${Date.now()}`, ...note };
    }
  },

  // Add physician order
  async addOrder(patientId: string, order: Omit<PhysicianOrder, 'id'>): Promise<PhysicianOrder> {
    try {
      const res = await fetch(`/api/patients/${patientId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Clinical API] Add order network error:', err);
      return { id: `ord-${Date.now()}`, ...order };
    }
  },

  // Acknowledge alert
  async acknowledgeAlert(patientId: string, alertId: string): Promise<void> {
    try {
      await fetch(`/api/patients/${patientId}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('[Clinical API] Acknowledge alert network error:', err);
    }
  },
};
