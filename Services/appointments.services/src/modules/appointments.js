const router = require('express').Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const events = require('../events');
const asyncHandler = require('../middleware/asyncHandler');

// --- Seul point de contact avec les medecins -----------------------------
// En microservices : ces deux fonctions deviennent un appel HTTP vers le
// service Medecins (ou une lecture d'un cache local alimente par RabbitMQ).
const findDoctor = (id) => Doctor.findById(id);
const findDoctors = (ids) => Doctor.findByIds(ids);
// -------------------------------------------------------------------------

router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(404).json({ error: 'Rendez-vous introuvable' });
  next();
});

const STATUTS = ['confirmé', 'annulé'];

function validate({ doctor_id, patient_nom, patient_email, date_heure, statut }) {
  if (!doctor_id || !patient_nom || !patient_email || !date_heure) {
    return 'Médecin, nom du patient, email et date sont obligatoires';
  }
  if (!/^\S+@\S+\.\S+$/.test(patient_email)) return 'Email invalide';
  if (Number.isNaN(Date.parse(date_heure))) return 'Date invalide';
  if (statut !== undefined && !STATUTS.includes(statut)) return 'Statut invalide';
  return null;
}

// Ajoute le nom du medecin a chaque rendez-vous (remplace l'ancien JOIN SQL)
async function withDoctorNames(appointments) {
  const ids = [...new Set(appointments.map((a) => a.doctor_id))];
  const doctors = await findDoctors(ids);
  const names = new Map(doctors.map((d) => [d.id, d.nom]));
  return appointments.map((a) => ({ ...a, doctor_nom: names.get(a.doctor_id) || 'Médecin supprimé' }));
}

// Liste des rendez-vous
router.get('/', asyncHandler(async (req, res) => {
  res.json(await withDoctorNames(await Appointment.findAll()));
}));

// Détail d'un rendez-vous
router.get('/:id', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Rendez-vous introuvable' });
  res.json((await withDoctorNames([appointment]))[0]);
}));

// Prendre un rendez-vous
router.post('/', asyncHandler(async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  if (!(await findDoctor(req.body.doctor_id))) {
    return res.status(404).json({ error: 'Médecin introuvable' });
  }
  res.status(201).json(await Appointment.create(req.body));
}));

// Modifier un rendez-vous (date, médecin, statut...)
router.put('/:id', asyncHandler(async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  if (!(await findDoctor(req.body.doctor_id))) {
    return res.status(404).json({ error: 'Médecin introuvable' });
  }
  const appointment = await Appointment.update(req.params.id, { statut: 'confirmé', ...req.body });
  if (!appointment) return res.status(404).json({ error: 'Rendez-vous introuvable' });
  res.json(appointment);
}));

// Supprimer un rendez-vous
router.delete('/:id', asyncHandler(async (req, res) => {
  const appointment = await Appointment.remove(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Rendez-vous introuvable' });
  res.status(204).end();
}));

// Reaction aux evenements des autres modules
// En microservices : ce sera le consommateur RabbitMQ de "doctor.deleted".
function registerListeners() {
  events.on('doctor.deleted', async ({ doctorId }) => {
    try {
      await Appointment.cancelByDoctor(doctorId);
    } catch (err) {
      console.error('Erreur annulation des rendez-vous', err);
    }
  });
}

module.exports = { router, registerListeners };
