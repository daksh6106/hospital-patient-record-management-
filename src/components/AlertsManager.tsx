import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, Filter, ArrowRight } from 'lucide-react';
import { Patient, ClinicalAlert } from '../types/clinical';
import { AlertBanner } from './AlertBanner';

interface AlertsManagerProps {
  patients: Patient[];
  onAcknowledgeAlert: (patientId: string, alertId: string) => void;
  onOpenPatientChart: (patientId: string) => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  patients,
  onAcknowledgeAlert,
  onOpenPatientChart,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterAck, setFilterAck] = useState<string>('Unacknowledged');

  // Gather all alerts across all ward patients
  const allAlerts = patients.flatMap((p) =>
    p.alerts.map((alert) => ({
      ...alert,
      patientId: p.id,
      patientName: `${p.lastName}, ${p.firstName}`,
      roomBed: p.roomBed,
      ward: p.ward,
    }))
  );

  const filteredAlerts = allAlerts.filter((a) => {
    const matchesSeverity = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchesAck =
      filterAck === 'All'
        ? true
        : filterAck === 'Unacknowledged'
        ? !a.acknowledged
        : a.acknowledged;

    return matchesSeverity && matchesAck;
  });

  const criticalCount = allAlerts.filter((a) => a.severity === 'Critical' && !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-headline font-bold text-lg text-[#0D1C2E] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              <span>Ward Clinical Alerts & Decision Support (CDS)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Rule-based alerts, severe biomarker threshold breaches, and mandatory clinical interventions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="h-[36px] px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] text-slate-700 font-medium focus:outline-none focus:border-[#0284C7]"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Observation">Observation Only</option>
            </select>

            <select
              value={filterAck}
              onChange={(e) => setFilterAck(e.target.value)}
              className="h-[36px] px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] text-slate-700 font-medium focus:outline-none focus:border-[#0284C7]"
            >
              <option value="Unacknowledged">Action Required</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="All">All Logs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Cards List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-headline font-bold text-base text-slate-800">
            No Active Alerts In Current View
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
            All acute laboratory and biometric safety criteria are satisfied for selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0D5C75] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                    Bed {alert.roomBed}
                  </span>
                  <span className="font-semibold text-slate-800">{alert.patientName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 text-[11px]">{alert.ward}</span>
                </div>

                <button
                  onClick={() => onOpenPatientChart(alert.patientId)}
                  className="text-xs font-semibold text-[#0D5C75] hover:underline flex items-center gap-1"
                >
                  <span>Open Chart</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Alert banner with 4px left highlight bar */}
              <AlertBanner
                alert={alert}
                onAcknowledge={() => onAcknowledgeAlert(alert.patientId, alert.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
