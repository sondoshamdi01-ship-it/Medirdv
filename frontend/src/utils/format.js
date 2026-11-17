// Le backend renvoie "2026-12-01 10:00:00" (sans fuseau horaire).
const toIso = (value) => String(value).replace(' ', 'T');

export const formatDateTime = (value) =>
  new Date(toIso(value)).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

// Format attendu par <input type="datetime-local">
export const toInputValue = (value) => toIso(value).slice(0, 16);
