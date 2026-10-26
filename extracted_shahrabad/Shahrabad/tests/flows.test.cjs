const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('src/app.js', 'utf8');
const cutoff = source.indexOf("$('#importInput')?.addEventListener('change'");
const context = vm.createContext({ console, Intl, Date, Math, Map, Set, window: { addEventListener() {} }, document: { querySelector: () => null, querySelectorAll: () => [] } });
vm.runInContext(source.slice(0, cutoff) + '\nthis.api = { normalizeData, makeTrip, makeStop, sortedStops, nightsBetween, state, duplicateTrip }; persist = () => {}; render = () => {};', context);
const { api } = context;
const fixture = {
  trips: [{
    id: 'legacy', title: 'Asie',
    stops: [
      { id: 'tokyo', name: 'Ancien nom affiché', city: 'Tokyo', country: 'Japon', activities: [{ id: 'act', title: 'Visite' }], notes: 'Note conservée' },
      { id: 'seoul', city: 'Séoul', country: 'Corée du Sud', accommodations: [{ id: 'stay', name: 'Hôtel' }] }
    ],
    expenses: [{ id: 'expense', amount: 100, stopId: 'tokyo' }],
    links: [{ id: 'link', url: 'https://example.com', stopId: 'seoul' }],
    documents: [{ id: 'doc', reference: 'ABC' }]
  }]
};
const normalized = api.normalizeData(fixture);
const trip = normalized.trips[0];
assert.equal(trip.mode, 'multi');
assert.equal(trip.countries.length, 2);
assert.ok(trip.countries.every(country => country.id));
assert.equal(trip.stops[0].name, 'Tokyo');
assert.equal(trip.stops[0].notes, 'Note conservée');
assert.equal(trip.stops[0].activities[0].id, 'act');
assert.equal(trip.stops[1].accommodations[0].id, 'stay');
assert.equal(trip.expenses[0].amount, 100);
assert.ok(trip.stops.every(stop => trip.countries.some(country => country.id === stop.countryId && country.name === stop.country)));
const intermediate = api.normalizeData({ trips: [{ id: 'i', title: 'Route', mode: 'multi', countries: [{ name: 'Japon' }, { name: 'France' }], stops: [{ id: 'a', city: 'Kyoto', country: 'Japon' }, { id: 'b', city: 'Paris', country: 'France' }] }] }).trips[0];
assert.notEqual(intermediate.countries[0].id, intermediate.countries[1].id);
assert.notEqual(intermediate.stops[0].countryId, intermediate.stops[1].countryId);
trip.links[0].countryId = trip.countries[1].id;
api.state.data = normalized;
api.duplicateTrip(trip);
const clone = api.state.data.trips[0];
assert.notEqual(clone.id, trip.id);
assert.equal(clone.expenses[0].stopId, clone.stops[0].id);
assert.equal(clone.links[0].stopId, clone.stops[1].id);
assert.equal(clone.links[0].countryId, clone.countries[1].id);
assert.equal(clone.stops[0].countryId, clone.countries[0].id);
assert.notEqual(clone.stops[0].activities[0].id, trip.stops[0].activities[0].id);
assert.equal(api.nightsBetween('2027-04-01', '2027-04-05'), 4);
assert.equal(api.makeTrip().cover, '');
console.log('OK : migration ancienne/intermédiaire, hiérarchie pays-villes, conservation des données, duplication des relations, nuits et couvertures automatiques.');
