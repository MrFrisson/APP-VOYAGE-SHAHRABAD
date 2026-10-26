/* ShahrabadDates — calendrier local, bornes inclusives et sans dépendance externe. */
(function (global) {
  'use strict';

  var counter = 0;
  var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  var boundRoots = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();
  var fieldStates = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();
  var pairRoots = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();
  var handledEvents = typeof WeakSet !== 'undefined' ? new WeakSet() : new Set();

  function claimEvent(event) {
    if (!event || (typeof event !== 'object' && typeof event !== 'function')) return true;
    if (handledEvents.has(event)) return false;
    handledEvents.add(event);
    return true;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function localDate(value) {
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    var year = Number(match[1]); var month = Number(match[2]) - 1; var day = Number(match[3]);
    var date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
  }

  function isoDate(date) {
    if (!date || isNaN(date.getTime())) return '';
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dateLabel(value) {
    var date = localDate(value); if (!date) return 'Choisir une date';
    try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date); } catch (e) { return String(value); }
  }
  function validBound(value) { return localDate(value) ? isoDate(localDate(value)) : ''; }
  function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function inBounds(value, state) {
    if (!value) return false;
    return (!state.min || value >= state.min) && (!state.max || value <= state.max);
  }
  function clampDate(value, state) {
    var d = localDate(value) || today(); var result = isoDate(d);
    if (state.min && result < state.min) result = state.min;
    if (state.max && result > state.max) result = state.max;
    return localDate(result) || d;
  }
  function monthKey(year, month) { return year * 12 + month; }
  function monthAllowed(year, month, state) {
    var first = isoDate(new Date(year, month, 1));
    var last = isoDate(new Date(year, month + 1, 0));
    return (!state.min || last >= state.min) && (!state.max || first <= state.max);
  }
  function monthOptions(selected, year, state) {
    return months.map(function (month, index) {
      var disabled = !monthAllowed(year, index, state);
      return '<option value="' + index + '"' + (index === selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + month + '</option>';
    }).join('');
  }
  function yearOptions(selected, state) {
    var current = today().getFullYear();
    var first = state.min ? localDate(state.min).getFullYear() : current - 100;
    var last = state.max ? localDate(state.max).getFullYear() : current + 100;
    first = Math.min(first, selected); last = Math.max(last, selected);
    var output = '';
    for (var year = first; year <= last; year += 1) {
      var enabled = false;
      for (var month = 0; month < 12; month += 1) if (monthAllowed(year, month, state)) { enabled = true; break; }
      output += '<option value="' + year + '"' + (year === selected ? ' selected' : '') + (enabled ? '' : ' disabled') + '>' + year + '</option>';
    }
    return output;
  }

  function field(label, name, value, opts) {
    opts = opts || {};
    counter += 1;
    var rawName = String(name == null || name === '' ? 'date-' + counter : name);
    var rawValue = localDate(value) ? isoDate(localDate(value)) : '';
    var initial = clampDate(rawValue || opts.defaultDate || opts.min || opts.max || '', { min: validBound(opts.min), max: validBound(opts.max) });
    var base = 'shahrabad-date-' + counter;
    var inputId = base + '-value'; var buttonId = base + '-button'; var popupId = base + '-popup';
    var safeLabel = escapeHtml(label == null ? 'Date' : label);
    var min = validBound(opts.min); var max = validBound(opts.max);
    var required = opts.required ? ' required' : '';
    return '<div class="sd-date-field" data-shahrabad-date-field>' +
      '<label class="sd-date-label" for="' + buttonId + '">' + safeLabel + '</label>' +
      '<input class="sd-date-input" type="hidden" id="' + inputId + '" name="' + escapeHtml(rawName) + '" value="' + escapeHtml(rawValue) + '"' + (min ? ' data-date-min="' + min + '"' : '') + (max ? ' data-date-max="' + max + '"' : '') + (opts.defaultDate ? ' data-date-default="' + escapeHtml(validBound(opts.defaultDate)) + '"' : '') + required + '>' +
      '<button class="sd-date-trigger" type="button" id="' + buttonId + '" data-shahrabad-date-trigger aria-haspopup="dialog" aria-expanded="false" aria-controls="' + popupId + '"><span data-shahrabad-date-text>' + escapeHtml(dateLabel(rawValue)) + '</span><span class="sd-date-trigger-icon" aria-hidden="true">⌄</span></button>' +
      '<div class="sd-date-popup" id="' + popupId + '" data-shahrabad-date-popup role="dialog" aria-label="Choisir ' + safeLabel + '" hidden>' +
        '<div class="sd-date-navigation"><button class="sd-date-nav" type="button" data-date-prev aria-label="Mois précédent">‹</button><div class="sd-date-selects"><select data-date-month aria-label="Mois">' + monthOptions(initial.getMonth(), initial.getFullYear(), { min: min, max: max }) + '</select><select data-date-year aria-label="Année">' + yearOptions(initial.getFullYear(), { min: min, max: max }) + '</select></div><button class="sd-date-nav" type="button" data-date-next aria-label="Mois suivant">›</button></div>' +
        '<div class="sd-date-weekdays" role="row">' + weekdays.map(function (day) { return '<span role="columnheader">' + day + '</span>'; }).join('') + '</div><div class="sd-date-grid" data-date-grid role="grid" aria-label="Jours du mois"></div><div class="sd-date-footer"><button class="sd-date-clear" type="button" data-date-clear>Effacer</button></div></div></div>';
  }

  function resolveRoot(root) {
    if (typeof root === 'string' && global.document) return global.document.querySelector(root) || global.document;
    return root || global.document;
  }
  function fieldElement(target, root) {
    if (!target || !target.closest) return null;
    var node = target.closest('[data-shahrabad-date-field]');
    return node && (root === global.document || !root || root.contains(node)) ? node : null;
  }
  function inputFor(root, name) {
    if (!root || !root.querySelectorAll) return null;
    var inputs = root.querySelectorAll('.sd-date-input');
    for (var i = 0; i < inputs.length; i += 1) if (inputs[i].name === name || inputs[i].getAttribute('name') === name) return inputs[i];
    return null;
  }
  function stateFor(node) {
    var state = fieldStates.get(node);
    if (!state) { state = { year: 0, month: 0, min: '', max: '', defaultDate: '' }; fieldStates.set(node, state); }
    var input = node.querySelector('.sd-date-input');
    if (!state.min && input) state.min = validBound(input.getAttribute('data-date-min'));
    if (!state.max && input) state.max = validBound(input.getAttribute('data-date-max'));
    if (!state.defaultDate && input) state.defaultDate = validBound(input.getAttribute('data-date-default'));
    if (!state.year) {
      var date = localDate(input && input.value) || localDate(state.defaultDate) || localDate(state.min) || localDate(state.max) || today();
      date = clampDate(date, state); state.year = date.getFullYear(); state.month = date.getMonth();
    }
    return state;
  }
  function updateTrigger(node) {
    var input = node.querySelector('.sd-date-input'); var text = node.querySelector('[data-shahrabad-date-text]'); var trigger = node.querySelector('[data-shahrabad-date-trigger]');
    if (!input || !text || !trigger) return;
    text.textContent = dateLabel(input.value); trigger.classList.toggle('has-value', Boolean(localDate(input.value)));
  }
  function render(node) {
    var state = stateFor(node); var popup = node.querySelector('[data-shahrabad-date-popup]'); var month = node.querySelector('[data-date-month]'); var year = node.querySelector('[data-date-year]'); var grid = node.querySelector('[data-date-grid]');
    if (!popup || !month || !year || !grid) return;
    var view = clampDate(new Date(state.year, state.month, 1), state); state.year = view.getFullYear(); state.month = view.getMonth();
    month.innerHTML = monthOptions(state.month, state.year, state); year.innerHTML = yearOptions(state.year, state); month.value = String(state.month); year.value = String(state.year);
    var first = new Date(state.year, state.month, 1); var leading = (first.getDay() + 6) % 7; var days = new Date(state.year, state.month + 1, 0).getDate(); var input = node.querySelector('.sd-date-input'); var selected = input && localDate(input.value) ? isoDate(localDate(input.value)) : ''; var html = '';
    for (var i = 0; i < leading; i += 1) html += '<span class="sd-date-day is-empty" aria-hidden="true"></span>';
    for (var day = 1; day <= days; day += 1) {
      var value = isoDate(new Date(state.year, state.month, day)); var selectedDay = value === selected; var disabled = !inBounds(value, state); var isToday = value === isoDate(today());
      html += '<button class="sd-date-day' + (selectedDay ? ' is-selected' : '') + (isToday ? ' is-today' : '') + (disabled ? ' is-disabled' : '') + '" type="button" role="gridcell" tabindex="' + (selectedDay && !disabled ? '0' : '-1') + '" aria-selected="' + (selectedDay ? 'true' : 'false') + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + ' data-date-value="' + value + '">' + day + '</button>';
    }
    grid.innerHTML = html; grid.setAttribute('aria-label', months[state.month] + ' ' + state.year); var prev = node.querySelector('[data-date-prev]'); var next = node.querySelector('[data-date-next]');
    if (prev) prev.disabled = !monthAllowed(state.year, state.month - 1, state); if (next) next.disabled = !monthAllowed(state.year, state.month + 1, state); updateTrigger(node);
  }
  function closeOthers(except) { if (!global.document || !global.document.querySelectorAll) return; Array.prototype.forEach.call(global.document.querySelectorAll('[data-shahrabad-date-field]'), function (node) { if (node !== except && node.classList.contains('is-open')) setOpen(node, false, false); }); }
  function setOpen(node, open, focusTrigger) {
    var popup = node.querySelector('[data-shahrabad-date-popup]'); var trigger = node.querySelector('[data-shahrabad-date-trigger]'); if (!popup || !trigger) return;
    if (open) { closeOthers(node); render(node); popup.hidden = false; trigger.setAttribute('aria-expanded', 'true'); node.classList.add('is-open'); var focus = popup.querySelector('.sd-date-day:not(.is-empty):not(:disabled)'); if (focus && focus.focus) focus.focus(); }
    else { popup.hidden = true; trigger.setAttribute('aria-expanded', 'false'); node.classList.remove('is-open'); if (focusTrigger && trigger.focus) trigger.focus(); }
  }
  function shiftMonth(node, amount) { var state = stateFor(node); var cursor = new Date(state.year, state.month + amount, 1); if (monthAllowed(cursor.getFullYear(), cursor.getMonth(), state)) { state.year = cursor.getFullYear(); state.month = cursor.getMonth(); render(node); } }
  function dispatchChange(input) {
    if (!input || !input.dispatchEvent) return;
    var event; try { event = new global.Event('change', { bubbles: true }); } catch (e) { if (global.document && global.document.createEvent) { event = global.document.createEvent('Event'); event.initEvent('change', true, true); } }
    if (event) input.dispatchEvent(event);
  }
  function setValue(node, value, notify) {
    var input = node.querySelector('.sd-date-input'); if (!input) return;
    input.value = localDate(value) ? isoDate(localDate(value)) : ''; var date = localDate(input.value); var state = stateFor(node);
    if (date) { state.year = date.getFullYear(); state.month = date.getMonth(); } render(node); if (notify) dispatchChange(input);
  }
  function moveFocus(node, value) {
    var state = stateFor(node); var date = localDate(value); if (!date) return; var wanted = isoDate(date);
    if (!inBounds(wanted, state)) wanted = state.min && wanted < state.min ? state.min : state.max && wanted > state.max ? state.max : wanted;
    date = localDate(wanted); if (!date) return; state.year = date.getFullYear(); state.month = date.getMonth(); render(node); var button = node.querySelector('[data-date-value="' + wanted + '"]'); if (button && button.focus) button.focus();
  }
  function handleClick(event, root) {
    if (!claimEvent(event)) return;
    var node = fieldElement(event.target, root); if (!node) { closeAll(root, false); return; } var target = event.target.closest('button, select'); if (!target) return;
    if (target.hasAttribute('data-shahrabad-date-trigger')) { event.preventDefault(); setOpen(node, target.getAttribute('aria-expanded') !== 'true', false); }
    else if (target.hasAttribute('data-date-prev')) { event.preventDefault(); shiftMonth(node, -1); }
    else if (target.hasAttribute('data-date-next')) { event.preventDefault(); shiftMonth(node, 1); }
    else if (target.hasAttribute('data-date-clear')) { event.preventDefault(); setValue(node, '', true); setOpen(node, false, true); }
    else if (target.hasAttribute('data-date-value') && !target.disabled) { event.preventDefault(); setValue(node, target.getAttribute('data-date-value'), true); setOpen(node, false, true); }
  }
  function applyPairs(root, event) {
    var pairs = pairRoots.get(root) || []; if (!event.target || !event.target.matches || !event.target.matches('.sd-date-input')) return;
    pairs.forEach(function (pair) {
      var start = inputFor(root, pair.startName); var end = inputFor(root, pair.endName); if (!start || !end || pair.busy) return;
      pair.busy = true;
      var startValue = validBound(start.value); var endValue = validBound(end.value); var options = { min: pair.min, max: pair.max };
      if (startValue && endValue && endValue < startValue) { end.value = startValue; dispatchChange(end); endValue = startValue; }
      setBounds(root, pair.endName, { min: startValue || pair.min, max: pair.max, defaultDate: startValue || endValue || pair.min });
      setBounds(root, pair.startName, { min: pair.min, max: pair.max, defaultDate: startValue || pair.min });
      if (startValue && endValue && endValue < startValue) end.value = startValue;
      pair.busy = false;
    });
  }
  function handleChange(event, root) {
    if (!claimEvent(event)) return;
    var node = fieldElement(event.target, root); if (node && event.target.hasAttribute && event.target.hasAttribute('data-date-month')) { var state = stateFor(node); state.month = Number(event.target.value); render(node); }
    if (node && event.target.hasAttribute && event.target.hasAttribute('data-date-year')) { var state2 = stateFor(node); state2.year = Number(event.target.value); render(node); }
    applyPairs(root, event);
  }
  function handleKeydown(event, root) {
    if (!claimEvent(event)) return;
    var node = fieldElement(event.target, root); if (!node) return; if (event.key === 'Escape') { event.preventDefault(); setOpen(node, false, true); return; }
    if (!node.classList.contains('is-open') || !event.target.hasAttribute('data-date-value')) return; var current = localDate(event.target.getAttribute('data-date-value')); if (!current) return; var next;
    if (event.key === 'ArrowLeft') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1); if (event.key === 'ArrowRight') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1); if (event.key === 'ArrowUp') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7); if (event.key === 'ArrowDown') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7); if (event.key === 'Home') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - ((current.getDay() + 6) % 7)); if (event.key === 'End') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + (6 - ((current.getDay() + 6) % 7))); if (event.key === 'PageUp') next = new Date(current.getFullYear(), current.getMonth() - 1, current.getDate()); if (event.key === 'PageDown') next = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
    if (next) { event.preventDefault(); moveFocus(node, isoDate(next)); }
  }
  function closeAll(root, focus) { if (!root || !root.querySelectorAll) return; Array.prototype.forEach.call(root.querySelectorAll('[data-shahrabad-date-field]'), function (node) { if (node.classList.contains('is-open')) setOpen(node, false, focus); }); }
  function bind(root) {
    root = resolveRoot(root); if (!root || !root.addEventListener) return root;
    if (boundRoots.has(root)) { if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('[data-shahrabad-date-field]'), render); return root; }
    var onClick = function (e) { handleClick(e, root); }; var onChange = function (e) { handleChange(e, root); }; var onKeydown = function (e) { handleKeydown(e, root); }; var onOutside = function (e) { if ((root !== global.document && root && !root.contains(e.target)) || !fieldElement(e.target, root)) closeAll(root, false); };
    root.addEventListener('click', onClick); root.addEventListener('change', onChange); root.addEventListener('keydown', onKeydown); if (global.document && root !== global.document) global.document.addEventListener('click', onOutside); boundRoots.set(root, { onClick: onClick, onChange: onChange, onKeydown: onKeydown, onOutside: onOutside });
    if (!pairRoots.has(root)) pairRoots.set(root, []); if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('[data-shahrabad-date-field]'), render); return root;
  }
  function setBounds(root, name, opts) {
    root = resolveRoot(root); opts = opts || {}; var input = inputFor(root, name); if (!input) return root;
    var node = fieldElement(input, root); var state = stateFor(node); state.min = validBound(opts.min != null ? opts.min : state.min); state.max = validBound(opts.max != null ? opts.max : state.max); if (opts.defaultDate != null) { state.defaultDate = validBound(opts.defaultDate); var viewDate = clampDate(state.defaultDate, state); state.year = viewDate.getFullYear(); state.month = viewDate.getMonth(); }
    if (state.min) input.setAttribute('data-date-min', state.min); else input.removeAttribute('data-date-min'); if (state.max) input.setAttribute('data-date-max', state.max); else input.removeAttribute('data-date-max'); if (state.defaultDate) input.setAttribute('data-date-default', state.defaultDate); render(node); return root;
  }
  function bindPair(root, startName, endName, opts) {
    root = resolveRoot(root); opts = opts || {}; bind(root); var pairs = pairRoots.get(root) || []; var existing = pairs.find(function (p) { return p.startName === startName && p.endName === endName; });
    if (!existing) { existing = { startName: startName, endName: endName, busy: false, min: validBound(opts.min), max: validBound(opts.max) }; pairs.push(existing); pairRoots.set(root, pairs); }
    else { existing.min = validBound(opts.min != null ? opts.min : existing.min); existing.max = validBound(opts.max != null ? opts.max : existing.max); }
    setBounds(root, startName, { min: existing.min, max: existing.max }); var start = inputFor(root, startName); var end = inputFor(root, endName); var sv = start && validBound(start.value); setBounds(root, endName, { min: sv || existing.min, max: existing.max, defaultDate: sv || (end && end.value) || existing.min }); return root;
  }

  global.ShahrabadDates = { field: field, bind: bind, setBounds: setBounds, bindPair: bindPair };
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this)));
