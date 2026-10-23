import React, { useState } from 'react';
import { Activity, Check, AlertTriangle, ShieldCheck, Heart, Thermometer, User, Bed, ArrowRight } from 'lucide-react';
import { Patient, VitalSignReading } from '../types/clinical';

interface BedsideVitalsEntryProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSaveVitals: (patientId: string, reading: VitalSignReading) => void;
  onBackToOverview: () => void;
}

export const BedsideVitalsEntry: React.FC<BedsideVitalsEntryProps> = ({
  patients,
  selectedPatientId,
  onSaveVitals,
  onBackToOverview,
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || patients[0]?.id || ''
  );

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Vitals form inputs
  const [hr, setHr] = useState<string>(activePatient ? String(activePatient.currentVitals.heartRate) : '75');
  const [bpSys, setBpSys] = useState<string>(activePatient ? String(activePatient.currentVitals.bloodPressureSys) : '120');
  const [bpDia, setBpDia] = useState<string>(activePatient ? String(activePatient.currentVitals.bloodPressureDia) : '80');
  const [spo2, setSpo2] = useState<string>(activePatient ? String(activePatient.currentVitals.spO2) : '98');
  const [rr, setRr] = useState<string>(activePatient ? String(activePatient.currentVitals.respRate) : '16');
  const [temp, setTemp] = useState<string>(activePatient ? String(activePatient.currentVitals.temperature) : '37.0');
  const [pain, setPain] = useState<number>(activePatient ? activePatient.currentVitals.painScore : 0);
  const [o2Method, setO2Method] = useState<string>(activePatient ? activePatient.currentVitals.o2Delivery : 'Room Air');
  const [nurseName, setNurseName] = useState<string>('Nurse Rachel Kim, RN');
  const [successToast, setSuccessToast] = useState<boolean>(false);

  // When patient selection changes, load their latest readings
  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    const p = patients.find((pat) => pat.id === id);
    if (p) {
      setHr(String(p.currentVitals.heartRate));
      setBpSys(String(p.currentVitals.bloodPressureSys));
      setBpDia(String(p.currentVitals.bloodPressureDia));
      setSpo2(String(p.currentVitals.spO2));
      setRr(String(p.currentVitals.respRate));
      setTemp(String(p.currentVitals.temperature));
      setPain(p.currentVitals.painScore);
      setO2Method(p.currentVitals.o2Delivery);
    }
  };

  // Calculate Modified Early Warning Score (MEWS)
  const calculateMEWS = () => {
    let score = 0;
    const numHr = Number(hr) || 0;
    const numSys = Number(bpSys) || 0;
    const numRr = Number(rr) || 0;
    const numTemp = Number(temp) || 0;

    // HR scoring
    if (numHr <= 40 || numHr >= 130) score += 3;
    else if (numHr >= 111 && numHr <= 129) score += 2;
    else if ((numHr >= 41 && numHr <= 50) || (numHr >= 101 && numHr <= 110)) score += 1;

    // Systolic BP scoring
    if (numSys <= 70) score += 3;
    else if (numSys <= 80) score += 2;
    else if (numSys <= 100 || numSys >= 200) score += 1;

    // Resp Rate scoring
    if (numRr <= 8 || numRr >= 30) score += 3;
    else if (numRr >= 21 && numRr <= 29) score += 2;
    else if (numRr >= 15 && numRr <= 20) score += 1;

    // Temperature scoring
    if (numTemp < 35.0 || numTemp >= 38.5) score += 2;

    return score;
  };

  const mewsScore = calculateMEWS();
  const isHighRisk = mewsScore >= 5;
  const isModerateRisk = mewsScore >= 3 && mewsScore < 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    const newReading: VitalSignReading = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: Number(hr),
      bloodPressureSys: Number(bpSys),
      bloodPressureDia: Number(bpDia),
      spO2: Number(spo2),
      respRate: Number(rr),
      temperature: Number(temp),
      painScore: pain,
      o2Delivery: o2Method,
      recordedBy: nurseName,
    };

    onSaveVitals(activePatient.id, newReading);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Breadcrumb & Patient Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-headline font-bold text-lg text-[#0D1C2E] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0D5C75]" />
              <span>Bedside Clinical Vitals Entry & MEWS Calculator</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              High-efficiency bedside entry with instant MEWS early-warning risk scoring
            </p>
          </div>

          <button
            onClick={onBackToOverview}
            className="text-xs font-semibold text-[#0D5C75] hover:text-[#0A475B] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Return to Ward Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Patient Selection Bar */}
        <div className="mt-4 pt-3 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Bed / Patient:</label>
            <select
              value={activePatientId}
              onChange={(e) => handleSelectPatient(e.target.value)}
              className="w-full h-[40px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  Bed {p.roomBed} — {p.lastName}, {p.firstName} ({p.mrn}) · {p.ward}
                </option>
              ))}
            </select>
          </div>

          {activePatient && (
            <div className="bg-[#eff4ff] border border-[#dce9ff] p-2.5 rounded-[0.25rem] text-xs">
              <div className="font-bold text-[#0D5C75] flex items-center justify-between">
                <span>{activePatient.lastName}, {activePatient.firstName} ({activePatient.roomBed})</span>
                <span className="font-mono text-[11px] text-slate-600">{activePatient.mrn}</span>
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5">
                Dx: {activePatient.primaryDiagnosis}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Entry Form & MEWS Dashboard */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Ergonomic 44px Touch Form Fields */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="font-headline font-bold text-sm text-[#0D1C2E] border-b border-slate-200 pb-2">
            Acute Biometrics Input
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heart Rate (bpm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="250"
                  required
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  bpm
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Normal: 60 - 100 bpm</p>
            </div>

            {/* Blood Pressure (Sys / Dia) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Pressure (Systolic / Diastolic)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="40"
                    max="280"
                    placeholder="Sys"
                    required
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                    Sys
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="180"
                    placeholder="Dia"
                    required
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                    Dia
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Normal: 90-130 / 60-85 mmHg</p>
            </div>

            {/* SpO2 Saturation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oxygen Saturation (SpO2 %)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Normal: &ge; 95% on room air</p>
            </div>

            {/* Respiration Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Respiratory Rate (breaths/min)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="4"
                  max="60"
                  required
                  value={rr}
                  onChange={(e) => setRr(e.target.value)}
                  className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  /min
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Normal: 12 - 20 bpm</p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="32.0"
                  max="43.0"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-sm font-bold font-mono focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  °C
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Normal: 36.5 - 37.5°C</p>
            </div>

            {/* O2 Delivery Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oxygen Delivery Device
              </label>
              <select
                value={o2Method}
                onChange={(e) => setO2Method(e.target.value)}
                className="w-full h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-[0.25rem] text-xs font-medium focus:outline-none focus:border-[#0284C7]"
              >
                <option value="Room Air">Room Air (Ambient)</option>
                <option value="1L Nasal Cannula">1L Nasal Cannula</option>
                <option value="2L Nasal Cannula">2L Nasal Cannula</option>
                <option value="4L Nasal Cannula">4L Nasal Cannula</option>
                <option value="Non-Rebreather Mask (15L)">Non-Rebreather Mask (15L)</option>
                <option value="High Flow Nasal Cannula (HFNC)">High Flow Nasal Cannula (HFNC)</option>
                <option value="BiPAP / CPAP Mask">BiPAP / CPAP Mask</option>
                <option value="Mechanical Vent (Intubated)">Mechanical Vent (Intubated)</option>
              </select>
            </div>
          </div>

          {/* Pain Scale (0 to 10 slider + buttons) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Wong-Baker / Numeric Pain Scale:
              </label>
              <span className="font-mono font-bold text-sm text-[#0D5C75]">
                {pain} / 10 ({pain === 0 ? 'No Pain' : pain <= 3 ? 'Mild' : pain <= 6 ? 'Moderate' : 'Severe'})
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setPain(score)}
                  className={`h-9 rounded-[0.25rem] text-xs font-bold font-mono transition-colors ${
                    pain === score
                      ? score >= 7
                        ? 'bg-[#DC2626] text-white shadow-xs'
                        : score >= 4
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'bg-[#0D5C75] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Signoff & Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Signed by: {nurseName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-[#0D5C75] hover:bg-[#0A475B] text-white rounded-[0.25rem] transition-colors shadow-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>Save & Sync to Chart</span>
              </button>
            </div>
          </div>

          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-[0.25rem] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Vitals successfully recorded to patient electronic flowsheet and synchronized.</span>
            </div>
          )}
        </div>

        {/* Right Col: MEWS Early Warning Score Calculation Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="font-headline font-bold text-sm text-[#0D1C2E]">
                MEWS Scorecard
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Automated Clinical Rules
              </span>
            </div>

            {/* Score Display Banner */}
            <div
              className={`p-4 rounded-lg text-center border ${
                isHighRisk
                  ? 'bg-[#FEF2F2] border-[#F87171] text-[#991B1B]'
                  : isModerateRisk
                  ? 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]'
                  : 'bg-[#F0F9FF] border-[#7DD3FC] text-[#075985]'
              }`}
            >
              <div className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Modified Early Warning Score
              </div>
              <div className="text-4xl font-bold font-mono my-1 tabular-nums">
                {mewsScore}
              </div>
              <div className="text-xs font-bold uppercase tracking-wide">
                {isHighRisk
                  ? 'High Deterioration Risk'
                  : isModerateRisk
                  ? 'Medium Acuity Observation'
                  : 'Low Risk — Stable'}
              </div>
            </div>

            {/* Protocol Action Triggered by MEWS */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-700">Mandated Action Protocol:</div>
              {isHighRisk ? (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-900 text-[11px] leading-relaxed">
                  <strong className="block font-bold">MEWS &ge; 5 Trigger:</strong>
                  1. Notify Attending Physician STAT.
                  <br />
                  2. Consider Rapid Response Team (RRT) activation.
                  <br />
                  3. Increase vitals frequency to Q15min.
                </div>
              ) : isModerateRisk ? (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <strong className="block font-bold">MEWS 3-4 Trigger:</strong>
                  1. Notify Charge Nurse.
                  <br />
                  2. Increase vitals monitoring to Q1H.
                  <br />
                  3. Review fluid balance and active titrations.
                </div>
              ) : (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  Standard ward monitoring cycle active. No acute clinical intervention required at this time.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
            Institution Algorithm: RCP National Early Warning Score (NEWS2) & MEWS Protocol.
          </div>
        </div>
      </form>
    </div>
  );
};
