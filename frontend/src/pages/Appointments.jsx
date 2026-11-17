import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDateTime, toInputValue } from '../utils/format.js';

const EMPTY = { doctor_id: '', patient_nom: '', patient_email: '', date_heure: '', statut: 'confirmé' };

export default function Appointments() {
  const { data: appointments, loading, error, reload } = useFetch('/appointments');
  const { data: doctors } = useFetch('/doctors');
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const reset = () => { setForm(EMPTY); setEditId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, doctor_id: Number(form.doctor_id) };
      if (editId) await api(`/appointments/${editId}`, { method: 'PUT', body });
      else await api('/appointments', { method: 'POST', body });
      toast(editId ? 'Rendez-vous modifié' : 'Rendez-vous réservé');
      reset();
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const edit = (a) => {
    setEditId(a.id);
    setForm({
      doctor_id: String(a.doctor_id),
      patient_nom: a.patient_nom,
      patient_email: a.patient_email,
      date_heure: toInputValue(a.date_heure),
      statut: a.statut,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await api(`/appointments/${toDelete.id}`, { method: 'DELETE' });
      toast('Rendez-vous supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <>
      <h1>Rendez-vous</h1>

      <form className="card form" onSubmit={submit}>
        <h2>{editId ? 'Modifier le rendez-vous' : 'Réserver un rendez-vous'}</h2>
        <div className="form-grid">
          <select value={form.doctor_id} onChange={set('doctor_id')} required>
            <option value="">Choisir un médecin</option>
            {(doctors || []).map((d) => (
              <option key={d.id} value={d.id}>{d.nom} ({d.specialite})</option>
            ))}
          </select>
          <input placeholder="Nom du patient" value={form.patient_nom} onChange={set('patient_nom')} required />
          <input type="email" placeholder="Email du patient" value={form.patient_email} onChange={set('patient_email')} required />
          <input type="datetime-local" value={form.date_heure} onChange={set('date_heure')} required />
          {editId && (
            <select value={form.statut} onChange={set('statut')}>
              <option value="confirmé">confirmé</option>
              <option value="annulé">annulé</option>
            </select>
          )}
        </div>
        <div className="row">
          <button className="btn btn-primary" disabled={saving}>{editId ? 'Enregistrer' : 'Réserver'}</button>
          {editId && <button type="button" className="btn" onClick={reset}>Annuler</button>}
        </div>
      </form>

      {loading && <p className="muted">Chargement…</p>}
      {error && <p className="error">{error}</p>}
      {appointments && appointments.length === 0 && (
        <EmptyState title="Aucun rendez-vous" text="Réservez un rendez-vous avec le formulaire ci-dessus." />
      )}
      {appointments && appointments.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Médecin</th><th>Patient</th><th>Email</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.date_heure)}</td>
                  <td>{a.doctor_nom}</td>
                  <td>{a.patient_nom}</td>
                  <td>{a.patient_email}</td>
                  <td><span className={`badge ${a.statut === 'annulé' ? 'badge-off' : 'badge-ok'}`}>{a.statut}</span></td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => edit(a)}>Modifier</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setToDelete(a)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce rendez-vous ?"
        message={toDelete ? `Rendez-vous de ${toDelete.patient_nom} avec ${toDelete.doctor_nom}.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
