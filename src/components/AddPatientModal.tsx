import React, { useState } from 'react';
import { UserPlus, X, Check, AlertTriangle, ShieldCheck, Heart, Stethoscope, Bed, Plus, Trash2 } from 'lucide-react';
import { Patient, PatientStatus, AcuityLevel, CodeStatus, Allergy } from '../types/clinical';
import { clinicalAudio } from '../utils/audio';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
  existingBeds: string[];
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
  existingBeds,
}) => {
  // Identification
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1975-05-15');
  const [sex, setSex] = useState<'M' | 'F' | 'Other'>('M');
  const [mrn, setMrn] = useState(`MRN-${Math.floor(1000000 + Math.random() * 9000000)}`);

  // Bed & Ward
  const [ward, setWard] = useState<Patient['ward']>('ICU');
  const [roomBed, setRoomBed] = useState('ICU-05A');
  const [attending, setAttending] = useState('Dr. Elena Vance, MD (Critical Care)');
  const [nurse, setNurse] = useState('Nurse Rachel Kim, RN');

  // Clinical Diagnosis & Status
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState('Hypertension, Hyperlipidemia');
  const [status, setStatus] = useState<PatientStatus>('Admitted');
  const [acuity, setAcuity] = useState<AcuityLevel>('Acuity 3 - Urgent');
  const [codeStatus, setCodeStatus] = useState<CodeStatus>('FULL CODE');
  const [isolation, setIsolation] = useState<Patient['isolation']>('None');
  const [fallRisk, setFallRisk] = useState<Patient['fallRisk']>('Moderate');
  const [diet, setDiet] = useState<Patient['dietStatus']>('Regular');

  // Initial Vitals
  const [hr, setHr] = useState('78');
  const [bpSys, setBpSys] = useState('124');
  const [bpDia, setBpDia] = useState('80');
  const [spo2, setSpo2] = useState('98');
  const [rr, setRr] = useState('16');
  const [temp, setTemp] = useState('37.0');
  const [pain, setPain] = useState(2);
  const [o2Delivery, setO2Delivery] = useState('Room Air');

  // Allergies list
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [allergySubstance, setAllergySubstance] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');

  if (!isOpen) return null;

  const handleAddAllergy = () => {
    if (!allergySubstance.trim()) return;
    setAllergies([
      ...allergies,
      {
        substance: allergySubstance.trim(),
        reaction: allergyReaction.trim() || 'Rash / Urticaria',
        severity: 'moderate',
      },
    ]);
    setAllergySubstance('');
    setAllergyReaction('');
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970) || 45;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !primaryDiagnosis.trim()) return;

    const age = calculateAge(dob);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toISOString().slice(0, 10);

    const newPatient: Patient = {
      id: `pt-${Date.now()}`,
      mrn: mrn.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age,
      sex,
      dob,
      roomBed: roomBed.trim(),
      ward,
      admissionDate: `${nowDate} ${nowTime}`,
      attendingPhysician: attending,
      primaryNurse: nurse,
      primaryDiagnosis: primaryDiagnosis.trim(),
      secondaryDiagnoses: secondaryDiagnoses
        ? secondaryDiagnoses.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      codeStatus,
      allergies,
      isolation,
      fallRisk,
      dietStatus: diet,
      status,
      acuity,
      currentVitals: {
        heartRate: Number(hr) || 75,
        bloodPressureSys: Number(bpSys) || 120,
        bloodPressureDia: Number(bpDia) || 80,
        spO2: Number(spo2) || 98,
        respRate: Number(rr) || 16,
        temperature: Number(temp) || 37.0,
        painScore: pain,
        o2Delivery,
        timestamp: 'Just now',
        trend: 'stable',
      },
      vitalsHistory: [
        {
          timestamp: nowTime,
          heartRate: Number(hr) || 75,
          bloodPressureSys: Number(bpSys) || 120,
          bloodPressureDia: Number(bpDia) || 80,
          spO2: Number(spo2) || 98,
          respRate: Number(rr) || 16,
          temperature: Number(temp) || 37.0,
          painScore: pain,
          o2Delivery,
          recordedBy: nurse,
        },
      ],
      labs: [
        {
          id: `lab-${Date.now()}-1`,
          category: 'Metabolic (CMP)',
          testName: 'Basic Metabolic Panel (Admission)',
          value: 'Pending',
          unit: '',
          referenceRange: 'Standard',
          status: 'Pending',
          collectedAt: nowTime,
        },
      ],
      infusions: [],
      scheduledMeds: [],
      prnMeds: [
        {
          id: `prn-${Date.now()}-1`,
          name: 'Acetaminophen (Tylenol)',
          dose: '650 mg',
          route: 'Oral',
          indication: 'Mild pain or fever > 38.0°C',
          maxDaily: '3000 mg/24h',
          status: 'Available',
        },
      ],
      notes: [
        {
          id: `note-${Date.now()}`,
          timestamp: nowTime,
          author: attending,
          role: 'Attending Physician',
          title: 'Initial Inpatient Admission & History/Physical (H&P)',
          type: 'SOAP',
          content: `S: Patient admitted to ${ward} Bed ${roomBed} under care of ${attending}. Primary complaint: ${primaryDiagnosis}.\nO: Initial vitals HR ${hr}, BP ${bpSys}/${bpDia}, SpO2 ${spo2}%, Temp ${temp}°C. Exam unremarkable except for acute findings related to primary diagnosis.\nA: ${primaryDiagnosis}.\nP: Admit to ${ward}. Standard admission orders, telemetry monitoring, baseline labs sent.`,
        },
      ],
      orders: [
        {
          id: `ord-${Date.now()}`,
          timestamp: nowTime,
          orderText: `Admit to ${ward} Bed ${roomBed}. Continuous ECG and SpO2 telemetry monitoring. Routine vitals Q4H.`,
          priority: 'Routine',
          category: 'Nursing',
          orderedBy: attending,
          status: 'Active',
        },
      ],
      alerts:
        status === 'Critical'
          ? [
              {
                id: `alt-${Date.now()}`,
                severity: 'Critical',
                title: 'High Acuity Inpatient Bedside Surveillance',
                instruction: 'Patient admitted with Critical status. Intensivist evaluation and arterial line verification required.',
                timestamp: 'Just now',
                acknowledged: false,
              },
            ]
          : [],
      fluidBalance: {
        intakeIvMl: 0,
        intakePoMl: 0,
        outputUrineMl: 0,
        outputDrainsMl: 0,
        net24hMl: 0,
      },
    };

    clinicalAudio.playScanSuccess();
    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#CBD5E1] rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#004357] text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-[#0D1C2E]">
                Inpatient Bed Admission & Triage Registration
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Station 4B Electronic Health Record Entry · System Form ADM-101
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Admission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#004357] mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>1. Patient Demographics & Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miller"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biological Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'M' | 'F' | 'Other')}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Bed Assignment & Clinical Triage */}
          <div>
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#004357] mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>2. Ward Assignment & Clinical Triage</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ward Unit</label>
                <select
                  value={ward}
                  onChange={(e) => {
                    const w = e.target.value as Patient['ward'];
                    setWard(w);
                    if (w === 'ICU') setRoomBed('ICU-05A');
                    if (w === 'Med-Surg 3B') setRoomBed('3B-18');
                    if (w === 'Step-Down Cardiology') setRoomBed('StepDown-10');
                    if (w === 'Emergency') setRoomBed('ED-06');
                  }}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="Step-Down Cardiology">Step-Down Cardiology</option>
                  <option value="Med-Surg 3B">Med-Surg 3B</option>
                  <option value="Emergency">Emergency Department</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Bed # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU-05A"
                  value={roomBed}
                  onChange={(e) => setRoomBed(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-[#004357] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Triage Status Tier</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PatientStatus)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-[#004357] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="Critical">Critical (Immediate Care)</option>
                  <option value="Observation">Observation (Telemetry)</option>
                  <option value="Admitted">Admitted (Inpatient)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acuity Level</label>
                <select
                  value={acuity}
                  onChange={(e) => setAcuity(e.target.value as AcuityLevel)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="Acuity 1 - Resuscitation">Acuity 1 - Resuscitation</option>
                  <option value="Acuity 2 - Emergent">Acuity 2 - Emergent</option>
                  <option value="Acuity 3 - Urgent">Acuity 3 - Urgent</option>
                  <option value="Acuity 4 - Less Urgent">Acuity 4 - Less Urgent</option>
                </select>
              </div>
            </div>

            {/* Diagnosis Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Admitting Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Coronary Syndrome (NSTEMI)"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Secondary Diagnoses / PMHx
                </label>
                <input
                  type="text"
                  placeholder="Comma-separated e.g. T2D, COPD, Chronic Kidney Disease"
                  value={secondaryDiagnoses}
                  onChange={(e) => setSecondaryDiagnoses(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Admission Vitals */}
          <div>
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#004357] mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>3. Baseline Vital Signs Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">HR bpm</label>
                <input
                  type="number"
                  required
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">BP Sys</label>
                <input
                  type="number"
                  required
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">BP Dia</label>
                <input
                  type="number"
                  required
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">SpO2 %</label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">RR /min</label>
                <input
                  type="number"
                  required
                  value={rr}
                  onChange={(e) => setRr(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Temp °C</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full h-[34px] px-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Safety & Allergies Profile */}
          <div>
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#004357] mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>4. Safety Profile & Drug Allergies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Status</label>
                <select
                  value={codeStatus}
                  onChange={(e) => setCodeStatus(e.target.value as CodeStatus)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-bold"
                >
                  <option value="FULL CODE">FULL CODE</option>
                  <option value="DNR / DNI">DNR / DNI</option>
                  <option value="DNR (Comfort Care)">DNR (Comfort Care)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diet Orders</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value as Patient['dietStatus'])}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="Regular">Regular Diet</option>
                  <option value="NPO">NPO (Nil Per Os)</option>
                  <option value="Clear Liquids">Clear Liquids</option>
                  <option value="Cardiac Low-Sodium">Cardiac Low-Sodium</option>
                  <option value="Diabetic">Diabetic / Consistent Carb</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isolation Precautions</label>
                <select
                  value={isolation}
                  onChange={(e) => setIsolation(e.target.value as Patient['isolation'])}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="None">None (Standard Precautions)</option>
                  <option value="Contact">Contact Isolation</option>
                  <option value="Droplet">Droplet Isolation</option>
                  <option value="Airborne">Airborne Isolation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fall Risk Assessment</label>
                <select
                  value={fallRisk}
                  onChange={(e) => setFallRisk(e.target.value as Patient['fallRisk'])}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="High">High Fall Risk</option>
                </select>
              </div>
            </div>

            {/* Allergies Builder */}
            <div className="mt-3 bg-[#F8FAFC] border border-slate-200 p-2.5 rounded">
              <label className="block font-semibold text-slate-700 mb-1">
                Known Drug Allergies & Adverse Reactions:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Substance e.g. Penicillin, Codeine"
                  value={allergySubstance}
                  onChange={(e) => setAllergySubstance(e.target.value)}
                  className="flex-1 h-[34px] px-2.5 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Reaction e.g. Anaphylaxis"
                  value={allergyReaction}
                  onChange={(e) => setAllergyReaction(e.target.value)}
                  className="flex-1 h-[34px] px-2.5 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-1.5 bg-[#004357] text-white rounded text-xs font-semibold hover:bg-[#0d5c75]"
                >
                  Add Allergy
                </button>
              </div>

              {allergies.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {allergies.map((a, i) => (
                    <span
                      key={i}
                      className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>{a.substance} ({a.reaction})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(i)}
                        className="text-red-500 hover:text-red-700 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors shadow-xs flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Check className="w-4 h-4" />
              <span>Complete Inpatient Admission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
