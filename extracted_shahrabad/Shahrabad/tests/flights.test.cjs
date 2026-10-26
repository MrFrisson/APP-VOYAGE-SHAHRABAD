const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('src/flights.js', 'utf8');
const document = {
  hidden: false,
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; }
};
const context = {
  console, Intl, Date, Math, Map, Set, Promise, URL, AbortController,
  encodeURIComponent, setTimeout, clearTimeout, structuredClone, document
};
context.window = context;
context.globalThis = context;
vm.runInNewContext(source, context, { filename: 'src/flights.js' });
const api = context.ShahrabadFlights;
assert.deepEqual(Object.keys(api).sort(), ['bind', 'dispose', 'list', 'normalize', 'render', 'resolve']);

const attachment = { name: 'boarding.pdf', type: 'application/pdf', dataUrl: 'data:application/pdf;base64,AA==' };
const trip = {
  id: 'trip-1',
  flights: [{ id: 'top-flight', flightNumber: 'SB204', company: 'Shahrabad Air', from: 'CDG', to: 'NRT', date: '2027-04-12', time: '10:30', reference: 'PNR-MUST-NOT-BECOME-FLIGHT-NUMBER', ticketAttachment: attachment }],
  stops: [{ id: 'tokyo', transports: [
    { id: 'nested-flight', type: 'flight', number: 'SB205', from: 'NRT', to: 'MEL', date: '2027-04-18', ticketAttachment: { ...attachment } },
    { id: 'train-1', type: 'train', number: 'TR999', from: 'NRT', to: 'Tokyo' }
  ] }],
  documents: [{ id: 'visa-1', title: 'Visa', type: 'Visa', flightId: 'nested-flight', ticketAttachment: attachment }]
};
const listed = api.list(trip);
assert.equal(listed.length, 2);
assert.deepEqual(Array.from(listed, flight => flight.id), ['top-flight', 'nested-flight']);
assert.equal(listed[0].flightNumber, 'SB204');
assert.equal(listed[0].number, undefined);
assert.equal(listed[1].number, 'SB205');
assert.equal(listed[1].stopId, 'tokyo');
assert.equal(listed[0].ticketAttachment.name, 'boarding.pdf');
assert.notStrictEqual(listed[0], trip.flights[0]);
assert.notStrictEqual(listed[0].ticketAttachment, trip.flights[0].ticketAttachment);
listed[0].ticketAttachment.name = 'changed';
assert.equal(trip.flights[0].ticketAttachment.name, 'boarding.pdf');
assert.equal(trip.flights[0].reference, 'PNR-MUST-NOT-BECOME-FLIGHT-NUMBER');

const legacy = { flights: [{ number: 'AF002' }], stops: [{ id: 'legacy-stop', transports: [{ id: 'old-vol', type: 'vol' }, { id: 'old-flag', typeflight: true }] }], documents: [{ id: 'old-doc', flightId: 'flight-1' }] };
assert.strictEqual(api.resolve(legacy, 'flight-1').item, legacy.flights[0]);
assert.strictEqual(api.resolve(legacy, 'old-vol').item, legacy.stops[0].transports[0]);
assert.strictEqual(api.resolve(legacy, 'old-flag').item, legacy.stops[0].transports[1]);
api.normalize(legacy);
assert.equal(legacy.flights[0].id, 'flight-1');
assert.equal(legacy.stops[0].transports[0].type, 'flight');
assert.equal(legacy.documents[0].flightId, legacy.flights[0].id);

const emptyMarkup = api.render({ flights: [], stops: [], documents: [] });
assert.match(emptyMarkup, /Vols &amp; documents/);
assert.match(emptyMarkup, /Ajoute ton premier vol/);
assert.doesNotMatch(emptyMarkup, /flight-card"/);
assert.match(emptyMarkup, /data-action="add-flight"/);

const filledMarkup = api.render(trip);
assert.match(filledMarkup, /SB204/);
assert.match(filledMarkup, /SB205/);
assert.match(filledMarkup, /data-action="flight-document" data-kind="visa" data-id="top-flight"/);
assert.match(filledMarkup, /data-action="flight-ticket" data-id="nested-flight"/);
assert.match(filledMarkup, /data-track-flight="top-flight"/);
assert.match(filledMarkup, /Suivi non connecté/);
assert.doesNotMatch(filledMarkup, /PNR-MUST-NOT-BECOME-FLIGHT-NUMBER/);
assert.doesNotMatch(filledMarkup, /Mis à jour/);

function makeTextNode() { return { textContent: '', setAttribute() {}, getAttribute() { return ''; } }; }
function makeLive(id) {
  const message = makeTextNode();
  const detail = makeTextNode();
  return {
    attrs: { 'data-flight-id': id, 'data-live-state': 'not_connected' },
    message, detail,
    querySelector(selector) { return selector === '[data-flight-message]' ? message : selector === '[data-flight-detail]' ? detail : null; },
    getAttribute(name) { return this.attrs[name] || null; },
    setAttribute(name, value) { this.attrs[name] = String(value); }
  };
}
function makeRoot(id) {
  const live = makeLive(id);
  const button = {
    attrs: { 'data-flight-id': id, 'data-track-flight': id },
    textContent: 'Suivre le vol', disabled: false,
    closest() { return this; },
    getAttribute(name) { return this.attrs[name] || null; },
    setAttribute(name, value) { this.attrs[name] = String(value); }
  };
  let click;
  return {
    live, button,
    addEventListener(type, handler) { if (type === 'click') click = handler; },
    removeEventListener() { click = null; },
    contains(node) { return node === live || node === button; },
    querySelectorAll(selector) {
      if (selector === '.flight-live[data-flight-id="' + id + '"]') return [live];
      if (selector === '[data-track-flight="' + id + '"]') return [button];
      if (selector === '.flight-live[data-live-state]') return [live];
      return [];
    },
    click() { click({ target: button, preventDefault() {} }); }
  };
}

(async () => {
  const root = makeRoot('top-flight');
  context.fetch = async () => ({ ok: true, status: 200, json: async () => ({ state: 'live', source: 'provider', updatedAt: '2027-04-12T10:30:00Z' }) });
  api.bind(root, trip);
  root.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(root.live.message.textContent, 'Suivi non connecté', 'missing connected is rejected');
  api.dispose();
  context.fetch = async () => ({ ok: true, status: 200, json: async () => ({ connected: true, state: 'live', updatedAt: '2027-04-12T10:30:00Z' }) });
  api.bind(root, trip);
  root.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(root.live.message.textContent, 'Suivi non connecté', 'missing source is rejected');
  api.dispose();
  console.log('OK : contrat vols, extraction stable sans fuite de références, état vide et statut réel uniquement.');
})();
