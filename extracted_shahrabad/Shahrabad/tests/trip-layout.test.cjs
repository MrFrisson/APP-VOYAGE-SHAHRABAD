const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('src/app.js', 'utf8');
const cutoff = source.indexOf("$('#importInput')?.addEventListener('change'");
const app = { innerHTML: '' };
const bindings = [];
let disposed = 0;
let flightRenders = 0;
const context = vm.createContext({
  console, Intl, Date, Math, Map, Set,
  document: { querySelector: selector => selector === '#app' ? app : null, querySelectorAll: () => [] },
  window: {
    addEventListener() {}, setTimeout() {},
    ShahrabadFlights: {
      render() { flightRenders++; return '<section data-flights-panel>Vols &amp; documents</section>'; },
      bind(root, trip) { bindings.push({ root, trip }); },
      dispose() { disposed++; }
    }
  }
});
vm.runInContext(source.slice(0, cutoff) + `
  refreshDestinationImages = () => {};
  hydrateDestinationImages = () => {};
  bindCountryMenus = () => {};
  updateConverter = () => {};
  this.api = { state, makeTrip, render, handleAction };
`, context);
const api = context.api;
const trip = api.makeTrip({ id: 'layout-trip', title: 'Japon', country: 'Japon', flights: [{ id: 'flight-one', flightNumber: 'JL045' }], documents: [{ id: 'visa-one', type: 'Visa', flightId: 'flight-one', reference: 'Conservée' }] });
api.state.data = { trips: [trip] };
api.state.tripId = trip.id;
api.state.view = 'trip';
api.state.tab = 'overview';
const before = JSON.stringify(api.state.data);
api.render();
const banner = app.innerHTML.split('<nav class="tabs"')[0];
const tabs = app.innerHTML.match(/<nav class="tabs"[^>]*>([\s\S]*?)<\/nav>/)[1];
assert.doesNotMatch(banner, /data-tab="flights"/);
assert.doesNotMatch(banner, /data-action="duplicate-trip"/);
assert.match(tabs, /data-tab="flights">Vols & documents<\/button>/);
assert.equal((app.innerHTML.match(/data-tab="flights"/g) || []).length, 1);
assert.doesNotMatch(app.innerHTML, /data-flights-panel/);
assert.match(app.innerHTML, /overview-grid/);
assert.equal(bindings.length, 0);
assert.equal(flightRenders, 0);
for (const tab of ['flights', 'flights', 'overview', 'budget', 'flights', 'budget']) {
  const previousBindings = bindings.length;
  const previousDisposed = disposed;
  api.handleAction({ currentTarget: { dataset: { action: 'switch-tab', tab } } });
  assert.equal(api.state.tab, tab);
  assert.match(app.innerHTML, new RegExp('class="tab active" data-action="switch-tab" data-tab="' + tab + '"'));
  assert.equal(disposed, previousDisposed + 1);
  if (tab === 'flights') {
    assert.match(app.innerHTML, /data-flights-panel/);
    assert.doesNotMatch(app.innerHTML, /overview-grid/);
    assert.equal(bindings.length, previousBindings + 1);
    assert.strictEqual(bindings.at(-1).trip, trip);
  } else {
    assert.doesNotMatch(app.innerHTML, /data-flights-panel/);
    assert.equal(bindings.length, previousBindings);
  }
}
assert.equal(JSON.stringify(api.state.data), before);
console.log('OK : Vols & documents uniquement dans la barre des onglets, navigation normale, vue d’ensemble légère, suivi limité à sa vue et données inchangées.');
