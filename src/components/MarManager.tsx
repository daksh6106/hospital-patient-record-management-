import React, { useState } from 'react';
import { Pill, Droplets, AlertTriangle, Check, Search, Filter, Barcode, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { Patient, ScheduledMedication, ContinuousInfusion } from '../types/clinical';

interface MarManagerProps {
  patients: Patient[];
  onOpenPatientChart: (patientId: string) => void;
  onAdministerMed: (patientId: string, medId: string) => void;
}

export const MarManager: React.FC<MarManagerProps> = ({
  patients,
  onOpenPatientChart,
  onAdministerMed,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Due' | 'HighAlert' | 'Infusions'>('All');
  const [search, setSearch] = useState('');

  // Collect all scheduled medications across ward
  const allScheduled = patients.flatMap((p) =>
    p.scheduledMeds.map((med) => ({
      ...med,
      patientId: p.id,
      patientName: `${p.lastName}, ${p.firstName}`,
      roomBed: p.roomBed,
      allergies: p.allergies,
    }))
  );

  // Collect all continuous infusions across ward
  const allInfusions = patients.flatMap((p) =>
    p.infusions.map((inf) => ({
      ...inf,
      patientId: p.id,
      patientName: `${p.lastName}, ${p.firstName}`,
      roomBed: p.roomBed,
    }))
  );

  const filteredMeds = allScheduled.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.patientName.toLowerCase().includes(search.toLowerCase()) ||
      m.roomBed.toLowerCase().includes(search.toLowerCase());

    if (filterType === 'Due') return matchesSearch && (m.status === 'Due' || m.status === 'Overdue');
    if (filterType === 'HighAlert') return matchesSearch && m.highAlert;
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Ward MAR Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline font-bold text-lg text-[#0D1C2E] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#0D5C75]" />
              <span>Ward Medication Administration Record (eMAR)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ward-wide dosing schedule, smart infusion pumps, and barcode verification queue
            </p>
          </div>

          {/* Quick Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#F1F5F9] rounded-[0.25rem] p-0.5 text-xs">
              <button
                onClick={() => setFilterType('All')}
                className={`px-3 py-1 rounded-[0.25rem] font-medium transition-colors ${
                  filterType === 'All' ? 'bg-white text-[#0D5C75] shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                All Meds ({allScheduled.length})
              </button>
              <button
                onClick={() => setFilterType('Due')}
                className={`px-3 py-1 rounded-[0.25rem] font-medium transition-colors ${
                  filterType === 'Due' ? 'bg-white text-[#0D5C75] shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Due / Overdue ({allScheduled.filter((m) => m.status === 'Due' || m.status === 'Overdue').length})
              </button>
              <button
                onClick={() => setFilterType('HighAlert')}
                className={`px-3 py-1 rounded-[0.25rem] font-medium transition-colors ${
                  filterType === 'HighAlert' ? 'bg-white text-[#0D5C75] shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                High Alert ({allScheduled.filter((m) => m.highAlert).length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by med, bed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 h-[36px] pl-8 pr-3 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Infusions Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <h2 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5 mb-3">
          <Droplets className="w-4 h-4 text-[#0284C7]" />
          <span>Active Continuous Infusions & Titration Pumps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allInfusions.map((inf) => {
            const percentLeft = Math.round((inf.bagRemainingMl / inf.totalBagMl) * 100);

            return (
              <div
                key={inf.id}
                className="border border-[#CBD5E1] rounded-lg p-3 bg-[#F8FAFC] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0D5C75] bg-[#eff4ff] px-1.5 py-0.5 rounded border border-[#dce9ff]">
                        Bed {inf.roomBed}
                      </span>
                      <div className="text-xs font-bold text-slate-800 mt-1">{inf.patientName}</div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        inf.status === 'Titrating'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {inf.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-900">{inf.name}</div>
                  <div className="flex items-center justify-between mt-1 text-xs font-mono">
                    <span className="text-slate-500 font-sans">Pump Rate:</span>
                    <span className="font-bold text-sm text-[#0D5C75]">{inf.rate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                    {inf.line}
                  </div>

                  {/* Volume Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Bag Left:</span>
                      <span>
                        {inf.bagRemainingMl} / {inf.totalBagMl} mL ({percentLeft}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          percentLeft < 20 ? 'bg-[#DC2626]' : 'bg-[#0284C7]'
                        }`}
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">{inf.lastRateChange}</span>
                  <button
                    onClick={() => onOpenPatientChart(inf.patientId)}
                    className="text-xs font-semibold text-[#0D5C75] hover:underline"
                  >
                    Manage Pump &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Medications Queue */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
        <h2 className="font-headline font-bold text-sm text-[#0D1C2E] flex items-center gap-1.5 mb-3">
          <Clock className="w-4 h-4 text-[#0D5C75]" />
          <span>Scheduled Inpatient Dosing Queue</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono uppercase text-[10px] text-slate-600">
                <th className="py-2.5 px-3">Bed & Patient</th>
                <th className="py-2.5 px-3">Medication</th>
                <th className="py-2.5 px-3">Dose & Route</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Due Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredMeds.map((med) => (
                <tr key={`${med.patientId}-${med.id}`} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs font-bold text-[#0D5C75] bg-[#eff4ff] px-1.5 py-0.5 rounded border border-[#dce9ff] mr-2">
                      {med.roomBed}
                    </span>
                    <span className="font-semibold text-slate-800">{med.patientName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{med.name}</span>
                      {med.highAlert && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-900 border border-red-300 font-bold uppercase">
                          High Alert
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {med.dose} ({med.route})
                  </td>
                  <td className="py-3 px-3 text-slate-600">{med.frequency}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{med.nextDue}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                        med.status === 'Due'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : med.status === 'Overdue'
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : med.status === 'Given'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {med.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {med.status !== 'Given' ? (
                      <button
                        onClick={() => onOpenPatientChart(med.patientId)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#0D5C75] hover:bg-[#0A475B] text-white rounded-[0.25rem] transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Open & Administer</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Administered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
