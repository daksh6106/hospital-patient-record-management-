import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PATIENTS } from './src/data/mockPatients.ts';
import { Patient, VitalSignReading, ClinicalNote, PhysicianOrder } from './src/types/clinical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory clinical database initialized from mock data
let patientsStore: Patient[] = JSON.parse(JSON.stringify(INITIAL_PATIENTS));

// --- REST API ENDPOINTS ---

// 1. Health check & station status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Clinical Clarity Acute EHR Engine',
    timestamp: new Date().toISOString(),
    station: 'Station 4B - Critical Care & Telemetry',
    activePatients: patientsStore.length,
  });
});

// 2. Ward Census summary
app.get('/api/census', (req: Request, res: Response) => {
  const totalBeds = 20;
  const occupied = patientsStore.filter((p) => p.status !== 'Discharged').length;
  const critical = patientsStore.filter((p) => p.status === 'Critical').length;
  const observation = patientsStore.filter((p) => p.status === 'Observation').length;
  const admitted = patientsStore.filter((p) => p.status === 'Admitted').length;
  const discharged = patientsStore.filter((p) => p.status === 'Discharged').length;

  res.json({
    totalStaffedBeds: totalBeds,
    occupied,
    available: totalBeds - occupied,
    breakdown: {
      critical,
      observation,
      admitted,
      discharged,
    },
    censusPercent: Math.round((occupied / totalBeds) * 100),
  });
});

// 3. Get all patients (with optional ward & status filtering)
app.get('/api/patients', (req: Request, res: Response) => {
  const { ward, status, query } = req.query;

  let results = [...patientsStore];

  if (ward && ward !== 'All') {
    results = results.filter((p) => p.ward === ward);
  }

  if (status && status !== 'All') {
    results = results.filter((p) => p.status === status);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.roomBed.toLowerCase().includes(q) ||
        p.primaryDiagnosis.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// 4. Get single patient
app.get('/api/patients/:id', (req: Request, res: Response) => {
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

// 5. Admit new patient (POST /api/patients)
app.post('/api/patients', (req: Request, res: Response) => {
  const newPatient: Patient = req.body;

  if (!newPatient.firstName || !newPatient.lastName || !newPatient.roomBed || !newPatient.primaryDiagnosis) {
    return res.status(400).json({ error: 'Missing required patient fields (firstName, lastName, roomBed, primaryDiagnosis)' });
  }

  // Check if bed already occupied by active patient
  const bedConflict = patientsStore.find(
    (p) => p.roomBed.toLowerCase() === newPatient.roomBed.toLowerCase() && p.status !== 'Discharged'
  );

  if (bedConflict) {
    return res.status(409).json({
      error: `Bed ${newPatient.roomBed} is currently occupied by ${bedConflict.lastName}, ${bedConflict.firstName} (${bedConflict.mrn})`,
    });
  }

  const patientToStore: Patient = {
    ...newPatient,
    id: newPatient.id || `pt-${Date.now()}`,
    admissionDate: newPatient.admissionDate || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };

  patientsStore.unshift(patientToStore);
  res.status(201).json(patientToStore);
});

// 6. Record bedside vitals (PUT /api/patients/:id/vitals)
app.put('/api/patients/:id/vitals', (req: Request, res: Response) => {
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const reading: VitalSignReading = req.body;
  if (!reading.heartRate || !reading.bloodPressureSys) {
    return res.status(400).json({ error: 'Invalid vital signs payload' });
  }

  const isDeteriorating = reading.heartRate > 110 || reading.bloodPressureSys < 90 || reading.spO2 < 92;

  patient.currentVitals = {
    heartRate: reading.heartRate,
    bloodPressureSys: reading.bloodPressureSys,
    bloodPressureDia: reading.bloodPressureDia,
    spO2: reading.spO2,
    respRate: reading.respRate,
    temperature: reading.temperature,
    painScore: reading.painScore,
    o2Delivery: reading.o2Delivery,
    timestamp: 'Just now',
    trend: isDeteriorating ? 'deteriorating' : 'stable',
  };

  patient.vitalsHistory.unshift(reading);

  res.json({
    message: 'Vitals successfully recorded and synced',
    currentVitals: patient.currentVitals,
    vitalsHistory: patient.vitalsHistory,
  });
});

// 7. Administer medication (POST /api/patients/:id/administer-med)
app.post('/api/patients/:id/administer-med', (req: Request, res: Response) => {
  const { medId } = req.body;
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const med = patient.scheduledMeds.find((m) => m.id === medId);
  if (!med) {
    return res.status(404).json({ error: 'Medication order not found' });
  }

  med.status = 'Given';
  med.lastAdmin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  res.json({
    message: `Medication ${med.name} successfully administered`,
    med,
  });
});

// 8. Bed Transfer (POST /api/patients/:id/transfer)
app.post('/api/patients/:id/transfer', (req: Request, res: Response) => {
  const { newWard, newBed, reason } = req.body;
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const oldBed = patient.roomBed;
  const oldWard = patient.ward;

  patient.ward = newWard;
  patient.roomBed = newBed;

  const transferNote: ClinicalNote = {
    id: `note-trans-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    author: 'Dr. Elena Vance, MD',
    role: 'Attending Physician',
    title: `Bed Transfer from ${oldWard} (${oldBed}) to ${newWard} (${newBed})`,
    type: 'SOAP',
    content: `Patient transferred to ${newWard} Bed ${newBed}. Rationale: ${reason || 'Clinical step-down'}. Verbal handoff confirmed.`,
  };

  patient.notes.unshift(transferNote);

  res.json({
    message: `Bed transfer to ${newWard} Bed ${newBed} executed`,
    patient,
  });
});

// 9. Discharge Patient (POST /api/patients/:id/discharge)
app.post('/api/patients/:id/discharge', (req: Request, res: Response) => {
  const { disposition, instructions } = req.body;
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  patient.status = 'Discharged';

  const dcNote: ClinicalNote = {
    id: `note-dc-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    author: 'Dr. Elena Vance, MD',
    role: 'Attending Physician',
    title: `Inpatient Discharge Summary (${disposition})`,
    type: 'SOAP',
    content: `Patient discharged. Disposition: ${disposition}.\nInstructions: ${instructions || 'Follow outpatient plan.'}\nMedications reconciled.`,
  };

  patient.notes.unshift(dcNote);

  res.json({
    message: 'Patient encounter finalized and discharged',
    patient,
  });
});

// 10. Add Clinical Note (POST /api/patients/:id/notes)
app.post('/api/patients/:id/notes', (req: Request, res: Response) => {
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const newNote: ClinicalNote = {
    id: `note-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    author: req.body.author || 'Dr. Elena Vance, MD',
    role: req.body.role || 'Attending Physician',
    title: req.body.title || 'Clinical Progress Note',
    type: req.body.type || 'SOAP',
    content: req.body.content || '',
  };

  patient.notes.unshift(newNote);
  res.status(201).json(newNote);
});

// 11. Add Physician Order (POST /api/patients/:id/orders)
app.post('/api/patients/:id/orders', (req: Request, res: Response) => {
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const newOrder: PhysicianOrder = {
    id: `ord-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    orderText: req.body.orderText,
    priority: req.body.priority || 'Routine',
    category: req.body.category || 'Medication',
    orderedBy: req.body.orderedBy || 'Dr. Elena Vance, MD',
    status: 'Active',
  };

  patient.orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// 12. Acknowledge Alert (POST /api/patients/:id/alerts/:alertId/acknowledge)
app.post('/api/patients/:id/alerts/:alertId/acknowledge', (req: Request, res: Response) => {
  const patient = patientsStore.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const alert = patient.alerts.find((a) => a.id === req.params.alertId);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.acknowledged = true;
  alert.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  res.json({ message: 'Alert acknowledged', alert });
});

// --- VITE MIDDLEWARE / STATIC ASSET SERVING ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Vite middleware attached to Express
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Clinical Clarity EHR Server] Listening on http://0.0.0.0:${PORT} (ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Clinical Clarity EHR Server] Fatal startup error:', err);
  process.exit(1);
});
