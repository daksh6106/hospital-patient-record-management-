import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Maximize2, 
  Check, 
  Sliders, 
  Grid, 
  Layout, 
  ShieldAlert, 
  Filter, 
  Heart,
  Droplets,
  Radio
} from 'lucide-react';
import { Patient } from '../types/clinical';
import { StatusBadge } from './StatusBadge';
import { clinicalAudio } from '../utils/audio';

interface CentralStationMonitoringProps {
  patients: Patient[];
  onOpenPatientChart: (patientId: string) => void;
  onAcknowledgeAlert: (patientId: string, alertId: string) => void;
}

interface MiniMonitorChannelProps {
  patient: Patient;
  onOpenChart: (patientId: string) => void;
  onSilence: (patientId: string) => void;
}

const MiniMonitorChannel: React.FC<MiniMonitorChannelProps> = ({
  patient,
  onOpenChart,
  onSilence,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSilenced, setIsSilenced] = useState(false);
  const vitals = patient.currentVitals;
  const isCritical = patient.status === 'Critical';
  const hasUnackAlert = patient.alerts.some((a) => !a.acknowledged);

  const map = Math.round((2 * vitals.bloodPressureDia + vitals.bloodPressureSys) / 3);

  // Realistic continuous sweep wave on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#050a12';
    ctx.fillRect(0, 0, width, height);

    let beatProgress = 0;
    const beatLength = Math.max(18, Math.round((60 / Math.max(35, vitals.heartRate)) * 60));
    let prevY = height * 0.5;

    const render = () => {
      const step = 2;
      const nextX = (x + step) % width;

      // Erase ahead
      ctx.fillStyle = '#050a12';
      ctx.fillRect(nextX, 0, 14, height);

      // Grid line
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      for (let gx = nextX; gx < nextX + 14; gx++) {
        if (gx % 20 === 0) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }
      }
      ctx.restore();

      const phase = (beatProgress % beatLength) / beatLength;
      const baseline = height * 0.52;
      let offset = 0;

      if (phase > 0.08 && phase < 0.16) {
        offset = -7 * Math.sin(((phase - 0.08) / 0.08) * Math.PI);
      } else if (phase >= 0.18 && phase < 0.20) {
        offset = 4;
      } else if (phase >= 0.20 && phase < 0.24) {
        offset = -38; // R spike
      } else if (phase >= 0.24 && phase < 0.27) {
        offset = 12;
      } else if (phase >= 0.35 && phase < 0.52) {
        offset = -(isCritical ? 16 : 10) * Math.sin(((phase - 0.35) / 0.17) * Math.PI);
      } else {
        offset = (Math.random() - 0.5) * 1.0;
      }

      const y = baseline + offset;

      ctx.beginPath();
      ctx.strokeStyle = isCritical ? '#f87171' : '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, prevY);
      ctx.lineTo(nextX, y);
      ctx.stroke();

      prevY = y;
      x = nextX;
      beatProgress++;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [vitals.heartRate, isCritical]);

  const handleToggleSilence = () => {
    setIsSilenced(!isSilenced);
    clinicalAudio.playScanSuccess();
    onSilence(patient.id);
  };

  return (
    <div
      className={`rounded-lg bg-[#060c16] border text-slate-100 flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
        isCritical && hasUnackAlert
          ? 'border-red-500 ring-1 ring-red-500/60 animate-pulse'
          : isCritical
          ? 'border-red-800'
          : 'border-slate-800'
      }`}
    >
      {/* Channel Header */}
      <div className="bg-[#0b1424] px-3 py-2 border-b border-slate-800/90 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50">
            Bed {patient.roomBed}
          </span>
          <span className="font-sans font-bold text-white text-xs truncate max-w-[130px]">
            {patient.lastName}, {patient.firstName[0]}.
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">{patient.mrn}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusBadge status={patient.status} className="scale-90" />
          <button
            onClick={() => onOpenChart(patient.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Expand Single Bed Monitor"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Waveform Canvas & Numbers */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        {/* Waveform Left (2 Cols) */}
        <div className="sm:col-span-2 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ECG Lead II
            </span>
            <span>ST: +0.02 mV</span>
          </div>
          <canvas
            ref={canvasRef}
            width={380}
            height={90}
            className="w-full h-[85px] block rounded bg-[#03070e] border border-slate-900"
          />
          {patient.infusions.length > 0 && (
            <div className="text-[10px] text-cyan-400 font-mono mt-1 truncate">
              Drip: {patient.infusions[0].name} ({patient.infusions[0].rate})
            </div>
          )}
        </div>

        {/* Real-time Biometric Readout (1 Col) */}
        <div className="bg-[#0a121f] p-2.5 rounded border border-slate-800/80 font-mono space-y-1.5 text-right">
          <div>
            <div className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold">HR bpm</div>
            <div
              className={`text-2xl font-bold tabular-nums leading-none ${
                vitals.heartRate > 100 || vitals.heartRate < 55 ? 'text-rose-400 font-extrabold' : 'text-emerald-300'
              }`}
            >
              {vitals.heartRate}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">SpO2 %</div>
            <div
              className={`text-xl font-bold tabular-nums leading-none ${
                vitals.spO2 < 92 ? 'text-rose-400 font-extrabold' : 'text-cyan-300'
              }`}
            >
              {vitals.spO2}%
            </div>
          </div>

          <div>
            <div className="text-[9px] text-amber-400 uppercase tracking-wider font-semibold">BP (MAP)</div>
            <div className="text-sm font-bold tabular-nums text-amber-300 leading-none">
              {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
            </div>
            <div className="text-[9px] text-slate-400">MAP {map}</div>
          </div>
        </div>
      </div>

      {/* Alarm Status & Silence Action */}
      <div className="bg-[#040810] px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          {hasUnackAlert ? (
            <span className="text-rose-400 text-[11px] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Alarm Active</span>
            </span>
          ) : (
            <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Telemetry Normal</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSilence}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
              isSilenced
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isSilenced ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isSilenced ? 'Silenced (2m)' : 'Silence'}</span>
          </button>

          <button
            onClick={() => onOpenChart(patient.id)}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#004357] hover:bg-[#0d5c75] text-white transition-colors"
          >
            Chart &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export const CentralStationMonitoring: React.FC<CentralStationMonitoringProps> = ({
  patients,
  onOpenPatientChart,
  onAcknowledgeAlert,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [layoutMode, setLayoutMode] = useState<'4-quad' | '6-hex' | 'all'>('6-hex');
  const [globalMuted, setGlobalMuted] = useState(false);

  const wards = ['All', 'ICU', 'Step-Down Cardiology', 'Med-Surg 3B', 'Emergency'];

  const filteredPatients = patients.filter((p) => {
    if (selectedWard === 'All') return true;
    return p.ward === selectedWard;
  });

  const displayCount = layoutMode === '4-quad' ? 4 : layoutMode === '6-hex' ? 6 : filteredPatients.length;
  const displayPatients = filteredPatients.slice(0, displayCount);

  const toggleGlobalMute = () => {
    const next = !globalMuted;
    setGlobalMuted(next);
    clinicalAudio.setMuted(next);
  };

  return (
    <div className="space-y-4">
      {/* Central Station Master Banner */}
      <div className="bg-[#050b14] text-white border border-slate-800 rounded-lg p-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#004357] border border-cyan-500/40 flex items-center justify-center text-cyan-200">
              <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg text-white flex items-center gap-2">
                <span>Central Telemetry Patient Monitoring Console</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                  Multi-Bed Live Telemetry
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Station 4B · Multi-Channel Continuous Waveforms & Arrhythmia Surveillance
              </p>
            </div>
          </div>

          {/* Monitoring Controls & Layout Selector */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            {/* Unit Filter */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              {wards.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWard(w)}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    selectedWard === w
                      ? 'bg-[#004357] text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Layout Mode (Quad vs Hex vs All) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => setLayoutMode('4-quad')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  layoutMode === '4-quad' ? 'bg-[#004357] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                4-Quad
              </button>
              <button
                onClick={() => setLayoutMode('6-hex')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  layoutMode === '6-hex' ? 'bg-[#004357] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                6-Hex
              </button>
              <button
                onClick={() => setLayoutMode('all')}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  layoutMode === 'all' ? 'bg-[#004357] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Beds ({filteredPatients.length})
              </button>
            </div>

            {/* Global Silence Alarm Button */}
            <button
              onClick={toggleGlobalMute}
              className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
                globalMuted
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {globalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
              <span>{globalMuted ? 'Telemetry Muted' : 'Audio Live'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Channel Waveform Monitor Grid */}
      <div className={`grid gap-3 ${
        layoutMode === '4-quad'
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {displayPatients.map((patient) => (
          <MiniMonitorChannel
            key={patient.id}
            patient={patient}
            onOpenChart={onOpenPatientChart}
            onSilence={(id) => {
              const activeUnack = patient.alerts.find((a) => !a.acknowledged);
              if (activeUnack) {
                onAcknowledgeAlert(id, activeUnack.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
