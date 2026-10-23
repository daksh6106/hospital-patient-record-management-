import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Activity, Gauge, Sliders, ShieldCheck } from 'lucide-react';
import { clinicalAudio } from '../utils/audio';

interface LiveWaveformProps {
  heartRate: number;
  spO2: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  isCritical?: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  heartRate,
  spO2,
  bloodPressureSys,
  bloodPressureDia,
  isCritical = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [sweepSpeed, setSweepSpeed] = useState<number>(2); // 1 = 25mm/s, 2 = 50mm/s
  const [activeLead, setActiveLead] = useState<'II' | 'V5'>('II');
  const [ecgGain, setEcgGain] = useState<number>(1.0); // 10 mm/mV

  // Calculate Mean Arterial Pressure (MAP)
  const map = Math.round((2 * bloodPressureDia + bloodPressureSys) / 3);

  // Dynamic rhythm interpretation
  const rhythmDiagnosis =
    heartRate > 115
      ? 'Sinus Tachycardia (ST Elevation/Peaked T-wave evaluation)'
      : heartRate < 55
      ? 'Sinus Bradycardia'
      : 'Normal Sinus Rhythm (NSR)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;

    // Base background
    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, width, height);

    let beatProgress = 0;
    // Frames per cardiac cycle at ~60fps
    const beatLength = Math.max(22, Math.round((60 / Math.max(30, heartRate)) * 60));

    let prevY_ecg = height * 0.28;
    let prevY_pleth = height * 0.65;
    let prevY_art = height * 0.88;

    let lastBeepFrame = 0;

    const render = () => {
      if (!isRunning) return;

      const step = sweepSpeed;
      const nextX = (x + step) % width;

      // Erase bar ahead of cursor (standard medical sweep bar effect)
      ctx.fillStyle = '#060d16';
      ctx.fillRect(nextX, 0, 20, height);

      // Redraw medical calibrated grid
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;
      for (let gx = nextX; gx < nextX + 20; gx++) {
        if (gx % 25 === 0) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }
      }
      for (let gy = 0; gy < height; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(nextX, gy);
        ctx.lineTo(nextX + 20, gy);
        ctx.stroke();
      }
      ctx.restore();

      const phase = (beatProgress % beatLength) / beatLength;

      // 1. Realistic ECG Lead II Waveform
      const ecgBaseline = height * 0.28;
      let ecgOffset = 0;

      // Calibration pulse at x = 0-15
      if (x < 15) {
        ecgOffset = -35 * ecgGain; // 1 mV standard cal square
      } else if (phase > 0.06 && phase < 0.15) {
        // P-wave
        ecgOffset = -10 * Math.sin(((phase - 0.06) / 0.09) * Math.PI) * ecgGain;
      } else if (phase >= 0.17 && phase < 0.19) {
        // Q dip
        ecgOffset = 5 * ecgGain;
      } else if (phase >= 0.19 && phase < 0.23) {
        // R spike
        ecgOffset = -62 * ecgGain;

        // Trigger pulse audio beep at the apex of R-wave once per beat
        if (beatProgress - lastBeepFrame > beatLength * 0.8) {
          clinicalAudio.playHeartBeep(spO2);
          lastBeepFrame = beatProgress;
        }
      } else if (phase >= 0.23 && phase < 0.26) {
        // S dip
        ecgOffset = 16 * ecgGain;
      } else if (phase >= 0.34 && phase < 0.52) {
        // T-wave (slightly peaked if critical / hyperkalemic)
        const tAmp = isCritical ? 24 : 16;
        ecgOffset = -tAmp * Math.sin(((phase - 0.34) / 0.18) * Math.PI) * ecgGain;
      } else {
        // Physiological baseline micro-drift
        ecgOffset = (Math.random() - 0.5) * 1.0;
      }
      const y_ecg = ecgBaseline + ecgOffset;

      // 2. Pleth / SpO2 Pulse Waveform
      const plethBaseline = height * 0.63;
      const plethPhase = (phase + 0.14) % 1.0;
      let plethOffset = 0;
      if (plethPhase < 0.42) {
        const p = plethPhase / 0.42;
        plethOffset = -30 * Math.sin(p * Math.PI) * Math.exp(-p * 1.3);
        if (p > 0.45 && p < 0.65) {
          plethOffset += 5; // Dicrotic notch
        }
      }
      const y_pleth = plethBaseline + plethOffset;

      // 3. Arterial Line Waveform
      const artBaseline = height * 0.89;
      const artPhase = (phase + 0.12) % 1.0;
      let artOffset = 0;
      if (artPhase < 0.44) {
        const ap = artPhase / 0.44;
        const pulsePressure = Math.min(36, (bloodPressureSys - bloodPressureDia) * 0.65);
        artOffset = -pulsePressure * Math.sin(ap * Math.PI) * Math.exp(-ap * 1.4);
        if (ap > 0.38 && ap < 0.58) {
          artOffset += 7; // Precise dicrotic notch
        }
      }
      const y_art = artBaseline + artOffset;

      // Render ECG Trace
      ctx.beginPath();
      ctx.strokeStyle = isCritical ? '#f87171' : '#22c55e'; // Clean diagnostic green or alert red
      ctx.lineWidth = 1.75;
      ctx.shadowColor = isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)';
      ctx.shadowBlur = 2;
      ctx.moveTo(x, prevY_ecg);
      ctx.lineTo(nextX, y_ecg);
      ctx.stroke();

      // Render Pleth SpO2 Trace
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.3)';
      ctx.shadowBlur = 2;
      ctx.moveTo(x, prevY_pleth);
      ctx.lineTo(nextX, y_pleth);
      ctx.stroke();

      // Render Arterial Pressure Trace
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
      ctx.shadowBlur = 2;
      ctx.moveTo(x, prevY_art);
      ctx.lineTo(nextX, y_art);
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      prevY_ecg = y_ecg;
      prevY_pleth = y_pleth;
      prevY_art = y_art;
      x = nextX;
      beatProgress++;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, spO2, bloodPressureSys, bloodPressureDia, isRunning, sweepSpeed, ecgGain, isCritical]);

  return (
    <div className="bg-[#050b12] text-slate-100 rounded-lg border border-slate-800 p-3.5 shadow-sm">
      {/* Top Monitor Status & Calibration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/90 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wider uppercase text-emerald-400 font-bold">
              ECG Lead {activeLead}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              10mm/mV (1mV Cal Standard)
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Rhythm:</span>
            <span className={`font-semibold ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>
              {rhythmDiagnosis}
            </span>
          </div>
        </div>

        {/* Telemetry Monitor Action Controls */}
        <div className="flex items-center gap-2">
          {/* Lead Selector */}
          <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setActiveLead('II')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLead === 'II' ? 'bg-[#0d5c75] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lead II
            </button>
            <button
              onClick={() => setActiveLead('V5')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLead === 'V5' ? 'bg-[#0d5c75] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lead V5
            </button>
          </div>

          {/* Gain Selector */}
          <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setEcgGain(0.5)}
              className={`px-2 py-0.5 rounded transition-colors ${
                ecgGain === 0.5 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => setEcgGain(1.0)}
              className={`px-2 py-0.5 rounded transition-colors ${
                ecgGain === 1.0 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => setEcgGain(1.5)}
              className={`px-2 py-0.5 rounded transition-colors ${
                ecgGain === 1.5 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1.5x
            </button>
          </div>

          {/* Sweep Speed */}
          <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setSweepSpeed(1)}
              className={`px-2 py-0.5 rounded transition-colors ${
                sweepSpeed === 1 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              25mm/s
            </button>
            <button
              onClick={() => setSweepSpeed(2)}
              className={`px-2 py-0.5 rounded transition-colors ${
                sweepSpeed === 2 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              50mm/s
            </button>
          </div>

          {/* Freeze / Live Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-[11px] font-bold font-mono transition-colors shadow-xs ${
              isRunning
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3" /> FREEZE
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> LIVE
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas & Digital Parameter Readout Split */}
      <div className="relative mt-2 flex flex-col md:flex-row gap-3 bg-[#03070d] p-2 rounded border border-slate-900">
        <div className="flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            width={860}
            height={220}
            className="w-full h-[210px] block cursor-crosshair"
          />
          <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-900">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> ECG Lead {activeLead} (ST: +0.02 mV)
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Pleth SpO2 (PI 3.4%)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-0.5 bg-amber-400 inline-block" /> Arterial Line (Zeroed & Dampened)
              </span>
            </div>
            <span>Sweep: {sweepSpeed === 1 ? '25' : '50'} mm/s</span>
          </div>
        </div>

        {/* Digital Telemetry Column (Philips IntelliVue Style) */}
        <div className="w-full md:w-44 shrink-0 bg-[#060e18] p-3 rounded border border-slate-800 flex flex-row md:flex-col justify-between gap-2 font-mono">
          {/* HR */}
          <div className="border-b border-slate-800/80 pb-2">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
              <span>HR bpm</span>
              <span className="text-slate-500 text-[9px]">60-100</span>
            </div>
            <div className={`text-3xl font-bold tabular-nums leading-tight ${
              heartRate > 100 || heartRate < 55 ? 'text-rose-400' : 'text-emerald-300'
            }`}>
              {heartRate}
            </div>
            <div className="text-[9px] text-slate-400">Sinus rhythm</div>
          </div>

          {/* SpO2 */}
          <div className="border-b border-slate-800/80 pb-2">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
              <span>SpO2 %</span>
              <span className="text-slate-500 text-[9px]">&gt;94</span>
            </div>
            <div className={`text-3xl font-bold tabular-nums leading-tight ${
              spO2 < 92 ? 'text-rose-400' : 'text-cyan-300'
            }`}>
              {spO2}%
            </div>
            <div className="text-[9px] text-slate-400">Pleth good quality</div>
          </div>

          {/* ART Line BP & MAP */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
              <span>ART mmHg</span>
              <span className="text-slate-500 text-[9px]">MAP &gt;65</span>
            </div>
            <div className={`text-2xl font-bold tabular-nums leading-tight ${
              bloodPressureSys < 90 ? 'text-rose-400' : 'text-amber-300'
            }`}>
              {bloodPressureSys}/{bloodPressureDia}
            </div>
            <div className="text-[10px] text-amber-200/90 font-bold">
              MAP: <span className="text-white text-xs">{map}</span> mmHg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
