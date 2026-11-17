import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';

const EMPTY = { nom: '', specialite: '', email: '', ville: '' };

export default function Doctors() {
  const { data: doctors, loading, error, reload } = useFetch('/doctors');
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
      if (editId) await api(`/doctors/${editId}`, { method: 'PUT', body: form });
      else await api('/doctors', { method: 'POST', body: form });
      toast(editId ? 'Médecin modifié' : 'Médecin ajouté');
      reset();
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const edit = (d) => {
    setEditId(d.id);
    setForm({ nom: d.nom, specialite: d.specialite, email: d.email, ville: d.ville || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await api(`/doctors/${toDelete.id}`, { method: 'DELETE' });
      toast('Médecin supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <>
      <h1>Médecins</h1>

      <form className="card form" onSubmit={submit}>
        <h2>{editId ? 'Modifier le médecin' : 'Ajouter un médecin'}</h2>
        <div className="form-grid">
          <input placeholder="Nom" value={form.nom} onChange={set('nom')} required />
          <input placeholder="Spécialité" value={form.specialite} onChange={set('specialite')} required />
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input placeholder="Ville" value={form.ville} onChange={set('ville')} />
        </div>
        <div className="row">
          <button className="btn btn-primary" disabled={saving}>{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button type="button" className="btn" onClick={reset}>Annuler</button>}
        </div>
      </form>

      {loading && <p className="muted">Chargement…</p>}
      {error && <p className="error">{error}</p>}
      {doctors && doctors.length === 0 && (
        <EmptyState title="Aucun médecin" text="Ajoutez votre premier médecin avec le formulaire ci-dessus." />
      )}
      {doctors && doctors.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Spécialité</th><th>Email</th><th>Ville</th><th></th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>{d.nom}</td>
                  <td>{d.specialite}</td>
                  <td>{d.email}</td>
                  <td>{d.ville}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => edit(d)}>Modifier</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setToDelete(d)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce médecin ?"
        message={toDelete ? `${toDelete.nom} sera supprimé et ses rendez-vous seront annulés.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
