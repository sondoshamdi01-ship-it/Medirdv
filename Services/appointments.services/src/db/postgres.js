const { Pool, types } = require('pg');
const { databaseUrl } = require('../config');

// Les dates "TIMESTAMP" restent des textes ("2026-12-01 10:00:00") :
// on evite ainsi tout decalage de fuseau horaire entre le serveur et le navigateur.
types.setTypeParser(1114, (value) => value);

const pool = new Pool({ connectionString: databaseUrl });

async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id         SERIAL PRIMARY KEY,
      nom        VARCHAR(100) NOT NULL,
      specialite VARCHAR(100) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      ville      VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )`);

  // doctor_id n'est PAS une cle etrangere : le module appointments ne depend pas
  // de la table doctors (ils pourront etre separes en deux services / deux bases).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id            SERIAL PRIMARY KEY,
      doctor_id     INTEGER NOT NULL,
      patient_nom   VARCHAR(100) NOT NULL,
      patient_email VARCHAR(150) NOT NULL,
      date_heure    TIMESTAMP NOT NULL,
      statut        VARCHAR(20) NOT NULL DEFAULT 'confirmé' CHECK (statut IN ('confirmé', 'annulé')),
      created_at    TIMESTAMP DEFAULT NOW()
    )`);
}

module.exports = { pool, initPostgres };
