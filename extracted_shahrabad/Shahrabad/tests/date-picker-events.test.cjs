const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeElement {
  constructor(tagName = 'div', attrs = {}, classes = []) {
    this.tagName = tagName.toLowerCase();
    this.attributes = { ...attrs };
    this.children = [];
    this.parentNode = null;
    this.listeners = Object.create(null);
    this.classes = new Set(classes);
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      contains: name => this.classes.has(name),
      toggle: (name, force) => {
        const next = force === undefined ? !this.classes.has(name) : Boolean(force);
        if (next) this.classes.add(name); else this.classes.delete(name);
        return next;
      }
    };
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.name = '';
    this.textContent = '';
    this.innerHTML = '';
  }

  append(...nodes) {
    nodes.forEach(node => {
      node.parentNode = this;
      this.children.push(node);
    });
    return this;
  }

  contains(node) {
    for (let current = node; current; current = current.parentNode) if (current === this) return true;
    return false;
  }

  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; }
  hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name); }
  removeAttribute(name) { delete this.attributes[name]; }

  matches(selector) {
    if (selector.includes(',')) return selector.split(',').some(part => this.matches(part.trim()));
    if (selector === 'button') return this.tagName === 'button';
    if (selector === 'select') return this.tagName === 'select';
    if (selector === '.sd-date-input') return this.classes.has('sd-date-input');
    if (selector === '[data-shahrabad-date-field]') return this.hasAttribute('data-shahrabad-date-field');
    if (selector === '[data-shahrabad-date-trigger]') return this.hasAttribute('data-shahrabad-date-trigger');
    if (selector === '[data-shahrabad-date-popup]') return this.hasAttribute('data-shahrabad-date-popup');
    if (selector === '[data-date-month]') return this.hasAttribute('data-date-month');
    if (selector === '[data-date-year]') return this.hasAttribute('data-date-year');
    if (selector === '[data-date-grid]') return this.hasAttribute('data-date-grid');
    if (selector === '[data-date-prev]') return this.hasAttribute('data-date-prev');
    if (selector === '[data-date-next]') return this.hasAttribute('data-date-next');
    if (selector === '[data-date-clear]') return this.hasAttribute('data-date-clear');
    if (selector === '[data-date-value]') return this.hasAttribute('data-date-value');
    if (selector.startsWith('.sd-date-day')) return this.classes.has('sd-date-day') && (!selector.includes(':not(:disabled)') || !this.disabled) && (!selector.includes(':not(.is-empty)') || !this.classes.has('is-empty'));
    return false;
  }

  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches(selector)) return current;
    return null;
  }

  querySelectorAll(selector) {
    const result = [];
    const visit = node => {
      node.children.forEach(child => {
        if (child.matches(selector)) result.push(child);
        visit(child);
      });
    };
    visit(this);
    return result;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }

  addEventListener(type, listener) {
    (this.listeners[type] ||= []).push(listener);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    let current = this;
    while (current) {
      for (const listener of current.listeners[event.type] || []) listener.call(current, event);
      if (!event.bubbles) break;
      current = current.parentNode;
    }
    return !event.defaultPrevented;
  }

  focus() { this.focused = true; }
}

class FakeDocument {
  constructor() {
    this.roots = [];
    this.listeners = Object.create(null);
  }
  querySelector(selector) { return selector === '#modalRoot' ? this.roots.find(root => root.id === 'modalRoot') || null : null; }
  querySelectorAll(selector) { return this.roots.flatMap(root => root.querySelectorAll(selector)); }
  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
  createEvent() { return new DomEvent(''); }
}

class DomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.defaultPrevented = false;
    this.target = null;
    this.key = options.key;
  }
  preventDefault() { this.defaultPrevented = true; }
}

function makeDateField(name, value) {
  const field = new FakeElement('div', { 'data-shahrabad-date-field': '' }, ['sd-date-field']);
  const input = new FakeElement('input', { 'data-date-min': '', 'data-date-max': '' }, ['sd-date-input']);
  input.name = name;
  input.value = value;
  const trigger = new FakeElement('button', { 'data-shahrabad-date-trigger': '', 'aria-expanded': 'false' }, ['sd-date-trigger']);
  const popup = new FakeElement('div', { 'data-shahrabad-date-popup': '' }, ['sd-date-popup']);
  popup.hidden = true;
  const prev = new FakeElement('button', { 'data-date-prev': '' }, ['sd-date-nav']);
  const next = new FakeElement('button', { 'data-date-next': '' }, ['sd-date-nav']);
  const month = new FakeElement('select', { 'data-date-month': '' });
  const year = new FakeElement('select', { 'data-date-year': '' });
  const grid = new FakeElement('div', { 'data-date-grid': '' }, ['sd-date-grid']);
  const clear = new FakeElement('button', { 'data-date-clear': '' }, ['sd-date-clear']);
  popup.append(prev, month, year, next, grid, clear);
  field.append(input, trigger, popup);
  return { field, input, trigger, popup, prev, next, month, year, grid };
}

const document = new FakeDocument();
const window = { document, Event: DomEvent };
const context = vm.createContext({ console, Intl, Date, Math, Map, Set, WeakMap, WeakSet, window });
vm.runInContext(fs.readFileSync('src/date-picker.js', 'utf8'), context, { filename: 'src/date-picker.js' });
const picker = window.ShahrabadDates;

const modalRoot = new FakeElement('div');
modalRoot.id = 'modalRoot';
const form = new FakeElement('form');
const start = makeDateField('startDate', '2028-11-10');
const end = makeDateField('endDate', '2028-11-20');
form.append(start.field, end.field);
modalRoot.append(form);
document.roots.push(modalRoot);

assert.match(picker.field('Retour', 'endDate', '', { min: '2028-11-10', max: '2028-11-30' }), /name="endDate"/);
picker.bind(modalRoot);
picker.bindPair(form, 'startDate', 'endDate', {});

start.trigger.dispatchEvent(new DomEvent('click', { bubbles: true }));
assert.equal(start.popup.hidden, false, 'the trigger event must be handled once across both roots');
assert.equal(start.trigger.getAttribute('aria-expanded'), 'true');

const beforeMonth = Number(start.month.value) + Number(start.year.value) * 12;
start.prev.dispatchEvent(new DomEvent('click', { bubbles: true }));
const afterMonth = Number(start.month.value) + Number(start.year.value) * 12;
assert.equal(afterMonth, beforeMonth - 1, 'previous month must move exactly one month');

start.trigger.dispatchEvent(new DomEvent('click', { bubbles: true }));
assert.equal(start.popup.hidden, true, 'the second trigger click must close the popup');
assert.equal(start.trigger.getAttribute('aria-expanded'), 'false');

start.input.value = '2028-11-15';
start.input.dispatchEvent(new DomEvent('change', { bubbles: true }));
assert.equal(end.input.getAttribute('data-date-min'), '2028-11-15', 'changing the hidden start input must update the end minimum');

console.log('OK : événements DOM dédupliqués entre modalRoot/form, navigation mensuelle exacte et paire start/end synchronisée.');
