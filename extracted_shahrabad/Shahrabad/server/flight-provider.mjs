/* Fournisseur optionnel. Aucune clé, référence de réservation ou pièce jointe dans la réponse. */
const API = 'https://fr24api.flightradar24.com/api';
const isoUTC = value => {
  if (typeof value !== 'string' || !value) return null;
  const raw = /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : value + 'Z';
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
export async function getFlightStatus(number, date, options = {}) {
  const key = options.key ?? process.env.FR24_API_KEY;
  if (!key) return { connected: false, state: 'not_connected', message: 'Accès API Flightradar24 à activer côté serveur. Aucun statut de vol ne peut être confirmé.' };
  const numberValue = String(number || '').toUpperCase().replace(/\s/g, '');
  if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(numberValue) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return { connected: false, state: 'unavailable', message: 'Numéro et date de vol valides requis.' };
  const start = new Date(date + 'T00:00:00Z');
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date) return { connected: false, state: 'unavailable', message: 'Date invalide.' };
  const end = new Date(start.getTime() + 86400000 - 1);
  const signal = AbortSignal.timeout(8000);
  const fetcher = options.fetcher || fetch;
  async function request(path, params) {
    const url = new URL(API + path);
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
    const response = await fetcher(url, { headers: { Authorization: `Bearer ${key}`, 'Accept-Version': 'v1', Accept: 'application/json' }, signal });
    if (!response.ok) throw new Error('provider');
    const body = await response.json();
    if (!Array.isArray(body.data)) throw new Error('schema');
    return body.data;
  }
  try {
    const summaries = await request('/flight-summary/light', { flights: numberValue, flight_datetime_from: start.toISOString(), flight_datetime_to: end.toISOString(), limit: '10' });
    const matches = summaries.filter(item => String(item.flight || '').toUpperCase() === numberValue && isoUTC(item.first_seen)?.slice(0, 10) === date);
    const source = 'Flightradar24';
    if (!matches.length) return { connected: true, state: 'not_found', source, updatedAt: new Date().toISOString(), message: 'Aucune observation trouvée pour ce jour UTC. Cela ne signifie ni annulation ni retard. Le suivi ne fournit pas les horaires futurs ni les portes d’embarquement.' };
    if (matches.length !== 1) return { connected: true, state: 'unavailable', source, updatedAt: new Date().toISOString(), message: 'Plusieurs vols correspondent. Vérifie le numéro et la date ; aucun statut ambigu n’est affiché.' };
    const summary = matches[0];
    const takeoff = isoUTC(summary.datetime_takeoff);
    const landed = isoUTC(summary.datetime_landed);
    let updatedAt = isoUTC(summary.last_seen);
    if (!updatedAt) return { connected: false, state: 'unavailable', message: 'Le fournisseur ne fournit pas d’heure d’observation valide.' };
    const result = { connected: true, state: landed ? 'landed' : summary.flight_ended === false && takeoff ? 'live' : 'unavailable', source, updatedAt, departure: { airport: summary.orig_icao, time: takeoff }, arrival: { airport: summary.dest_icao_actual || summary.dest_icao, time: landed }, message: 'Observation fournisseur en UTC. Retards, annulations et portes non fournis par cette intégration. Confirme toujours auprès de la compagnie.' };
    if (!landed && summary.flight_ended === false) {
      const positions = await request('/live/flight-positions/full', { flights: numberValue, limit: '10' });
      const position = positions.find(item => item.fr24_id && item.fr24_id === summary.fr24_id);
      if (position && isoUTC(position.timestamp)) {
        result.updatedAt = isoUTC(position.timestamp);
        result.position = { latitude: position.lat, longitude: position.lon, altitude: position.alt };
        result.departure.airport = position.orig_iata || position.orig_icao || result.departure.airport;
        result.arrival.airport = position.dest_iata || position.dest_icao || result.arrival.airport;
        result.arrival.time = landed || isoUTC(position.eta);
        result.arrival.estimated = !landed && Boolean(result.arrival.time);
        if (result.state !== 'live') result.message = 'Position reçue, mais décollage non confirmé : aucun statut « en vol » n’est inventé. Horaires fournisseur en UTC.';
      }
    }
    if (result.state === 'live' && Date.now() - new Date(result.updatedAt).getTime() > 600000) { result.state = 'unavailable'; result.message = 'Dernière observation trop ancienne pour confirmer un vol en direct. Vérifie auprès de la compagnie.'; }
    return result;
  } catch (_) {
    return { connected: false, state: 'unavailable', message: 'Connexion Flightradar24 indisponible : vérifie l’accès API, ses droits et la connexion. Aucun statut n’est confirmé.' };
  }
}
