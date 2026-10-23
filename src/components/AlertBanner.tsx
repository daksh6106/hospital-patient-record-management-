import React from 'react';
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { ClinicalAlert } from '../types/clinical';

interface AlertBannerProps {
  alert: ClinicalAlert;
  onAcknowledge?: (id: string) => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onAcknowledge, className = '' }) => {
  const isCritical = alert.severity === 'Critical';
  const isObservation = alert.severity === 'Observation';

  // Left highlight bar: 4px solid matching severity color
  const borderLeftColor = isCritical ? 'border-l-[#DC2626]' : isObservation ? 'border-l-[#D97706]' : 'border-l-[#0284C7]';
  const bgColor = isCritical ? 'bg-[#FEF2F2]' : isObservation ? 'bg-[#FFFBEB]' : 'bg-[#F0F9FF]';
  const borderColor = isCritical ? 'border-[#FCA5A5]' : isObservation ? 'border-[#FDE68A]' : 'border-[#BAE6FD]';
  const titleColor = isCritical ? 'text-[#991B1B]' : isObservation ? 'text-[#92400E]' : 'text-[#075985]';
  const textColor = isCritical ? 'text-[#7F1D1D]' : isObservation ? 'text-[#78350F]' : 'text-[#0C4A6E]';

  return (
    <div
      className={`border border-l-4 ${borderLeftColor} ${bgColor} ${borderColor} p-3 rounded-sm flex items-start justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          ) : isObservation ? (
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          ) : (
            <Info className="w-4 h-4 text-[#0284C7]" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${titleColor}`}>
              {alert.severity} Alert
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {alert.timestamp}
            </span>
            {alert.acknowledged && (
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <Check className="w-3 h-3" /> Acknowledged
              </span>
            )}
          </div>
          <p className={`text-sm font-semibold mt-0.5 ${titleColor}`}>
            {alert.title}
          </p>
          <p className={`text-xs mt-0.5 leading-relaxed ${textColor}`}>
            {alert.instruction}
          </p>
        </div>
      </div>

      {!alert.acknowledged && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-[0.25rem] transition-colors ${
            isCritical
              ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
              : isObservation
              ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
              : 'bg-[#0D5C75] hover:bg-[#0A475B] text-white'
          }`}
        >
          Acknowledge
        </button>
      )}
    </div>
  );
};
