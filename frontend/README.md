# Frontend MediRDV

Application React (Vite), port 5173.

- `src/pages` : une page par écran (Home, Doctors, Appointments)
- `src/components` : composants réutilisables (Layout, Navbar, ConfirmDialog, EmptyState)
- `src/context` : données partagées (notifications toast)
- `src/hooks` : `useFetch` (chargement / erreur / données)
- `src/services/api.js` : l'unique fonction qui parle au backend
- `src/styles` : thème et styles
- Lancement : `docker compose up` depuis la racine du projet
