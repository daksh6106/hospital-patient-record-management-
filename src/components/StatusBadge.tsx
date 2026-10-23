import React from 'react';
import { PatientStatus } from '../types/clinical';

interface StatusBadgeProps {
  status: PatientStatus;
  className?: string;
}

/**
 * Status Badges specification from Clinical Clarity:
 * - Pill-shaped (rounded-full), compact height (22px), uppercase label-sm tracking with high legibility.
 * - Critical: Light crimson fill (#FEF2F2), solid crimson text (#991B1B), subtle border (#F87171). Includes a mandatory solid dot indicator (#DC2626).
 * - Observation: Warm amber fill (#FFFBEB), amber text (#92400E), border (#FCD34D).
 * - Admitted: Clinical cyan tint fill (#F0F9FF), rich cyan text (#075985), border (#7DD3FC).
 * - Discharged: Soft emerald fill (#ECFDF5), emerald text (#065F46), border (#6EE7B7).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" aria-hidden="true" />
          <span>Critical</span>
        </span>
      );
    case 'Observation':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] ${className}`}
        >
          <span>Observation</span>
        </span>
      );
    case 'Admitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#F0F9FF] text-[#075985] border border-[#7DD3FC] ${className}`}
        >
          <span>Admitted</span>
        </span>
      );
    case 'Discharged':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#ECFDF5] text-[#065F46] border border-[#6EE7B7] ${className}`}
        >
          <span>Discharged</span>
        </span>
      );
    default:
      return null;
  }
};
