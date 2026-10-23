import React, { useState } from 'react';
import { FileText, Copy, Printer, Check, Users, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Patient } from '../types/clinical';
import { StatusBadge } from './StatusBadge';

interface ShiftHandoverProps {
  patients: Patient[];
  onOpenPatientChart: (patientId: string) => void;
}

export const ShiftHandover: React.FC<ShiftHandoverProps> = ({
  patients,
  onOpenPatientChart,
}) => {
  const [copied, setCopied] = useState(false);
  const [shiftLead, setShiftLead] = useState('Dr. Elena Vance, MD / Nurse Rachel Kim, RN');
  const [handoverNote, setHandoverNote] = useState(
    'Day Shift handover report. Bed ICU-04 (Marcus Chen) remains high-acuity on dual vasopressors, repeat lactate scheduled for 10:00. Bed ED-03 awaiting ICU transfer bed assignment for DKA protocol.'
  );

  const generateSbarText = () => {
    let report = `CLINICAL CLARITY — SBAR CLINICAL SHIFT HANDOVER REPORT\n`;
    report += `Station: Acute Care Ward · Station 4B\n`;
    report += `Date/Time: ${new Date().toLocaleString()}\n`;
    report += `Outgoing Clinicians: ${shiftLead}\n`;
    report += `General Ward Handoff Notes: ${handoverNote}\n`;
    report += `----------------------------------------------------------\n\n`;

    patients.forEach((p, idx) => {
      const v = p.currentVitals;
      const abnormalLabs = p.labs.filter((l) => l.flag === 'CRITICAL' || l.flag === 'HIGH');
      const infusions = p.infusions.map((i) => `${i.name} @ ${i.rate}`).join(', ');

      report += `[PATIENT ${idx + 1}] BED ${p.roomBed} — ${p.lastName}, ${p.firstName} (${p.mrn})\n`;
      report += `S (Situation): ${p.age}yo ${p.sex}, Admitted: ${p.admissionDate}. Status: ${p.status}. Code: ${p.codeStatus}. Primary Dx: ${p.primaryDiagnosis}.\n`;
      report += `B (Background): PMHx: ${p.secondaryDiagnoses.join('; ')}. Allergies: ${p.allergies.length > 0 ? p.allergies.map((a) => a.substance).join(', ') : 'NKDA'}. Diet: ${p.dietStatus}. Isolation: ${p.isolation}.\n`;
      report += `A (Assessment): Vitals: HR ${v.heartRate}, BP ${v.bloodPressureSys}/${v.bloodPressureDia}, SpO2 ${v.spO2}% (${v.o2Delivery}), RR ${v.respRate}, Temp ${v.temperature}°C. 24h Net Fluid: ${p.fluidBalance.net24hMl} mL. Infusions: ${infusions || 'None'}. Abnormal Labs: ${abnormalLabs.map((l) => `${l.testName} ${l.value} (${l.flag})`).join(', ') || 'Within Normal Limits'}.\n`;
      report += `R (Recommendation): ${p.orders.filter((o) => o.status === 'Active').map((o) => o.orderText).join('; ') || 'Continue current clinical trajectory'}.\n\n`;
    });

    return report;
  };

  const handleCopy = () => {
    const text = generateSbarText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Handover Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-headline font-bold text-lg text-[#0D1C2E] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0D5C75]" />
              <span>Shift Handover / SBAR Clinical Handoff Tool</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized Situation, Background, Assessment & Recommendation format for nurse-to-nurse and physician rounds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold bg-[#0D5C75] hover:bg-[#0A475B] text-white rounded-[0.25rem] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SBAR' : 'Copy SBAR'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-50 text-slate-700 rounded-[0.25rem] transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Global Shift Summary Editor */}
        <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Station 4B Shift Overview & Lead Handoff Notes:
          </label>
          <textarea
            rows={2}
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs text-slate-800 focus:outline-none focus:border-[#0284C7] font-sans"
          />
        </div>
      </div>

      {/* SBAR Patient Feed */}
      <div className="space-y-4">
        {patients.map((p) => {
          const v = p.currentVitals;
          const abnormalLabs = p.labs.filter((l) => l.flag === 'CRITICAL' || l.flag === 'HIGH');
          const isCritical = p.status === 'Critical';

          return (
            <div
              key={p.id}
              className={`bg-white border rounded-lg p-4 shadow-xs space-y-3 ${
                isCritical
                  ? 'border-l-4 border-l-[#DC2626] border-[#FCA5A5]'
                  : 'border-[#E2E8F0]'
              }`}
            >
              {/* Patient Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0D5C75] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                    {p.roomBed}
                  </span>
                  <h3 className="font-headline font-bold text-base text-[#0D1C2E]">
                    {p.lastName}, {p.firstName}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {p.age}y {p.sex} · MRN {p.mrn}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <button
                    onClick={() => onOpenPatientChart(p.id)}
                    className="text-xs font-semibold text-[#0D5C75] hover:underline"
                  >
                    View Chart &rarr;
                  </button>
                </div>
              </div>

              {/* SBAR 4-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* S - Situation */}
                <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
                  <div className="font-headline font-bold text-[#0D5C75] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#0D5C75] text-white flex items-center justify-center text-[10px] font-mono">S</span>
                    <span>Situation</span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900 leading-snug">{p.primaryDiagnosis}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Admitted: {p.admissionDate}</p>
                    <p className="text-[11px] font-medium text-slate-800">Code: {p.codeStatus}</p>
                    <p className="text-[11px] text-slate-600">MD: {p.attendingPhysician}</p>
                  </div>
                </div>

                {/* B - Background */}
                <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
                  <div className="font-headline font-bold text-[#0284C7] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-mono">B</span>
                    <span>Background</span>
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <p><strong className="text-slate-800">PMHx:</strong> {p.secondaryDiagnoses.join(', ')}</p>
                    <p className="font-bold text-red-700">
                      Allergies: {p.allergies.length > 0 ? p.allergies.map((a) => a.substance).join(', ') : 'None'}
                    </p>
                    <p>Diet: {p.dietStatus} · Fall Risk: {p.fallRisk}</p>
                    {p.isolation !== 'None' && <p className="text-amber-800 font-semibold">Iso: {p.isolation}</p>}
                  </div>
                </div>

                {/* A - Assessment */}
                <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
                  <div className="font-headline font-bold text-[#0F766E] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-mono">A</span>
                    <span>Assessment</span>
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span>HR {v.heartRate} bpm</span>
                      <span>BP {v.bloodPressureSys}/{v.bloodPressureDia}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SpO2 {v.spO2}%</span>
                      <span>Temp {v.temperature}°C</span>
                    </div>
                    <div className="text-slate-600 font-sans truncate">
                      O2: {v.o2Delivery}
                    </div>
                    {p.infusions.length > 0 && (
                      <p className="font-bold text-[#0D5C75] truncate">
                        Pump: {p.infusions[0].name} ({p.infusions[0].rate})
                      </p>
                    )}
                    {abnormalLabs.length > 0 && (
                      <p className="text-red-700 font-bold truncate">
                        Abnormal: {abnormalLabs.map((l) => `${l.testName} ${l.value}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* R - Recommendation */}
                <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
                  <div className="font-headline font-bold text-purple-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-mono">R</span>
                    <span>Recommendation</span>
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px]">
                    {p.orders.length > 0 ? (
                      <ul className="list-disc pl-3.5 space-y-1 text-slate-800">
                        {p.orders.slice(0, 2).map((ord) => (
                          <li key={ord.id} className="leading-tight">
                            <span className="font-bold text-red-600 font-mono">[{ord.priority}]</span> {ord.orderText}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">Continue standard inpatient clinical pathway.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
