import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  User, 
  Hospital, 
  Volume2, 
  VolumeX, 
  Clock, 
  Search, 
  Activity, 
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Wifi,
  UserPlus,
  Radio
} from 'lucide-react';
import { clinicalAudio } from '../utils/audio';

export type NavigationTab = 
  | 'ward-overview' 
  | 'central-telemetry'
  | 'patient-chart' 
  | 'bedside-entry' 
  | 'mar-infusions' 
  | 'active-alerts' 
  | 'shift-handover';

interface ClinicianHeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onTriggerCodeBlue: () => void;
  onOpenAdmitModal: () => void;
  criticalAlertsCount: number;
  activePatientName?: string;
}

export const ClinicianHeader: React.FC<ClinicianHeaderProps> = ({
  activeTab,
  onSelectTab,
  onTriggerCodeBlue,
  onOpenAdmitModal,
  criticalAlertsCount,
  activePatientName,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    clinicalAudio.setMuted(!nextState);
    if (nextState) {
      clinicalAudio.playScanSuccess();
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 bg-[#004357] border-b border-[#003444] text-white shadow-xs">
      {/* Top Clinical Station Micro-Bar */}
      <div className="bg-[#002e3c] border-b border-[#003b4d] px-4 sm:px-6 py-1 text-[11px] text-cyan-200/80">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              METROPOLITAN ACUTE HEALTH SYSTEM
            </span>
            <span className="text-cyan-400/50">|</span>
            <span className="hidden md:inline text-cyan-300">Station 4B: Critical Care & Telemetry</span>
            <span className="text-cyan-400/50 hidden md:inline">|</span>
            <span className="hidden lg:inline text-slate-300">Continuous Central Surveillance</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                audioEnabled
                  ? 'bg-cyan-800 text-cyan-100 border border-cyan-500/40'
                  : 'text-cyan-400/70 hover:text-cyan-100 hover:bg-cyan-900/40'
              }`}
              title={audioEnabled ? 'Telemetry audio cues enabled' : 'Muted (Click to enable pulse & scanner audio)'}
            >
              {audioEnabled ? <Volume2 className="w-3 h-3 text-cyan-300" /> : <VolumeX className="w-3 h-3" />}
              <span>{audioEnabled ? 'Audio: ON' : 'Audio: Muted'}</span>
            </button>

            {/* Live Clock & Shift Progress */}
            <div className="flex items-center gap-1.5 text-cyan-100">
              <Clock className="w-3 h-3 text-cyan-300" />
              <span className="tabular-nums font-bold">{formattedTime}</span>
              <span className="text-[10px] text-cyan-300/80 hidden sm:inline">(Day Shift 07:00-19:00)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row adhering strictly to the Top Bar Contract */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-[0.25rem] bg-[#0d5c75] border border-cyan-400/30 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <Hospital className="w-4 h-4 text-cyan-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-lg tracking-tight text-white">
              Clinical Clarity
            </span>
            <span className="text-[10px] font-mono font-medium text-cyan-300/80 uppercase tracking-widest bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
              EHR
            </span>
          </div>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('ward-overview')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'ward-overview'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            Ward Beds
          </button>

          <button
            onClick={() => onSelectTab('central-telemetry')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'central-telemetry'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Central Telemetry</span>
          </button>

          <button
            onClick={() => onSelectTab('patient-chart')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'patient-chart'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            <span>Patient Charts</span>
            {activePatientName && (
              <span className="text-[10px] bg-cyan-950/50 text-cyan-200 px-1.5 py-0.2 rounded font-mono hidden xl:inline-block max-w-[110px] truncate">
                {activePatientName}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('bedside-entry')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'bedside-entry'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            Bedside Entry
          </button>

          <button
            onClick={() => onSelectTab('mar-infusions')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'mar-infusions'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            MAR & Infusions
          </button>

          <button
            onClick={() => onSelectTab('active-alerts')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'active-alerts'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            <span>Active Alerts</span>
            {criticalAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {criticalAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('shift-handover')}
            className={`px-3 py-1.5 rounded-[0.25rem] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'shift-handover'
                ? 'bg-white text-[#004357] font-bold shadow-xs'
                : 'text-cyan-50/90 hover:bg-[#0d5c75] hover:text-white'
            }`}
          >
            Shift SBAR
          </button>
        </nav>

        {/* Zone 3: Admit Patient & Emergency Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAdmitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d5c75] hover:bg-[#0b4d63] text-white text-xs font-semibold rounded-[0.25rem] transition-colors border border-cyan-400/30 shadow-xs whitespace-nowrap"
            title="Admit new patient to ward bed"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Admit Patient</span>
            <span className="sm:hidden">Admit</span>
          </button>

          <button
            onClick={onTriggerCodeBlue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-[0.25rem] transition-colors shadow-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#004357] whitespace-nowrap"
            title="Hospital Emergency Resuscitation Protocol"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Code Blue</span>
            <span className="sm:hidden">Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
