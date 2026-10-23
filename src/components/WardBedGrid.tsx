import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Heart, 
  UserPlus, 
  Bed, 
  ChevronRight,
  ShieldAlert,
  Flame,
  Droplets,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  CheckCircle2,
  BadgeAlert
} from 'lucide-react';
import { Patient, PatientStatus } from '../types/clinical';
import { StatusBadge } from './StatusBadge';

interface WardBedGridProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenBedsideEntry: (patientId: string) => void;
  onOpenMar: (patientId: string) => void;
  onOpenTransferDischarge: (patientId: string) => void;
}

export const WardBedGrid: React.FC<WardBedGridProps> = ({
  patients,
  onSelectPatient,
  onOpenBedsideEntry,
  onOpenMar,
  onOpenTransferDischarge,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'bed' | 'acuity' | 'name'>('bed');

  const wards = ['All', 'ICU', 'Med-Surg 3B', 'Step-Down Cardiology', 'Emergency'];
  const statusOptions = ['All', 'Critical', 'Observation', 'Admitted', 'Discharged'];

  const filteredPatients = patients
    .filter((p) => {
      const matchesWard = selectedWard === 'All' || p.ward === selectedWard;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.roomBed.toLowerCase().includes(q) ||
        p.primaryDiagnosis.toLowerCase().includes(q);

      return matchesWard && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'bed') return a.roomBed.localeCompare(b.roomBed);
      if (sortBy === 'name') return a.lastName.localeCompare(b.lastName);
      if (sortBy === 'acuity') {
        const order: Record<PatientStatus, number> = {
          Critical: 0,
          Observation: 1,
          Admitted: 2,
          Discharged: 3,
        };
        return order[a.status] - order[b.status];
      }
      return 0;
    });

  // Ward census metrics
  const totalOccupied = patients.length;
  const criticalCount = patients.filter((p) => p.status === 'Critical').length;
  const observationCount = patients.filter((p) => p.status === 'Observation').length;
  const admittedCount = patients.filter((p) => p.status === 'Admitted').length;
  const dischargedCount = patients.filter((p) => p.status === 'Discharged').length;

  return (
    <div className="space-y-4">
      {/* Ward Census Bar & KPI Overview */}
      <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg font-bold text-[#0D1C2E] flex items-center gap-2">
                <Bed className="w-5 h-5 text-[#004357]" />
                <span>Ward Master Census & Bed Acuity Grid</span>
              </h1>
              <span className="font-mono text-xs bg-[#eff4ff] text-[#004357] px-2 py-0.5 rounded border border-[#dce9ff] font-bold">
                Station 4B · 20 Staffed Beds
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time physiological telemetry, acute triage tiers, and continuous medication drips
            </p>
          </div>

          {/* Quick Metrics Strip with tabular numbers */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
            <div className="bg-[#eff4ff] border border-[#dce9ff] px-3 py-1.5 rounded-[0.25rem] flex items-center gap-2">
              <span className="text-slate-600 font-sans text-xs">Census:</span>
              <span className="font-bold text-[#004357] text-sm tabular-nums">
                {totalOccupied} / 20 Beds
              </span>
            </div>

            <div className="bg-[#FEF2F2] border border-[#F87171]/40 px-3 py-1.5 rounded-[0.25rem] flex items-center gap-1.5 text-[#991B1B]">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span className="font-sans text-xs font-medium">Critical:</span>
              <span className="font-bold text-sm tabular-nums">{criticalCount}</span>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FCD34D]/50 px-3 py-1.5 rounded-[0.25rem] flex items-center gap-1.5 text-[#92400E]">
              <span className="font-sans text-xs font-medium">Observation:</span>
              <span className="font-bold text-sm tabular-nums">{observationCount}</span>
            </div>

            <div className="bg-[#F0F9FF] border border-[#7DD3FC]/50 px-3 py-1.5 rounded-[0.25rem] flex items-center gap-1.5 text-[#075985]">
              <span className="font-sans text-xs font-medium">Admitted:</span>
              <span className="font-bold text-sm tabular-nums">{admittedCount}</span>
            </div>

            <div className="bg-[#ECFDF5] border border-[#6EE7B7]/50 px-3 py-1.5 rounded-[0.25rem] flex items-center gap-1.5 text-[#065F46]">
              <span className="font-sans text-xs font-medium">Discharged:</span>
              <span className="font-bold text-sm tabular-nums">{dischargedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter & View Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Unit Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Unit:
            </span>
            {wards.map((ward) => (
              <button
                key={ward}
                onClick={() => setSelectedWard(ward)}
                className={`px-2.5 py-1 rounded-[0.25rem] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedWard === ward
                    ? 'bg-[#004357] text-white shadow-xs font-semibold'
                    : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ward}
              </button>
            ))}
          </div>

          {/* Search, Sort, and View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient, MRN, Bed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] pl-8 pr-3 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] focus:outline-none focus:border-[#0284C7] placeholder-slate-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] focus:outline-none focus:border-[#0284C7] text-slate-700 font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Critical">Critical</option>
              <option value="Observation">Observation</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'bed' | 'acuity' | 'name')}
              className="h-[36px] px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[0.25rem] focus:outline-none focus:border-[#0284C7] text-slate-700 font-medium cursor-pointer"
            >
              <option value="bed">Sort: Bed #</option>
              <option value="acuity">Sort: Acuity</option>
              <option value="name">Sort: Name</option>
            </select>

            {/* Grid vs Table View Mode */}
            <div className="flex items-center bg-[#F1F5F9] border border-slate-200 rounded-[0.25rem] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[0.25rem] transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#004357] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[0.25rem] transition-colors ${
                  viewMode === 'table' ? 'bg-white text-[#004357] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dense Clinical Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View: Grid vs Table */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-12 text-center">
          <Bed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-headline font-semibold text-base text-slate-700">No Patients Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No patient records match the selected unit or search query. Adjust filters or search criteria.
          </p>
          <button
            onClick={() => {
              setSelectedWard('All');
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold bg-[#004357] text-white rounded-[0.25rem] hover:bg-[#0d5c75]"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Dense Clinical Census Table View */
        <div className="bg-white border border-[#CBD5E1] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] font-mono uppercase text-[10px] text-slate-600">
                  <th className="py-2.5 px-3">Bed</th>
                  <th className="py-2.5 px-3">Patient Name & MRN</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Primary Diagnosis</th>
                  <th className="py-2.5 px-3">HR</th>
                  <th className="py-2.5 px-3">BP (MAP)</th>
                  <th className="py-2.5 px-3">SpO2</th>
                  <th className="py-2.5 px-3">Continuous Drips</th>
                  <th className="py-2.5 px-3">Safety Flags</th>
                  <th className="py-2.5 px-3 text-right">Chart Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredPatients.map((p) => {
                  const isCritical = p.status === 'Critical';
                  const map = Math.round((2 * p.currentVitals.bloodPressureDia + p.currentVitals.bloodPressureSys) / 3);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isCritical ? 'border-l-4 border-l-[#DC2626] bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#004357]">
                        {p.roomBed}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{p.lastName}, {p.firstName}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {p.mrn} · {p.age}y {p.sex}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px] truncate text-slate-700" title={p.primaryDiagnosis}>
                        {p.primaryDiagnosis}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                        <span className={p.currentVitals.heartRate > 100 ? 'text-[#DC2626]' : 'text-slate-800'}>
                          {p.currentVitals.heartRate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">
                        <span className={p.currentVitals.bloodPressureSys < 90 ? 'text-[#DC2626] font-bold' : 'text-slate-800'}>
                          {p.currentVitals.bloodPressureSys}/{p.currentVitals.bloodPressureDia}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">MAP {map}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">
                        <span className={p.currentVitals.spO2 < 92 ? 'text-[#DC2626] font-bold' : 'text-slate-800'}>
                          {p.currentVitals.spO2}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        {p.infusions.length > 0 ? (
                          <span className="font-mono font-semibold text-[#004357] block truncate max-w-[140px]">
                            {p.infusions[0].name} ({p.infusions[0].rate})
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono">
                          {p.allergies.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">
                              Allergy
                            </span>
                          )}
                          {p.dietStatus === 'NPO' && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                              NPO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenTransferDischarge(p.id)}
                            className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-[0.25rem] transition-colors"
                            title="Bed Transfer or Discharge"
                          >
                            Transfer/Discharge
                          </button>
                          <button
                            onClick={() => onSelectPatient(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#004357] hover:bg-[#0d5c75] text-white rounded-[0.25rem] transition-colors"
                          >
                            Chart &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bed Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const isCritical = patient.status === 'Critical';
            const vitals = patient.currentVitals;
            const hasAlerts = patient.alerts.filter((a) => !a.acknowledged).length > 0;
            const hasSevereAllergies = patient.allergies.some((a) => a.severity === 'severe');

            const leftBorderStyle = isCritical
              ? 'border-l-4 border-l-[#DC2626]'
              : patient.status === 'Observation'
              ? 'border-l-4 border-l-[#D97706]'
              : 'border-l-4 border-l-[#0284C7]';

            return (
              <div
                key={patient.id}
                className={`bg-white border border-[#CBD5E1] rounded-lg shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden ${leftBorderStyle}`}
              >
                {/* Card Header */}
                <div className="p-3.5 border-b border-slate-200 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#004357] border border-[#dce9ff]">
                          {patient.roomBed}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {patient.mrn}
                        </span>
                      </div>
                      <h2 className="font-headline font-bold text-base text-[#0D1C2E] mt-1 tracking-tight">
                        {patient.lastName}, {patient.firstName}
                      </h2>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {patient.age}y {patient.sex} · DOB {patient.dob}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={patient.status} />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {patient.ward}
                      </span>
                    </div>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="mt-2.5 text-xs text-slate-800 font-medium line-clamp-1 bg-[#F8FAFC] p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 font-normal">Dx:</span> {patient.primaryDiagnosis}
                  </div>

                  {/* Safety Chips: Allergies, Code Status, Fall Risk */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        patient.codeStatus === 'FULL CODE'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {patient.codeStatus}
                    </span>

                    {patient.allergies.length > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          hasSevereAllergies
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                        title={patient.allergies.map((a) => `${a.substance}: ${a.reaction}`).join(', ')}
                      >
                        Allergy: {patient.allergies[0].substance}
                        {patient.allergies.length > 1 ? ` (+${patient.allergies.length - 1})` : ''}
                      </span>
                    )}

                    {patient.dietStatus === 'NPO' && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px]">
                        NPO
                      </span>
                    )}

                    {patient.fallRisk === 'High' && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold text-[10px]">
                        Fall Risk
                      </span>
                    )}

                    {patient.isolation !== 'None' && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 font-bold text-[10px]">
                        {patient.isolation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Embedded Telemetry Blocks (JetBrains Mono) */}
                <div className="p-3 bg-[#F8FAFC] border-b border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Activity className="w-3.5 h-3.5 text-[#0284C7]" />
                      Biometric Telemetry
                    </span>
                    <span>{vitals.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {/* HR */}
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">HR</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          vitals.heartRate > 100 || vitals.heartRate < 55
                            ? 'text-[#DC2626]'
                            : 'text-slate-800'
                        }`}
                      >
                        {vitals.heartRate}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">bpm</div>
                    </div>

                    {/* BP */}
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">BP</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          vitals.bloodPressureSys < 90 || vitals.bloodPressureSys > 150
                            ? 'text-[#DC2626]'
                            : 'text-slate-800'
                        }`}
                      >
                        {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">mmHg</div>
                    </div>

                    {/* SpO2 */}
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SpO2</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          vitals.spO2 < 92 ? 'text-[#DC2626]' : 'text-slate-800'
                        }`}
                      >
                        {vitals.spO2}%
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {vitals.o2Delivery.includes('Vent') ? 'Vent' : 'Air'}
                      </div>
                    </div>

                    {/* Temp / Resp */}
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Temp</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          vitals.temperature > 38.3 ? 'text-[#DC2626]' : 'text-slate-800'
                        }`}
                      >
                        {vitals.temperature}°C
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">RR {vitals.respRate}</div>
                    </div>
                  </div>

                  {/* Active Infusions & High-Alert notice if any */}
                  {patient.infusions.length > 0 && (
                    <div className="mt-2 text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                      <span className="flex items-center gap-1 text-[#004357]">
                        <Droplets className="w-3 h-3 text-[#0284C7]" />
                        <span>Infusion: {patient.infusions[0].name}</span>
                      </span>
                      <span className="font-mono text-slate-700 font-bold">
                        {patient.infusions[0].rate}
                      </span>
                    </div>
                  )}

                  {/* Unacknowledged Alert notification */}
                  {hasAlerts && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] px-2 py-1 rounded border border-[#FCA5A5]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                      <span className="truncate">Alert: {patient.alerts[0].title}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onOpenBedsideEntry(patient.id)}
                      className="px-2 py-1 text-xs font-semibold text-[#004357] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-[0.25rem] transition-colors flex items-center gap-1"
                      title="Bedside Vitals Entry"
                    >
                      <Activity className="w-3 h-3" />
                      <span>Vitals</span>
                    </button>

                    <button
                      onClick={() => onOpenMar(patient.id)}
                      className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] hover:bg-slate-50 rounded-[0.25rem] transition-colors flex items-center gap-1"
                      title="Medication Administration Record"
                    >
                      <Pill className="w-3 h-3 text-slate-500" />
                      <span>MAR</span>
                    </button>

                    <button
                      onClick={() => onOpenTransferDischarge(patient.id)}
                      className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-[0.25rem] transition-colors"
                      title="Transfer or Discharge Patient"
                    >
                      Transfer/DC
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#004357] hover:bg-[#0d5c75] rounded-[0.25rem] transition-colors flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <span>View Chart</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
