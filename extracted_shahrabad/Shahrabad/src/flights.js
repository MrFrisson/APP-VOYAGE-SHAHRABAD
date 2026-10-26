/* ShahrabadFlights — vols, pièces jointes et suivi optionnel. Le module ne possède ni formulaire ni document. */
(function (global) {
  'use strict';

  var timers = new Map();
  var controllers = new Map();
  var boundRoot = null;
  var boundTrip = null;
  var clickHandler = null;
  var visibilityHandler = null;
  var timerApi = global || {};
  var operationalStates = {
    live: 'En vol',
    landed: 'Atterri',
    scheduled: 'Programmé',
    cancelled: 'Annulé',
    delayed: 'Retardé',
    not_found: 'Vol introuvable',
    unavailable: 'Statut indisponible',
    not_connected: 'Non connecté'
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function text(value, fallback) {
    var result = String(value == null ? '' : value).trim();
    return result || (fallback || '—');
  }

  function clone(value, seen) {
    if (value === null || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function' && !seen) {
      try { return structuredClone(value); } catch (_) { /* fallback below */ }
    }
    seen = seen || [];
    for (var i = 0; i < seen.length; i += 1) if (seen[i][0] === value) return seen[i][1];
    var output = Array.isArray(value) ? [] : {};
    seen.push([value, output]);
    Object.keys(value).forEach(function (key) { output[key] = clone(value[key], seen); });
    return output;
  }

  function isFlight(item) {
    if (!item || typeof item !== 'object') return false;
    var type = String(item.type || item.typeflight || item.typeFlight || '').toLowerCase();
    return type === 'flight' || type === 'vol' || item.typeflight === true || item.isFlight === true;
  }

  function stableId(item, prefix, index, stopId) {
    var existing = String(item && item.id != null ? item.id : '').trim();
    if (existing) return existing;
    return prefix + '-' + (stopId ? String(stopId) + '-' : '') + String(index + 1);
  }

  function list(trip) {
    trip = trip || {};
    var result = [];
    var used = Object.create(null);
    function push(item, source, index, stopId, stopIndex) {
      if (!item || typeof item !== 'object') return;
      var decorated = clone(item);
      var id = stableId(item, 'flight', index, stopId);
      var base = id;
      var suffix = 2;
      while (used[id]) id = base + '-' + suffix++;
      used[id] = true;
      decorated.id = id;
      if (stopId) decorated.stopId = String(stopId);
      decorated.source = source;
      decorated.sourceIndex = index;
      decorated.sourceStopIndex = stopIndex;
      result.push(decorated);
    }
    (Array.isArray(trip.flights) ? trip.flights : []).forEach(function (flight, index) {
      push(flight, 'trip.flights', index, '');
    });
    (Array.isArray(trip.stops) ? trip.stops : []).forEach(function (stop, stopIndex) {
      var stopId = stop && stop.id != null ? stop.id : 'stop-' + (stopIndex + 1);
      (Array.isArray(stop && stop.transports) ? stop.transports : []).forEach(function (transport, index) {
        if (isFlight(transport)) push(transport, 'stop.transports', index, stopId, stopIndex);
      });
    });
    return result;
  }

  function resolveListed(trip, flight) {
    if (!flight) return null;
    var stop = flight.source === 'stop.transports' ? (trip.stops || [])[flight.sourceStopIndex] : null;
    var collection = stop ? stop.transports : trip.flights;
    var item = collection && collection[flight.sourceIndex];
    return item ? { item: item, collection: collection, stop: stop } : null;
  }
  function resolve(trip, id) {
    return resolveListed(trip, list(trip).find(function (flight) { return String(flight.id) === String(id); }));
  }
  function normalize(trip) {
    list(trip).forEach(function (flight) {
      var found = resolveListed(trip, flight);
      if (found) { found.item.id = flight.id; found.item.type = 'flight'; }
    });
    return trip;
  }

  function documentList(trip) {
    return (Array.isArray(trip && trip.documents) ? trip.documents : []).map(function (document, index) {
      var item = clone(document || {});
      item.id = item.id != null && String(item.id) ? String(item.id) : 'document-' + (index + 1);
      item.title = text(item.title, 'Document');
      item.type = text(item.type, 'Document');
      if (item.flightId != null && String(item.flightId)) item.flightId = String(item.flightId);
      if (item.ticketAttachment && typeof item.ticketAttachment === 'object') item.ticketAttachment = clone(item.ticketAttachment);
      return item;
    });
  }

  function docsForFlight(documents, flightId) {
    return documents.filter(function (item) { return String(item.flightId || '') === String(flightId); });
  }

  function dateLabel(value) {
    if (!value) return 'Date à préciser';
    var raw = String(value);
    var date = new Date(raw.length === 10 ? raw + 'T12:00:00' : raw);
    if (Number.isNaN(date.getTime())) return text(value, 'Date à préciser');
    try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date); }
    catch (_) { return raw; }
  }

  function flightNumber(flight) {
    /* PNR/reference is intentionally not a fallback: only these two fields are flight numbers. */
    return text(flight && (flight.flightNumber || flight.number), 'Numéro à préciser');
  }

  function renderDocumentButton(document, flightId) {
    var id = document && document.id != null ? document.id : '';
    return '<button type="button" class="flight-document" data-action="open-document" data-id="' + esc(id) + '"' + (flightId ? ' data-flight-id="' + esc(flightId) + '"' : '') + '>' + esc(text(document && document.title, 'Document')) + '</button>';
  }

  function renderFlight(flight, documents) {
    var related = docsForFlight(documents, flight.id);
    return '<article class="flight-card" data-flight-id="' + esc(flight.id) + '" data-flight-source="' + esc(flight.source || '') + '">' +
      '<div class="flight-card-main">' +
        '<div class="flight-card-top"><span class="flight-label">' + esc(flight.company || 'Compagnie à préciser') + '</span><span class="flight-number">' + esc(flightNumber(flight)) + '</span></div>' +
        '<div class="boarding-route"><div><strong>' + esc(text(flight.from, 'Départ')) + '</strong><small>Départ</small></div><span class="route-line" aria-hidden="true">→</span><div class="route-arrival"><strong>' + esc(text(flight.to, 'Arrivée')) + '</strong><small>Arrivée</small></div></div>' +
        '<div class="flight-meta"><span>' + esc(dateLabel(flight.date)) + '</span><span>' + esc(text(flight.time, 'Heure à préciser')) + '</span></div>' +
      '</div>' +
      '<div class="flight-card-side">' +
        '<div class="flight-actions"><button type="button" class="soft-button" data-action="edit-flight" data-id="' + esc(flight.id) + '">Modifier</button><button type="button" class="ghost-button" data-action="flight-ticket" data-id="' + esc(flight.id) + '">Ouvrir le billet</button></div>' +
        '<div class="flight-document-actions" aria-label="Ajouter un document au vol"><button type="button" class="flight-document-add" data-action="flight-document" data-kind="ticket" data-id="' + esc(flight.id) + '">+ Billet</button><button type="button" class="flight-document-add" data-action="flight-document" data-kind="visa" data-id="' + esc(flight.id) + '">+ Visa</button><button type="button" class="flight-document-add" data-action="flight-document" data-kind="extra" data-id="' + esc(flight.id) + '">+ Extra</button></div>' +
        (related.length ? '<div class="flight-documents" aria-label="Documents liés">' + related.map(function (document) { return renderDocumentButton(document, flight.id); }).join('') + '</div>' : '') +
        '<div class="flight-live" data-flight-id="' + esc(flight.id) + '" data-live-state="not_connected"><div class="flight-live-copy"><span class="flight-live-kicker">Suivi du vol</span><strong data-flight-message>Suivi non connecté</strong><span class="flight-live-detail" data-flight-detail></span></div><button type="button" class="track-flight" data-track-flight="' + esc(flight.id) + '" data-flight-id="' + esc(flight.id) + '">Suivre le vol</button></div>' +
      '</div>' +
    '</article>';
  }

  function renderGlobalDocuments(documents) {
    var globalDocuments = documents.filter(function (document) { return !document.flightId; });
    if (!globalDocuments.length) return '<p class="flight-panel-note">Aucun document global pour le moment.</p>';
    return '<div class="flight-global-documents">' + globalDocuments.map(function (document) { return '<div class="flight-global-document"><span><strong>' + esc(document.title) + '</strong><small>' + esc(document.type) + '</small></span>' + renderDocumentButton(document, '') + '</div>'; }).join('') + '</div>';
  }

  function render(trip) {
    var flights = list(trip);
    var documents = documentList(trip || {});
    return '<section class="flights-panel panel" data-flights-panel aria-labelledby="flights-title">' +
      '<div class="panel-head flights-panel-head"><div><p class="eyebrow">Carnet aérien</p><h2 id="flights-title">Vols &amp; documents</h2><span class="panel-subtitle">Billets, justificatifs et suivi optionnel dans un seul espace.</span></div><button type="button" class="primary-button" data-action="add-flight">+ Ajouter un vol</button></div>' +
      '<div class="panel-body flights-panel-body">' +
      (flights.length ? '<div class="flight-list">' + flights.map(function (flight) { return renderFlight(flight, documents); }).join('') + '</div>' : '<div class="empty-state flight-empty"><strong>Ajoute ton premier vol</strong><span>Les vols apparaîtront ici sans inventer de statut ni de numéro.</span><button type="button" class="primary-button" data-action="add-flight">+ Ajouter un vol</button></div>') +
      '<section class="flight-documents-panel" aria-labelledby="global-flight-documents-title"><div class="flight-documents-head"><div><h3 id="global-flight-documents-title">Documents du voyage</h3><span class="panel-subtitle">Les documents globaux restent accessibles depuis le carnet.</span></div><button type="button" class="soft-button" data-action="add-flight-document">+ Document</button></div>' + renderGlobalDocuments(documents) + '</section>' +
      '</div></section>';
  }

  function resolveRoot(root) {
    if (typeof root === 'string' && global.document && global.document.querySelector) return global.document.querySelector(root);
    return root || (global.document || null);
  }

  function documentVisible() {
    return !global.document || global.document.hidden !== true;
  }

  function rootContains(node) {
    return Boolean(boundRoot && node && (!boundRoot.contains || boundRoot.contains(node)));
  }

  function nodesFor(id) {
    if (!boundRoot || !boundRoot.querySelectorAll) return [];
    var nodes = boundRoot.querySelectorAll('.flight-live[data-flight-id="' + cssEscape(id) + '"]');
    return Array.prototype.slice.call(nodes || []);
  }

  function cssEscape(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, function (character) { return '\\' + character.charCodeAt(0).toString(16) + ' '; });
  }

  function findFlight(id) {
    return list(boundTrip).find(function (flight) { return String(flight.id) === String(id); }) || null;
  }

  function setLive(id, state, message, detail) {
    nodesFor(id).forEach(function (node) {
      if (!rootContains(node)) return;
      node.setAttribute('data-live-state', state);
      var messageNode = node.querySelector('[data-flight-message]');
      var detailNode = node.querySelector('[data-flight-detail]');
      if (messageNode) messageNode.textContent = message;
      if (detailNode) detailNode.textContent = detail || '';
    });
  }

  function setLoading(id, loading) {
    if (!boundRoot || !boundRoot.querySelectorAll) return;
    var buttons = boundRoot.querySelectorAll('[data-track-flight="' + cssEscape(id) + '"]');
    Array.prototype.forEach.call(buttons || [], function (button) {
      button.disabled = loading;
      button.setAttribute('aria-busy', loading ? 'true' : 'false');
      if (loading) button.setAttribute('data-track-label', button.textContent || '');
      button.textContent = loading ? 'Connexion…' : (button.getAttribute('data-track-label') || 'Suivre le vol');
    });
  }

  function validISO(value) {
    if (typeof value !== 'string' || !value || !/T/.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
  }

  function detailForStatus(data) {
    var parts = [];
    if (data.source) parts.push('Source : ' + String(data.source));
    if (validISO(data.updatedAt)) parts.push('Observation : ' + String(data.updatedAt));
    var departure = data.departure && [data.departure.airport, data.departure.time].filter(Boolean).join(' · ');
    var arrival = data.arrival && [data.arrival.airport, data.arrival.time].filter(Boolean).join(' · ');
    if (departure) parts.push('Départ : ' + departure);
    if (arrival) parts.push((data.arrival.estimated ? 'Arrivée estimée : ' : 'Arrivée : ') + arrival);
    if (data.message) parts.push(String(data.message));
    if (data.position && typeof data.position === 'object' && ['latitude', 'longitude'].every(function (key) { return data.position[key] != null; })) {
      parts.push('Position : ' + String(data.position.latitude) + ', ' + String(data.position.longitude));
    }
    return parts.join(' · ');
  }

  function acceptedStatus(data) {
    return Boolean(data && data.connected === true && operationalStates[data.state] && data.state !== 'not_connected' && typeof data.source === 'string' && data.source.trim() && validISO(data.updatedAt));
  }

  function schedule(id) {
    if (timers.has(id) || !documentVisible()) return;
    var scheduleFn = timerApi.setTimeout || setTimeout;
    timers.set(id, scheduleFn(function () {
      timers.delete(id);
      if (!documentVisible() || !boundRoot || !findFlight(id)) return;
      requestStatus(id, true);
    }, 60000));
  }

  async function requestStatus(id, automatic) {
    var flight = findFlight(id);
    if (!flight || !documentVisible() || !boundRoot) return;
    var number = String(flight.flightNumber || flight.number || '').trim();
    var date = String(flight.date || '').trim();
    if (!number || !date) {
      setLive(id, 'not_connected', 'Suivi non connecté', 'Numéro de vol et date requis pour interroger le suivi.');
      return;
    }
    if (automatic && !rootContains(nodesFor(id)[0])) return;
    if (controllers.has(id)) return;
    var controller = typeof global.AbortController === 'function' ? new global.AbortController() : null;
    controllers.set(id, controller);
    setLoading(id, true);
    setLive(id, 'loading', 'Connexion au suivi…', 'Aucun document ni référence de réservation n’est envoyé.');
    var timeout = (timerApi.setTimeout || setTimeout)(function () { if (controller) controller.abort(); }, 10000);
    try {
      var query = '?number=' + encodeURIComponent(number) + '&date=' + encodeURIComponent(date);
      var response = await global.fetch('/api/flight-status' + query, controller ? { method: 'GET', signal: controller.signal } : { method: 'GET' });
      var payload = null;
      try { payload = await response.json(); } catch (_) { payload = null; }
      if (response.status === 503 && payload && payload.connected === false) {
        setLive(id, 'not_connected', 'Suivi non connecté', payload.message || 'Le fournisseur de suivi est indisponible pour le moment.');
      } else if (response.status === 404 || !response.ok || !payload || !acceptedStatus(payload)) {
        setLive(id, 'not_connected', 'Suivi non connecté', 'Aucune connexion de suivi valide. Réessaie manuellement.');
      } else {
        setLive(id, payload.state, operationalStates[payload.state], detailForStatus(payload));
        schedule(id);
      }
    } catch (error) {
      if (error && error.name === 'AbortError') setLive(id, 'not_connected', 'Suivi non connecté', 'Connexion interrompue ou délai dépassé. Réessaie manuellement.');
      else setLive(id, 'not_connected', 'Suivi non connecté', 'Service de suivi indisponible. Réessaie manuellement.');
    } finally {
      (timerApi.clearTimeout || clearTimeout)(timeout);
      if (controllers.get(id) === controller) controllers.delete(id);
      setLoading(id, false);
    }
  }

  function onVisibilityChange() {
    if (!documentVisible()) {
      timers.forEach(function (timer) { (timerApi.clearTimeout || clearTimeout)(timer); });
      timers.clear();
      controllers.forEach(function (controller) { if (controller && controller.abort) controller.abort(); });
      return;
    }
    /* A connected tracker resumes at the normal cadence; hidden tabs never poll immediately. */
    if (boundRoot && boundRoot.querySelectorAll) {
      Array.prototype.forEach.call(boundRoot.querySelectorAll('.flight-live[data-live-state]') || [], function (node) {
        var state = node.getAttribute('data-live-state');
        var id = node.getAttribute('data-flight-id');
        if (id && state && state !== 'not_connected' && state !== 'loading') schedule(id);
      });
    }
  }

  function bind(root, trip) {
    dispose();
    boundRoot = resolveRoot(root);
    boundTrip = trip || {};
    if (!boundRoot || !boundRoot.addEventListener) return boundRoot;
    clickHandler = function (event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-track-flight]') : null;
      if (!target || !rootContains(target)) return;
      event.preventDefault();
      requestStatus(target.getAttribute('data-flight-id') || target.getAttribute('data-track-flight'), false);
    };
    boundRoot.addEventListener('click', clickHandler);
    if (global.document && global.document.addEventListener) {
      visibilityHandler = onVisibilityChange;
      global.document.addEventListener('visibilitychange', visibilityHandler);
    }
    return boundRoot;
  }

  function dispose() {
    timers.forEach(function (timer) { (timerApi.clearTimeout || clearTimeout)(timer); });
    timers.clear();
    controllers.forEach(function (controller) { if (controller && controller.abort) controller.abort(); });
    controllers.clear();
    if (boundRoot && clickHandler && boundRoot.removeEventListener) boundRoot.removeEventListener('click', clickHandler);
    if (global.document && visibilityHandler && global.document.removeEventListener) global.document.removeEventListener('visibilitychange', visibilityHandler);
    boundRoot = null;
    boundTrip = null;
    clickHandler = null;
    visibilityHandler = null;
  }

  global.ShahrabadFlights = { render: render, bind: bind, dispose: dispose, list: list, resolve: resolve, normalize: normalize };
}(typeof window !== 'undefined' ? window : globalThis));
