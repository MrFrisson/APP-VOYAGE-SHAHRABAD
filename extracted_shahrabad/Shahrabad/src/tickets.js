/* ShahrabadTickets — billets locaux, sans OCR, scan ni stockage distant. */
(function (global) {
  'use strict';

  var MAX_BYTES = 1 * 1024 * 1024;
  var states = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();
  var imageType = /^image\/[a-z0-9.+-]+$/i;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function resolveRoot(root) {
    if (typeof root === 'string' && global.document) return global.document.querySelector(root);
    return root || global.document;
  }

  function controls() {
    var fileId = 'ticket-file-' + Math.random().toString(36).slice(2, 9);
    var cameraId = 'ticket-camera-' + Math.random().toString(36).slice(2, 9);
    return '<section class="shahrabad-ticket-controls" data-ticket-controls aria-labelledby="' + fileId + '-label">' +
      '<div class="shahrabad-ticket-controls__head">' +
        '<div><p class="shahrabad-ticket-kicker" id="' + fileId + '-label">Billet / justificatif</p>' +
        '<p class="shahrabad-ticket-help">Ajoute une image ou un PDF local. Il restera sur cet appareil et ne sera pas envoyé.</p></div>' +
        '<span class="shahrabad-ticket-badge">local</span>' +
      '</div>' +
      '<div class="shahrabad-ticket-actions">' +
        '<button type="button" class="shahrabad-ticket-button" data-ticket-file-trigger aria-controls="' + fileId + '">Ajouter un fichier</button>' +
        '<button type="button" class="shahrabad-ticket-button shahrabad-ticket-button--quiet" data-ticket-camera-trigger aria-controls="' + cameraId + '">Prendre une photo</button>' +
        '<button type="button" class="shahrabad-ticket-button shahrabad-ticket-button--soon" data-ticket-scan aria-describedby="' + fileId + '-status">Scanner un billet · bientôt</button>' +
      '</div>' +
      '<input id="' + fileId + '" data-ticket-file type="file" accept="image/*,application/pdf" hidden>' +
      '<input id="' + cameraId + '" data-ticket-camera type="file" accept="image/*" capture="environment" hidden>' +
      '<div class="shahrabad-ticket-status" data-ticket-status="empty" id="' + fileId + '-status" role="status" aria-live="polite">Aucune pièce sélectionnée · fichier local uniquement.</div>' +
      '<div class="shahrabad-ticket-preview" data-ticket-preview hidden></div>' +
    '</section>';
  }

  function getState(node) {
    var state = states.get(node);
    if (!state) {
      state = { attachment: null, status: 'empty' };
      states.set(node, state);
    }
    return state;
  }

  function controlsIn(root) {
    if (!root || !root.querySelectorAll) return [];
    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-ticket-controls]'));
    if (root.matches && root.matches('[data-ticket-controls]')) nodes.unshift(root);
    return nodes;
  }

  function setStatus(node, status, message) {
    var state = getState(node);
    state.status = status;
    var statusNode = node.querySelector('[data-ticket-status]');
    if (statusNode) {
      statusNode.dataset.ticketStatus = status;
      statusNode.textContent = message;
    }
  }

  function validType(type) {
    var normalized = String(type || '').toLowerCase();
    return (imageType.test(normalized) && normalized !== 'image/svg+xml') || normalized === 'application/pdf';
  }

  function preview(node, attachment) {
    var target = node.querySelector('[data-ticket-preview]');
    if (!target) return;
    if (!attachment) {
      target.hidden = true;
      target.innerHTML = '';
      return;
    }
    target.hidden = false;
    if (attachment.type.toLowerCase() === 'application/pdf') {
      target.innerHTML = '<div class="shahrabad-ticket-preview__pdf"><span aria-hidden="true">PDF</span><div><strong>' + esc(attachment.name) + '</strong><small>Document local prêt à joindre</small></div></div>';
      return;
    }
    target.innerHTML = '<img src="' + esc(attachment.dataUrl) + '" alt="Aperçu du billet ' + esc(attachment.name) + '"><span>' + esc(attachment.name) + '</span>';
  }

  function acceptFile(node, file) {
    if (!file) return;
    var state = getState(node);
    if (file.size > MAX_BYTES) {
      state.attachment = null;
      preview(node, null);
      setStatus(node, 'error', 'Fichier refusé · limite locale de 1 Mo pour cette version sur appareil.');
      return;
    }
    if (!validType(file.type)) {
      state.attachment = null;
      preview(node, null);
      setStatus(node, 'error', 'Fichier refusé · image ou PDF uniquement.');
      return;
    }
    setStatus(node, 'reading', 'Lecture locale en cours…');
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = String(reader.result || '');
      if (!dataUrl || dataUrl.indexOf('data:') !== 0) {
        state.attachment = null;
        preview(node, null);
        setStatus(node, 'error', 'Lecture locale impossible · réessaie avec ce fichier.');
        return;
      }
      state.attachment = { name: String(file.name || 'billet'), type: String(file.type || '').toLowerCase(), dataUrl: dataUrl };
      preview(node, state.attachment);
      setStatus(node, 'ready', 'Pièce prête · locale, non envoyée.');
    };
    reader.onerror = function () {
      state.attachment = null;
      preview(node, null);
      setStatus(node, 'error', 'Lecture locale impossible · le formulaire reste disponible.');
    };
    reader.readAsDataURL(file);
  }

  function bind(root) {
    root = resolveRoot(root);
    if (!root || !root.addEventListener) return root;
    if (root.getAttribute && root.getAttribute('data-tickets-bound') === '1') return root;
    if (root.setAttribute) root.setAttribute('data-tickets-bound', '1');
    root.addEventListener('click', function (event) {
      var target = event.target.closest ? event.target.closest('[data-ticket-file-trigger],[data-ticket-camera-trigger],[data-ticket-scan]') : null;
      if (!target || !root.contains(target)) return;
      var node = target.closest('[data-ticket-controls]');
      if (!node) return;
      if (target.hasAttribute('data-ticket-file-trigger')) {
        event.preventDefault();
        var fileInput = node.querySelector('[data-ticket-file]');
        if (fileInput) fileInput.click();
      } else if (target.hasAttribute('data-ticket-camera-trigger')) {
        event.preventDefault();
        var cameraInput = node.querySelector('[data-ticket-camera]');
        if (cameraInput) cameraInput.click();
      } else {
        event.preventDefault();
        setStatus(node, 'soon', 'Scan QR bientôt · aucun scan lancé.');
      }
    });
    root.addEventListener('change', function (event) {
      var input = event.target;
      if (!input || (!input.matches('[data-ticket-file]') && !input.matches('[data-ticket-camera]'))) return;
      var node = input.closest('[data-ticket-controls]');
      if (node && input.files && input.files[0]) acceptFile(node, input.files[0]);
    });
    return root;
  }

  function read(root) {
    root = resolveRoot(root);
    var nodes = controlsIn(root);
    for (var index = 0; index < nodes.length; index += 1) {
      var attachment = getState(nodes[index]).attachment;
      if (attachment) return { ticketAttachment: { name: attachment.name, type: attachment.type, dataUrl: attachment.dataUrl } };
    }
    return {};
  }

  function safeURL(value) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return '';
    try {
      var parsed = new URL(raw);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return parsed.href;
    } catch (error) {
      return '';
    }
  }

  function safeAttachment(value) {
    if (!value || typeof value !== 'object') return null;
    var type = String(value.type || '').toLowerCase();
    var dataUrl = String(value.dataUrl || '');
    var match = /^data:([^;,]+)(?:;[^,]*)?,/i.exec(dataUrl);
    if (!match || match[1].toLowerCase() !== type || !validType(type)) return null;
    if (type !== 'application/pdf' && !imageType.test(type)) return null;
    return { name: String(value.name || 'Billet local'), type: type, dataUrl: dataUrl };
  }

  function dateLabel(value) {
    if (!value) return '';
    var date = new Date(String(value).length === 10 ? String(value) + 'T12:00:00' : value);
    if (Number.isNaN(date.getTime())) return String(value);
    try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date); } catch (error) { return String(value); }
  }

  function typeLabel(type) {
    return { activity: 'Activité', accommodation: 'Hébergement', transport: 'Transport' }[type] || 'Billet';
  }

  function details(item, type) {
    item = item || {};
    var title = item.title || item.name || (item.company ? item.company : '') || typeLabel(type);
    var reference = item.reference || item.reservation || item.bookingReference || '';
    var date = item.date || item.checkIn || item.startDate || '';
    if (type === 'accommodation' && item.checkOut) date = date ? date + ' → ' + item.checkOut : item.checkOut;
    var place = item.location || item.address || '';
    if (!place && (item.from || item.to)) place = [item.from, item.to].filter(Boolean).join(' → ');
    return { title: title, reference: reference, date: date, place: place };
  }

  function viewer(item, type) {
    var info = details(item, type);
    var attachment = safeAttachment(item && item.ticketAttachment);
    var link = '';
    var linkCandidates = [item && item.ticketUrl, item && item.url, item && item.mapUrl];
    for (var linkIndex = 0; linkIndex < linkCandidates.length && !link; linkIndex += 1) link = safeURL(linkCandidates[linkIndex]);
    var media = '';
    if (attachment) {
      if (attachment.type === 'application/pdf') {
        media = '<div class="shahrabad-ticket-media shahrabad-ticket-media--pdf"><object data="' + esc(attachment.dataUrl) + '" type="application/pdf" aria-label="Document PDF ' + esc(attachment.name) + '"><a href="' + esc(attachment.dataUrl) + '" download="' + esc(attachment.name) + '">Ouvrir le PDF local</a></object></div>';
      } else {
        media = '<div class="shahrabad-ticket-media"><img src="' + esc(attachment.dataUrl) + '" alt="Billet ' + esc(info.title) + '"></div>';
      }
    }
    return '<article class="shahrabad-ticket-viewer" aria-labelledby="shahrabad-ticket-title">' +
      '<div class="shahrabad-ticket-viewer__head"><div><p class="shahrabad-ticket-kicker">' + esc(typeLabel(type)) + '</p><h3 id="shahrabad-ticket-title">' + esc(info.title) + '</h3></div><span class="shahrabad-ticket-seal" aria-hidden="true">✦</span></div>' +
      '<dl class="shahrabad-ticket-meta">' +
        '<div><dt>Référence</dt><dd>' + esc(info.reference || '—') + '</dd></div>' +
        '<div><dt>Date</dt><dd>' + esc(dateLabel(info.date) || 'Date à préciser') + '</dd></div>' +
        '<div><dt>Lieu</dt><dd>' + esc(info.place || 'Lieu à préciser') + '</dd></div>' +
      '</dl>' +
      (media || link ? media + (link ? '<a class="shahrabad-ticket-link" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Ouvrir le billet / lien</a>' : '') : '<div class="shahrabad-ticket-empty"><strong>Aucun billet ajouté</strong><p>Tu peux joindre une image ou un PDF local ci-dessous. Le scan QR sera bientôt disponible.</p></div>') +
      '<p class="shahrabad-ticket-note">Si le document contient un QR original, il reste visible. Extraction automatique : bientôt.</p>' +
      '<div class="shahrabad-ticket-viewer__add">' + controls() + '</div>' +
    '</article>';
  }

  global.ShahrabadTickets = { controls: controls, bind: bind, read: read, viewer: viewer, safeURL: safeURL };
}(typeof window !== 'undefined' ? window : globalThis));
