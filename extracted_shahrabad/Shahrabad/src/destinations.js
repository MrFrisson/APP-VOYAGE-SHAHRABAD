/* Source mondiale ouverte : Wikivoyage / Wikimedia. Cache local, aucun pays imposé. */
(() => {
  const CACHE = 'shahrabad:destinations:v1';
  const inFlight = new Map();
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE) || '{}'); } catch (_) {}
  const clean = text => String(text || '').trim();
  const norm = text => clean(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  async function query(language, params) {
    const url = new URL(`https://${language}.wikivoyage.org/w/api.php`);
    url.search = new URLSearchParams({ action: 'query', format: 'json', origin: '*', ...params });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'Api-User-Agent': 'Shahrabad/1.0 (personal travel planner)' } });
      if (!response.ok) throw new Error('Service de destinations indisponible');
      const data = await response.json();
      if (data.error) throw new Error(data.error.info);
      return data;
    } finally { clearTimeout(timeout); }
  }

  async function lookup(name, country) {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    let translatedName = capitalized;
    let coordinateFallback = null;
    const usablePhoto = page => page.original && /\.(?:jpe?g|webp)(?:\?|$)/i.test(page.original.source) && !/(?:flag|map_of|location_map|drapeau)/i.test(page.original.source);
    for (const language of ['fr', 'en']) {
      const title = language === 'en' ? translatedName : capitalized;
      const titles = country ? `${title} (${country})|${title}` : title;
      let data = await query(language, { titles, redirects: '1', prop: 'pageimages|coordinates|pageprops|langlinks', piprop: 'original', ppprop: 'disambiguation', lllang: 'en' });
      let pages = Object.values(data.query?.pages || {}).filter(p => p.pageid && !Object.prototype.hasOwnProperty.call(p.pageprops || {}, 'disambiguation'));
      if (!pages.length) {
        const search = await query(language, { list: 'search', srsearch: name, srnamespace: '0', srlimit: '5' });
        // Choix exact ou désambiguïsation géographique, pas un article sans rapport avec le nom.
        const results = search.query?.search || [];
        const candidate = results.find(p => norm(p.title) === norm(name)) || results.find(p => country && norm(p.title).startsWith(norm(name)) && norm(p.title).includes(norm(country)));
        if (candidate) {
          data = await query(language, { pageids: String(candidate.pageid), prop: 'pageimages|coordinates', piprop: 'original' });
          pages = Object.values(data.query?.pages || {});
        }
      }
      const page = pages.find(usablePhoto) || pages[0];
      if (page) {
        translatedName = page.langlinks?.[0]?.['*'] || translatedName;
        const coordinates = page.coordinates?.[0];
        const image = usablePhoto(page) ? page.original.source : '';
        const result = {
          name: page.title,
          image,
          lat: coordinates?.lat ?? '',
          lng: coordinates?.lon ?? '',
          source: `https://${language}.wikivoyage.org/?curid=${page.pageid}`,
          fetchedAt: Date.now(),
          status: image ? 'ready' : 'missing'
        };
        if (image) return result;
        coordinateFallback = result;
      }
    }
    return coordinateFallback || { image: '', lat: '', lng: '', source: '', status: 'missing', fetchedAt: Date.now() };
  }

  function resolve(name, country = '') {
    name = clean(name); country = clean(country);
    if (!name) return Promise.resolve({ image: '', status: 'missing' });
    const key = `${norm(name)}|${norm(country)}`;
    const previous = cache[key];
    if (previous && Date.now() - previous.fetchedAt < 30 * 86400000) return Promise.resolve(previous);
    if (inFlight.has(key)) return inFlight.get(key);
    const request = lookup(name, country).then(result => {
      cache[key] = result;
      try { localStorage.setItem(CACHE, JSON.stringify(cache)); } catch (_) {}
      return result;
    }).catch(() => ({ image: '', status: 'error' })).finally(() => inFlight.delete(key));
    inFlight.set(key, request);
    return request;
  }
  window.ShahrabadDestinations = { resolve };
})();
