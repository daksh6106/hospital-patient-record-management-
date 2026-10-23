import React, { useState } from 'react';
import { 
  Activity, 
  Pill, 
  FlaskConical, 
  FileText, 
  AlertTriangle, 
  User, 
  ChevronDown, 
  Droplets, 
  Clock, 
  Plus, 
  Check, 
  ExternalLink,
  Shield,
  Heart,
  Calendar,
  Layers,
  Thermometer,
  Printer,
  Barcode,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  Stethoscope,
  Copy
} from 'lucide-react';
import { Patient, PatientStatus, LabResult, PhysicianOrder, ClinicalNote } from '../types/clinical';
import { StatusBadge } from './StatusBadge';
import { LiveWaveform } from './LiveWaveform';
import { AlertBanner } from './AlertBanner';
import { clinicalAudio } from '../utils/audio';

interface PatientChartProps {
  patient: Patient;
  allPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAdministerMed: (patientId: string, medId: string) => void;
  onAcknowledgeAlert: (patientId: string, alertId: string) => void;
  onAddNote: (patientId: string, note: Omit<ClinicalNote, 'id'>) => void;
  onAddOrder: (patientId: string, order: Omit<PhysicianOrder, 'id'>) => void;
  onOpenBedsideEntry: (patientId: string) => void;
  onOpenTransferDischarge?: (patientId: string) => void;
}

export type ChartTab = 'telemetry' | 'mar' | 'labs' | 'notes-orders' | 'alerts';

export const PatientChart: React.FC<PatientChartProps> = ({
  patient,
  allPatients,
  onSelectPatient,
  onAdministerMed,
  onAcknowledgeAlert,
  onAddNote,
  onAddOrder,
  onOpenBedsideEntry,
  onOpenTransferDischarge,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('telemetry');
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [showAdministerModal, setShowAdministerModal] = useState<boolean>(false);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);

  // New Note form state
  const [noteType, setNoteType] = useState<ClinicalNote['type']>('SOAP');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // New Order form state
  const [orderText, setOrderText] = useState('');
  const [orderPriority, setOrderPriority] = useState<PhysicianOrder['priority']>('STAT');
  const [orderCategory, setOrderCategory] = useState<PhysicianOrder['category']>('Medication');

  // Barcode / 5 rights simulation state
  const [scannedWristband, setScannedWristband] = useState(false);
  const [scannedMedication, setScannedMedication] = useState(false);
  const [nursePin, setNursePin] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const currentVitals = patient.currentVitals;
  const isCritical = patient.status === 'Critical';

  const handleOpenAdminister = (medId: string) => {
    setSelectedMedId(medId);
    setScannedWristband(false);
    setScannedMedication(false);
    setNursePin('');
    setAdminNote('');
    setShowAdministerModal(true);
  };

  const handleScanWristband = () => {
    setScannedWristband(true);
    clinicalAudio.playScanSuccess();
  };

  const handleScanMedication = () => {
    setScannedMedication(true);
    clinicalAudio.playScanSuccess();
  };

  const handleConfirmAdminister = () => {
    if (selectedMedId) {
      clinicalAudio.playScanSuccess();
      onAdministerMed(patient.id, selectedMedId);
      setShowAdministerModal(false);
      setSelectedMedId(null);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    onAddNote(patient.id, {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Dr. Elena Vance, MD',
      role: 'Attending Intensivist',
      title: noteTitle.trim(),
      type: noteType,
      content: noteContent.trim(),
    });

    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderText.trim()) return;

    onAddOrder(patient.id, {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderText: orderText.trim(),
      priority: orderPriority,
      category: orderCategory,
      orderedBy: 'Dr. Elena Vance, MD',
      status: 'Active',
    });

    setOrderText('');
    setShowOrderModal(false);
  };

  const activeMed = patient.scheduledMeds.find((m) => m.id === selectedMedId);

  return (
    <div className="space-y-4">
      {/* 1. Persistent Patient Master Banner (Clinical Clarity EHR Spec) */}
      <div className="bg-white border border-[#CBD5E1] rounded-lg shadow-xs overflow-hidden">
        {/* Top Banner Stripe */}
        <div className="p-4 bg-[#F8FAFC] border-b border-slate-200">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Left: Patient Primary Identification */}
            <div className="flex items-start gap-3">
              <div className="relative">
                <select
                  value={patient.id}
                  onChange={(e) => onSelectPatient(e.target.value)}
                  className="appearance-none font-headline font-bold text-lg text-[#0D1C2E] bg-white border border-[#CBD5E1] rounded-[0.25rem] pl-3 pr-8 py-1 focus:outline-none focus:border-[#0284C7] cursor-pointer"
                >
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (Bed {p.roomBed})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-mono bg-[#eff4ff] text-[#004357] px-2 py-0.5 rounded font-bold border border-[#dce9ff]">
                  Bed {patient.roomBed}
                </span>
                <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  {patient.mrn}
                </span>
                <span className="text-slate-600 font-medium">
                  {patient.age}y {patient.sex} · DOB: {patient.dob}
                </span>
                <StatusBadge status={patient.status} />
              </div>
            </div>

            {/* Right: Clinician Care Team & Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-xs text-right hidden sm:block">
                <div className="font-semibold text-slate-800">{patient.attendingPhysician}</div>
                <div className="text-slate-500 text-[11px] font-mono">RN: {patient.primaryNurse}</div>
              </div>

              {onOpenTransferDischarge && (
                <button
                  onClick={() => onOpenTransferDischarge(patient.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-50 text-slate-700 rounded-[0.25rem] transition-colors"
                >
                  Transfer / Discharge
                </button>
              )}

              <button
                onClick={() => onOpenBedsideEntry(patient.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Bedside Vitals</span>
              </button>
            </div>
          </div>

          {/* Secondary Clinical Metadata & Safety Indicators Strip */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold text-slate-700">
                Primary Diagnosis: <span className="font-bold text-slate-900">{patient.primaryDiagnosis}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-slate-500 text-[11px]">
                Admitted: {patient.admissionDate}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
              {/* Code Status */}
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  patient.codeStatus === 'FULL CODE'
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-red-100 text-red-900 border border-red-300'
                }`}
              >
                {patient.codeStatus}
              </span>

              {/* Allergies Highlight */}
              {patient.allergies.length > 0 ? (
                <span className="px-2 py-0.5 rounded font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                  ALLERGIES: {patient.allergies.map((a) => a.substance).join(', ')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  NKDA
                </span>
              )}

              {/* Isolation */}
              {patient.isolation !== 'None' && (
                <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Iso: {patient.isolation}
                </span>
              )}

              {/* Diet */}
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Diet: {patient.dietStatus}
              </span>

              {/* Net Fluid Balance */}
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#004357] border border-[#dce9ff] font-bold">
                24h Net: {patient.fluidBalance.net24hMl > 0 ? `+${patient.fluidBalance.net24hMl}` : patient.fluidBalance.net24hMl} mL
              </span>
            </div>
          </div>
        </div>

        {/* 2. Chart Sub-Navigation Tabs */}
        <div className="px-4 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'border-[#0284C7] text-[#0284C7] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & Live Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab('mar')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'mar'
                ? 'border-[#0284C7] text-[#0284C7] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>eMAR & Infusions</span>
            {patient.scheduledMeds.filter((m) => m.status === 'Due' || m.status === 'Overdue').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[10px] flex items-center justify-center font-mono">
                {patient.scheduledMeds.filter((m) => m.status === 'Due' || m.status === 'Overdue').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'labs'
                ? 'border-[#0284C7] text-[#0284C7] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Labs & Diagnostics</span>
            {patient.labs.filter((l) => l.flag === 'CRITICAL').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[10px] flex items-center justify-center font-mono">
                {patient.labs.filter((l) => l.flag === 'CRITICAL').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes-orders')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes-orders'
                ? 'border-[#0284C7] text-[#0284C7] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Notes & Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-[#0284C7] text-[#0284C7] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Alerts</span>
            {patient.alerts.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                {patient.alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- TAB 1: TELEMETRY & LIVE VITALS --- */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <LiveWaveform
            heartRate={currentVitals.heartRate}
            spO2={currentVitals.spO2}
            bloodPressureSys={currentVitals.bloodPressureSys}
            bloodPressureDia={currentVitals.bloodPressureDia}
            isCritical={isCritical}
          />

          {/* Vitals Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Heart Rate */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Heart Rate</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.heartRate > 100 || currentVitals.heartRate < 60
                    ? 'text-[#DC2626]'
                    : 'text-slate-900'
                }`}
              >
                {currentVitals.heartRate}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">bpm (60-100)</div>
            </div>

            {/* Blood Pressure */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Blood Pressure
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.bloodPressureSys < 90 || currentVitals.bloodPressureSys > 140
                    ? 'text-[#DC2626]'
                    : 'text-slate-900'
                }`}
              >
                {currentVitals.bloodPressureSys}/{currentVitals.bloodPressureDia}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                MAP {Math.round((2 * currentVitals.bloodPressureDia + currentVitals.bloodPressureSys) / 3)} mmHg
              </div>
            </div>

            {/* Oxygen Saturation */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                SpO2 Saturation
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.spO2 < 92 ? 'text-[#DC2626]' : 'text-slate-900'
                }`}
              >
                {currentVitals.spO2}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                {currentVitals.o2Delivery}
              </div>
            </div>

            {/* Respiration Rate */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Resp Rate
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.respRate > 22 || currentVitals.respRate < 10
                    ? 'text-[#DC2626]'
                    : 'text-slate-900'
                }`}
              >
                {currentVitals.respRate}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">breaths/min</div>
            </div>

            {/* Temperature */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Core Temp</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.temperature > 38.3 ? 'text-[#DC2626]' : 'text-slate-900'
                }`}
              >
                {currentVitals.temperature}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {(currentVitals.temperature * 1.8 + 32).toFixed(1)}°F (Normal 36.5-37.5)
              </div>
            </div>

            {/* Pain Scale */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-3 shadow-xs">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Pain Score
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                  currentVitals.painScore >= 6 ? 'text-[#DC2626]' : 'text-slate-900'
                }`}
              >
                {currentVitals.painScore}/10
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {currentVitals.painScore === 0 ? 'No Pain' : currentVitals.painScore <= 3 ? 'Mild' : currentVitals.painScore <= 6 ? 'Moderate' : 'Severe'}
              </div>
            </div>
          </div>

          {/* 24-Hour Vitals Flowsheet & Intake/Output Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#004357]" />
                  <span>24-Hour Vitals Flowsheet & Longitudinal Trend</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Q1H ICU Frequency</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 font-mono uppercase text-[10px] text-slate-600">
                      <th className="py-2 px-2.5">Time</th>
                      <th className="py-2 px-2.5">HR (bpm)</th>
                      <th className="py-2 px-2.5">BP (mmHg)</th>
                      <th className="py-2 px-2.5">SpO2</th>
                      <th className="py-2 px-2.5">RR</th>
                      <th className="py-2 px-2.5">Temp</th>
                      <th className="py-2 px-2.5">Pain</th>
                      <th className="py-2 px-2.5">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {patient.vitalsHistory.map((v, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2 px-2.5 font-bold text-slate-700">{v.timestamp}</td>
                        <td className={`py-2 px-2.5 tabular-nums ${v.heartRate > 100 ? 'text-[#DC2626] font-bold' : ''}`}>
                          {v.heartRate}
                        </td>
                        <td className={`py-2 px-2.5 tabular-nums ${v.bloodPressureSys < 90 ? 'text-[#DC2626] font-bold' : ''}`}>
                          {v.bloodPressureSys}/{v.bloodPressureDia}
                        </td>
                        <td className={`py-2 px-2.5 tabular-nums ${v.spO2 < 92 ? 'text-[#DC2626] font-bold' : ''}`}>
                          {v.spO2}%
                        </td>
                        <td className="py-2 px-2.5 tabular-nums">{v.respRate}</td>
                        <td className={`py-2 px-2.5 tabular-nums ${v.temperature > 38.3 ? 'text-[#DC2626] font-bold' : ''}`}>
                          {v.temperature}°C
                        </td>
                        <td className="py-2 px-2.5 tabular-nums">{v.painScore}/10</td>
                        <td className="py-2 px-2.5 text-slate-500 font-sans text-[11px]">{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fluid Intake & Output Balance Card */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5 mb-3">
                  <Droplets className="w-4 h-4 text-[#0284C7]" />
                  <span>Fluid Intake & Output (24h)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#eff4ff] border border-[#dce9ff]">
                    <span className="font-medium text-slate-700">IV Infusions & Boluses</span>
                    <span className="font-mono font-bold text-[#004357] tabular-nums">
                      {patient.fluidBalance.intakeIvMl} mL
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-700">Oral / Enteral Feeds</span>
                    <span className="font-mono font-bold text-slate-700 tabular-nums">
                      {patient.fluidBalance.intakePoMl} mL
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
                    <span className="font-medium text-amber-900">Urine Output (Foley)</span>
                    <span className="font-mono font-bold text-amber-900 tabular-nums">
                      {patient.fluidBalance.outputUrineMl} mL
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-700">Surgical Drains / NG</span>
                    <span className="font-mono font-bold text-slate-700 tabular-nums">
                      {patient.fluidBalance.outputDrainsMl} mL
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance Box */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Net 24-Hour Balance:</span>
                  <span
                    className={`font-mono text-base font-bold tabular-nums ${
                      patient.fluidBalance.net24hMl > 1000 ? 'text-[#DC2626]' : 'text-[#004357]'
                    }`}
                  >
                    {patient.fluidBalance.net24hMl > 0 ? `+${patient.fluidBalance.net24hMl}` : patient.fluidBalance.net24hMl} mL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Target: Maintain euvolemia during active vasopressor resuscitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MAR & INFUSIONS --- */}
      {activeTab === 'mar' && (
        <div className="space-y-4">
          {/* Section A: Continuous Smart Infusions */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#0284C7]" />
                <span>Continuous IV Infusions & Smart Pump Telemetry</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {patient.infusions.length} Active Lines
              </span>
            </div>

            {patient.infusions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No continuous infusions running.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patient.infusions.map((inf) => {
                  const percentLeft = Math.round((inf.bagRemainingMl / inf.totalBagMl) * 100);

                  return (
                    <div
                      key={inf.id}
                      className="border border-[#CBD5E1] rounded-lg p-3.5 bg-[#F8FAFC] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-headline font-bold text-sm text-[#0D1C2E] leading-snug">
                            {inf.name}
                          </h4>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              inf.status === 'Titrating'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {inf.status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-slate-500 font-sans">Infusion Rate:</span>
                            <span className="font-bold text-base text-[#004357] tabular-nums">
                              {inf.rate}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
                            <span className="font-sans">Concentration:</span>
                            <span>{inf.concentration}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
                            <span className="font-sans">Lumen/Line:</span>
                            <span className="truncate max-w-[150px]">{inf.line}</span>
                          </div>
                        </div>

                        {/* Volume Remaining Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                            <span>Bag Volume:</span>
                            <span>
                              {inf.bagRemainingMl} / {inf.totalBagMl} mL ({percentLeft}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                percentLeft < 20 ? 'bg-[#DC2626]' : 'bg-[#0284C7]'
                              }`}
                              style={{ width: `${percentLeft}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                        {inf.lastRateChange}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Scheduled Inpatient Medications */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#004357]" />
                  <span>Scheduled Inpatient Dosing Queue (BCMA Mandated)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bar Code Medication Administration protocol active with patient wristband verification
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                BCMA Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 font-mono uppercase text-[10px] text-slate-600">
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dose & Route</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Next Due</th>
                    <th className="py-2.5 px-3">Last Admin</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.scheduledMeds.map((med) => (
                    <tr key={med.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{med.name}</span>
                          {med.highAlert && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-900 border border-red-300 font-bold uppercase">
                              High Alert
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {med.dose} ({med.route})
                      </td>
                      <td className="py-3 px-3 text-slate-600">{med.frequency}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{med.nextDue}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{med.lastAdmin}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                            med.status === 'Due'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : med.status === 'Overdue'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : med.status === 'Given'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {med.status !== 'Given' ? (
                          <button
                            onClick={() => handleOpenAdminister(med.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                            <span>Scan & Give</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 text-xs font-semibold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Given
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C: PRN Medications */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
            <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5 mb-3">
              <Pill className="w-4 h-4 text-slate-500" />
              <span>PRN (As-Needed) Medications</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {patient.prnMeds.map((prn) => (
                <div
                  key={prn.id}
                  className="border border-[#CBD5E1] rounded-lg p-3 bg-[#F8FAFC] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{prn.name}</h4>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      {prn.dose} ({prn.route})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">Indication:</span> {prn.indication}
                    </div>
                    {prn.lastGiven && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Last Admin: {prn.lastGiven}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAdminister(prn.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-800 rounded-[0.25rem] transition-colors shrink-0"
                  >
                    Give PRN
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: LABS & DIAGNOSTICS --- */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-[#004357]" />
                  <span>Laboratory Panels & Biomarker Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified pathology laboratory assays with institutional reference intervals and critical delta flags
                </p>
              </div>

              <button
                onClick={() => setShowOrderModal(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order STAT Lab</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 font-mono uppercase text-[10px] text-slate-600">
                    <th className="py-2.5 px-3">Panel / Test</th>
                    <th className="py-2.5 px-3">Result Value</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Reference Interval</th>
                    <th className="py-2.5 px-3">Flag</th>
                    <th className="py-2.5 px-3">Collected</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {patient.labs.map((lab) => {
                    const isCriticalFlag = lab.flag === 'CRITICAL';
                    const isHighFlag = lab.flag === 'HIGH';
                    const isLowFlag = lab.flag === 'LOW';

                    return (
                      <tr
                        key={lab.id}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isCriticalFlag ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-semibold text-slate-900">{lab.testName}</div>
                          <div className="text-[10px] text-slate-500">{lab.category}</div>
                        </td>
                        <td
                          className={`py-2.5 px-3 font-bold text-sm tabular-nums ${
                            isCriticalFlag
                              ? 'text-[#DC2626]'
                              : isHighFlag
                              ? 'text-[#D97706]'
                              : isLowFlag
                              ? 'text-[#0284C7]'
                              : 'text-slate-800'
                          }`}
                        >
                          {lab.value}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{lab.unit || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-500">{lab.referenceRange}</td>
                        <td className="py-2.5 px-3">
                          {isCriticalFlag ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" /> CRITICAL
                            </span>
                          ) : isHighFlag ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]">
                              HIGH ▲
                            </span>
                          ) : isLowFlag ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#F0F9FF] text-[#075985] border border-[#7DD3FC]">
                              LOW ▼
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Normal</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{lab.collectedAt}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">{lab.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CLINICAL NOTES & ORDERS --- */}
      {activeTab === 'notes-orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column A: Clinical Notes (SOAP) */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#004357]" />
                  <span>Clinical Progress Notes (SOAP)</span>
                </h3>

                <button
                  onClick={() => setShowNoteModal(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              <div className="space-y-3">
                {patient.notes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-slate-200 rounded-lg p-3 bg-[#F8FAFC] text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-headline font-bold text-slate-900 block">
                          {note.title}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {note.author} ({note.role}) · {note.timestamp}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold uppercase">
                        {note.type}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed pt-1 border-t border-slate-200 font-sans whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column B: Active Physician Orders */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0284C7]" />
                  <span>Active Physician Orders</span>
                </h3>

                <button
                  onClick={() => setShowOrderModal(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enter Order</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {patient.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`border rounded-lg p-3 text-xs ${
                      ord.priority === 'STAT'
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-[#CBD5E1] bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                            ord.priority === 'STAT'
                              ? 'bg-red-600 text-white'
                              : ord.priority === 'Urgent'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {ord.priority}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {ord.category} · {ord.timestamp}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          ord.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 mt-1.5 font-sans">
                      {ord.orderText}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Ordered By: {ord.orderedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: ACTIVE ALERTS --- */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
            <h3 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <span>Clinical Decision Support & High-Priority Safety Alerts</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Actionable clinical alert banners with strict 4px left highlight bar
            </p>

            {patient.alerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded border border-slate-200">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Active Clinical Alerts</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  All biometric thresholds and laboratory safety invariants are satisfied.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patient.alerts.map((alert) => (
                  <AlertBanner
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={(id) => onAcknowledgeAlert(patient.id, id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Barcode Scan & Medication Administration Simulator */}
      {showAdministerModal && activeMed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0D1C2E] flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-[#004357]" />
                  <span>5 Rights BCMA Medication Verification</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Subject: {patient.lastName}, {patient.firstName} · MRN {patient.mrn}
                </p>
              </div>
              <button
                onClick={() => setShowAdministerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Med details box */}
            <div className="bg-[#eff4ff] border border-[#dce9ff] p-3 rounded-lg text-xs space-y-1">
              <div className="font-bold text-sm text-[#004357]">{activeMed.name}</div>
              <div className="font-mono text-slate-700">
                Dose: <span className="font-bold">{activeMed.dose}</span> · Route: <span className="font-bold">{activeMed.route}</span> · Frequency: {activeMed.frequency}
              </div>
              {activeMed.highAlert && (
                <div className="text-red-700 font-bold flex items-center gap-1 mt-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> High-Alert Drug: Independent Nurse Double-Check Mandatory
                </div>
              )}
            </div>

            {/* Barcode scanner steps */}
            <div className="space-y-3 text-xs">
              <div className="border border-slate-200 p-3 rounded bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Step 1: Scan Patient Wristband</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Verifies Barcode: {patient.mrn}
                  </div>
                </div>
                <button
                  onClick={handleScanWristband}
                  className={`px-3 py-1.5 rounded text-xs font-semibold ${
                    scannedWristband
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#004357] text-white hover:bg-[#0d5c75]'
                  }`}
                >
                  {scannedWristband ? '✓ Wristband Verified' : 'Scan Wristband'}
                </button>
              </div>

              <div className="border border-slate-200 p-3 rounded bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Step 2: Scan Medication Vial / Bag</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Verifies NDC Barcode & Lot Expiration
                  </div>
                </div>
                <button
                  disabled={!scannedWristband}
                  onClick={handleScanMedication}
                  className={`px-3 py-1.5 rounded text-xs font-semibold ${
                    scannedMedication
                      ? 'bg-emerald-600 text-white'
                      : scannedWristband
                      ? 'bg-[#004357] text-white hover:bg-[#0d5c75]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {scannedMedication ? '✓ Med NDC Verified' : 'Scan Med Barcode'}
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nurse Badge PIN Verification:
                </label>
                <input
                  type="password"
                  placeholder="Enter 4-digit Nurse PIN"
                  value={nursePin}
                  onChange={(e) => setNursePin(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administration Comment (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Infused via Left Peripheral IV #1"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowAdministerModal(false)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
              >
                Cancel
              </button>
              <button
                disabled={!scannedWristband || !scannedMedication || !nursePin}
                onClick={handleConfirmAdminister}
                className={`px-4 py-2 text-xs font-semibold rounded-[0.25rem] transition-colors ${
                  scannedWristband && scannedMedication && nursePin
                    ? 'bg-[#004357] hover:bg-[#0d5c75] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Sign & Administer Dose
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Clinical Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNote}
            className="bg-white border border-[#CBD5E1] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0D1C2E]">
                  Write Clinical Note
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: {patient.lastName}, {patient.firstName} ({patient.mrn})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Type:</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as ClinicalNote['type'])}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="SOAP">SOAP Progress Note</option>
                  <option value="Nursing Shift">Nursing Shift Handover</option>
                  <option value="Attending Rounds">Attending Rounds Note</option>
                  <option value="Consult">Specialist Consult</option>
                  <option value="Procedure">Procedure Note</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Care Afternoon Hemodynamic Re-evaluation"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Note Content (SOAP format):
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="S: Subjective symptoms reported by patient or bedside RN...&#10;O: Objective vitals, physical exam, current drips, and labs...&#10;A: Clinical assessment and differential diagnosis...&#10;P: Care plan, diagnostic orders, and titration targets..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] shadow-xs"
              >
                Sign & Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Enter Physician Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveOrder}
            className="bg-white border border-[#CBD5E1] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0D1C2E]">
                  Enter Physician Clinical Order
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Ordering Clinician: Dr. Elena Vance, MD · Critical Care
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority:</label>
                  <select
                    value={orderPriority}
                    onChange={(e) => setOrderPriority(e.target.value as PhysicianOrder['priority'])}
                    className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-semibold text-red-700"
                  >
                    <option value="STAT">STAT (Immediate Execution)</option>
                    <option value="Urgent">Urgent (&lt; 2 Hours)</option>
                    <option value="Routine">Routine (Next Ward Cycle)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={orderCategory}
                    onChange={(e) => setOrderCategory(e.target.value as PhysicianOrder['category'])}
                    className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="Medication">Medication Order</option>
                    <option value="Lab">Laboratory / Blood Gas</option>
                    <option value="Radiology">Radiology / Imaging</option>
                    <option value="Respiratory">Respiratory / Ventilator</option>
                    <option value="Nursing">Nursing Intervention</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Details:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. STAT ABG and Repeat Serum Potassium in 2 hours. Notify Intensivist if K+ remains > 5.2 mEq/L."
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  className="w-full p-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] shadow-xs"
              >
                Electronically Sign & Transmit Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
