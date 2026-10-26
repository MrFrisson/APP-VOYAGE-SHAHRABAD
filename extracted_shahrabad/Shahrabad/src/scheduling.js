/* ShahrabadSchedule — dates locales, périodes parents et transitions sans chevauchement. */
(function (global) {
  'use strict';
  function parse(value) {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
  }
  function localISO(value) {
    var date = parse(value);
    return date ? date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') : '';
  }
  function maximum(values) { return values.filter(Boolean).sort().pop() || ''; }
  function minimum(values) { return values.filter(Boolean).sort()[0] || ''; }
  function globalBounds(trip) { return { min: localISO(trip && trip.startDate), max: localISO(trip && trip.endDate) }; }
  function countryOrder(trip, id) { var index = (trip.countries || []).findIndex(function (country) { return country.id === id; }); return index < 0 ? 1000000 : index; }
  function orderedStops(trip) {
    return (trip.stops || []).slice().sort(function (a, b) {
      var countries = trip.mode === 'multi' ? countryOrder(trip, a.countryId) - countryOrder(trip, b.countryId) : 0;
      return countries || Number(a.order || 0) - Number(b.order || 0);
    });
  }
  function sameId(a, b) { return a === b || Boolean(a && b && a.id && a.id === b.id); }
  function stopBounds(trip, stop, countryId) {
    var ordered = orderedStops(trip); var index = stop ? ordered.findIndex(function (item) { return sameId(item, stop); }) : -1;
    var existing = index >= 0;
    if (!existing) {
      index = ordered.length;
      if (trip.mode === 'multi' && countryId) {
        var wanted = countryOrder(trip, countryId);
        var after = ordered.findIndex(function (item) { return countryOrder(trip, item.countryId) > wanted; });
        if (after >= 0) index = after;
      }
    }
    var previous = index > 0 ? ordered[index - 1] : null;
    var next = ordered[index + (existing ? 1 : 0)] || null;
    var bounds = globalBounds(trip);
    return { min: maximum([bounds.min, localISO(previous && previous.departure)]), max: minimum([bounds.max, localISO(next && next.arrival)]) };
  }
  function itemBounds(trip, stop) {
    var bounds = globalBounds(trip);
    return stop ? { min: maximum([bounds.min, localISO(stop.arrival)]), max: minimum([bounds.max, localISO(stop.departure)]) } : bounds;
  }
  function dateError(label, value, bounds) {
    if (!value) return '';
    var date = localISO(value);
    if (!date) return 'La date « ' + label + ' » est invalide.';
    if ((bounds.min && date < bounds.min) || (bounds.max && date > bounds.max)) return 'La date « ' + label + ' » doit rester dans la période autorisée (' + (bounds.min || '…') + ' → ' + (bounds.max || '…') + ').';
    return '';
  }
  function overlaps(a, b, c, d) { return Boolean(a && b && c && d && a < b && c < d && a < d && b > c); }
  function name(stop) { return (stop && (stop.city || stop.name)) || 'cette ville'; }
  function childrenError(trip, stop, arrival, departure) {
    if (!stop) return '';
    var bounds = { min: arrival, max: departure }; var collections = [['activities', 'activité'], ['transports', 'transport']];
    for (var c = 0; c < collections.length; c++) {
      var children = stop[collections[c][0]] || [];
      for (var i = 0; i < children.length; i++) {
        var error = dateError(collections[c][1] + ' de ' + name(stop), children[i].date, bounds);
        if (error) return error + ' Ajuste cet élément avant de modifier la ville.';
      }
    }
    var stays = stop.accommodations || [];
    for (var h = 0; h < stays.length; h++) {
      var inError = dateError('arrivée de l’hébergement', stays[h].checkIn, bounds) || dateError('départ de l’hébergement', stays[h].checkOut, bounds);
      if (inError) return inError;
      if (stays[h].checkIn && stays[h].checkOut && stays[h].checkOut < stays[h].checkIn) return 'Les dates d’un hébergement de ' + name(stop) + ' sont inversées.';
      for (var j = h + 1; j < stays.length; j++) if (overlaps(stays[h].checkIn, stays[h].checkOut, stays[j].checkIn, stays[j].checkOut)) return 'Deux hébergements de ' + name(stop) + ' se chevauchent.';
    }
    var expenses = (trip.expenses || []).filter(function (item) { return item.stopId === stop.id; });
    for (var e = 0; e < expenses.length; e++) { var expenseError = dateError('dépense de ' + name(stop), expenses[e].date, bounds); if (expenseError) return expenseError; }
    return '';
  }
  function validateStop(trip, stop, arrival, departure, countryId) {
    var a = localISO(arrival), d = localISO(departure);
    if (!a || !d) return 'Les dates d’arrivée et de départ de la ville sont requises.';
    if (d < a) return 'Le départ doit être le jour d’arrivée ou après.';
    var bounds = stopBounds(trip, stop, countryId);
    if ((bounds.min && a < bounds.min) || (bounds.max && d > bounds.max)) return 'La ville doit rester dans son créneau disponible (' + (bounds.min || '…') + ' → ' + (bounds.max || '…') + '), sans chevauchement.';
    var others = trip.stops || [];
    for (var i = 0; i < others.length; i++) if (!sameId(others[i], stop) && overlaps(a, d, localISO(others[i].arrival), localISO(others[i].departure))) return 'Cette période chevauche ' + name(others[i]) + '. Le jour de départ peut servir d’arrivée suivante.';
    return childrenError(trip, stop, a, d);
  }
  function validateTrip(trip, start, end) {
    var s = localISO(start), e = localISO(end);
    if (!s || !e) return 'Les dates de départ et de retour du voyage sont requises.';
    if (e < s) return 'Le retour doit être le jour du départ ou après.';
    var candidate = Object.assign({}, trip, { startDate: s, endDate: e });
    var stops = orderedStops(candidate);
    for (var i = 0; i < stops.length; i++) {
      var hasChildren = ['activities', 'transports', 'accommodations'].some(function (key) { return (stops[i][key] || []).length > 0; }) || (trip.expenses || []).some(function (item) { return item.stopId === stops[i].id && item.date; });
      if (stops[i].arrival || stops[i].departure || hasChildren) {
        var error = validateStop(candidate, stops[i], stops[i].arrival, stops[i].departure, stops[i].countryId);
        if (error) return name(stops[i]) + ' : ' + error;
      }
    }
    var expenses = trip.expenses || [];
    for (var j = 0; j < expenses.length; j++) { var expenseError = dateError('dépense', expenses[j].date, { min: s, max: e }); if (expenseError) return expenseError; }
    var flights = trip.flights || [];
    for (var k = 0; k < flights.length; k++) { var flightError = dateError('vol', flights[k].date, { min: s, max: e }); if (flightError) return flightError; }
    return '';
  }
  function validateItem(type, trip, stop, values) {
    values = values || {};
    if (!stop && values.stopId) stop = (trip.stops || []).find(function (item) { return item.id === values.stopId; });
    var bounds = itemBounds(trip, stop);
    var normalized = String(type || '').toLowerCase();
    if (stop && (!localISO(stop.arrival) || !localISO(stop.departure))) return 'Fixe d’abord les dates d’arrivée et de départ de la ville.';
    if (['activity', 'activities', 'transport', 'transports', 'expense', 'expenses'].indexOf(normalized) >= 0) return dateError(normalized, values.date || values.activityDate || values.transportDate, bounds);
    if (['accommodation', 'accommodations', 'lodging', 'hotel', 'hébergement'].indexOf(normalized) >= 0) {
      var error = dateError('arrivée de l’hébergement', values.checkIn, bounds) || dateError('départ de l’hébergement', values.checkOut, bounds);
      if (error) return error;
      var first = localISO(values.checkIn), last = localISO(values.checkOut);
      if (first && last && last < first) return 'Le départ de l’hébergement doit être le jour d’arrivée ou après.';
      if (Boolean(first) !== Boolean(last)) return 'Choisis l’arrivée et le départ de l’hébergement ensemble.';
      var stays = stop ? stop.accommodations || [] : [];
      for (var i = 0; i < stays.length; i++) if (stays[i].id !== values.id && overlaps(first, last, localISO(stays[i].checkIn), localISO(stays[i].checkOut))) return 'Cet hébergement chevauche un autre hébergement dans la même ville.';
    }
    return '';
  }
  var api = { localISO: localISO, stopBounds: stopBounds, itemBounds: itemBounds, validateTrip: validateTrip, validateStop: validateStop, validateItem: validateItem };
  global.ShahrabadSchedule = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
