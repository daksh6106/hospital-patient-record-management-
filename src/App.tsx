/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_PATIENTS } from './data/mockPatients';
import { Patient, VitalSignReading, ClinicalNote, PhysicianOrder } from './types/clinical';
import { ClinicianHeader, NavigationTab } from './components/ClinicianHeader';
import { WardBedGrid } from './components/WardBedGrid';
import { PatientChart } from './components/PatientChart';
import { BedsideVitalsEntry } from './components/BedsideVitalsEntry';
import { MarManager } from './components/MarManager';
import { AlertsManager } from './components/AlertsManager';
import { ShiftHandover } from './components/ShiftHandover';
import { CentralStationMonitoring } from './components/CentralStationMonitoring';
import { AddPatientModal } from './components/AddPatientModal';
import { TransferDischargeModal } from './components/TransferDischargeModal';
import { EmergencyCodeModal } from './components/EmergencyCodeModal';
import { AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react';
import { clinicalAudio } from './utils/audio';
import { clinicalApi } from './api/client';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activeTab, setActiveTab] = useState<NavigationTab>('ward-overview');
  const [activePatientId, setActivePatientId] = useState<string>('pt-101');
  
  // Modals state
  const [showCodeBlueModal, setShowCodeBlueModal] = useState<boolean>(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState<boolean>(false);
  const [showTransferDischargeModal, setShowTransferDischargeModal] = useState<boolean>(false);
  const [transferPatientId, setTransferPatientId] = useState<string>('pt-101');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load patients from backend on mount
  useEffect(() => {
    clinicalApi.getPatients().then((data) => {
      if (data && data.length > 0) {
        setPatients(data);
      }
    });
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const patientForTransfer = patients.find((p) => p.id === transferPatientId) || activePatient;

  // Critical alerts count across entire ward
  const criticalAlertsCount = patients.reduce(
    (count, p) => count + p.alerts.filter((a) => a.severity === 'Critical' && !a.acknowledged).length,
    0
  );

  // Keyboard navigation shortcuts for clinician speed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') setActiveTab('ward-overview');
      if (e.key === '2') setActiveTab('central-telemetry');
      if (e.key === '3') setActiveTab('patient-chart');
      if (e.key === '4') setActiveTab('bedside-entry');
      if (e.key === '5') setActiveTab('mar-infusions');
      if (e.key === '6') setActiveTab('active-alerts');
      if (e.key === '7') setActiveTab('shift-handover');
      if (e.key.toLowerCase() === 'a' && e.shiftKey) setShowAddPatientModal(true);
      if (e.key.toLowerCase() === 'c' && e.shiftKey) setShowCodeBlueModal(true);
      if (e.key === 'Escape') {
        setShowCodeBlueModal(false);
        setShowAddPatientModal(false);
        setShowTransferDischargeModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    setActiveTab('patient-chart');
  };

  const handleOpenBedsideEntry = (patientId: string) => {
    setActivePatientId(patientId);
    setActiveTab('bedside-entry');
  };

  const handleOpenMar = (patientId: string) => {
    setActivePatientId(patientId);
    setActiveTab('patient-chart');
  };

  const handleOpenTransferDischarge = (patientId: string) => {
    setTransferPatientId(patientId);
    setShowTransferDischargeModal(true);
  };

  // Admit / Add Patient Handler
  const handleAddPatient = async (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatientId(newPatient.id);
    setActiveTab('patient-chart');
    triggerToast(`Patient ${newPatient.lastName}, ${newPatient.firstName} successfully admitted to Bed ${newPatient.roomBed}.`);
    await clinicalApi.admitPatient(newPatient);
  };

  // Transfer Bed Handler
  const handleTransferPatient = async (patientId: string, newWard: Patient['ward'], newBed: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          ward: newWard,
          roomBed: newBed,
          notes: [
            {
              id: `note-trans-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              author: 'Dr. Elena Vance, MD',
              role: 'Attending Physician',
              title: `Bed Transfer to ${newWard} Bed ${newBed}`,
              type: 'SOAP' as const,
              content: `Patient transferred from ${p.ward} Room ${p.roomBed} to ${newWard} Room ${newBed}. Report called and accepted by receiving nurse. Telemetry channel reassigned.`,
            },
            ...p.notes,
          ],
        };
      })
    );
    triggerToast(`Bed transfer completed to ${newWard} Bed ${newBed}.`);
    await clinicalApi.transferBed(patientId, newWard, newBed);
  };

  // Discharge Patient Handler
  const handleDischargePatient = async (patientId: string, disposition: string, instructions: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'Discharged' as const,
          notes: [
            {
              id: `note-dc-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              author: 'Dr. Elena Vance, MD',
              role: 'Attending Physician',
              title: `Formal Inpatient Discharge Summary (${disposition})`,
              type: 'SOAP' as const,
              content: `Patient discharged. Disposition: ${disposition}.\nDischarge instructions provided: ${instructions}.\nHome prescriptions reconciled. Outpatient follow-up confirmed.`,
            },
            ...p.notes,
          ],
        };
      })
    );
    triggerToast(`Patient successfully discharged to ${disposition}.`);
    await clinicalApi.dischargePatient(patientId, disposition, instructions);
  };

  const handleSaveVitals = async (patientId: string, reading: VitalSignReading) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedHistory = [reading, ...p.vitalsHistory];
        return {
          ...p,
          currentVitals: {
            heartRate: reading.heartRate,
            bloodPressureSys: reading.bloodPressureSys,
            bloodPressureDia: reading.bloodPressureDia,
            spO2: reading.spO2,
            respRate: reading.respRate,
            temperature: reading.temperature,
            painScore: reading.painScore,
            o2Delivery: reading.o2Delivery,
            timestamp: 'Just now',
            trend:
              reading.heartRate > 110 || reading.bloodPressureSys < 90
                ? 'deteriorating'
                : 'stable',
          },
          vitalsHistory: updatedHistory,
        };
      })
    );
    await clinicalApi.recordVitals(patientId, reading);
  };

  const handleAdministerMed = async (patientId: string, medId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedScheduled = p.scheduledMeds.map((med) => {
          if (med.id !== medId) return med;
          return {
            ...med,
            status: 'Given' as const,
            lastAdmin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });

        return {
          ...p,
          scheduledMeds: updatedScheduled,
        };
      })
    );
    await clinicalApi.administerMed(patientId, medId);
  };

  const handleAcknowledgeAlert = async (patientId: string, alertId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedAlerts = p.alerts.map((alt) => {
          if (alt.id !== alertId) return alt;
          return { ...alt, acknowledged: true };
        });

        return {
          ...p,
          alerts: updatedAlerts,
        };
      })
    );
    await clinicalApi.acknowledgeAlert(patientId, alertId);
  };

  const handleAddNote = async (patientId: string, noteData: Omit<ClinicalNote, 'id'>) => {
    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      ...noteData,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          notes: [newNote, ...p.notes],
        };
      })
    );
    await clinicalApi.addNote(patientId, noteData);
  };

  const handleAddOrder = async (patientId: string, orderData: Omit<PhysicianOrder, 'id'>) => {
    const newOrder: PhysicianOrder = {
      id: `ord-${Date.now()}`,
      ...orderData,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          orders: [newOrder, ...p.orders],
        };
      })
    );
    await clinicalApi.addOrder(patientId, orderData);
  };

  const existingBeds = patients.map((p) => p.roomBed);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col font-sans selection:bg-[#0284c7]/20 selection:text-[#004357]">
      {/* 1. Header with Top Bar Contract & Station Status */}
      <ClinicianHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerCodeBlue={() => setShowCodeBlueModal(true)}
        onOpenAdmitModal={() => setShowAddPatientModal(true)}
        criticalAlertsCount={criticalAlertsCount}
        activePatientName={
          activePatient ? `${activePatient.lastName}, ${activePatient.firstName}` : undefined
        }
      />

      {/* 2. Critical Alert Ticker if any active unacknowledged critical alerts */}
      {criticalAlertsCount > 0 && activeTab !== 'active-alerts' && (
        <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] px-4 py-2 text-xs text-[#991B1B] shadow-xs">
          <div className="max-w-[1536px] mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse shrink-0" />
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>
                {criticalAlertsCount} Unacknowledged Critical Condition Alert{criticalAlertsCount > 1 ? 's' : ''} in Unit: Immediate clinician review mandated.
              </span>
            </div>

            <button
              onClick={() => setActiveTab('active-alerts')}
              className="px-2.5 py-0.5 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-[0.25rem] transition-colors shrink-0 shadow-xs"
            >
              Review Alerts &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3. Notification Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#004357] text-white px-4 py-2.5 rounded shadow-lg border border-cyan-400/30 text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Main Clinical Workspace Viewport */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto p-4 sm:p-5">
        {activeTab === 'ward-overview' && (
          <WardBedGrid
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onOpenBedsideEntry={handleOpenBedsideEntry}
            onOpenMar={handleOpenMar}
            onOpenTransferDischarge={handleOpenTransferDischarge}
          />
        )}

        {activeTab === 'central-telemetry' && (
          <CentralStationMonitoring
            patients={patients}
            onOpenPatientChart={handleSelectPatient}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {activeTab === 'patient-chart' && activePatient && (
          <PatientChart
            patient={activePatient}
            allPatients={patients}
            onSelectPatient={(id) => setActivePatientId(id)}
            onAdministerMed={handleAdministerMed}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onAddNote={handleAddNote}
            onAddOrder={handleAddOrder}
            onOpenBedsideEntry={handleOpenBedsideEntry}
            onOpenTransferDischarge={handleOpenTransferDischarge}
          />
        )}

        {activeTab === 'bedside-entry' && (
          <BedsideVitalsEntry
            patients={patients}
            selectedPatientId={activePatientId}
            onSaveVitals={handleSaveVitals}
            onBackToOverview={() => setActiveTab('ward-overview')}
          />
        )}

        {activeTab === 'mar-infusions' && (
          <MarManager
            patients={patients}
            onOpenPatientChart={handleSelectPatient}
            onAdministerMed={handleAdministerMed}
          />
        )}

        {activeTab === 'active-alerts' && (
          <AlertsManager
            patients={patients}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onOpenPatientChart={handleSelectPatient}
          />
        )}

        {activeTab === 'shift-handover' && (
          <ShiftHandover
            patients={patients}
            onOpenPatientChart={handleSelectPatient}
          />
        )}
      </main>

      {/* 5. Inpatient Admission (Add Patient) Modal */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onAddPatient={handleAddPatient}
        existingBeds={existingBeds}
      />

      {/* 6. Bed Transfer & Discharge Modal */}
      {patientForTransfer && (
        <TransferDischargeModal
          isOpen={showTransferDischargeModal}
          onClose={() => setShowTransferDischargeModal(false)}
          patient={patientForTransfer}
          onTransferPatient={handleTransferPatient}
          onDischargePatient={handleDischargePatient}
        />
      )}

      {/* 7. Resuscitation Code Blue Protocol Suite Modal */}
      <EmergencyCodeModal
        isOpen={showCodeBlueModal}
        onClose={() => setShowCodeBlueModal(false)}
        patients={patients}
      />

      {/* 8. Clinical Station Footer */}
      <footer className="mt-auto border-t border-[#CBD5E1] bg-white text-slate-500 text-xs py-2.5 px-6">
        <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#004357]">Clinical Clarity</span>
            <span>·</span>
            <span>Metropolitan Health Acute Care EHR Workstation</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-slate-400">HIPAA Compliant Session</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="hidden md:inline">Shortcuts: [1-7] Tabs · [Shift+A] Admit Patient · [Shift+C] Code Blue</span>
            <span>·</span>
            <span>Station 4B · Census: {patients.length}/20</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
