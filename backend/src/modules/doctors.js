const router = require('express').Router();
const Doctor = require('../models/Doctor');
const events = require('../events');
const asyncHandler = require('../middleware/asyncHandler');

// Verifie que :id est un entier avant d'arriver dans les routes
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(404).json({ error: 'Médecin introuvable' });
  next();
});

function validate({ nom, specialite, email }) {
  if (!nom || !specialite || !email) return 'Nom, spécialité et email sont obligatoires';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Email invalide';
  return null;
}

// Liste des médecins
router.get('/', asyncHandler(async (req, res) => {
  res.json(await Doctor.findAll());
}));

// Détail d'un médecin
router.get('/:id', asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Médecin introuvable' });
  res.json(doctor);
}));

// Ajouter un médecin
router.post('/', asyncHandler(async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json(await Doctor.create(req.body));
}));

// Modifier un médecin
router.put('/:id', asyncHandler(async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const doctor = await Doctor.update(req.params.id, req.body);
  if (!doctor) return res.status(404).json({ error: 'Médecin introuvable' });
  res.json(doctor);
}));

// Supprimer un médecin : on previent les autres modules par un evenement
router.delete('/:id', asyncHandler(async (req, res) => {
  const doctor = await Doctor.remove(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Médecin introuvable' });
  events.emit('doctor.deleted', { doctorId: doctor.id, nom: doctor.nom });
  res.status(204).end();
}));

module.exports = router;
