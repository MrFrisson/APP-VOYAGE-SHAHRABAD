export interface WorldCity {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  currency: string;
  emoji: string;
  popularHighlights?: string[];
}

export const WORLD_CITIES: WorldCity[] = [
  // Chine (Heritage from existing demo data)
  { city: 'Pékin (Beijing)', country: 'Chine', region: 'Asie', lat: 39.9042, lng: 116.4074, currency: 'CNY', emoji: '🏮', popularHighlights: ['Cité Interdite', 'Grande Muraille', 'Palais d’Été', 'Temple du Ciel'] },
  { city: 'Xi’an', country: 'Chine', region: 'Asie', lat: 34.3416, lng: 108.9398, currency: 'CNY', emoji: '🏺', popularHighlights: ['Armée de terre cuite', 'Remparts de Xi’an', 'Quartier Musulman', 'Pagode de l’Oie sauvage'] },
  { city: 'Guilin / Yangshuo', country: 'Chine', region: 'Asie', lat: 25.2736, lng: 110.2902, currency: 'CNY', emoji: '⛰️', popularHighlights: ['Croisière Rivière Li', 'Pics karstiques de Yangshuo', 'Rizières en terrasse de Longji'] },
  { city: 'Shanghai', country: 'Chine', region: 'Asie', lat: 31.2304, lng: 121.4737, currency: 'CNY', emoji: '🏙️', popularHighlights: ['The Bund', 'Jardin Yu', 'Tour de Shanghai', 'Concession française'] },
  { city: 'Chengdu', country: 'Chine', region: 'Asie', lat: 30.5728, lng: 104.0668, currency: 'CNY', emoji: '🐼', popularHighlights: ['Base des Pandas géants', 'Ruelle Kuanzhai', 'Mont Qingcheng'] },
  { city: 'Hong Kong', country: 'Chine', region: 'Asie', lat: 22.3193, lng: 114.1694, currency: 'HKD', emoji: '🚡', popularHighlights: ['Victoria Peak', 'Baie Victoria', 'Star Ferry', 'Temple Man Mo'] },

  // Europe
  { city: 'Paris', country: 'France', region: 'Europe', lat: 48.8566, lng: 2.3522, currency: 'EUR', emoji: '🗼', popularHighlights: ['Tour Eiffel', 'Musée du Louvre', 'Montmartre', 'Notre-Dame'] },
  { city: 'Rome', country: 'Italie', region: 'Europe', lat: 41.9028, lng: 12.4964, currency: 'EUR', emoji: '🏛️', popularHighlights: ['Colisée', 'Fontaine de Trevi', 'Vatican', 'Panthéon'] },
  { city: 'Florence', country: 'Italie', region: 'Europe', lat: 43.7696, lng: 11.2558, currency: 'EUR', emoji: '🎨', popularHighlights: ['Duomo Santa Maria', 'Galerie des Offices', 'Ponte Vecchio'] },
  { city: 'Venise', country: 'Italie', region: 'Europe', lat: 45.4408, lng: 12.3155, currency: 'EUR', emoji: '🎭', popularHighlights: ['Place Saint-Marc', 'Pont des Soupirs', 'Grand Canal', 'Murano'] },
  { city: 'Barcelone', country: 'Espagne', region: 'Europe', lat: 41.3851, lng: 2.1734, currency: 'EUR', emoji: '🏖️', popularHighlights: ['Sagrada Família', 'Parc Güell', 'Las Ramblas', 'Quartier Gothique'] },
  { city: 'Madrid', country: 'Espagne', region: 'Europe', lat: 40.4168, lng: -3.7038, currency: 'EUR', emoji: '🥘', popularHighlights: ['Musée du Prado', 'Palais Royal', 'Parc du Retiro', 'Plaza Mayor'] },
  { city: 'Londres', country: 'Royaume-Uni', region: 'Europe', lat: 51.5074, lng: -0.1278, currency: 'GBP', emoji: '🎡', popularHighlights: ['Big Ben', 'Tower Bridge', 'British Museum', 'Hyde Park'] },
  { city: 'Édimbourg', country: 'Royaume-Uni', region: 'Europe', lat: 55.9533, lng: -3.1883, currency: 'GBP', emoji: '🏰', popularHighlights: ['Château d’Édimbourg', 'Royal Mile', 'Arthur’s Seat'] },
  { city: 'Berlin', country: 'Allemagne', region: 'Europe', lat: 52.5200, lng: 13.4050, currency: 'EUR', emoji: '🍺', popularHighlights: ['Porte de Brandebourg', 'Mur de Berlin', 'Île aux Musées'] },
  { city: 'Munich', country: 'Allemagne', region: 'Europe', lat: 48.1351, lng: 11.5820, currency: 'EUR', emoji: '🥨', popularHighlights: ['Marienplatz', 'Château de Nymphenburg', 'Jardin Anglais'] },
  { city: 'Amsterdam', country: 'Pays-Bas', region: 'Europe', lat: 52.3676, lng: 4.9041, currency: 'EUR', emoji: '🚲', popularHighlights: ['Canaux d’Amsterdam', 'Musée Van Gogh', 'Rijksmuseum'] },
  { city: 'Bruxelles', country: 'Belgique', region: 'Europe', lat: 50.8503, lng: 4.3517, currency: 'EUR', emoji: '🍫', popularHighlights: ['Grand-Place', 'Atomium', 'Manneken-Pis'] },
  { city: 'Vienne', country: 'Autriche', region: 'Europe', lat: 48.2082, lng: 16.3738, currency: 'EUR', emoji: '🎻', popularHighlights: ['Palais de Schönbrunn', 'Opéra de Vienne', 'Palais Hofburg'] },
  { city: 'Prague', country: 'République Tchèque', region: 'Europe', lat: 50.0755, lng: 14.4378, currency: 'CZK', emoji: '🏰', popularHighlights: ['Pont Charles', 'Château de Prague', 'Horloge Astronomique'] },
  { city: 'Budapest', country: 'Hongrie', region: 'Europe', lat: 47.4979, lng: 19.0402, currency: 'HUF', emoji: '♨️', popularHighlights: ['Bains Széchenyi', 'Parlement hongrois', 'Bastion des Pêcheurs'] },
  { city: 'Athènes', country: 'Grèce', region: 'Europe', lat: 37.9838, lng: 23.7275, currency: 'EUR', emoji: '🏛️', popularHighlights: ['Acropole', 'Parthénon', 'Quartier de Plaka'] },
  { city: 'Santorin', country: 'Grèce', region: 'Europe', lat: 36.3932, lng: 25.4615, currency: 'EUR', emoji: '🌅', popularHighlights: ['Oia au coucher du soleil', 'Fira', 'Plage Rouge'] },
  { city: 'Lisbonne', country: 'Portugal', region: 'Europe', lat: 38.7223, lng: -9.1393, currency: 'EUR', emoji: '🚋', popularHighlights: ['Tramway 28', 'Tour de Belém', 'Alfama', 'Pastéis de Belém'] },
  { city: 'Porto', country: 'Portugal', region: 'Europe', lat: 41.1579, lng: -8.6291, currency: 'EUR', emoji: '🍷', popularHighlights: ['Ribeira', 'Pont Dom-Luís', 'Caves de Porto'] },
  { city: 'Reykjavik', country: 'Islande', region: 'Europe', lat: 64.1466, lng: -21.9426, currency: 'ISK', emoji: '🧊', popularHighlights: ['Cercle d’Or', 'Blue Lagoon', 'Aurores Boréales'] },
  { city: 'Zurich', country: 'Suisse', region: 'Europe', lat: 47.3769, lng: 8.5417, currency: 'CHF', emoji: '🏔️', popularHighlights: ['Lac de Zurich', 'Vieille Ville', 'Grossmünster'] },
  { city: 'Genève', country: 'Suisse', region: 'Europe', lat: 46.2044, lng: 6.1432, currency: 'CHF', emoji: '⛲', popularHighlights: ['Jet d’Eau', 'Lac Léman', 'Palais des Nations'] },
  { city: 'Stockholm', country: 'Suède', region: 'Europe', lat: 59.3293, lng: 18.0686, currency: 'SEK', emoji: '⛵', popularHighlights: ['Gamla Stan', 'Musée Vasa', 'Archipel de Stockholm'] },
  { city: 'Oslo', country: 'Norvège', region: 'Europe', lat: 59.9139, lng: 10.7522, currency: 'NOK', emoji: '🏔️', popularHighlights: ['Fjords', 'Opéra d’Oslo', 'Musée Munch'] },
  { city: 'Copenhague', country: 'Danemark', region: 'Europe', lat: 55.6761, lng: 12.5683, currency: 'DKK', emoji: '🧜‍♀️', popularHighlights: ['Nyhavn', 'Tivoli Gardens', 'La Petite Sirène'] },
  { city: 'Dublin', country: 'Irlande', region: 'Europe', lat: 53.3498, lng: -6.2603, currency: 'EUR', emoji: '🍀', popularHighlights: ['Temple Bar', 'Trinity College', 'Guinness Storehouse'] },

  // Asie
  { city: 'Tokyo', country: 'Japon', region: 'Asie', lat: 35.6762, lng: 139.6503, currency: 'JPY', emoji: '⛩️', popularHighlights: ['Shibuya Crossing', 'Sensō-ji', 'Akihabara', 'Mont Fuji'] },
  { city: 'Kyoto', country: 'Japon', region: 'Asie', lat: 35.0116, lng: 135.7681, currency: 'JPY', emoji: '🌸', popularHighlights: ['Fushimi Inari-taisha', 'Kinkaku-ji', 'Forêt de bambous Arashiyama'] },
  { city: 'Osaka', country: 'Japon', region: 'Asie', lat: 34.6937, lng: 135.5023, currency: 'JPY', emoji: '🍣', popularHighlights: ['Dotonbori', 'Château d’Osaka', 'Marché Kuromon'] },
  { city: 'Bangkok', country: 'Thaïlande', region: 'Asie', lat: 13.7563, lng: 100.5018, currency: 'THB', emoji: '🛕', popularHighlights: ['Grand Palais', 'Wat Pho', 'Marché flottant', 'Chinatown'] },
  { city: 'Chiang Mai', country: 'Thaïlande', region: 'Asie', lat: 18.7883, lng: 98.9853, currency: 'THB', emoji: '🐘', popularHighlights: ['Sanctuaires d’éléphants', 'Doi Suthep', 'Night Bazaar'] },
  { city: 'Phuket', country: 'Thaïlande', region: 'Asie', lat: 7.8804, lng: 98.3923, currency: 'THB', emoji: '🏝️', popularHighlights: ['Baie de Phang Nga', 'Plages de Kata & Karon', 'Big Buddha'] },
  { city: 'Séoul', country: 'Corée du Sud', region: 'Asie', lat: 37.5665, lng: 126.9780, currency: 'KRW', emoji: '🥢', popularHighlights: ['Palais Gyeongbokgung', 'Bukchon Hanok', 'Myeongdong', 'N Seoul Tower'] },
  { city: 'Singapour', country: 'Singapour', region: 'Asie', lat: 1.3521, lng: 103.8198, currency: 'SGD', emoji: '🦁', popularHighlights: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa'] },
  { city: 'Bali', country: 'Indonésie', region: 'Asie', lat: -8.4095, lng: 115.1889, currency: 'IDR', emoji: '🌺', popularHighlights: ['Ubud', 'Temples de Tanah Lot', 'Rizières de Tegalalang'] },
  { city: 'Kuala Lumpur', country: 'Malaisie', region: 'Asie', lat: 3.1390, lng: 101.6869, currency: 'MYR', emoji: '🕌', popularHighlights: ['Tours Petronas', 'Grottes de Batu', 'Bukit Bintang'] },
  { city: 'Hanoï', country: 'Vietnam', region: 'Asie', lat: 21.0285, lng: 105.8542, currency: 'VND', emoji: '🍜', popularHighlights: ['Vieux Quartier', 'Lac Hoan Kiem', 'Baie d’Halong (excursion)'] },
  { city: 'Hô-Chi-Minh-Ville', country: 'Vietnam', region: 'Asie', lat: 10.8231, lng: 106.6297, currency: 'VND', emoji: '🛵', popularHighlights: ['Marché Ben Thanh', 'Tunnel de Cu Chi', 'Delta du Mékong'] },
  { city: 'Siem Reap', country: 'Cambodge', region: 'Asie', lat: 13.3671, lng: 103.8448, currency: 'USD', emoji: '🗿', popularHighlights: ['Angkor Wat', 'Bayon', 'Ta Prohm'] },
  { city: 'Delhi', country: 'Inde', region: 'Asie', lat: 28.7041, lng: 77.1025, currency: 'INR', emoji: '🕌', popularHighlights: ['Fort Rouge', 'Qutb Minar', 'Temple du Lotus', 'Taj Mahal (Agra)'] },
  { city: 'Jaipur', country: 'Inde', region: 'Asie', lat: 26.9124, lng: 75.7873, currency: 'INR', emoji: '👑', popularHighlights: ['Palais des Vents (Hawa Mahal)', 'Fort d’Amber', 'City Palace'] },
  { city: 'Mumbai', country: 'Inde', region: 'Asie', lat: 19.0760, lng: 72.8777, currency: 'INR', emoji: '🚢', popularHighlights: ['Porte de l’Inde', 'Marine Drive', 'Gares Chhatrapati Shivaji'] },

  // Amériques
  { city: 'New York', country: 'États-Unis', region: 'Amérique du Nord', lat: 40.7128, lng: -74.0060, currency: 'USD', emoji: '🗽', popularHighlights: ['Central Park', 'Times Square', 'Empire State Building', 'Statue de la Liberté'] },
  { city: 'San Francisco', country: 'États-Unis', region: 'Amérique du Nord', lat: 37.7749, lng: -122.4194, currency: 'USD', emoji: '🌁', popularHighlights: ['Golden Gate Bridge', 'Alcatraz', 'Fisherman’s Wharf'] },
  { city: 'Los Angeles', country: 'États-Unis', region: 'Amérique du Nord', lat: 34.0522, lng: -118.2437, currency: 'USD', emoji: '🎬', popularHighlights: ['Hollywood', 'Santa Monica', 'Venice Beach', 'Beverly Hills'] },
  { city: 'Miami', country: 'États-Unis', region: 'Amérique du Nord', lat: 25.7617, lng: -80.1918, currency: 'USD', emoji: '🌴', popularHighlights: ['South Beach', 'Art Deco District', 'Everglades'] },
  { city: 'Montréal', country: 'Canada', region: 'Amérique du Nord', lat: 45.5017, lng: -73.5673, currency: 'CAD', emoji: '🍁', popularHighlights: ['Vieux-Montréal', 'Mont Royal', 'Basilique Notre-Dame'] },
  { city: 'Vancouver', country: 'Canada', region: 'Amérique du Nord', lat: 49.2827, lng: -123.1207, currency: 'CAD', emoji: '🌲', popularHighlights: ['Stanley Park', 'Pont suspendu Capilano', 'Granville Island'] },
  { city: 'Mexico', country: 'Mexique', region: 'Amérique Latine', lat: 19.4326, lng: -99.1332, currency: 'MXN', emoji: '🌮', popularHighlights: ['Zócalo', 'Teotihuacan', 'Musée Frida Kahlo', 'Chapultepec'] },
  { city: 'Cancún / Riviera Maya', country: 'Mexique', region: 'Amérique Latine', lat: 21.1619, lng: -86.8515, currency: 'MXN', emoji: '🤿', popularHighlights: ['Chichen Itza', 'Cénotes', 'Plages caraïbes', 'Tulum'] },
  { city: 'Rio de Janeiro', country: 'Brésil', region: 'Amérique du Sud', lat: -22.9068, lng: -43.1729, currency: 'BRL', emoji: '⛰️', popularHighlights: ['Christ Rédempteur', 'Pain de Sucre', 'Plage de Copacabana'] },
  { city: 'Buenos Aires', country: 'Argentine', region: 'Amérique du Sud', lat: -34.6037, lng: -58.3816, currency: 'ARS', emoji: '💃', popularHighlights: ['La Boca & Caminito', 'San Telmo', 'Teatro Colón', 'Recoleta'] },
  { city: 'Cusco / Machu Picchu', country: 'Pérou', region: 'Amérique du Sud', lat: -13.5319, lng: -71.9675, currency: 'PEN', emoji: '🦙', popularHighlights: ['Machu Picchu', 'Vallée Sacrée', 'Place d’Armes de Cusco'] },

  // Océanie
  { city: 'Sydney', country: 'Australie', region: 'Océanie', lat: -33.8688, lng: 151.2093, currency: 'AUD', emoji: '🦘', popularHighlights: ['Opéra de Sydney', 'Harbour Bridge', 'Bondi Beach', 'The Rocks'] },
  { city: 'Melbourne', country: 'Australie', region: 'Océanie', lat: -37.8136, lng: 144.9631, currency: 'AUD', emoji: '☕', popularHighlights: ['Great Ocean Road', 'Ruelles et Street Art', 'Federation Square'] },
  { city: 'Auckland', country: 'Nouvelle-Zélande', region: 'Océanie', lat: -36.8485, lng: 174.7633, currency: 'NZD', emoji: '🥝', popularHighlights: ['Sky Tower', 'Île Waiheke', 'Mont Éden'] },
  { city: 'Queenstown', country: 'Nouvelle-Zélande', region: 'Océanie', lat: -45.0312, lng: 168.6626, currency: 'NZD', emoji: '🎿', popularHighlights: ['Fjords de Milford Sound', 'Lac Wakatipu', 'Sports d’aventure'] },

  // Moyen-Orient & Afrique
  { city: 'Dubaï', country: 'Émirats Arabes Unis', region: 'Moyen-Orient', lat: 25.2048, lng: 55.2708, currency: 'AED', emoji: '🏙️', popularHighlights: ['Burj Khalifa', 'Dubaï Mall', 'Palm Jumeirah', 'Désert safari'] },
  { city: 'Le Caire', country: 'Égypte', region: 'Afrique', lat: 30.0444, lng: 31.2357, currency: 'EGP', emoji: '🐫', popularHighlights: ['Pyramides de Gizeh', 'Sphinx', 'Musée Égyptien', 'Bazar Khan el-Khalili'] },
  { city: 'Marrakech', country: 'Maroc', region: 'Afrique', lat: 31.6295, lng: -7.9811, currency: 'MAD', emoji: '🕌', popularHighlights: ['Place Jemaa el-Fna', 'Jardin Majorelle', 'Médina & Souks', 'Palais Bahia'] },
  { city: 'Le Cap (Cape Town)', country: 'Afrique du Sud', region: 'Afrique', lat: -33.9249, lng: 18.4241, currency: 'ZAR', emoji: '🐧', popularHighlights: ['Table Mountain', 'Cap de Bonne-Espérance', 'Boulders Beach'] }
];

export const CURATED_HERO_PHOTOS = [
  {
    id: 'asia',
    title: 'Guilin & Rivières Mystiques',
    subtitle: 'Chine & Asie',
    url: '/src/assets/images/travel_china_hero_1792423188699.jpg',
  },
  {
    id: 'europe',
    title: 'Toscane & Collines Dorées',
    subtitle: 'Italie & Europe',
    url: '/src/assets/images/travel_italy_hero_1792423188957.jpg',
  },
  {
    id: 'compass',
    title: 'Boussole Antique & Mappemonde',
    subtitle: 'Toutes destinations du monde',
    url: '/src/assets/images/travel_world_compass_1792423189242.jpg',
  },
];

export function getAutoCoverForDestination(destinationOrCountry: string): string {
  const norm = (destinationOrCountry || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!norm) return CURATED_HERO_PHOTOS[2].url;

  if (
    norm.includes('chin') ||
    norm.includes('pekin') ||
    norm.includes('beijing') ||
    norm.includes('shanghai') ||
    norm.includes('guilin') ||
    norm.includes('yangshuo') ||
    norm.includes('xian') ||
    norm.includes('chengdu') ||
    norm.includes('japon') ||
    norm.includes('tokyo') ||
    norm.includes('kyoto') ||
    norm.includes('osaka') ||
    norm.includes('asia') ||
    norm.includes('asie') ||
    norm.includes('thailand') ||
    norm.includes('bangkok') ||
    norm.includes('vietnam') ||
    norm.includes('hanoi') ||
    norm.includes('coree') ||
    norm.includes('seoul') ||
    norm.includes('indones') ||
    norm.includes('bali')
  ) {
    return CURATED_HERO_PHOTOS[0].url;
  }

  if (
    norm.includes('ital') ||
    norm.includes('rome') ||
    norm.includes('florence') ||
    norm.includes('venis') ||
    norm.includes('toscane') ||
    norm.includes('franc') ||
    norm.includes('paris') ||
    norm.includes('espagn') ||
    norm.includes('barcelon') ||
    norm.includes('madrid') ||
    norm.includes('grec') ||
    norm.includes('santorin') ||
    norm.includes('portugal') ||
    norm.includes('lisbon') ||
    norm.includes('porto') ||
    norm.includes('suiss') ||
    norm.includes('allemag') ||
    norm.includes('berlin') ||
    norm.includes('munich') ||
    norm.includes('vienn') ||
    norm.includes('europe') ||
    norm.includes('londres') ||
    norm.includes('amsterdam') ||
    norm.includes('prague')
  ) {
    return CURATED_HERO_PHOTOS[1].url;
  }

  return CURATED_HERO_PHOTOS[2].url;
}

export function searchDestinations(query: string): WorldCity[] {
  if (!query || query.trim() === '') return WORLD_CITIES.slice(0, 15);
  const q = query.toLowerCase().trim();
  return WORLD_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
  );
}

export function buildGoogleMapsUrl(locationName: string, lat?: number, lng?: number): string {
  if (lat !== undefined && lng !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
}

export function getAutoEmojiForDestination(destinationOrCountry: string): string {
  if (!destinationOrCountry) return '📍';
  const norm = destinationOrCountry.toLowerCase().trim();

  // Try exact or partial match in WORLD_CITIES first
  const match = WORLD_CITIES.find(
    (c) =>
      norm.includes(c.city.toLowerCase()) ||
      norm.includes(c.country.toLowerCase()) ||
      c.city.toLowerCase().includes(norm)
  );
  if (match) return match.emoji;

  if (norm.includes('japon') || norm.includes('japan') || norm.includes('tokyo') || norm.includes('kyoto')) return '⛩️';
  if (norm.includes('chine') || norm.includes('china') || norm.includes('pekin') || norm.includes('shanghai')) return '🏮';
  if (norm.includes('itali') || norm.includes('italy') || norm.includes('rome') || norm.includes('florence') || norm.includes('venis')) return '🏛️';
  if (norm.includes('franc') || norm.includes('paris')) return '🗼';
  if (norm.includes('espagn') || norm.includes('spain') || norm.includes('barcelon') || norm.includes('madrid')) return '🥘';
  if (norm.includes('grec') || norm.includes('greece') || norm.includes('athen') || norm.includes('santorin')) return '🏛️';
  if (norm.includes('usa') || norm.includes('etats-unis') || norm.includes('new york') || norm.includes('californi')) return '🗽';
  if (norm.includes('anglet') || norm.includes('uk') || norm.includes('londres') || norm.includes('london')) return '🎡';
  if (norm.includes('australi') || norm.includes('sydney') || norm.includes('melbourne')) return '🦘';
  if (norm.includes('thailand') || norm.includes('bangkok') || norm.includes('phuket')) return '🛕';
  if (norm.includes('bali') || norm.includes('indonesi')) return '🌺';
  if (norm.includes('vietnam') || norm.includes('hanoi')) return '🍜';
  if (norm.includes('islande') || norm.includes('iceland')) return '🧊';
  if (norm.includes('suiss') || norm.includes('switzerland') || norm.includes('alpes')) return '🏔️';
  if (norm.includes('canad') || norm.includes('quebec') || norm.includes('montreal')) return '🍁';
  if (norm.includes('maroc') || norm.includes('morocco') || norm.includes('egypt') || norm.includes('caire')) return '🐫';
  if (norm.includes('plage') || norm.includes('ile') || norm.includes('island')) return '🏝️';
  if (norm.includes('mont') || norm.includes('volcan')) return '🌋';

  return '📍';
}

export function getAutoCoordsForDestination(destinationOrCountry: string): { lat?: number; lng?: number } {
  if (!destinationOrCountry) return {};
  const norm = destinationOrCountry.toLowerCase().trim();
  const match = WORLD_CITIES.find(
    (c) =>
      norm.includes(c.city.toLowerCase()) ||
      norm.includes(c.country.toLowerCase()) ||
      c.city.toLowerCase().includes(norm)
  );
  if (match) return { lat: match.lat, lng: match.lng };
  return {};
}

