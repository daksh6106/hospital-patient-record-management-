import React, { useState } from 'react';
import { LogOut, ArrowRightLeft, X, Check, Bed, User, ShieldCheck } from 'lucide-react';
import { Patient, PatientStatus } from '../types/clinical';
import { clinicalAudio } from '../utils/audio';

interface TransferDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onTransferPatient: (patientId: string, newWard: Patient['ward'], newBed: string) => void;
  onDischargePatient: (patientId: string, disposition: string, instructions: string) => void;
}

export const TransferDischargeModal: React.FC<TransferDischargeModalProps> = ({
  isOpen,
  onClose,
  patient,
  onTransferPatient,
  onDischargePatient,
}) => {
  const [activeMode, setActiveMode] = useState<'transfer' | 'discharge'>('transfer');

  // Transfer state
  const [targetWard, setTargetWard] = useState<Patient['ward']>('Step-Down Cardiology');
  const [targetBed, setTargetBed] = useState('StepDown-12');
  const [transferReason, setTransferReason] = useState('Hemodynamically stable, extubated, ready for step-down telemetry.');

  // Discharge state
  const [disposition, setDisposition] = useState('Home with Outpatient Follow-up');
  const [dischargeInstructions, setDischargeInstructions] = useState(
    'Continue home medications as prescribed. Avoid strenuous lifting > 10 lbs for 2 weeks. Follow up with Cardiology clinic in 7-10 days. Return to ED immediately if fever > 38.3°C, shortness of breath, or chest discomfort recurs.'
  );

  if (!isOpen) return null;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    clinicalAudio.playScanSuccess();
    onTransferPatient(patient.id, targetWard, targetBed);
    onClose();
  };

  const handleExecuteDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    clinicalAudio.playScanSuccess();
    onDischargePatient(patient.id, disposition, dischargeInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#CBD5E1] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-headline font-bold text-base text-[#0D1C2E] flex items-center gap-2">
              {activeMode === 'transfer' ? (
                <>
                  <ArrowRightLeft className="w-5 h-5 text-[#004357]" />
                  <span>Bed Transfer Order & Unit Handoff</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 text-emerald-700" />
                  <span>Inpatient Discharge Disposition</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Patient: {patient.lastName}, {patient.firstName} · Bed {patient.roomBed} ({patient.mrn})
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-[#F1F5F9] border border-slate-200 rounded p-1 text-xs">
          <button
            onClick={() => setActiveMode('transfer')}
            className={`flex-1 py-1.5 rounded font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'transfer'
                ? 'bg-white text-[#004357] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Internal Bed Transfer</span>
          </button>

          <button
            onClick={() => setActiveMode('discharge')}
            className={`flex-1 py-1.5 rounded font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'discharge'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Discharge Encounter</span>
          </button>
        </div>

        {/* Transfer Mode Form */}
        {activeMode === 'transfer' ? (
          <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
            <div className="bg-[#eff4ff] border border-[#dce9ff] p-3 rounded text-slate-700 space-y-1">
              <div className="font-bold text-[#004357]">Current Bed Assignment:</div>
              <div className="font-mono text-xs">
                {patient.ward} · Room {patient.roomBed}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Ward Unit:</label>
                <select
                  value={targetWard}
                  onChange={(e) => {
                    const w = e.target.value as Patient['ward'];
                    setTargetWard(w);
                    if (w === 'ICU') setTargetBed('ICU-06');
                    if (w === 'Step-Down Cardiology') setTargetBed('StepDown-12');
                    if (w === 'Med-Surg 3B') setTargetBed('3B-20');
                  }}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="Step-Down Cardiology">Step-Down Cardiology</option>
                  <option value="Med-Surg 3B">Med-Surg 3B</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="Emergency">Emergency Holding</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned New Bed #:</label>
                <input
                  type="text"
                  required
                  value={targetBed}
                  onChange={(e) => setTargetBed(e.target.value)}
                  className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-mono font-bold text-[#004357] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Transfer Rationale:</label>
              <textarea
                required
                rows={3}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Bed Transfer</span>
              </button>
            </div>
          </form>
        ) : (
          /* Discharge Mode Form */
          <form onSubmit={handleExecuteDischarge} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discharge Disposition:</label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7] font-semibold"
              >
                <option value="Home with Outpatient Follow-up">Home with Outpatient Follow-up</option>
                <option value="Home Health Nursing Care">Home Health Nursing Care</option>
                <option value="Skilled Nursing Facility (SNF)">Skilled Nursing Facility (SNF)</option>
                <option value="Acute Inpatient Rehabilitation">Acute Inpatient Rehabilitation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discharge Instructions & Medication Reconciliation:
              </label>
              <textarea
                required
                rows={4}
                value={dischargeInstructions}
                onChange={(e) => setDischargeInstructions(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-emerald-900 text-[11px] leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>All outpatient prescriptions and discharge paperwork will be signed and transmitted.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] hover:bg-slate-100 text-slate-700 rounded-[0.25rem]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-[0.25rem] shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalize Patient Discharge</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
