const { pool } = require('../db/postgres');

const COLUMNS = 'id, nom, specialite, email, ville';

async function findAll() {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM doctors ORDER BY nom`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM doctors WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findByIds(ids) {
  if (ids.length === 0) return [];
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM doctors WHERE id = ANY($1::int[])`, [ids]);
  return rows;
}

async function count() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM doctors');
  return rows[0].total;
}

async function create({ nom, specialite, email, ville }) {
  const { rows } = await pool.query(
    `INSERT INTO doctors (nom, specialite, email, ville) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [nom, specialite, email, ville || null]
  );
  return rows[0];
}

async function update(id, { nom, specialite, email, ville }) {
  const { rows } = await pool.query(
    `UPDATE doctors SET nom = $1, specialite = $2, email = $3, ville = $4 WHERE id = $5 RETURNING ${COLUMNS}`,
    [nom, specialite, email, ville || null, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query(`DELETE FROM doctors WHERE id = $1 RETURNING ${COLUMNS}`, [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById, findByIds, count, create, update, remove };
