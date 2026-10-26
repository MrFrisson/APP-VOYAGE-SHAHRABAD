const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function load(file, extras = {}) {
  const context = vm.createContext({ console, Intl, Date, Math, Map, Set, ...extras });
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return context;
}
const schedule = load('src/scheduling.js').ShahrabadSchedule;
assert.equal(schedule.localISO(new Date(2028, 10, 18, 23)), '2028-11-18');
assert.equal(schedule.localISO('2028-02-30'), '');
const trip = {
  mode: 'multi', startDate: '2028-11-01', endDate: '2028-11-30',
  countries: [{ id: 'fr', name: 'France' }, { id: 'jp', name: 'Japon' }],
  stops: [
    { id: 'paris', countryId: 'fr', city: 'Paris', order: 0, arrival: '2028-11-01', departure: '2028-11-10', accommodations: [], activities: [] },
    { id: 'kyoto', countryId: 'jp', city: 'Kyoto', order: 1, arrival: '2028-11-12', departure: '2028-11-20', accommodations: [], activities: [] },
    { id: 'tokyo', countryId: 'jp', city: 'Tokyo', order: 2, arrival: '2028-11-20', departure: '2028-11-30', accommodations: [], activities: [] }
  ], expenses: []
};
assert.equal(JSON.stringify(schedule.stopBounds(trip, trip.stops[1])), JSON.stringify({ min: '2028-11-10', max: '2028-11-20' }));
assert.equal(JSON.stringify(schedule.itemBounds(trip, trip.stops[0])), JSON.stringify({ min: '2028-11-01', max: '2028-11-10' }));
assert.equal(JSON.stringify(schedule.stopBounds(trip, null, 'fr')), JSON.stringify({ min: '2028-11-10', max: '2028-11-12' }));
assert.equal(schedule.validateTrip(trip, trip.startDate, trip.endDate), '');
assert.ok(schedule.validateTrip(trip, '2028-11-01', '2028-11-09'));
assert.equal(schedule.validateStop(trip, trip.stops[1], '2028-11-10', '2028-11-12', 'jp'), '');
assert.ok(schedule.validateStop(trip, trip.stops[1], '2028-11-09', '2028-11-12', 'jp'));
assert.equal(schedule.validateItem('activity', trip, trip.stops[1], { date: '2028-11-12' }), '');
assert.ok(schedule.validateItem('activity', trip, trip.stops[0], { date: '2028-11-11' }));
assert.ok(schedule.validateItem('transport', trip, trip.stops[1], { date: '2028-11-09' }));
assert.equal(schedule.validateItem('expense', trip, null, { date: '2028-11-30' }), '');
assert.equal(schedule.validateItem('expense', trip, null, {}), '');
trip.stops[0].accommodations.push({ id: 'old', checkIn: '2028-11-02', checkOut: '2028-11-05' });
assert.equal(schedule.validateItem('accommodation', trip, trip.stops[0], { checkIn: '2028-11-05', checkOut: '2028-11-08' }), '');
assert.match(schedule.validateItem('accommodation', trip, trip.stops[0], { checkIn: '2028-11-04', checkOut: '2028-11-08' }), /chevauche/);
assert.ok(schedule.validateItem('accommodation', trip, trip.stops[0], { checkIn: '2028-10-31', checkOut: '2028-11-03' }));
trip.stops[0].activities.push({ id: 'museum', date: '2028-11-09' });
assert.match(schedule.validateStop(trip, trip.stops[0], '2028-11-01', '2028-11-08', 'fr'), /activité/);
const single = { mode: 'single', startDate: '2026-11-15', endDate: '2026-11-25', stops: [{ id: 'one', arrival: '2026-11-15', departure: '2026-11-18', order: 0 }] };
assert.equal(schedule.stopBounds(single).min, '2026-11-18');
assert.ok(schedule.validateStop(single, null, '2026-11-17', '2026-11-20'));
assert.equal(schedule.validateStop(single, null, '2026-11-18', '2026-11-20'), '');
const multi = { ...single, mode: 'multi', countries: [{ id: 'fr' }, { id: 'jp' }], stops: [{ ...single.stops[0], countryId: 'fr' }] };
assert.equal(schedule.stopBounds(multi, null, 'fr').min, '2026-11-18');
assert.equal(schedule.stopBounds(multi, null, 'jp').min, '2026-11-18');
assert.ok(schedule.validateStop(multi, null, '2026-11-17', '2026-11-20', 'jp'));
const undated = { mode: 'single', startDate: '2026-11-15', endDate: '2026-11-25', stops: [{ id: 'legacy', city: 'Paris', activities: [{ date: '2026-12-01' }] }] };
assert.ok(schedule.validateTrip(undated, undated.startDate, undated.endDate));
assert.ok(schedule.validateItem('activity', undated, undated.stops[0], { date: '2026-11-17' }));
const picker = load('src/date-picker.js', { window: {} }).window.ShahrabadDates;
const html = picker.field('Retour', 'endDate', '', { min: '2028-11-18', max: '2028-11-30', defaultDate: '2028-11-18', required: true });
assert.match(html, /data-date-min="2028-11-18"/);
assert.match(html, /data-date-max="2028-11-30"/);
assert.match(html, /name="endDate"/);
assert.match(html, / required/);
for (const api of ['bind', 'setBounds', 'bindPair']) assert.equal(typeof picker[api], 'function');
console.log('OK : dates locales, nouvelles villes enchaînées même jour, bornes voyage/ville, changements sans perte d’éléments, hôtels sans chevauchement et contrat calendrier.');
