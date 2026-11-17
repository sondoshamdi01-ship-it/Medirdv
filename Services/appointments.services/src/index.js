const express = require('express');
const cors = require('cors');
const { port } = require('./config');
const { initPostgres } = require('./db/postgres');
const Doctor = require('./models/Doctor');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Chaque module = une ligne. Pour le sortir en microservice, on deplace son fichier.
app.use('/api/doctors', require('./modules/doctors'));
app.use('/api/appointments', require('./modules/appointments').router);
require('./modules/appointments').registerListeners();

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Cette ressource existe déjà' });
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Ajoute deux medecins d'exemple au premier demarrage
async function seedDoctors() {
  if ((await Doctor.count()) > 0) return;
  await Doctor.create({ nom: 'Dr Martin', specialite: 'Généraliste', email: 'martin@medirdv.fr', ville: 'Paris' });
  await Doctor.create({ nom: 'Dr Bernard', specialite: 'Cardiologue', email: 'bernard@medirdv.fr', ville: 'Lyon' });
  console.log('Médecins d\'exemple créés');
}

async function start() {
  await initPostgres();
  console.log('PostgreSQL connecte, tables pretes');
  await seedDoctors();
  app.listen(port, () => console.log(`API MediRDV sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
