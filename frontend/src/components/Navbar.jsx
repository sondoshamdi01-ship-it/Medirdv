import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">MediRDV</NavLink>
        <nav className="nav-links">
          <NavLink to="/doctors">Médecins</NavLink>
          <NavLink to="/appointments">Rendez-vous</NavLink>
        </nav>
      </div>
    </header>
  );
}
