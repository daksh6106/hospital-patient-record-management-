import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, Pause, RotateCcw, Zap, Syringe, Clock, UserCheck, X, Check, Activity, Volume2, VolumeX } from 'lucide-react';
import { Patient } from '../types/clinical';
import { clinicalAudio } from '../utils/audio';

interface EmergencyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

export const EmergencyCodeModal: React.FC<EmergencyCodeModalProps> = ({
  isOpen,
  onClose,
  patients,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [cprCycleSeconds, setCprCycleSeconds] = useState<number>(120); // 2-min cycle
  const [epiSecondsRemaining, setEpiSecondsRemaining] = useState<number>(180); // 3-min epi timer
  const [isActive, setIsActive] = useState<boolean>(true);
  const [shockCount, setShockCount] = useState<number>(0);
  const [selectedJoules, setSelectedJoules] = useState<number>(200);
  const [events, setEvents] = useState<Array<{ time: string; text: string }>>([
    { time: '00:00', text: 'Code Blue Initiated. CPR Commenced.' },
  ]);

  // Code team roles
  const [teamLead, setTeamLead] = useState('Dr. Elena Vance, MD');
  const [compressor, setCompressor] = useState('Nurse Jamal Brooks, RN');
  const [airway, setAirway] = useState('Respiratory Therapist Derek Lin');
  const [medNurse, setMedNurse] = useState('Nurse Rachel Kim, RN');

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setCprCycleSeconds((prev) => {
        if (prev <= 1) {
          clinicalAudio.playAlertChime();
          return 120;
        }
        return prev - 1;
      });
      setEpiSecondsRemaining((prev) => {
        if (prev <= 1) {
          clinicalAudio.playAlertChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isActive]);

  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAdministerEpi = () => {
    setEpiSecondsRemaining(240); // Reset to 4 min
    clinicalAudio.playScanSuccess();
    setEvents((prev) => [
      { time: formatTime(elapsedSeconds), text: 'Epinephrine 1mg IV Push administered + 20mL NS flush.' },
      ...prev,
    ]);
  };

  const handleDeliverShock = () => {
    const currentShock = shockCount + 1;
    setShockCount(currentShock);
    clinicalAudio.playScanSuccess();
    setEvents((prev) => [
      { time: formatTime(elapsedSeconds), text: `Defibrillator Shock #${currentShock} (${selectedJoules}J Biphasic) delivered. Immediately resumed chest compressions.` },
      ...prev,
    ]);
  };

  const handleLogRhythm = (rhythm: string) => {
    setEvents((prev) => [
      { time: formatTime(elapsedSeconds), text: `Rhythm Check: ${rhythm}. Pulse check completed.` },
      ...prev,
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b1320] text-slate-100 border-2 border-red-600 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-xl text-white tracking-wide uppercase flex items-center gap-2">
                <span>Code Blue Emergency Resuscitation Suite</span>
                <span className="text-xs bg-red-600/90 text-white px-2 py-0.5 rounded font-mono font-bold">
                  ACLS 2026 Active
                </span>
              </h2>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                Hospital Cardiac Arrest & Resuscitation Workstation · Station 4B
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Selection Bar */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Resuscitation Subject:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold rounded px-2.5 py-1 focus:outline-none focus:border-red-500 font-mono"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  Bed {p.roomBed} — {p.lastName}, {p.firstName} ({p.mrn}) · {p.codeStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 font-bold">
              {selectedPatient.codeStatus}
            </span>
            <span className="text-slate-400">
              Allergies: {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.map(a => a.substance).join(', ') : 'None'}
            </span>
          </div>
        </div>

        {/* Timers & Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Master Resuscitation Elapsed Timer */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg text-center">
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>Total Code Time</span>
            </div>
            <div className="text-4xl font-bold font-mono text-white mt-1 tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">Elapsed Stopwatch</div>
          </div>

          {/* 2-Minute CPR Cycle Countdown */}
          <div
            className={`border p-4 rounded-lg text-center transition-colors ${
              cprCycleSeconds <= 15
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}
          >
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>2-Min CPR Cycle</span>
            </div>
            <div className="text-4xl font-bold font-mono text-amber-300 mt-1 tabular-nums">
              {formatTime(cprCycleSeconds)}
            </div>
            <div className="text-[11px] font-mono mt-1">
              {cprCycleSeconds <= 15 ? 'PAUSE COMPRESSIONS / RHYTHM CHECK' : 'Compressions @ 100-120/min'}
            </div>
          </div>

          {/* Epinephrine 3-5min Timer */}
          <div
            className={`border p-4 rounded-lg text-center ${
              epiSecondsRemaining === 0
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}
          >
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Syringe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Epinephrine 1mg Due</span>
            </div>
            <div className="text-4xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
              {formatTime(epiSecondsRemaining)}
            </div>
            <div className="text-[11px] font-mono mt-1 font-bold">
              {epiSecondsRemaining === 0 ? 'DUE NOW (Q3-5 MIN)' : 'Next interval countdown'}
            </div>
          </div>
        </div>

        {/* Rapid Clinical Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedJoules}
              onChange={(e) => setSelectedJoules(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-amber-300 font-bold font-mono text-xs rounded p-3 focus:outline-none"
            >
              <option value={120}>120J</option>
              <option value={150}>150J</option>
              <option value={200}>200J (Max)</option>
            </select>
            <button
              onClick={handleDeliverShock}
              className="flex-1 p-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Shock #{shockCount + 1} ({selectedJoules}J)</span>
            </button>
          </div>

          <button
            onClick={handleAdministerEpi}
            className="p-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Syringe className="w-5 h-5" />
            <span>Give Epinephrine 1mg IV</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLogRhythm('Ventricular Fibrillation (VF)')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors text-xs text-center border border-slate-700"
            >
              VF / Pulseless VT
            </button>
            <button
              onClick={() => handleLogRhythm('PEA / Asystole')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors text-xs text-center border border-slate-700"
            >
              PEA / Asystole
            </button>
          </div>
        </div>

        {/* Roles & Real-Time Event Audit Log (2 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
          {/* Roles */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[11px] flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resuscitation Team Assignments</span>
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Team Leader:</span>
                <span className="font-semibold text-white">{teamLead}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Chest Compressions:</span>
                <span className="font-semibold text-white">{compressor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Airway / Bag-Valve:</span>
                <span className="font-semibold text-white">{airway}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Medications & Access:</span>
                <span className="font-semibold text-white">{medNurse}</span>
              </div>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[11px] mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>ACLS Code Event Log</span>
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px] pr-1">
                {events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-cyan-400 font-bold shrink-0">{ev.time}</span>
                    <span className="leading-tight">{ev.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            ACLS Cardiac Arrest Algorithm Active · Automatic Event Audit
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clinicalAudio.playScanSuccess();
                setEvents((prev) => [
                  { time: formatTime(elapsedSeconds), text: 'ROSC Achieved (Return of Spontaneous Circulation). Post-cardiac arrest care initiated.' },
                  ...prev,
                ]);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors"
            >
              Document ROSC Achieved
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded text-xs transition-colors"
            >
              Stand Down / Close Suite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
