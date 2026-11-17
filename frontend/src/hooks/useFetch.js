import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

// Charge une adresse de l'API et gere "chargement / erreur / donnees".
// `reload` permet de recharger apres un ajout, une modification ou une suppression.
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    return api(path)
      .then((data) => setState({ data, loading: false, error: '' }))
      .catch((e) => setState({ data: null, loading: false, error: e.message }));
  }, [path]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
