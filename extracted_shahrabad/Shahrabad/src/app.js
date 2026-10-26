/* Shahrabad — application statique, données locales et architecture extensible */
const STORAGE_KEY = 'voyageur:data:v1';
const LEGACY_KEY = 'voyageur:legacy-imported';
const state = { data: null, view: 'home', tripId: null, tab: 'overview', map: null, mapMarkers: [], rates: { EUR: 1, CNY: 7.8, AUD: 1.65, USD: 1.08, JPY: 160 }, rateDate: null };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));
const isoToday = () => window.ShahrabadSchedule.localISO(new Date());
const dateObj = value => value ? new Date(`${value}T12:00:00`) : null;
const dateLabel = (value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => { const d = dateObj(value); return d && !Number.isNaN(d.getTime()) ? new Intl.DateTimeFormat('fr-FR', opts).format(d) : 'Date à préciser'; };
const money = (amount, currency = 'EUR') => `${Number(amount || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${currency}`;
const sum = values => values.reduce((total, value) => total + Number(value || 0), 0);
const nightsBetween = (arrival, departure) => { const a = dateObj(arrival); const b = dateObj(departure); if (!a || !b || b <= a) return 0; return Math.round((b - a) / 86400000); };
const sortedStops = trip => [...(trip?.stops || [])].sort((a, b) => {
  if (trip?.mode === 'multi') {
    const countries = trip.countries || [];
    const countryOrder = countries.findIndex(c => c.id === a.countryId) - countries.findIndex(c => c.id === b.countryId);
    if (countryOrder) return countryOrder;
  }
  return (a.order ?? 0) - (b.order ?? 0);
});
const activeTrip = () => state.data?.trips.find(t => t.id === state.tripId);
const statusLabel = status => ({ idea: 'Idée', tobook: 'À réserver', booked: 'Réservé', done: 'Effectué', planned: 'Prévu', unpaid: 'À payer', partial: 'Partiellement payé', paid: 'Payé' }[status] || status || '—');
const statusClass = status => `status-${status || 'planned'}`;
const categoryLabel = cat => ({ lodging: 'Hébergement', transport: 'Transport', activity: 'Activités', food: 'Nourriture', shopping: 'Shopping', admin: 'Administratif', other: 'Autre' }[cat] || cat || 'Autre');
const typeLabel = type => ({ flight: 'Avion', train: 'Train', bus: 'Bus', metro: 'Métro', ferry: 'Ferry', car: 'Voiture', taxi: 'Taxi / transfert', other: 'Autre' }[type] || type);

function blankData() { return { version: 1, updatedAt: new Date().toISOString(), trips: [] }; }
function makeTrip(overrides = {}) {
  return { id: uid('trip'), title: 'Nouveau voyage', subtitle: '', cover: '', startDate: '', endDate: '', currency: 'EUR', notes: '', mode: 'single', country: '', countries: [], flights: [], stops: [], expenses: [], documents: [], links: [], ...overrides };
}
function makeStop(overrides = {}) {
  return { id: uid('stop'), name: 'Nouvelle étape', city: '', country: '', countryId: '', cover: '', lat: '', lng: '', arrival: '', departure: '', nights: 0, transportNext: 'Train', notes: '', order: 0, activities: [], accommodations: [], transports: [], ...overrides };
}
function seedDemo() {
  const trip = makeTrip({ id: 'trip-demo', mode: 'multi', title: 'Lignes d’horizon', subtitle: 'Paris · Kyoto · Melbourne', cover: '', startDate: '2026-04-08', endDate: '2026-04-25', currency: 'EUR', notes: 'Un voyage de villes anciennes, de jardins et de cafés où prendre le temps.', stops: [] });
  const paris = makeStop({ id: 'stop-paris', name: 'Paris', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, arrival: '2026-04-08', departure: '2026-04-12', nights: 4, notes: 'Commencer doucement, entre rives et librairies.', transportNext: 'Avion', order: 0 });
  paris.activities = [{ id: uid('act'), title: 'Promenade sur les quais', date: '2026-04-08', time: '17:30', category: 'Découverte', status: 'idea', price: 0, currency: 'EUR', location: 'Quai de Seine', notes: '', url: '' }, { id: uid('act'), title: 'Musée de l’Orangerie', date: '2026-04-09', time: '10:00', category: 'Culture', status: 'booked', price: 16, currency: 'EUR', location: 'Jardin des Tuileries', notes: '', url: 'https://www.musee-orangerie.fr/' }];
  paris.accommodations = [{ id: uid('stay'), name: 'Maison du Canal', address: '10e arrondissement, Paris', checkIn: '2026-04-08', checkOut: '2026-04-12', price: 420, currency: 'EUR', bookingStatus: 'booked', paymentStatus: 'partial', reservation: 'PAR-2604', mapUrl: 'https://maps.google.com/?q=Paris', notes: '' }];
  const kyoto = makeStop({ id: 'stop-kyoto', name: 'Kyoto', city: 'Kyoto', country: 'Japon', lat: 35.0116, lng: 135.7681, arrival: '2026-04-13', departure: '2026-04-19', nights: 6, notes: 'Prévoir une journée sans programme.', transportNext: 'Avion', order: 1 });
  kyoto.activities = [{ id: uid('act'), title: 'Fushimi Inari au lever du jour', date: '2026-04-14', time: '06:00', category: 'Nature', status: 'idea', price: 0, currency: 'EUR', location: 'Fushimi Inari Taisha', notes: '', url: '' }, { id: uid('act'), title: 'Cours de cuisine', date: '2026-04-16', time: '11:00', category: 'Expérience', status: 'tobook', price: 75, currency: 'EUR', location: 'Gion', notes: '', url: '' }];
  kyoto.accommodations = [{ id: uid('stay'), name: 'Ryokan Kumo', address: 'Higashiyama, Kyoto', checkIn: '2026-04-13', checkOut: '2026-04-19', price: 690, currency: 'EUR', bookingStatus: 'tobook', paymentStatus: 'unpaid', reservation: '', mapUrl: 'https://maps.google.com/?q=Kyoto', notes: 'Demander une chambre calme.' }];
  const melbourne = makeStop({ id: 'stop-melbourne', name: 'Melbourne', city: 'Melbourne', country: 'Australie', lat: -37.8136, lng: 144.9631, arrival: '2026-04-20', departure: '2026-04-25', nights: 5, notes: 'Dernière étape : lumière, galeries et côte.', transportNext: '—', order: 2 });
  melbourne.activities = [{ id: uid('act'), title: 'National Gallery of Victoria', date: '2026-04-21', time: '11:00', category: 'Culture', status: 'idea', price: 0, currency: 'AUD', location: 'St Kilda Road', notes: '', url: 'https://www.ngv.vic.gov.au/' }];
  trip.stops = [paris, kyoto, melbourne];
  trip.expenses = [{ id: uid('expense'), title: 'Train et métro à Paris', category: 'transport', amount: 48, paidAmount: 48, currency: 'EUR', status: 'paid', date: '2026-04-08', stopId: paris.id }, { id: uid('expense'), title: 'Billet musée', category: 'activity', amount: 16, paidAmount: 16, currency: 'EUR', status: 'paid', date: '2026-04-09', stopId: paris.id }, { id: uid('expense'), title: 'Vol Paris → Kyoto', category: 'transport', amount: 780, paidAmount: 250, currency: 'EUR', status: 'partial', date: '2026-04-12', stopId: paris.id }];
  trip.links = [{ id: uid('link'), title: 'Guide de voyage Japon', url: 'https://www.japan.travel/fr/fr/', description: 'Ressource générale', stopId: kyoto.id }];
  trip.documents = [{ id: uid('doc'), title: 'Référence réservation Maison du Canal', type: 'Hébergement', reference: 'PAR-2604', url: '', notes: 'Confirmation à retrouver dans la boîte mail.' }];
  return { version: 1, updatedAt: new Date().toISOString(), trips: [trip] };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeData(JSON.parse(raw));
  } catch (error) { console.warn('Lecture locale impossible', error); }
  const demo = seedDemo();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); localStorage.setItem(LEGACY_KEY, 'demo'); } catch (error) { console.warn('Initialisation locale impossible', error); }
  return normalizeData(demo);
}
function normalizeData(data) {
  const normalized = data && Array.isArray(data.trips) ? data : blankData();
  normalized.version = 1;
  normalized.trips = normalized.trips.map(raw => {
    const previousCountries = [...new Set((raw.stops || []).map(s => s.country).filter(Boolean))];
    const trip = {
      ...makeTrip(), ...raw,
      mode: raw.mode || (previousCountries.length > 1 ? 'multi' : 'single'),
      country: raw.country || (previousCountries.length === 1 ? previousCountries[0] : ''),
      countries: (raw.countries || []).map(country => ({ ...country, id: country.id || uid('country') })),
      stops: (raw.stops || []).map((stop, index) => ({
        ...makeStop(), ...stop, name: stop.city || stop.name || 'Ville à préciser',
        city: stop.city || stop.name || '', order: stop.order ?? index,
        activities: stop.activities || [], accommodations: stop.accommodations || [], transports: stop.transports || []
      })),
      flights: raw.flights || [], expenses: raw.expenses || [], documents: raw.documents || [], links: raw.links || []
    };
    window.ShahrabadFlights?.normalize(trip);
    if (trip.mode === 'multi') {
      trip.stops.forEach(stop => {
        let country = trip.countries.find(item => item.id === stop.countryId);
        if (!country) country = trip.countries.find(item => normalizePlace(item.name) === normalizePlace(stop.country || 'Étapes existantes'));
        if (!country) {
          country = { id: uid('country'), name: stop.country || 'Étapes existantes', cover: '' };
          trip.countries.push(country);
        }
        stop.countryId = country.id;
        stop.country = country.name;
      });
    } else {
      trip.country = trip.country || trip.title;
      trip.stops.forEach(stop => { stop.countryId = ''; stop.country = trip.country; });
    }
    return trip;
  });
  return normalized;
}
function persist(message = 'Sauvegardé sur cet appareil') {
  state.data.updatedAt = new Date().toISOString();
  const status = $('#saveStatus');
  if (status) { status.classList.add('is-saving'); status.innerHTML = '<i></i> Enregistrement…'; }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); } catch (error) {
    if (status) { status.classList.remove('is-saving'); status.innerHTML = '<i></i> Erreur locale'; }
    toast('Sauvegarde locale impossible. Exporte tes données et utilise un billet plus petit ou un lien.', true);
    return false;
  }
  window.setTimeout(() => { if (status) { status.classList.remove('is-saving'); status.innerHTML = '<i></i> Local'; } }, 380);
  if (message) toast(message);
  return true;
}
function toast(message, error = false) {
  const region = $('#toastRegion'); if (!region) return;
  const node = document.createElement('div'); node.className = `toast${error ? ' error' : ''}`; node.textContent = message; region.appendChild(node);
  window.setTimeout(() => node.remove(), 3300);
}

function render() {
  if (!state.data) return;
  window.ShahrabadFlights?.dispose();
  if (state.map) { state.map.remove(); state.map = null; state.mapMarkers = []; }
  const app = $('#app');
  app.innerHTML = state.view === 'home' ? renderHome() : renderTrip();
  bindActions();
  bindCountryMenus();
  refreshDestinationImages();
  hydrateDestinationImages();
  if (state.view === 'trip' && state.tab === 'overview') window.setTimeout(initMap, 40);
  if (state.view === 'trip' && state.tab === 'flights') window.ShahrabadFlights?.bind(app, activeTrip());
}
function renderHome() {
  const trips = state.data.trips;
  const totalStops = sum(trips.map(t => t.stops.length));
  return `<section class="hero-panel"><div class="hero-copy"><p class="eyebrow">Carnet de route · édition personnelle</p><h1>Partir avec une idée claire de la route.</h1><p>Organise tes voyages, garde les réservations importantes à portée de main et laisse de la place à l’imprévu.</p><div class="button-row"><button class="primary-button" data-action="new-trip">+ Créer un voyage</button><button class="ghost-button" data-action="load-demo">Recharger la démo</button></div></div><div class="hero-stat"><strong>${trips.length}</strong><span>voyage${trips.length > 1 ? 's' : ''} · ${totalStops} étape${totalStops > 1 ? 's' : ''}</span></div></section>
    <div class="page-head"><div><p class="eyebrow">Tes itinéraires</p><h2>Les voyages en cours</h2><p class="page-intro">Chaque voyage est indépendant. Ajoute une route mondiale, même si elle ne ressemble à aucune autre.</p></div><button class="soft-button" data-action="new-trip">+ Nouveau voyage</button></div>
    ${trips.length ? `<div class="trip-grid">${trips.map(renderTripCard).join('')}</div>` : `<div class="empty-state"><strong>Le carnet est encore vide.</strong>Crée ton premier voyage pour commencer à poser les étapes.</div>`}`;
}
function renderTripCard(trip) {
  const stops = sortedStops(trip);
  const dates = trip.startDate ? `${dateLabel(trip.startDate, { day: 'numeric', month: 'short' })} → ${trip.endDate ? dateLabel(trip.endDate, { day: 'numeric', month: 'short', year: 'numeric' }) : 'à préciser'}` : 'Dates à préciser';
  return `<article class="trip-card">${destinationPhoto(trip, 'trip-photo')}<span class="eyebrow">${trip.mode === 'multi' ? `${trip.countries.length} pays` : esc(trip.country || 'Un seul pays')} · ${stops.length} étape${stops.length > 1 ? 's' : ''}</span><h3>${esc(trip.title)}</h3><div class="trip-meta"><span>${esc(dates)}</span><span>${money(tripTotal(trip), trip.currency)}</span></div><div class="card-actions"><button class="primary-button" data-action="open-trip" data-id="${trip.id}">Ouvrir le voyage</button><button class="icon-button" data-action="trip-menu" data-id="${trip.id}" title="Options du voyage" aria-label="Options du voyage" aria-haspopup="dialog">⋯</button></div></article>`;
}
function renderTrip() {
  const trip = activeTrip();
  if (!trip) { state.view = 'home'; return renderHome(); }
  const tabs = [['overview', 'Vue d’ensemble'], ['itinerary', 'Itinéraire'], ['calendar', 'Calendrier'], ['plan', 'Planning'], ['budget', 'Budget'], ['resources', 'Ressources'], ['flights', 'Vols & documents']];
  return `<section class="trip-banner" data-banner-id="${trip.id}" style="--trip-cover: url('${esc(trip.cover || '')}')"><div class="trip-banner-copy"><div class="trip-kicker"><span class="pill">${trip.startDate ? dateLabel(trip.startDate, { month: 'short', year: 'numeric' }) : 'Dates ouvertes'}</span><span class="pill">${trip.stops.length} étape${trip.stops.length > 1 ? 's' : ''}</span><span class="pill">${trip.currency}</span><span class="pill">${trip.mode === 'multi' ? 'Multi-pays' : esc(trip.country)}</span></div><h1>${esc(trip.title)}</h1><div class="button-row"><button class="primary-button" data-action="edit-trip" data-id="${trip.id}">Modifier le voyage</button><button class="soft-button" data-action="friends" data-id="${trip.id}">Inviter des amis</button><button class="danger-button" data-action="delete-trip" data-id="${trip.id}">Supprimer</button><button class="ghost-button" data-action="back-home">← Tous les voyages</button></div>${destinationCredit(trip)}</div></section><nav class="tabs" aria-label="Sections du voyage">${tabs.map(([id, label]) => `<button class="tab ${state.tab === id ? 'active' : ''}" data-action="switch-tab" data-tab="${id}">${label}</button>`).join('')}</nav>${state.tab === 'overview' ? renderOverview(trip) : ''}${state.tab === 'flights' ? window.ShahrabadFlights?.render(trip) || '' : ''}${state.tab === 'itinerary' ? renderItinerary(trip) : ''}${state.tab === 'calendar' ? renderCalendarTab(trip) : ''}${state.tab === 'plan' ? renderPlanning(trip) : ''}${state.tab === 'budget' ? renderBudget(trip) : ''}${state.tab === 'resources' ? renderResources(trip) : ''}`;
}
function renderOverview(trip) {
  const stops = sortedStops(trip); const activities = allActivities(trip); const booked = activities.filter(a => ['booked', 'done'].includes(a.status)).length;
  return `<section class="overview-grid"><div class="section-stack"><div class="panel"><div class="panel-head"><div><h3>Le fil de la route</h3><span class="panel-subtitle">Les étapes dans l’ordre du voyage</span></div>${routeAddButton(trip)}</div><div class="panel-body">${renderRoute(trip, false)}</div></div><div class="panel"><div class="panel-head"><div><h3>Repères</h3><span class="panel-subtitle">Une lecture rapide du voyage</span></div></div><div class="panel-body"><div class="stat-grid"><div class="stat"><strong>${stops.length}</strong><span>étapes</span></div><div class="stat"><strong>${activities.length}</strong><span>activités</span></div><div class="stat"><strong>${booked}</strong><span>réservées</span></div><div class="stat"><strong>${tripTotal(trip).toFixed(0)}</strong><span>${trip.currency} engagés</span></div></div></div></div></div><aside class="section-stack"><div class="panel map-wrap"><div class="panel-head"><div><h3>Carte vivante</h3><span class="panel-subtitle">Les villes reconnues sont placées automatiquement sur la carte.</span></div></div><div class="map-options"><label for="mapProvider">Fond de carte</label><select id="mapProvider"><option value="dark">Sombre · carte simple</option><option value="light">Clair · carte simple</option></select></div><div id="map"><div class="map-placeholder">Chargement de la carte…</div></div><p id="mapStatus" class="map-status" aria-live="polite"></p></div><div class="panel"><div class="panel-head"><div><h3>Actions rapides</h3><span class="panel-subtitle">Garder le carnet léger</span></div></div><div class="panel-body"><div class="quick-actions"><button class="quick-action" data-action="${trip.mode === 'multi' ? 'add-country' : 'add-stop'}"><b>${trip.mode === 'multi' ? '+ Ajouter un pays' : '+ Ajouter une ville'}</b><span>${trip.mode === 'multi' ? 'Puis ses étapes, ville par ville' : 'La prochaine étape de la route'}</span></button><button class="quick-action" data-action="open-item" data-type="activity"><b>+ Planifier une activité</b><span>Créer un repère jour par jour</span></button><button class="quick-action" data-action="open-item" data-type="expense"><b>+ Ajouter une dépense</b><span>Suivre le réel, pas les doublons</span></button><button class="quick-action" data-action="open-item" data-type="document"><b>+ Ajouter un document</b><span>Référence, billet ou lien</span></button></div></div></div></aside></section>`;
}
function renderStopRow(stop, index, stops) {
  const dates = stop.arrival ? `${dateLabel(stop.arrival, { day: 'numeric', month: 'short' })} → ${stop.departure ? dateLabel(stop.departure, { day: 'numeric', month: 'short' }) : '…'}` : 'Dates à préciser';
  return `<div class="stop-row city-row"><div class="stop-index">${String(index + 1).padStart(2, '0')}</div>${destinationPhoto(stop, 'city-photo')}<div class="city-row-copy"><h4>${esc(stop.city || stop.name)}</h4><p>${esc(dates)} · ${stop.nights || 0} nuit${stop.nights > 1 ? 's' : ''}</p></div><div class="stop-actions"><button class="mini-icon" data-action="edit-stop" data-id="${stop.id}" title="Modifier la ville">✎</button>${index > 0 ? `<button class="mini-icon" data-action="move-stop" data-id="${stop.id}" data-direction="up" title="Monter">↑</button>` : ''}${index < stops - 1 ? `<button class="mini-icon" data-action="move-stop" data-id="${stop.id}" data-direction="down" title="Descendre">↓</button>` : ''}</div></div>`;
}
function renderItinerary(trip) {
  return `<div class="section-toolbar"><div><p class="eyebrow">Route détaillée</p><h2>Itinéraire</h2></div>${routeAddButton(trip)}</div><div class="section-stack">${renderRoute(trip, true)}</div>`;
}
function renderStopCard(trip, stop, index) {
  const acts = stop.activities || []; const stays = stop.accommodations || []; const trans = stop.transports || [];
  return `<article class="stop-card"><div class="stop-card-head">${destinationPhoto(stop, 'stop-cover')}<div><div class="eyebrow">Ville · étape ${String(index + 1).padStart(2, '0')}</div><h3>${esc(stop.name)}</h3><p>${esc([stop.city, stop.country].filter(Boolean).join(', ') || 'Lieu à préciser')} · ${esc(stop.arrival ? dateLabel(stop.arrival) : 'Dates à préciser')} ${stop.departure ? `→ ${esc(dateLabel(stop.departure))}` : ''} · <b>${stop.nights || 0} nuit${stop.nights > 1 ? 's' : ''}</b></p></div><div class="button-row"><button class="ghost-button" data-action="edit-stop" data-id="${stop.id}">Modifier</button><button class="danger-button" data-action="delete-stop" data-id="${stop.id}">Supprimer</button></div></div><div class="stop-card-body"><div class="stop-grid"><div class="subsection"><h4>Activités <button data-action="open-item" data-type="activity" data-stop-id="${stop.id}">+</button></h4>${acts.length ? `<div class="list-stack">${acts.map(activity => renderActivityRow(activity, stop)).join('')}</div>` : '<p class="panel-subtitle">Aucune activité pour le moment.</p>'}</div><div class="subsection"><h4>Hébergements <button data-action="open-item" data-type="accommodation" data-stop-id="${stop.id}">+</button></h4>${stays.length ? `<div class="list-stack">${stays.map(stay => renderStayRow(stay, stop)).join('')}</div>` : '<p class="panel-subtitle">Aucun hébergement enregistré.</p>'}</div><div class="subsection"><h4>Transports <button data-action="open-item" data-type="transport" data-stop-id="${stop.id}">+</button></h4>${trans.length ? `<div class="list-stack">${trans.map(item => renderTransportRow(item, stop)).join('')}</div>` : '<p class="panel-subtitle">Aucun déplacement local enregistré.</p>'}</div><div class="subsection"><h4>Emplacement</h4><p class="panel-subtitle">${stop.geoStatus === 'ready' || (stop.lat !== '' && stop.lng !== '') ? 'Ville positionnée sur la carte.' : 'Emplacement en cours de recherche ou non reconnu.'}</p><a class="soft-button" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.city || stop.name}, ${stop.country || ''}`)}">Ouvrir dans Maps</a></div></div></div></div></article>`;
}
function renderActivityRow(activity, stop) {
  const categories = activity.categories?.join(' · ') || activity.category || 'Activité';
  return `<div class="list-row"><div><h4><button class="entry-title" data-action="ticket" data-type="activity" data-stop-id="${stop.id}" data-id="${activity.id}">${esc(activity.title)}<span>Voir le billet ↗</span></button></h4><p>${activity.date ? dateLabel(activity.date, { day: 'numeric', month: 'short' }) : 'Jour à préciser'}${activity.time ? ` · ${esc(activity.time)}` : ''} · ${esc(categories)}</p></div><div class="list-side"><span class="status ${statusClass(activity.status)}">${statusLabel(activity.status)}</span>${activity.price ? `<span class="price">${money(activity.price, activity.currency)}</span>` : ''}<button class="mini-icon" data-action="delete-nested" data-type="activity" data-stop-id="${stop.id}" data-id="${activity.id}" aria-label="Supprimer l’activité">×</button></div></div>`;
}
function renderStayRow(stay, stop) {
  return `<div class="list-row"><div><h4><button class="entry-title" data-action="ticket" data-type="accommodation" data-stop-id="${stop.id}" data-id="${stay.id}">${esc(stay.name)}<span>Voir la réservation ↗</span></button></h4><p>${esc(stay.address || 'Adresse à préciser')} · ${stay.checkIn ? dateLabel(stay.checkIn, { day: 'numeric', month: 'short' }) : 'Date à préciser'} → ${stay.checkOut ? dateLabel(stay.checkOut, { day: 'numeric', month: 'short' }) : '…'}</p></div><div class="list-side"><span class="status ${statusClass(stay.bookingStatus || 'planned')}">${statusLabel(stay.bookingStatus || 'planned')}</span>${stay.price ? `<span class="price">${money(stay.price, stay.currency)}</span>` : ''}<button class="mini-icon" data-action="delete-nested" data-type="accommodation" data-stop-id="${stop.id}" data-id="${stay.id}" aria-label="Supprimer l’hébergement">×</button></div></div>`;
}
function renderTransportRow(item, stop) {
  return `<div class="list-row"><div><h4><button class="entry-title" data-action="ticket" data-type="transport" data-stop-id="${stop.id}" data-id="${item.id}">${esc(typeLabel(item.type))}${item.company ? ` · ${esc(item.company)}` : ''}<span>Voir le billet ↗</span></button></h4><p>${esc(item.from || 'Départ')} → ${esc(item.to || 'Arrivée')} · ${item.date ? dateLabel(item.date, { day: 'numeric', month: 'short' }) : 'Date à préciser'}</p></div><div class="list-side">${item.price ? `<span class="price">${money(item.price, item.currency)}</span>` : ''}<button class="mini-icon" data-action="delete-nested" data-type="transport" data-stop-id="${stop.id}" data-id="${item.id}" aria-label="Supprimer le transport">×</button></div></div>`;
}
function renderPlanning(trip) {
  const acts = allActivities(trip).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)));
  const dates = eachDate(trip.startDate, trip.endDate);
  return `<div class="section-toolbar"><div><p class="eyebrow">Jour par jour</p><h2>Planning</h2></div><button class="primary-button" data-action="open-item" data-type="activity">+ Activité</button></div><div class="section-stack">${dates.length ? `<div class="panel"><div class="panel-body"><div class="calendar-shell"><div class="calendar">${dates.map(date => { const dayActs = acts.filter(a => a.date === date); return `<div class="calendar-day ${date >= trip.startDate && date <= trip.endDate ? 'is-trip' : ''}"><span class="calendar-date">${dateLabel(date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>${dayActs.map((a, i) => `<span class="calendar-event ${i % 2 ? 'alt' : ''}" title="${esc(a.title)}">${esc(a.time ? `${a.time} · ` : '')}${esc(a.title)}</span>`).join('')}</div>`; }).join('')}</div></div></div></div>` : `<div class="empty-state"><strong>Les dates ouvriront le planning.</strong>Ajoute une date de départ et une date de retour dans les paramètres du voyage.</div>`}<div class="panel"><div class="panel-head"><div><h3>Toutes les activités</h3><span class="panel-subtitle">Idées, réservations et expériences</span></div></div><div class="panel-body">${acts.length ? `<div class="list-stack">${acts.map(a => { const stop = trip.stops.find(s => s.activities.some(item => item.id === a.id)); return renderActivityRow(a, stop || { id: '' }); }).join('')}</div>` : '<p class="panel-subtitle">Aucune activité n’est encore planifiée.</p>'}</div></div></div>`;
}
function renderCalendarTab(trip) {
  const start = dateObj(trip.startDate); const end = dateObj(trip.endDate);
  if (!start || !end || end < start) return `<div class="empty-state"><strong>Le calendrier attend tes dates.</strong>Modifie le voyage pour choisir un départ et un retour.</div>`;
  const cursor = new Date(start); cursor.setDate(1); const last = new Date(end); last.setDate(1); const activities = allActivities(trip); let html = '';
  while (cursor <= last) {
    const year = cursor.getFullYear(); const month = cursor.getMonth(); const monthStart = new Date(year, month, 1); const monthEnd = new Date(year, month + 1, 0); const firstDay = (monthStart.getDay() + 6) % 7;
    html += `<div class="panel"><div class="panel-head"><div><h3>${new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(monthStart)}</h3><span class="panel-subtitle">${dateLabel(trip.startDate)} → ${dateLabel(trip.endDate)}</span></div></div><div class="panel-body"><div class="calendar-shell"><div class="calendar">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => `<div class="calendar-head">${day}</div>`).join('')}${Array.from({ length: firstDay }, () => '<div class="calendar-day is-out"></div>').join('')}${Array.from({ length: monthEnd.getDate() }, (_, index) => { const dayDate = new Date(year, month, index + 1); const day = window.ShahrabadSchedule.localISO(dayDate); const items = activities.filter(item => item.date === day); const inTrip = day >= trip.startDate && day <= trip.endDate; return `<div class="calendar-day ${inTrip ? 'is-trip' : ''} ${day === isoToday() ? 'is-today' : ''}"><span class="calendar-date">${index + 1}</span>${items.map((item, i) => `<span class="calendar-event ${i % 2 ? 'alt' : ''}" title="${esc(item.title)}">${esc(item.title)}</span>`).join('')}</div>`; }).join('')}</div></div></div></div>`;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return `<div class="section-toolbar"><div><p class="eyebrow">Dates du voyage</p><h2>Calendrier</h2></div><button class="primary-button" data-action="open-item" data-type="activity">+ Activité</button></div><div class="section-stack">${html}</div>`;
}
function renderBudget(trip) {
  const expenses = trip.expenses || []; const total = sum(expenses.map(e => convertAmount(e.amount, e.currency, trip.currency))); const paid = sum(expenses.map(e => convertAmount(e.paidAmount ?? (e.status === 'paid' ? e.amount : 0), e.currency, trip.currency))); const remaining = Math.max(0, total - paid); const categories = ['lodging', 'transport', 'activity', 'food', 'shopping', 'admin', 'other'];
  return `<div class="section-toolbar"><div><p class="eyebrow">Argent et prévisions</p><h2>Budget</h2></div><button class="primary-button" data-action="open-item" data-type="expense">+ Dépense</button></div><div class="budget-layout"><div class="section-stack"><div class="budget-total"><div><span>Total des dépenses explicites</span><strong>${money(total, trip.currency)}</strong></div><div><span>Restant à payer</span><strong style="font-size:24px">${money(remaining, trip.currency)}</strong></div></div><div class="panel"><div class="panel-head"><div><h3>Répartition</h3><span class="panel-subtitle">Les réservations ne sont comptées que si elles deviennent une dépense.</span></div></div><div class="panel-body"><div class="budget-bars">${categories.map(category => { const value = sum(expenses.filter(e => e.category === category).map(e => convertAmount(e.amount, e.currency, trip.currency))); const pct = total ? Math.min(100, (value / total) * 100) : 0; return `<div class="bar-line"><span>${categoryLabel(category)}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${money(value, trip.currency)}</b></div>`; }).join('')}</div></div></div><div class="panel"><div class="panel-head"><div><h3>Dépenses</h3><span class="panel-subtitle">${expenses.length} entrée${expenses.length > 1 ? 's' : ''} · ${money(paid, trip.currency)} déjà payé</span></div></div><div class="panel-body">${expenses.length ? `<div class="list-stack">${expenses.map(renderExpenseRow).join('')}</div>` : '<div class="empty-state"><strong>Le budget est vierge.</strong>Ajoute les dépenses réellement prévues pour éviter les doublons.</div>'}</div></div></div><aside class="section-stack">${renderFriendsBudget(trip)}<div class="panel"><div class="panel-head"><div><h3>Convertisseur</h3><span class="panel-subtitle">Taux indicatifs avec état visible</span></div></div><div class="panel-body"><div class="converter"><label class="converter-label" for="convertAmount">Montant à convertir</label><div class="converter-row"><input type="number" min="0" step="0.01" id="convertAmount" value="100" aria-label="Montant à convertir"><select id="convertFrom" aria-label="Devise de départ"><option>EUR</option><option>USD</option><option>CNY</option><option>AUD</option><option>JPY</option></select></div><button class="converter-swap" type="button" data-action="swap-currencies" aria-label="Inverser les devises">⇅</button><label class="converter-label" for="convertResult">Montant converti</label><div class="converter-row converter-output"><input type="number" step="0.01" id="convertResult" readonly placeholder="—" aria-label="Montant converti"><select id="convertTo" aria-label="Devise d’arrivée"><option>CNY</option><option>EUR</option><option>AUD</option><option>USD</option><option>JPY</option></select></div><div id="exchangeNote" class="exchange-note" aria-live="polite">Chargement des taux…</div></div></div></div><div class="panel"><div class="panel-head"><div><h3>Résumé</h3></div></div><div class="panel-body"><div class="stat-grid"><div class="stat"><strong>${expenses.filter(e => e.status === 'paid').length}</strong><span>payées</span></div><div class="stat"><strong>${expenses.filter(e => e.status === 'partial').length}</strong><span>partielles</span></div><div class="stat"><strong>${expenses.filter(e => e.status === 'unpaid' || e.status === 'planned').length}</strong><span>à payer</span></div><div class="stat"><strong>${money(paid, trip.currency).split(' ')[0]}</strong><span>${trip.currency} payé</span></div></div></div></div></aside></div>`;
}
function renderExpenseRow(expense) { return `<div class="list-row"><div><h4>${esc(expense.title)}</h4><p>${categoryLabel(expense.category)}${expense.date ? ` · ${dateLabel(expense.date, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p></div><div class="list-side"><span class="status ${statusClass(expense.status)}">${statusLabel(expense.status)}</span><span class="price">${money(expense.amount, expense.currency)}</span><button class="mini-icon" data-action="delete-expense" data-id="${expense.id}">×</button></div></div>`; }
function renderResources(trip) {
  return `<div class="section-toolbar"><div><p class="eyebrow">Tout garder au même endroit</p><h2>Ressources</h2></div><div class="button-row"><button class="soft-button" data-action="open-item" data-type="link">+ Lien</button><button class="primary-button" data-action="open-item" data-type="document">+ Document</button></div></div><div class="content-grid"><div class="section-stack"><div class="panel"><div class="panel-head"><div><h3>Documents & réservations</h3><span class="panel-subtitle">Références, billets et informations utiles</span></div></div><div class="panel-body">${trip.documents.length ? `<div class="list-stack">${trip.documents.map(doc => `<div class="list-row"><div><h4><button class="entry-title" data-action="open-document" data-id="${doc.id}">${esc(doc.title)}<span>Ouvrir le document ↗</span></button></h4><p>${esc(doc.type || 'Document')}${doc.reference ? ` · ${esc(doc.reference)}` : ''}${doc.notes ? ` · ${esc(doc.notes)}` : ''}</p></div><div class="list-side">${doc.url ? `<a class="soft-button" href="${esc(doc.url)}" target="_blank" rel="noreferrer">Ouvrir</a>` : ''}<button class="mini-icon" data-action="delete-resource" data-type="documents" data-id="${doc.id}">×</button></div></div>`).join('')}</div>` : '<p class="panel-subtitle">Aucun document enregistré.</p>'}</div></div><div class="panel"><div class="panel-head"><div><h3>Liens utiles</h3><span class="panel-subtitle">Guides, réservations et sites officiels</span></div></div><div class="panel-body">${trip.links.length ? `<div class="list-stack">${trip.links.map(link => `<div class="list-row"><div><h4>${esc(link.title)}</h4><p>${esc(link.description || link.url)}</p></div><div class="list-side"><a class="soft-button" href="${esc(link.url)}" target="_blank" rel="noreferrer">Ouvrir</a><button class="mini-icon" data-action="delete-resource" data-type="links" data-id="${link.id}">×</button></div></div>`).join('')}</div>` : '<p class="panel-subtitle">Aucun lien enregistré.</p>'}</div></div></div><aside class="panel"><div class="panel-head"><div><h3>Notes du voyage</h3></div></div><div class="panel-body">${trip.notes ? `<div class="note-box">${esc(trip.notes)}</div>` : '<p class="panel-subtitle">Aucune note générale pour le moment.</p>'}<button class="soft-button" style="margin-top:14px" data-action="edit-trip" data-id="${trip.id}">Modifier les notes</button></div></aside></div>`;
}

function allActivities(trip) { return sortedStops(trip).flatMap(stop => (stop.activities || []).map(activity => ({ ...activity, stopId: stop.id, stopName: stop.name }))); }
function tripTotal(trip) { return sum((trip.expenses || []).map(e => convertAmount(e.amount, e.currency, trip.currency))); }
function convertAmount(amount, from, to) { const value = Number(amount || 0); if (!from || !to || from === to) return value; const fromRate = state.rates[from] || 1; const toRate = state.rates[to] || 1; return value / fromRate * toRate; }
function eachDate(start, end) { if (!start || !end) return []; const dates = []; const cursor = dateObj(start); const last = dateObj(end); if (!cursor || !last || last < cursor) return []; while (cursor <= last && dates.length < 120) { dates.push(window.ShahrabadSchedule.localISO(cursor)); cursor.setDate(cursor.getDate() + 1); } return dates; }

function renderCalendarView(trip) {
  const mapEl = $('#calendarMount'); if (!mapEl) return; const start = dateObj(trip.startDate); const end = dateObj(trip.endDate); if (!start || !end) { mapEl.innerHTML = '<div class="empty-state"><strong>Ajoute les dates du voyage.</strong>Le calendrier se remplira automatiquement.</div>'; return; }
  const cursor = new Date(start); cursor.setDate(1); const last = new Date(end); last.setDate(1); const events = allActivities(trip);
  let output = '<div class="calendar-shell"><div class="calendar">'; ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(d => output += `<div class="calendar-head">${d}</div>`); const firstDay = (cursor.getDay() + 6) % 7; for (let i = 0; i < firstDay; i++) output += '<div class="calendar-day is-out"></div>'; while (cursor <= last) { const day = window.ShahrabadSchedule.localISO(cursor); const dayEvents = events.filter(e => e.date === day); output += `<div class="calendar-day ${day >= trip.startDate && day <= trip.endDate ? 'is-trip' : ''} ${day === isoToday() ? 'is-today' : ''}"><span class="calendar-date">${cursor.getDate()}</span>${dayEvents.map((e, i) => `<span class="calendar-event ${i % 2 ? 'alt' : ''}">${esc(e.title)}</span>`).join('')}</div>`; cursor.setDate(cursor.getDate() + 1); if (cursor.getDate() === 1 && cursor <= last) { const gap = (cursor.getDay() + 6) % 7; for (let i = 0; i < gap; i++) output += '<div class="calendar-day is-out"></div>'; } } output += '</div></div>'; mapEl.innerHTML = output;
}

function initMap() {
  const el = $('#map'); const trip = activeTrip();
  if (!el || !trip || !window.L) return;
  if (!state.map) {
    el.innerHTML = '';
    state.map = L.map(el, { zoomControl: false, scrollWheelZoom: false, minZoom: 1, maxBounds: [[-85, -Infinity], [85, Infinity]], maxBoundsViscosity: 1 }).setView([28, 10], 2);
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    let provider = 'dark';
    try { provider = localStorage.getItem('shahrabad:map-provider') || 'dark'; } catch (_) {}
    setMapProvider(provider);
  }
  const map = state.map;
  window.setTimeout(() => { if (state.map === map && $('#map')) map.invalidateSize(); }, 50);
  updateMap(trip);
}
function updateMap(trip) { if (!state.map) return; state.mapMarkers.forEach(layer => state.map.removeLayer(layer)); state.mapMarkers = []; const points = []; sortedStops(trip).forEach((stop, index) => { if (stop.lat === '' || stop.lng === '' || Number.isNaN(Number(stop.lat)) || Number.isNaN(Number(stop.lng))) return; const point = [Number(stop.lat), Number(stop.lng)]; points.push(point); const marker = L.marker(point, { icon: L.divIcon({ className: 'voyage-marker', html: `<span>${index + 1}</span>`, iconSize: [34,34], iconAnchor: [17,17] }) }).addTo(state.map); marker.bindPopup(`<div class="map-popup"><strong>${esc(stop.name)}</strong><small>${esc([stop.city, stop.country].filter(Boolean).join(', '))}</small></div>`); state.mapMarkers.push(marker); (stop.activities || []).filter(a => a.lat && a.lng).forEach(activity => addMapMarker(activity.lat, activity.lng, '✦', activity.title, 'Activité', trip)); (stop.accommodations || []).filter(a => a.lat && a.lng).forEach(stay => addMapMarker(stay.lat, stay.lng, '⌂', stay.name, 'Hébergement', trip)); }); if (points.length > 1) state.mapMarkers.push(L.polyline(points, { color: '#c6a56a', weight: 2, opacity: .7, dashArray: '6 9' }).addTo(state.map)); if (points.length) state.map.fitBounds(points, { padding: [35,35], maxZoom: 6 }); }
function addMapMarker(lat, lng, icon, title, category) { const marker = L.marker([Number(lat), Number(lng)], { icon: L.divIcon({ className: 'place-marker', html: `<span>${icon}</span>`, iconSize: [27,27], iconAnchor: [13,13] }) }).addTo(state.map); marker.bindPopup(`<div class="map-popup"><strong>${esc(title)}</strong><small>${esc(category)}</small></div>`); state.mapMarkers.push(marker); }

function openModal(title, body, onSubmit, submitLabel = 'Enregistrer') {
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${title}</h2><button type="button" class="modal-close" data-action="close-modal" aria-label="Fermer">×</button></div><form id="activeForm"><div class="modal-body">${body}</div><div class="modal-foot"><button type="button" class="ghost-button" data-action="close-modal">Annuler</button><button class="primary-button" type="submit">${submitLabel}</button></div></form></div></div>`;
  $('#activeForm').addEventListener('submit', event => {
    event.preventDefault();
    if (event.currentTarget.querySelector('[data-ticket-status="reading"]')) { toast('Attends la fin de la lecture du billet avant d’enregistrer.', true); return; }
    const result = onSubmit(new FormData(event.currentTarget));
    if (result !== false) closeModal();
  });
  $('.modal-backdrop', root).addEventListener('click', event => {
    if (event.target === event.currentTarget) closeModal();
  });
  bindActions(); window.ShahrabadDates?.bind(root); window.ShahrabadTickets?.bind(root);
}
function closeModal() { $('#modalRoot').innerHTML = ''; }
function field(label, name, value = '', type = 'text', opts = {}) {
  if (type === 'date') return dateField(label, name, value, opts);
  const required = opts.required ? 'required' : ''; const full = opts.full ? ' full' : '';
  const placeholder = opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : '';
  if (type === 'textarea') return `<div class="field${full}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" ${required} ${placeholder}>${esc(value)}</textarea></div>`;
  if (type === 'select') return `<div class="field${full}"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${required}>${opts.options.map(([val, text]) => `<option value="${esc(val)}" ${String(value) === String(val) ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select></div>`;
  return `<div class="field${full}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${required} ${placeholder} ${opts.step ? `step="${opts.step}"` : ''}></div>`;
}
function openTripForm(trip = null) {
  const isEdit = Boolean(trip);
  const initialMode = trip?.mode || 'single';
  const title = initialMode === 'single' ? trip?.country || trip?.title || '' : trip?.title || '';
  const modes = `<div class="trip-mode-picker" role="group" aria-label="Type de voyage"><label class="trip-mode-option"><input type="radio" name="mode" value="single" ${initialMode === 'single' ? 'checked' : ''}><span><b>Un seul pays</b><small>Un pays, toutes ses villes</small></span></label><label class="trip-mode-option"><input type="radio" name="mode" value="multi" ${initialMode === 'multi' ? 'checked' : ''}><span><b>Multi-pays</b><small>Des pays, puis leurs villes</small></span></label></div>`;
  openModal(isEdit ? 'Paramètres du voyage' : 'Créer un voyage', `${modes}<div class="form-grid">${field(initialMode === 'single' ? 'Nom du pays' : 'Nom du voyage', 'title', title, 'text', { required: true, full: true, placeholder: initialMode === 'single' ? 'Ex. Japon, Éthiopie, Chine…' : 'Ex. Asie, Afrique, tour du monde…' })}${dateField('Départ', 'startDate', trip?.startDate || '')}${dateField('Retour', 'endDate', trip?.endDate || '')}${field('Devise d’affichage', 'currency', trip?.currency || 'EUR', 'select', { options: currencyOptions() })}</div><p class="form-help photo-hint">La photo de couverture est recherchée automatiquement à partir du nom. Aucune URL à renseigner.</p>`, form => {
    const values = Object.fromEntries(form.entries());
    const enteredTitle = values.title.trim();
    if (!enteredTitle) return false;
    if (trip && trip.stops.length && values.mode !== trip.mode) { toast('Garde le type de ce voyage tant qu’il contient des villes, pour préserver leurs associations aux pays.', true); return false; }
    const dateError = window.ShahrabadSchedule.validateTrip(trip || makeTrip(), values.startDate, values.endDate); if (dateError) { toast(dateError, true); return false; }
    let target = trip;
    if (!target) { target = makeTrip({ cover: '', subtitle: '' }); state.data.trips.unshift(target); }
    const changed = target.title !== enteredTitle || target.mode !== values.mode;
    Object.assign(target, { title: enteredTitle, mode: values.mode, country: values.mode === 'single' ? enteredTitle : '', startDate: values.startDate, endDate: values.endDate, currency: values.currency });
    if (changed) { target.cover = ''; target.photoStatus = ''; target.photoKey = ''; target.photoSource = ''; }
    // Réaffectation sans suppression des étapes ni de leurs informations.
    if (values.mode === 'single') target.stops.forEach(stop => { stop.country = enteredTitle; stop.countryId = ''; });
    state.data = normalizeData(state.data);
    state.tripId = target.id; state.view = 'trip'; state.tab = 'overview';
    persist(isEdit ? 'Voyage modifié.' : 'Voyage créé.'); render();
  }, isEdit ? 'Enregistrer' : 'Créer le voyage');
  const form = $('#activeForm');
  window.ShahrabadDates.bindPair(form, 'startDate', 'endDate', {});
  form.addEventListener('change', event => {
    if (event.target.name !== 'mode') return;
    const single = event.target.value === 'single';
    $('[for="title"]', form).textContent = single ? 'Nom du pays' : 'Nom du voyage';
    $('[name="title"]', form).placeholder = single ? 'Ex. Japon, Éthiopie, Chine…' : 'Ex. Asie, Afrique, tour du monde…';
  });
}
function openStopForm(trip, stop = null, countryId = '') {
  if (!trip) return;
  if (!trip.startDate || !trip.endDate) { toast('Choisis d’abord les dates du voyage pour encadrer ses villes.', true); openTripForm(trip); return; }
  const country = trip.mode === 'multi' ? trip.countries.find(item => item.id === (stop?.countryId || countryId)) : null;
  if (trip.mode === 'multi' && !country) { openCountryChooser(trip); return; }
  const bounds = window.ShahrabadSchedule.stopBounds(trip, stop, country?.id || '');
  if (bounds.min && bounds.max && bounds.min > bounds.max) { toast('Aucun créneau libre à cet endroit de l’itinéraire. Ajuste les dates voisines.', true); return; }
  const isEdit = Boolean(stop);
  openModal(isEdit ? 'Modifier la ville' : 'Ajouter une ville', `${country ? `<p class="eyebrow">${esc(country.name)}</p>` : ''}<div class="form-grid">${field('Ville', 'city', stop?.city || stop?.name || '', 'text', { required: true, full: true, placeholder: 'Ex. Kyoto, Addis-Abeba, Los Angeles…' })}${dateField('Arrivée', 'arrival', stop?.arrival || '', { ...bounds, defaultDate: bounds.min, required: true })}${dateField('Départ', 'departure', stop?.departure || '', { ...bounds, defaultDate: stop?.arrival || bounds.min, required: true })}</div><p class="form-help photo-hint">Créneau disponible : ${dateLabel(bounds.min)} → ${dateLabel(bounds.max)}. Le départ peut être le jour d’arrivée de la ville suivante, sans chevauchement de nuits.</p>`, form => {
    const values = Object.fromEntries(form.entries()); const city = values.city.trim();
    if (!city) return false;
    const dateError = window.ShahrabadSchedule.validateStop(trip, stop, values.arrival, values.departure, country?.id || '');
    if (dateError) { toast(dateError, true); return false; }
    const previousName = stop?.city;
    const item = stop || makeStop({ cover: '', order: Math.max(-1, ...trip.stops.map(s => Number(s.order || 0))) + 1 });
    Object.assign(item, { name: city, city, country: country?.name || trip.country, countryId: country?.id || '', arrival: values.arrival, departure: values.departure, nights: nightsBetween(values.arrival, values.departure) });
    if (!stop) trip.stops.push(item);
    if (!isEdit || previousName !== city) { item.cover = ''; item.photoStatus = ''; item.photoKey = ''; item.photoSource = ''; item.lat = ''; item.lng = ''; }
    if (country) expandedCountries.add(country.id);
    persist(isEdit ? 'Ville modifiée.' : 'Ville ajoutée.'); render();
  });
  window.ShahrabadDates.bindPair($('#activeForm'), 'arrival', 'departure', bounds);
}
function openItemForm(type, trip, stopId = '') {
  const stop = trip.stops.find(s => s.id === stopId) || sortedStops(trip)[0];
  const nested = ['activity', 'accommodation', 'transport'].includes(type);
  if (nested && !stop) { toast('Ajoute d’abord une ville.', true); return; }
  if ((nested || type === 'expense') && (!trip.startDate || !trip.endDate)) { toast('Choisis d’abord les dates du voyage.', true); openTripForm(trip); return; }
  if (nested && (!stop.arrival || !stop.departure)) { toast('Fixe d’abord les dates de cette ville pour encadrer ses réservations.', true); openStopForm(trip, stop); return; }
  const titles = { activity: 'Planifier une activité', accommodation: 'Ajouter un hébergement', transport: 'Ajouter un déplacement', expense: 'Ajouter une dépense', document: 'Ajouter un document', link: 'Ajouter un lien' };
  const stepField = () => field('Étape', 'stopId', stop?.id || '', 'select', { options: sortedStops(trip).map(s => [s.id, s.name]) });
  const currencyField = () => field('Devise', 'currency', trip.currency, 'select', { options: currencyOptions() });
  let body = '';
  if (type === 'activity') body = `${field('Nom', 'title', '', 'text', { required: true, placeholder: 'Ex. Visite, randonnée, restaurant…' })}${stepField()}${field('Date', 'date', '', 'date')}${field('Heure', 'time', '', 'time')}${activityCategories()}${field('Statut', 'status', 'idea', 'select', { options: [['idea', 'Idée'], ['tobook', 'À réserver'], ['booked', 'Réservé'], ['done', 'Effectué']] })}${field('Prix', 'price', '', 'number', { step: '0.01', placeholder: '0' })}${currencyField()}${field('Lieu / adresse', 'location', '', 'text')}${field('Lien du billet / réservation (facultatif)', 'url', '', 'url', { placeholder: 'https://…' })}${field('Notes', 'notes', '', 'textarea', { full: true })}`;
  if (type === 'accommodation') body = `${field('Nom de l’établissement', 'name', '', 'text', { required: true })}${stepField()}${field('Adresse', 'address', '', 'text', { full: true })}${field('Arrivée', 'checkIn', '', 'date')}${field('Départ', 'checkOut', '', 'date')}${field('Prix total', 'price', '', 'number', { step: '0.01' })}${currencyField()}${field('Statut réservation', 'bookingStatus', 'tobook', 'select', { options: [['tobook', 'À réserver'], ['booked', 'Réservé']] })}${field('Paiement', 'paymentStatus', 'unpaid', 'select', { options: [['unpaid', 'À payer'], ['partial', 'Partiel'], ['paid', 'Payé']] })}${field('Numéro de réservation', 'reservation', '', 'text')}${field('Lien Google Maps / réservation', 'mapUrl', '', 'url', { full: true })}${field('Notes', 'notes', '', 'textarea', { full: true })}`;
  if (type === 'transport') body = `${field('Type', 'type', 'train', 'select', { options: [['flight', 'Avion'], ['train', 'Train'], ['bus', 'Bus'], ['metro', 'Métro'], ['ferry', 'Ferry'], ['car', 'Voiture'], ['taxi', 'Taxi / transfert'], ['other', 'Autre']] })}${stepField()}${field('Départ', 'from', '', 'text')}${field('Arrivée', 'to', '', 'text')}${field('Date', 'date', '', 'date')}${field('Heure', 'time', '', 'time')}${field('Compagnie', 'company', '', 'text')}${field('Référence', 'reference', '', 'text')}${field('Prix', 'price', '', 'number', { step: '0.01' })}${currencyField()}${field('Statut', 'status', 'planned', 'select', { options: [['planned', 'Prévu'], ['booked', 'Réservé'], ['paid', 'Payé']] })}${field('Lien du billet / réservation', 'ticketUrl', '', 'url', { full: true, placeholder: 'https://…' })}${field('Notes', 'notes', '', 'textarea', { full: true })}`;
  if (type === 'expense') body = `${field('Description', 'title', '', 'text', { required: true, placeholder: 'Ex. billet, repas, assurance…' })}${field('Catégorie', 'category', 'other', 'select', { options: [['lodging', 'Hébergement'], ['transport', 'Transport'], ['activity', 'Activités'], ['food', 'Nourriture'], ['shopping', 'Shopping'], ['admin', 'Frais administratifs'], ['other', 'Autres dépenses']] })}${field('Montant', 'amount', '', 'number', { required: true, step: '0.01' })}${field('Déjà payé', 'paidAmount', '', 'number', { step: '0.01' })}${currencyField()}${field('Statut', 'status', 'planned', 'select', { options: [['planned', 'Prévu'], ['unpaid', 'À payer'], ['partial', 'Partiellement payé'], ['paid', 'Payé']] })}${field('Date', 'date', '', 'date')}${field('Étape', 'stopId', '', 'select', { options: [['', 'Voyage entier'], ...sortedStops(trip).map(s => [s.id, s.name])] })}<div class="field full"><label>Compte entre amis</label><button type="button" class="ghost-button" data-action="friends">Payé par / partager · bientôt</button></div>${field('Notes', 'notes', '', 'textarea', { full: true })}`;
  if (type === 'document') body = `${field('Titre', 'title', '', 'text', { required: true })}${field('Type', 'type', 'Réservation', 'text')}${field('Référence', 'reference', '', 'text')}${field('Lien externe', 'url', '', 'url', { placeholder: 'https://…' })}${field('Notes', 'notes', '', 'textarea', { full: true })}`;
  if (type === 'link') body = `${field('Titre', 'title', '', 'text', { required: true })}${field('URL', 'url', '', 'url', { required: true })}${field('Étape associée', 'stopId', '', 'select', { options: [['', 'Voyage entier'], ...sortedStops(trip).map(s => [s.id, s.name])] })}${field('Description', 'description', '', 'textarea', { full: true })}`;
  openModal(titles[type], `<div class="form-grid">${body}</div>${nested ? window.ShahrabadTickets.controls() : ''}`, form => {
    const values = Object.fromEntries(form.entries());
    const targetStop = values.stopId ? trip.stops.find(s => s.id === values.stopId) : nested ? stop : null;
    if (nested && !targetStop) { toast('Ville introuvable.', true); return false; }
    const dateError = (nested || type === 'expense') ? window.ShahrabadSchedule.validateItem(type, trip, targetStop, values) : '';
    if (dateError) { toast(dateError, true); return false; }
    const attachment = nested ? window.ShahrabadTickets.read($('#activeForm')) : {};
    if (type === 'activity') {
      const categories = form.getAll('categories');
      targetStop.activities.push({ id: uid('act'), title: values.title.trim(), date: values.date, time: values.time, categories: categories.length ? categories : ['Autre'], category: categories.join(' · ') || 'Autre', status: values.status, price: Number(values.price || 0), currency: values.currency, location: values.location, notes: values.notes, url: values.url, ...attachment });
    }
    if (type === 'accommodation') targetStop.accommodations.push({ id: uid('stay'), name: values.name.trim(), address: values.address, checkIn: values.checkIn, checkOut: values.checkOut, price: Number(values.price || 0), currency: values.currency, bookingStatus: values.bookingStatus, paymentStatus: values.paymentStatus, reservation: values.reservation, mapUrl: values.mapUrl, notes: values.notes, ...attachment });
    if (type === 'transport') targetStop.transports.push({ id: uid('transport'), type: values.type, from: values.from, to: values.to, date: values.date, time: values.time, company: values.company, reference: values.reference, price: Number(values.price || 0), currency: values.currency, status: values.status, notes: values.notes, ticketUrl: values.ticketUrl, ...attachment });
    if (type === 'expense') trip.expenses.push({ id: uid('expense'), title: values.title.trim(), category: values.category, amount: Number(values.amount || 0), paidAmount: Number(values.paidAmount || 0), currency: values.currency, status: values.status, date: values.date, stopId: values.stopId, notes: values.notes });
    if (type === 'document') trip.documents.push({ id: uid('doc'), title: values.title.trim(), type: values.type, reference: values.reference, url: values.url, notes: values.notes });
    if (type === 'link') trip.links.push({ id: uid('link'), title: values.title.trim(), url: values.url, description: values.description, stopId: values.stopId });
    if (!persist('Élément enregistré.')) {
      const collection = { activity: 'activities', accommodation: 'accommodations', transport: 'transports', expense: 'expenses', document: 'documents', link: 'links' }[type];
      (nested ? targetStop : trip)[collection].pop();
      return false;
    }
    render();
  });
  if (nested || type === 'expense') {
    const form = $('#activeForm');
    configureItemDates(type, trip, stop, form);
    $('[name="stopId"]', form)?.addEventListener('change', () => configureItemDates(type, trip, stop, form));
  }
}
function currencyOptions() { return [['EUR', 'EUR · Euro'], ['USD', 'USD · Dollar US'], ['CNY', 'CNY · Yuan'], ['AUD', 'AUD · Dollar australien'], ['JPY', 'JPY · Yen']]; }

function bindActions() {
  $$('[data-action]').forEach(button => {
    if (button.dataset.bound) return;
    button.dataset.bound = '1';
    button.addEventListener('click', event => {
      if (button.dataset.action === 'friends' && button.closest('#activeForm')) { toast('Partage entre amis bientôt disponible. Ta saisie reste intacte.'); return; }
      if (window.ShahrabadFlightActions?.handle(button, activeTrip())) return;
      handleAction(event);
    });
  });
  if ($('#convertAmount')) $('#convertAmount').oninput = updateConverter;
  if ($('#convertFrom')) $('#convertFrom').onchange = updateConverter;
  if ($('#convertTo')) $('#convertTo').onchange = updateConverter;
  if ($('#mapProvider')) $('#mapProvider').onchange = event => setMapProvider(event.target.value);
  updateConverter();
}
function handleAction(event) { const el = event.currentTarget; const action = el.dataset.action; const trip = activeTrip(); if (action === 'home' || action === 'back-home') { event.preventDefault(); state.view = 'home'; state.tripId = null; render(); return; } if (action === 'new-trip') return openTripForm(); if (action === 'load-demo') { state.data = normalizeData(seedDemo()); persist('Données de démonstration rechargées.'); state.view = 'home'; state.tripId = null; render(); return; } if (action === 'open-trip') { state.tripId = el.dataset.id; state.view = 'trip'; state.tab = 'overview'; render(); return; } if (action === 'trip-menu') return openTripMenu(state.data.trips.find(t => t.id === el.dataset.id)); if (action === 'ticket') return openTicket(trip, el.dataset.type, el.dataset.stopId, el.dataset.id); if (action === 'friends') return openFriendsPreview(); if (action === 'swap-currencies') return swapCurrencies(); if (action === 'feature-soon') return toast('Fonction en préparation : aucun partage ni calcul de dettes pour le moment.'); if (action === 'edit-trip') { const target = state.data.trips.find(t => t.id === el.dataset.id) || trip; return openTripForm(target); } if (action === 'duplicate-trip') { closeModal(); return duplicateTrip(state.data.trips.find(t => t.id === el.dataset.id) || trip); } if (action === 'delete-trip') { const target = state.data.trips.find(t => t.id === el.dataset.id) || trip; closeModal(); return deleteTrip(target); } if (action === 'switch-tab') { state.tab = el.dataset.tab; render(); return; } if (action === 'add-country') return openCountryForm(trip); if (action === 'edit-country') return openCountryForm(trip, trip.countries.find(item => item.id === el.dataset.id)); if (action === 'add-stop') return openStopForm(trip, null, el.dataset.countryId || ''); if (action === 'edit-stop') return openStopForm(trip, trip.stops.find(s => s.id === el.dataset.id)); if (action === 'delete-stop') { if (!confirm('Supprimer cette étape et ses activités ?')) return; trip.stops = trip.stops.filter(s => s.id !== el.dataset.id).map((s, i) => ({ ...s, order: i })); persist('Étape supprimée.'); render(); return; } if (action === 'move-stop') return moveStop(trip, el.dataset.id, el.dataset.direction); if (action === 'open-item') return openItemForm(el.dataset.type, trip, el.dataset.stopId || ''); if (action === 'delete-nested') { const stop = trip.stops.find(s => s.id === el.dataset.stopId); const collection = el.dataset.type === 'activity' ? 'activities' : el.dataset.type === 'accommodation' ? 'accommodations' : 'transports'; if (stop && confirm('Supprimer cet élément ?')) { stop[collection] = stop[collection].filter(item => item.id !== el.dataset.id); persist('Élément supprimé.'); render(); } return; } if (action === 'delete-expense') { if (confirm('Supprimer cette dépense ?')) { trip.expenses = trip.expenses.filter(e => e.id !== el.dataset.id); persist('Dépense supprimée.'); render(); } return; } if (action === 'delete-resource') { if (confirm('Supprimer cette ressource ?')) { trip[el.dataset.type] = trip[el.dataset.type].filter(item => item.id !== el.dataset.id); persist('Ressource supprimée.'); render(); } return; } if (action === 'close-modal') return closeModal(); if (action === 'export') return exportData(); if (action === 'import') return $('#importInput').click(); }
function duplicateTrip(trip) {
  const clone = JSON.parse(JSON.stringify(trip));
  clone.id = uid('trip'); clone.title = `${trip.title} · copie`;
  const ids = new Map();
  clone.countries = (clone.countries || []).map(item => { const id = uid('country'); ids.set(item.id, id); return { ...item, id }; });
  clone.stops = clone.stops.map(stop => {
    const id = uid('stop'); ids.set(stop.id, id);
    return { ...stop, id, countryId: ids.get(stop.countryId) || '', activities: (stop.activities || []).map(item => ({ ...item, id: uid('act') })), accommodations: (stop.accommodations || []).map(item => ({ ...item, id: uid('stay') })), transports: (stop.transports || []).map(item => { const newId = uid('transport'); ids.set(item.id, newId); return { ...item, id: newId }; }) };
  });
  clone.flights = (clone.flights || []).map(item => { const id = uid('flight'); ids.set(item.id, id); return { ...item, id }; });
  ['expenses', 'documents', 'links'].forEach(key => { clone[key] = (clone[key] || []).map(item => ({ ...item, id: uid(key), stopId: ids.get(item.stopId) || item.stopId || '', ...(item.flightId ? { flightId: ids.get(item.flightId) || item.flightId } : {}), ...(item.countryId ? { countryId: ids.get(item.countryId) || item.countryId } : {}) })); });
  state.data.trips.unshift(clone); state.tripId = clone.id;
  persist('Voyage dupliqué.'); render();
}
function deleteTrip(trip) { if (!trip || !confirm(`Supprimer « ${trip.title} » et toutes ses données ?`)) return; state.data.trips = state.data.trips.filter(item => item.id !== trip.id); state.view = 'home'; state.tripId = null; state.map = null; persist('Voyage supprimé.'); render(); }
function moveStop(trip, id, direction) {
  const ordered = sortedStops(trip);
  const current = ordered.find(stop => stop.id === id);
  const group = trip.mode === 'multi' ? ordered.filter(stop => stop.countryId === current?.countryId) : ordered;
  const index = group.findIndex(stop => stop.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= group.length) return;
  const oldOrder = group[index].order;
  group[index].order = group[target].order;
  group[target].order = oldOrder;
  const conflict = sortedStops(trip).map(stop => window.ShahrabadSchedule.validateStop(trip, stop, stop.arrival, stop.departure, stop.countryId)).find(Boolean);
  if (conflict) { group[target].order = group[index].order; group[index].order = oldOrder; toast('Cet ordre ferait chevaucher les dates. Ajuste les périodes avant de déplacer les villes.', true); return; }
  persist('Ordre des villes mis à jour.'); render();
}
function exportData() { const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `shahrabad-export-${isoToday()}.json`; link.click(); URL.revokeObjectURL(url); toast('Export JSON téléchargé.'); }
function importData(file) { const reader = new FileReader(); reader.onload = () => { try { const parsed = normalizeData(JSON.parse(reader.result)); if (!Array.isArray(parsed.trips)) throw new Error('Format invalide'); state.data = parsed; state.view = 'home'; state.tripId = null; persist('Import réussi.'); render(); } catch (error) { toast('Le fichier n’est pas un export Shahrabad valide.', true); } }; reader.readAsText(file); }
async function fetchRates() {
  state.rateState = 'loading'; updateConverter();
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!response.ok) throw new Error('rate');
    const data = await response.json();
    if (!data.rates) throw new Error('rate');
    state.rates = { ...state.rates, ...data.rates, EUR: 1 };
    state.rateDate = data.time_last_update_utc || new Date().toISOString(); state.rateState = 'ready';
  } catch (_) { state.rateDate = null; state.rateState = 'fallback'; }
  updateConverter();
}
function updateConverter() {
  const amount = Number($('#convertAmount')?.value || 0);
  const from = $('#convertFrom')?.value; const to = $('#convertTo')?.value;
  const output = $('#convertResult'); if (output) output.value = convertAmount(amount, from, to).toFixed(2);
  const note = $('#exchangeNote');
  if (note) note.textContent = state.rateState === 'loading' ? 'Chargement des taux…' : state.rateDate ? `Taux indicatifs · ${state.rateDate}` : 'Taux de secours indicatifs · service indisponible';
}
const expandedCountries = new Set();
const photoQueue = [];
let photoWorkers = 0;
function normalizePlace(value) { return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function dateField(label, name, value, opts = {}) { return window.ShahrabadDates.field(label, name, value, opts); }
function routeAddButton(trip) { return `<button class="soft-button" data-action="${trip.mode === 'multi' ? 'add-country' : 'add-stop'}">${trip.mode === 'multi' ? '+ Ajouter un pays' : '+ Ajouter une ville'}</button>`; }
function renderRoute(trip, detailed) {
  if (trip.mode !== 'multi') {
    const stops = sortedStops(trip);
    return stops.length ? (detailed ? stops.map((stop, i) => renderStopCard(trip, stop, i)).join('') : `<div class="timeline">${stops.map((stop, i) => renderStopRow(stop, i, stops.length)).join('')}</div>`) : '<div class="empty-state"><strong>La première ville t’attend.</strong>Ajoute les villes de ton voyage.</div>';
  }
  if (!trip.countries.length) return '<div class="empty-state"><strong>Commence par un pays.</strong>Ajoute un pays, puis ses villes dans le sous-menu.</div>';
  return `<div class="country-list">${trip.countries.map(country => {
    const stops = sortedStops(trip).filter(stop => stop.countryId === country.id);
    return `<details class="country-menu" data-country-menu="${country.id}" ${expandedCountries.has(country.id) ? 'open' : ''}><summary>${destinationPhoto(country, 'country-photo')}<span class="country-title"><b>${esc(country.name)}</b><small>${stops.length} ville${stops.length > 1 ? 's' : ''} · ouvrir les étapes</small></span><span class="country-chevron">⌄</span></summary><div class="country-content"><div class="country-tools"><button class="soft-button" data-action="add-stop" data-country-id="${country.id}">+ Ajouter une ville</button><button class="ghost-button" data-action="edit-country" data-id="${country.id}">Modifier le pays</button></div>${stops.length ? (detailed ? `<div class="section-stack">${stops.map((stop, i) => renderStopCard(trip, stop, i)).join('')}</div>` : `<div class="timeline">${stops.map((stop, i) => renderStopRow(stop, i, stops.length)).join('')}</div>`) : '<p class="panel-subtitle">Aucune ville ajoutée à ce pays pour le moment.</p>'}</div></details>`;
  }).join('')}</div>`;
}
function bindCountryMenus() {
  $$('[data-country-menu]').forEach(menu => menu.addEventListener('toggle', () => {
    if (menu.open) expandedCountries.add(menu.dataset.countryMenu); else expandedCountries.delete(menu.dataset.countryMenu);
  }));
}
function openCountryForm(trip, country = null) {
  if (!trip) return;
  openModal(country ? 'Modifier le pays' : 'Ajouter un pays', `<div class="form-grid">${field('Pays', 'countryName', country?.name || '', 'text', { required: true, full: true, placeholder: 'Ex. Japon, Éthiopie, France…' })}</div><p class="form-help photo-hint">Une photo du pays sera ajoutée automatiquement. Tu pourras ensuite ajouter ses villes.</p>`, form => {
    const name = String(form.get('countryName') || '').trim();
    if (!name) return false;
    const duplicate = trip.countries.find(item => item.id !== country?.id && normalizePlace(item.name) === normalizePlace(name));
    if (duplicate) { toast('Ce pays est déjà présent dans le voyage.', true); return false; }
    const item = country || { id: uid('country'), cover: '' };
    const changed = item.name !== name;
    item.name = name;
    if (changed) { item.cover = ''; item.photoKey = ''; item.photoStatus = ''; item.photoSource = ''; }
    if (!country) trip.countries.push(item);
    trip.stops.filter(stop => stop.countryId === item.id).forEach(stop => { stop.country = name; });
    expandedCountries.add(item.id);
    persist(country ? 'Pays modifié.' : 'Pays ajouté.'); render();
  });
}
function openCountryChooser(trip) {
  if (!trip.countries.length) { openCountryForm(trip); return; }
  openModal('Choisir le pays', `<div class="form-grid">${field('Ajouter la ville dans…', 'countryId', trip.countries[0].id, 'select', { options: trip.countries.map(item => [item.id, item.name]) })}</div>`, form => {
    const id = String(form.get('countryId'));
    closeModal(); openStopForm(trip, null, id);
    return false;
  }, 'Continuer');
}
function destinationCredit(entity) {
  return `<a class="photo-credit" data-credit-id="${entity.id}" href="${esc(entity.photoSource || '#')}" target="_blank" rel="noreferrer" ${entity.photoSource ? '' : 'hidden'}>Photo · Wikivoyage / Wikimedia</a>`;
}
function destinationPhoto(entity, className) {
  return `<div class="destination-photo ${className}" data-photo-id="${entity.id}"><img alt="${esc(entity.city || entity.name || entity.title || '')}" ${entity.cover ? `src="${esc(entity.cover)}"` : 'hidden'} loading="lazy"><span class="photo-state" ${entity.cover ? 'hidden' : ''}>Photo en recherche</span>${destinationCredit(entity)}</div>`;
}
function findDestination(id) {
  for (const trip of state.data.trips) {
    if (trip.id === id) return trip;
    const country = trip.countries.find(item => item.id === id); if (country) return country;
    const stop = trip.stops.find(item => item.id === id); if (stop) return stop;
  }
  return null;
}
function refreshDestinationImages() {
  $$('[data-photo-id]').forEach(element => {
    const entity = findDestination(element.dataset.photoId); if (!entity) return;
    const image = $('img', element); const note = $('.photo-state', element);
    if (entity.cover) {
      image.src = entity.cover; image.hidden = false; note.hidden = true;
      image.onerror = () => { image.hidden = true; note.hidden = false; note.textContent = 'Photo momentanément indisponible'; };
    } else {
      image.hidden = true; note.hidden = false;
      note.textContent = entity.photoStatus === 'error' ? 'Photos indisponibles hors connexion' : entity.photoStatus === 'missing' ? 'Aucune photo trouvée pour ce nom' : 'Photo en recherche';
    }
  });
  $$('[data-banner-id]').forEach(element => {
    const trip = findDestination(element.dataset.bannerId);
    if (trip) element.style.setProperty('--trip-cover', trip.cover ? `url("${trip.cover.replace(/["\\]/g, '')}")` : 'none');
  });
  $$('[data-credit-id]').forEach(link => {
    const entity = findDestination(link.dataset.creditId);
    link.hidden = !entity?.photoSource;
    if (entity?.photoSource) link.href = entity.photoSource;
  });
}
function queueDestination(entity, name, country = '', isCity = false) {
  const key = `${name}|${country}`;
  if (!name) return;
  if (entity.photoKey === key && ['ready', 'missing'].includes(entity.photoStatus)) return;
  if (entity.photoKey === key && ['loading', 'error'].includes(entity.photoStatus) && Date.now() - (entity.photoAttempt || 0) < 30000) return;
  entity.photoKey = key; entity.photoStatus = 'loading'; entity.photoAttempt = Date.now();
  photoQueue.push(async () => {
    const result = await window.ShahrabadDestinations.resolve(name, country);
    const current = findDestination(entity.id);
    if (!current || current.photoKey !== key) return;
    if (result.image) { current.cover = result.image; current.photoSource = result.source; }
    current.photoStatus = result.status;
    if (isCity) {
      if (result.lat !== '' && result.lng !== '' && result.lat != null && result.lng != null) { current.lat = result.lat; current.lng = result.lng; current.geoStatus = 'ready'; }
      else current.geoStatus = 'missing';
    }
    persist(''); refreshDestinationImages();
    if (state.map && state.view === 'trip') updateMap(activeTrip());
  });
}
function hydrateDestinationImages() {
  const trips = state.view === 'home' ? state.data.trips : [activeTrip()].filter(Boolean);
  trips.forEach(trip => {
    queueDestination(trip, trip.mode === 'single' ? trip.country || trip.title : trip.title);
    if (state.view !== 'home') {
      trip.countries.forEach(country => queueDestination(country, country.name));
      trip.stops.forEach(stop => queueDestination(stop, stop.city || stop.name, stop.country || trip.country, true));
    }
  });
  drainPhotoQueue();
}
function drainPhotoQueue() {
  while (photoWorkers < 2 && photoQueue.length) {
    photoWorkers++;
    photoQueue.shift()().catch(() => {}).finally(() => { photoWorkers--; drainPhotoQueue(); });
  }
}


function openTripMenu(trip) {
  if (!trip) return;
  openModal('Options du voyage', `<p class="page-intro">${esc(trip.title)}</p><div class="trip-menu-actions"><button type="button" class="soft-button" data-action="edit-trip" data-id="${trip.id}">Modifier le voyage</button><button type="button" class="ghost-button" data-action="duplicate-trip" data-id="${trip.id}">Dupliquer le voyage</button><button type="button" class="danger-button" data-action="delete-trip" data-id="${trip.id}">Supprimer le voyage</button></div>`, () => false);
  $('.modal-foot').innerHTML = '<button type="button" class="ghost-button" data-action="close-modal">Fermer</button>'; bindActions();
}
function activityCategories() {
  const categories = ['Découverte', 'Culture', 'Nature', 'Sport', 'Restaurant', 'Shopping', 'Détente', 'Expérience', 'Autre'];
  return `<fieldset class="category-picker"><legend>Catégories <span>Plusieurs choix possibles</span></legend><div>${categories.map((category, index) => `<label><input type="checkbox" name="categories" value="${esc(category)}" ${index === 0 ? 'checked' : ''}><span>${esc(category)}</span></label>`).join('')}</div></fieldset>`;
}
function configureItemDates(type, trip, initialStop, root) {
  const selectedId = $('[name="stopId"]', root)?.value;
  const stop = selectedId ? trip.stops.find(item => item.id === selectedId) : type === 'expense' ? null : initialStop;
  const bounds = window.ShahrabadSchedule.itemBounds(trip, stop);
  if (type === 'accommodation') {
    const ends = (stop?.accommodations || []).map(item => item.checkOut).filter(Boolean);
    const min = [bounds.min, ...ends].filter(Boolean).sort().pop() || bounds.min;
    window.ShahrabadDates.setBounds(root, 'checkIn', { min, max: bounds.max, defaultDate: min });
    window.ShahrabadDates.setBounds(root, 'checkOut', { min, max: bounds.max, defaultDate: min });
    window.ShahrabadDates.bindPair(root, 'checkIn', 'checkOut', { min, max: bounds.max });
  } else window.ShahrabadDates.setBounds(root, 'date', { ...bounds, defaultDate: bounds.min });
}
function openTicket(trip, type, stopId, itemId) {
  const stop = trip?.stops.find(item => item.id === stopId);
  const collection = type === 'activity' ? 'activities' : type === 'accommodation' ? 'accommodations' : 'transports';
  const item = stop?.[collection]?.find(entry => entry.id === itemId);
  if (!item) return;
  openModal('Mon billet', window.ShahrabadTickets.viewer(item, type), () => {
    const attachment = window.ShahrabadTickets.read($('#activeForm'));
    if (attachment.ticketAttachment) {
      const previous = item.ticketAttachment;
      Object.assign(item, attachment);
      if (!persist('Billet enregistré sur cet appareil.')) { if (previous) item.ticketAttachment = previous; else delete item.ticketAttachment; return false; }
      render();
    }
  }, 'Enregistrer / fermer');
}
function renderFriendsBudget() {
  return `<div class="panel friends-panel"><div class="panel-head"><div><h3>Entre amis</h3><span class="panel-subtitle">Partage des dépenses · en préparation</span></div></div><div class="panel-body"><div class="friends-empty">Aucun participant invité pour le moment.</div><button class="soft-button" type="button" data-action="friends">Inviter des amis</button><div class="friends-controls"><button type="button" class="ghost-button" data-action="feature-soon">Payé par</button><button type="button" class="ghost-button" data-action="feature-soon">Répartir</button><button type="button" class="ghost-button" data-action="feature-soon">Voir les soldes</button></div><p class="form-help">Les invitations, participants et remboursements seront connectés plus tard. Aucun calcul de dettes n’est effectué.</p></div></div>`;
}
function openFriendsPreview() {
  openModal('Voyager entre amis', `<div class="friends-preview"><span class="pill">En préparation</span><h3>Un voyage, des comptes partagés.</h3><p class="page-intro">Les amis invités apparaîtront ici, puis dans les dépenses. Tu pourras préciser qui a payé, répartir les montants et consulter qui doit rembourser qui.</p><div class="friends-controls"><button type="button" class="soft-button" data-action="feature-soon">Inviter un ami</button><button type="button" class="ghost-button" data-action="feature-soon">Voir les participants</button><button type="button" class="ghost-button" data-action="feature-soon">Partager une dépense</button></div><p class="form-help">Pour l’instant, ces boutons présentent la future fonctionnalité : aucune invitation n’est envoyée.</p></div>`, () => {} , 'Fermer');
}
function swapCurrencies() {
  const from = $('#convertFrom'); const to = $('#convertTo'); if (!from || !to) return;
  const previous = from.value; from.value = to.value; to.value = previous; updateConverter();
}
function setMapProvider(name) {
  if (!state.map) return;
  const selected = name === 'light' ? 'light' : 'dark';
  if ($('#mapProvider')) $('#mapProvider').value = selected;
  if (state.tileLayer) { state.map.removeLayer(state.tileLayer); state.tileLayer = null; }
  const status = $('#mapStatus');
  if (!window.ShahrabadVectorLayer) { if (status) status.textContent = 'Chargement de la carte vectorielle…'; return; }
  const credit = '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> · <a href="https://carto.com/attribution/">© CARTO</a>';
  if (!state.map._shahrabadCredit) { state.map.attributionControl.addAttribution(credit); state.map._shahrabadCredit = true; }
  try {
    const layer = window.ShahrabadVectorLayer({
      style: selected === 'dark' ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      pane: 'tilePane', attribution: credit
    });
    state.tileLayer = layer;
    layer.addTo(state.map);
    const gl = layer.getMaplibreMap();
    gl.on('error', () => { if (state.tileLayer === layer && $('#mapStatus')) $('#mapStatus').textContent = 'Fond indisponible : vérifie la connexion ou réessaie. Les marqueurs et données du voyage sont conservés.'; });
    gl.on('idle', () => { if (state.tileLayer === layer && gl.isStyleLoaded() && $('#mapStatus')) $('#mapStatus').textContent = ''; });
    if (status) status.textContent = 'Chargement du fond…';
    try { localStorage.setItem('shahrabad:map-provider', selected); } catch (_) {}
  } catch (_) {
    if (status) status.textContent = 'Le fond vectoriel nécessite WebGL dans ce navigateur. Les étapes restent enregistrées.';
  }
}
window.addEventListener('shahrabad:map-ready', () => { if (state.map && $('#map')) setMapProvider($('#mapProvider')?.value || 'dark'); });

$('#importInput')?.addEventListener('change', event => { if (event.target.files[0]) importData(event.target.files[0]); event.target.value = ''; });
window.addEventListener('hashchange', () => { if (location.hash === '#home') { state.view = 'home'; state.tripId = null; render(); } });
state.data = loadData(); render(); bindActions(); fetchRates();
