/* Formulaires de vols et documents ; aucune clé ni donnée distante dans le navigateur. */
(function (global) {
  'use strict';

  function findFlight(trip, id) {
    return global.ShahrabadFlights.resolve(trip, id);
  }
  function updateEntity(item, values, collection, isNew, message) {
    const previous = { ...item };
    Object.assign(item, values);
    if (isNew) collection.push(item);
    if (!persist(message)) {
      if (isNew) collection.splice(collection.indexOf(item), 1);
      else { Object.keys(values).forEach(key => delete item[key]); Object.assign(item, previous); }
      return false;
    }
    render();
  }
  function openFlightForm(trip, id) {
    if (!trip) return;
    if (!trip.startDate || !trip.endDate) { toast('Choisis d’abord les dates du voyage.', true); openTripForm(trip); return; }
    const found = id ? findFlight(trip, id) : null;
    if (id && !found) return;
    const item = found?.item || { id: uid('flight'), type: 'flight' };
    const bounds = global.ShahrabadSchedule.itemBounds(trip, found?.stop);
    const body = `<div class="form-grid">${field('Numéro du vol', 'flightNumber', item.flightNumber || item.number || '', 'text', { required: true, placeholder: 'Ex. AF002, ET704, SQ322' })}${field('Compagnie', 'company', item.company || '', 'text')}${field('Aéroport de départ', 'from', item.from || '', 'text', { required: true, placeholder: 'Ex. Paris CDG' })}${field('Aéroport d’arrivée', 'to', item.to || '', 'text', { required: true, placeholder: 'Ex. Tokyo HND' })}${dateField('Date du départ', 'date', item.date || '', { ...bounds, defaultDate: bounds.min, required: true })}${field('Heure locale du départ', 'time', item.time || '', 'time')}${field('Référence de réservation (facultative)', 'reference', item.reference || '', 'text')}${field('Lien du billet (facultatif)', 'ticketUrl', item.ticketUrl || '', 'url', { placeholder: 'https://…' })}</div><p class="form-help">La date et l’heure ci-dessus sont celles de ton billet, pas un statut en direct. Le suivi externe utilise uniquement le numéro et la date ; aucune référence ni pièce personnelle n’est transmise.</p>${global.ShahrabadTickets.controls()}`;
    openModal(found ? 'Modifier le vol' : 'Ajouter un vol', body, form => {
      const values = Object.fromEntries(form.entries());
      const number = values.flightNumber.toUpperCase().replace(/\s/g, '');
      if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(number)) { toast('Indique un numéro de vol valide, par exemple AF002 ou ET704.', true); return false; }
      const error = global.ShahrabadSchedule.validateItem('transport', trip, found?.stop, values);
      if (!values.date || error) { toast(error || 'Choisis la date du vol.', true); return false; }
      const attachment = global.ShahrabadTickets.read(document.querySelector('#activeForm'));
      trip.flights = trip.flights || [];
      return updateEntity(item, { type: 'flight', flightNumber: number, company: values.company.trim(), from: values.from.trim(), to: values.to.trim(), date: values.date, time: values.time, reference: values.reference, ticketUrl: values.ticketUrl, ...attachment }, found?.collection || trip.flights, !found, 'Vol enregistré.');
    });
  }
  function openDocumentForm(trip, options = {}) {
    if (!trip) return;
    const existing = options.id ? trip.documents.find(doc => doc.id === options.id) : null;
    if (options.id && !existing) return;
    const types = { ticket: 'Billet d’avion', visa: 'Visa', extra: 'Document complémentaire' };
    const item = existing || { id: uid('doc') };
    const flights = global.ShahrabadFlights.list(trip);
    const selectedFlight = existing?.flightId || options.flightId || '';
    const body = `<div class="form-grid">${field('Titre du document', 'title', existing?.title || types[options.kind] || '', 'text', { required: true, full: true })}${field('Type', 'type', existing?.type || types[options.kind] || 'Document complémentaire', 'select', { options: [...new Set([existing?.type, ...Object.values(types), 'Assurance', 'Réservation', 'Autre'].filter(Boolean))].map(type => [type, type]) })}${field('Vol associé', 'flightId', selectedFlight, 'select', { options: [['', 'Voyage entier'], ...flights.map(flight => [flight.id, `${flight.flightNumber || flight.company || 'Vol'} · ${flight.from || 'Départ'} → ${flight.to || 'Arrivée'}`])] })}${field('Référence (facultative)', 'reference', existing?.reference || '', 'text')}${field('Lien externe (facultatif)', 'url', existing?.url || '', 'url', { placeholder: 'https://…' })}${field('Notes', 'notes', existing?.notes || '', 'textarea', { full: true })}</div>${global.ShahrabadTickets.controls()}<p class="form-help">Billet, visa et pièces complémentaires restent sur cet appareil. L’ajout d’un visa ici ne valide pas son acceptation ni les conditions d’entrée du pays.</p>`;
    openModal(existing ? 'Modifier le document' : 'Ajouter un document', body, form => {
      const values = Object.fromEntries(form.entries());
      if (values.flightId && !findFlight(trip, values.flightId)) { toast('Le vol associé n’existe plus.', true); return false; }
      const attachment = global.ShahrabadTickets.read(document.querySelector('#activeForm'));
      const kind = values.type === 'Visa' ? 'visa' : values.type === 'Billet d’avion' ? 'ticket' : 'extra';
      return updateEntity(item, { title: values.title.trim(), type: values.type, kind, flightId: values.flightId, reference: values.reference, url: values.url, notes: values.notes, ...attachment }, trip.documents, !existing, 'Document enregistré sur cet appareil.');
    });
  }
  function openDocument(trip, id) {
    const item = trip?.documents.find(doc => doc.id === id);
    if (!item) return;
    const body = global.ShahrabadTickets.viewer(item, 'document') + `<button class="ghost-button" type="button" data-action="edit-document" data-id="${esc(item.id)}">Modifier les informations</button>`;
    openModal('Mon document', body, () => {
      const attachment = global.ShahrabadTickets.read(document.querySelector('#activeForm'));
      if (attachment.ticketAttachment) return updateEntity(item, attachment, trip.documents, false, 'Document enregistré sur cet appareil.');
    }, 'Enregistrer / fermer');
  }
  function openFlightTicket(trip, id) {
    const found = findFlight(trip, id);
    if (!found) return;
    const linked = [...trip.documents].reverse().find(doc => doc.flightId === id && (doc.kind === 'ticket' || doc.type === 'Billet d’avion'));
    if (!found.item.ticketAttachment && !found.item.ticketUrl && linked) return openDocument(trip, linked.id);
    openModal('Mon billet d’avion', global.ShahrabadTickets.viewer(found.item, 'transport'), () => {
      const attachment = global.ShahrabadTickets.read(document.querySelector('#activeForm'));
      if (attachment.ticketAttachment) return updateEntity(found.item, attachment, found.collection, false, 'Billet enregistré sur cet appareil.');
    }, 'Enregistrer / fermer');
  }
  function removeFlight(trip, id) {
    const found = findFlight(trip, id);
    if (!found || !confirm('Supprimer ce vol ? Les documents associés restent dans le carnet.')) return;
    const index = found.collection.indexOf(found.item);
    found.collection.splice(index, 1);
    const documents = trip.documents.filter(doc => doc.flightId === id);
    documents.forEach(doc => { doc.flightId = ''; });
    if (!persist('Vol supprimé ; documents conservés.')) { found.collection.splice(index, 0, found.item); documents.forEach(doc => { doc.flightId = id; }); return; }
    render();
  }
  function handle(button, trip) {
    const action = button.dataset.action;
    if (action === 'add-flight') openFlightForm(trip);
    else if (action === 'edit-flight') openFlightForm(trip, button.dataset.id);
    else if (action === 'delete-flight') removeFlight(trip, button.dataset.id);
    else if (action === 'flight-ticket') openFlightTicket(trip, button.dataset.id);
    else if (action === 'flight-document') openDocumentForm(trip, { flightId: button.dataset.id, kind: button.dataset.kind });
    else if (action === 'add-document' || action === 'add-flight-document' || (action === 'open-item' && button.dataset.type === 'document')) openDocumentForm(trip);
    else if (action === 'open-document') openDocument(trip, button.dataset.id);
    else if (action === 'edit-document') openDocumentForm(trip, { id: button.dataset.id });
    else return false;
    return true;
  }
  global.ShahrabadFlightActions = { handle, openFlightForm, openDocumentForm, findFlight };
}(window));
