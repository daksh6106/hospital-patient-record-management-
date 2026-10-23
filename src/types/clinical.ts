export type PatientStatus = 'Critical' | 'Observation' | 'Admitted' | 'Discharged';

export type AcuityLevel = 
  | 'Acuity 1 - Resuscitation' 
  | 'Acuity 2 - Emergent' 
  | 'Acuity 3 - Urgent' 
  | 'Acuity 4 - Less Urgent';

export type CodeStatus = 'FULL CODE' | 'DNR / DNI' | 'DNR (Comfort Care)' | 'Limited Interventions';

export interface Allergy {
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface VitalSignReading {
  timestamp: string;
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  spO2: number;
  respRate: number;
  temperature: number;
  painScore: number;
  o2Delivery: string;
  recordedBy: string;
}

export interface LabResult {
  id: string;
  category: 'Metabolic (CMP)' | 'Hematology (CBC)' | 'Arterial Blood Gas (ABG)' | 'Cardiac & Coag' | 'Microbiology';
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  collectedAt: string;
  status: 'Final' | 'Preliminary' | 'Pending';
}

export interface ContinuousInfusion {
  id: string;
  name: string;
  rate: string;
  concentration: string;
  line: string;
  bagRemainingMl: number;
  totalBagMl: number;
  status: 'Running' | 'Paused' | 'Titrating';
  lastRateChange: string;
}

export interface ScheduledMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  nextDue: string;
  lastAdmin: string;
  status: 'Due' | 'Given' | 'Pending' | 'Overdue';
  highAlert?: boolean;
}

export interface PrnMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  indication: string;
  maxDaily: string;
  status: 'Available' | 'Cooldown';
  lastGiven?: string;
}

export interface ClinicalNote {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  title: string;
  type: 'SOAP' | 'Nursing Shift' | 'Attending Rounds' | 'Consult' | 'Procedure';
  content: string;
}

export interface PhysicianOrder {
  id: string;
  timestamp: string;
  orderText: string;
  priority: 'STAT' | 'Urgent' | 'Routine';
  category: 'Medication' | 'Lab' | 'Radiology' | 'Nursing' | 'Respiratory';
  orderedBy: string;
  status: 'Active' | 'Pending Pharmacy' | 'Completed' | 'Discontinued';
}

export interface ClinicalAlert {
  id: string;
  severity: 'Critical' | 'Observation' | 'Info';
  title: string;
  instruction: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface FluidBalance {
  intakeIvMl: number;
  intakePoMl: number;
  outputUrineMl: number;
  outputDrainsMl: number;
  net24hMl: number;
}

export interface TelemetryAlarmLimits {
  hrHigh: number;
  hrLow: number;
  spo2Low: number;
  bpSysHigh: number;
  bpSysLow: number;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  dob: string;
  roomBed: string;
  ward: 'ICU' | 'Med-Surg 3B' | 'Step-Down Cardiology' | 'Emergency';
  admissionDate: string;
  attendingPhysician: string;
  primaryNurse: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  codeStatus: CodeStatus;
  allergies: Allergy[];
  isolation: 'None' | 'Contact' | 'Droplet' | 'Airborne' | 'Airborne + Contact';
  fallRisk: 'Low' | 'Moderate' | 'High';
  dietStatus: 'NPO' | 'Clear Liquids' | 'Cardiac Low-Sodium' | 'Diabetic' | 'Regular';
  status: PatientStatus;
  acuity: AcuityLevel;
  currentVitals: {
    heartRate: number;
    bloodPressureSys: number;
    bloodPressureDia: number;
    spO2: number;
    respRate: number;
    temperature: number;
    painScore: number;
    o2Delivery: string;
    timestamp: string;
    trend: 'stable' | 'deteriorating' | 'improving';
  };
  vitalsHistory: VitalSignReading[];
  labs: LabResult[];
  infusions: ContinuousInfusion[];
  scheduledMeds: ScheduledMedication[];
  prnMeds: PrnMedication[];
  notes: ClinicalNote[];
  orders: PhysicianOrder[];
  alerts: ClinicalAlert[];
  fluidBalance: FluidBalance;
  alarmLimits?: TelemetryAlarmLimits;
}
