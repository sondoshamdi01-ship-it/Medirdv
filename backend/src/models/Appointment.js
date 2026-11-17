const { pool } = require('../db/postgres');

// Ce modele ne touche jamais a la table doctors.
const COLUMNS = 'id, doctor_id, patient_nom, patient_email, date_heure, statut';

async function findAll() {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM appointments ORDER BY date_heure`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM appointments WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create({ doctor_id, patient_nom, patient_email, date_heure }) {
  const { rows } = await pool.query(
    `INSERT INTO appointments (doctor_id, patient_nom, patient_email, date_heure)
     VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [doctor_id, patient_nom, patient_email, date_heure]
  );
  return rows[0];
}

async function update(id, { doctor_id, patient_nom, patient_email, date_heure, statut }) {
  const { rows } = await pool.query(
    `UPDATE appointments
     SET doctor_id = $1, patient_nom = $2, patient_email = $3, date_heure = $4, statut = $5
     WHERE id = $6 RETURNING ${COLUMNS}`,
    [doctor_id, patient_nom, patient_email, date_heure, statut, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query(`DELETE FROM appointments WHERE id = $1 RETURNING ${COLUMNS}`, [id]);
  return rows[0] || null;
}

async function cancelByDoctor(doctorId) {
  await pool.query("UPDATE appointments SET statut = 'annulé' WHERE doctor_id = $1", [doctorId]);
}

module.exports = { findAll, findById, create, update, remove, cancelByDoctor };
