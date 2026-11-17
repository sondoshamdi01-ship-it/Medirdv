const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Une seule fonction pour parler au backend : renvoie du JSON ou leve une erreur.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}
