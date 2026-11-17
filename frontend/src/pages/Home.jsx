import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';

export default function Home() {
  const doctors = useFetch('/doctors');
  const appointments = useFetch('/appointments');

  return (
    <>
      <h1>Bienvenue sur MediRDV</h1>
      <p className="muted">Gérez vos médecins et vos rendez-vous médicaux.</p>
      <div className="grid">
        <Link to="/doctors" className="card card-link">
          <span className="big">{doctors.data ? doctors.data.length : '–'}</span>
          <span>Médecins</span>
        </Link>
        <Link to="/appointments" className="card card-link">
          <span className="big">{appointments.data ? appointments.data.length : '–'}</span>
          <span>Rendez-vous</span>
        </Link>
      </div>
      {(doctors.error || appointments.error) && (
        <p className="error">Impossible de joindre l'API : {doctors.error || appointments.error}</p>
      )}
    </>
  );
}
