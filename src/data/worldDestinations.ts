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
  // Europe
  { city: 'Paris', country: 'France', region: 'Europe', lat: 48.8566, lng: 2.3522, currency: 'EUR', emoji: '🗼', popularHighlights: ['Tour Eiffel', 'Musée du Louvre', 'Montmartre', 'Notre-Dame'] },
  { city: 'Rome', country: 'Italie', region: 'Europe', lat: 41.9028, lng: 12.4964, currency: 'EUR', emoji: '🏛️', popularHighlights: ['Colisée', 'Fontaine de Trevi', 'Vatican', 'Panthéon'] },
  { city: 'Florence', country: 'Italie', region: 'Europe', lat: 43.7696, lng: 11.2558, currency: 'EUR', emoji: '🎨', popularHighlights: ['Duomo Santa Maria', 'Galerie des Offices', 'Ponte Vecchio'] },
  { city: 'Venise', country: 'Italie', region: 'Europe', lat: 45.4408, lng: 12.3155, currency: 'EUR', emoji: '🎭', popularHighlights: ['Place Saint-Marc', 'Pont des Soupirs', 'Grand Canal'] },
  { city: 'Barcelone', country: 'Espagne', region: 'Europe', lat: 41.3851, lng: 2.1734, currency: 'EUR', emoji: '🏖️', popularHighlights: ['Sagrada Família', 'Parc Güell', 'Las Ramblas'] },
  { city: 'Madrid', country: 'Espagne', region: 'Europe', lat: 40.4168, lng: -3.7038, currency: 'EUR', emoji: '🥘', popularHighlights: ['Musée du Prado', 'Palais Royal', 'Retiro'] },
  { city: 'Séville', country: 'Espagne', region: 'Europe', lat: 37.3891, lng: -5.9845, currency: 'EUR', emoji: '💃', popularHighlights: ['Place d’Espagne', 'Alcazar', 'Giralda'] },
  { city: 'Londres', country: 'Royaume-Uni', region: 'Europe', lat: 51.5074, lng: -0.1278, currency: 'GBP', emoji: '🎡', popularHighlights: ['Big Ben', 'Tower Bridge', 'British Museum'] },
  { city: 'Édimbourg', country: 'Royaume-Uni', region: 'Europe', lat: 55.9533, lng: -3.1883, currency: 'GBP', emoji: '🏰', popularHighlights: ['Château d’Édimbourg', 'Royal Mile'] },
  { city: 'Dublin', country: 'Irlande', region: 'Europe', lat: 53.3498, lng: -6.2603, currency: 'EUR', emoji: '🍀', popularHighlights: ['Temple Bar', 'Trinity College'] },
  { city: 'Amsterdam', country: 'Pays-Bas', region: 'Europe', lat: 52.3676, lng: 4.9041, currency: 'EUR', emoji: '🚲', popularHighlights: ['Canaux d’Amsterdam', 'Musée Van Gogh'] },
  { city: 'Bruxelles', country: 'Belgique', region: 'Europe', lat: 50.8503, lng: 4.3517, currency: 'EUR', emoji: '🍫', popularHighlights: ['Grand-Place', 'Atomium'] },
  { city: 'Berlin', country: 'Allemagne', region: 'Europe', lat: 52.5200, lng: 13.4050, currency: 'EUR', emoji: '🍺', popularHighlights: ['Porte de Brandebourg', 'Mur de Berlin'] },
  { city: 'Munich', country: 'Allemagne', region: 'Europe', lat: 48.1351, lng: 11.5820, currency: 'EUR', emoji: '🥨', popularHighlights: ['Marienplatz', 'Jardin Anglais'] },
  { city: 'Vienne', country: 'Autriche', region: 'Europe', lat: 48.2082, lng: 16.3738, currency: 'EUR', emoji: '🎻', popularHighlights: ['Palais de Schönbrunn', 'Opéra'] },
  { city: 'Prague', country: 'République Tchèque', region: 'Europe', lat: 50.0755, lng: 14.4378, currency: 'CZK', emoji: '🏰', popularHighlights: ['Pont Charles', 'Château de Prague'] },
  { city: 'Budapest', country: 'Hongrie', region: 'Europe', lat: 47.4979, lng: 19.0402, currency: 'HUF', emoji: '♨️', popularHighlights: ['Bains Széchenyi', 'Parlement'] },
  { city: 'Athènes', country: 'Grèce', region: 'Europe', lat: 37.9838, lng: 23.7275, currency: 'EUR', emoji: '🏛️', popularHighlights: ['Acropole', 'Parthénon'] },
  { city: 'Santorin', country: 'Grèce', region: 'Europe', lat: 36.3932, lng: 25.4615, currency: 'EUR', emoji: '🌅', popularHighlights: ['Oia', 'Fira', 'Plage Rouge'] },
  { city: 'Mykonos', country: 'Grèce', region: 'Europe', lat: 37.4467, lng: 25.3289, currency: 'EUR', emoji: '⛵', popularHighlights: ['Moulins à vent', 'Petite Venise'] },
  { city: 'Lisbonne', country: 'Portugal', region: 'Europe', lat: 38.7223, lng: -9.1393, currency: 'EUR', emoji: '🚋', popularHighlights: ['Tram 28', 'Tour de Belém', 'Alfama'] },
  { city: 'Porto', country: 'Portugal', region: 'Europe', lat: 41.1579, lng: -8.6291, currency: 'EUR', emoji: '🍷', popularHighlights: ['Ribeira', 'Pont Dom-Luís'] },
  { city: 'Reykjavik', country: 'Islande', region: 'Europe', lat: 64.1466, lng: -21.9426, currency: 'ISK', emoji: '🧊', popularHighlights: ['Cercle d’Or', 'Blue Lagoon', 'Aurores Boréales'] },
  { city: 'Zurich', country: 'Suisse', region: 'Europe', lat: 47.3769, lng: 8.5417, currency: 'CHF', emoji: '🏔️', popularHighlights: ['Lac de Zurich', 'Grossmünster'] },
  { city: 'Genève', country: 'Suisse', region: 'Europe', lat: 46.2044, lng: 6.1432, currency: 'CHF', emoji: '⛲', popularHighlights: ['Jet d’Eau', 'Lac Léman'] },
  { city: 'Stockholm', country: 'Suède', region: 'Europe', lat: 59.3293, lng: 18.0686, currency: 'SEK', emoji: '⛵', popularHighlights: ['Gamla Stan', 'Musée Vasa'] },
  { city: 'Oslo', country: 'Norvège', region: 'Europe', lat: 59.9139, lng: 10.7522, currency: 'NOK', emoji: '🏔️', popularHighlights: ['Fjords', 'Opéra d’Oslo'] },
  { city: 'Copenhague', country: 'Danemark', region: 'Europe', lat: 55.6761, lng: 12.5683, currency: 'DKK', emoji: '🧜‍♀️', popularHighlights: ['Nyhavn', 'Tivoli'] },
  { city: 'Dubrovnik', country: 'Croatie', region: 'Europe', lat: 42.6507, lng: 18.0944, currency: 'EUR', emoji: '🛡️', popularHighlights: ['Remparts', 'Stradun'] },
  { city: 'Istanbul', country: 'Turquie', region: 'Europe', lat: 41.0082, lng: 28.9784, currency: 'TRY', emoji: '🕌', popularHighlights: ['Sainte-Sophie', 'Mosquée Bleue', 'Grand Bazar'] },

  // Asie
  { city: 'Tokyo', country: 'Japon', region: 'Asie', lat: 35.6762, lng: 139.6503, currency: 'JPY', emoji: '⛩️', popularHighlights: ['Shibuya Crossing', 'Sensō-ji', 'Mont Fuji'] },
  { city: 'Kyoto', country: 'Japon', region: 'Asie', lat: 35.0116, lng: 135.7681, currency: 'JPY', emoji: '🌸', popularHighlights: ['Fushimi Inari', 'Kinkaku-ji', 'Forêt de bambous'] },
  { city: 'Osaka', country: 'Japon', region: 'Asie', lat: 34.6937, lng: 135.5023, currency: 'JPY', emoji: '🍣', popularHighlights: ['Dotonbori', 'Château d’Osaka'] },
  { city: 'Pékin (Beijing)', country: 'Chine', region: 'Asie', lat: 39.9042, lng: 116.4074, currency: 'CNY', emoji: '🏮', popularHighlights: ['Cité Interdite', 'Grande Muraille', 'Palais d’Été'] },
  { city: 'Xi’an', country: 'Chine', region: 'Asie', lat: 34.3416, lng: 108.9398, currency: 'CNY', emoji: '🏺', popularHighlights: ['Guerriers de terre cuite', 'Remparts'] },
  { city: 'Guilin / Yangshuo', country: 'Chine', region: 'Asie', lat: 25.2736, lng: 110.2902, currency: 'CNY', emoji: '⛰️', popularHighlights: ['Rivière Li', 'Pics karstiques'] },
  { city: 'Shanghai', country: 'Chine', region: 'Asie', lat: 31.2304, lng: 121.4737, currency: 'CNY', emoji: '🏙️', popularHighlights: ['The Bund', 'Tour de Shanghai'] },
  { city: 'Chengdu', country: 'Chine', region: 'Asie', lat: 30.5728, lng: 104.0668, currency: 'CNY', emoji: '🐼', popularHighlights: ['Base des Pandas', 'Mont Qingcheng'] },
  { city: 'Hong Kong', country: 'Chine', region: 'Asie', lat: 22.3193, lng: 114.1694, currency: 'HKD', emoji: '🚡', popularHighlights: ['Victoria Peak', 'Star Ferry'] },
  { city: 'Bangkok', country: 'Thaïlande', region: 'Asie', lat: 13.7563, lng: 100.5018, currency: 'THB', emoji: '🛕', popularHighlights: ['Grand Palais', 'Wat Pho'] },
  { city: 'Chiang Mai', country: 'Thaïlande', region: 'Asie', lat: 18.7883, lng: 98.9853, currency: 'THB', emoji: '🐘', popularHighlights: ['Sanctuaires', 'Doi Suthep'] },
  { city: 'Phuket', country: 'Thaïlande', region: 'Asie', lat: 7.8804, lng: 98.3923, currency: 'THB', emoji: '🏝️', popularHighlights: ['Baie de Phang Nga', 'Plages'] },
  { city: 'Séoul', country: 'Corée du Sud', region: 'Asie', lat: 37.5665, lng: 126.9780, currency: 'KRW', emoji: '🥢', popularHighlights: ['Palais Gyeongbokgung', 'Myeongdong'] },
  { city: 'Singapour', country: 'Singapour', region: 'Asie', lat: 1.3521, lng: 103.8198, currency: 'SGD', emoji: '🦁', popularHighlights: ['Gardens by the Bay', 'Marina Bay Sands'] },
  { city: 'Bali', country: 'Indonésie', region: 'Asie', lat: -8.4095, lng: 115.1889, currency: 'IDR', emoji: '🌺', popularHighlights: ['Ubud', 'Temples de Tanah Lot'] },
  { city: 'Kuala Lumpur', country: 'Malaisie', region: 'Asie', lat: 3.1390, lng: 101.6869, currency: 'MYR', emoji: '🕌', popularHighlights: ['Tours Petronas', 'Grottes de Batu'] },
  { city: 'Hanoï', country: 'Vietnam', region: 'Asie', lat: 21.0285, lng: 105.8542, currency: 'VND', emoji: '🍜', popularHighlights: ['Vieux Quartier', 'Baie d’Halong'] },
  { city: 'Hô-Chi-Minh-Ville', country: 'Vietnam', region: 'Asie', lat: 10.8231, lng: 106.6297, currency: 'VND', emoji: '🛵', popularHighlights: ['Marché Ben Thanh', 'Mékong'] },
  { city: 'Siem Reap', country: 'Cambodge', region: 'Asie', lat: 13.3671, lng: 103.8448, currency: 'USD', emoji: '🗿', popularHighlights: ['Angkor Wat', 'Bayon'] },
  { city: 'Delhi', country: 'Inde', region: 'Asie', lat: 28.7041, lng: 77.1025, currency: 'INR', emoji: '🕌', popularHighlights: ['Fort Rouge', 'Taj Mahal (Agra)'] },
  { city: 'Jaipur', country: 'Inde', region: 'Asie', lat: 26.9124, lng: 75.7873, currency: 'INR', emoji: '👑', popularHighlights: ['Hawa Mahal', 'Fort d’Amber'] },

  // Amériques
  { city: 'New York', country: 'États-Unis', region: 'Amérique du Nord', lat: 40.7128, lng: -74.0060, currency: 'USD', emoji: '🗽', popularHighlights: ['Central Park', 'Times Square', 'Statue de la Liberté'] },
  { city: 'San Francisco', country: 'États-Unis', region: 'Amérique du Nord', lat: 37.7749, lng: -122.4194, currency: 'USD', emoji: '🌁', popularHighlights: ['Golden Gate', 'Alcatraz'] },
  { city: 'Los Angeles', country: 'États-Unis', region: 'Amérique du Nord', lat: 34.0522, lng: -118.2437, currency: 'USD', emoji: '🎬', popularHighlights: ['Hollywood', 'Santa Monica'] },
  { city: 'Miami', country: 'États-Unis', region: 'Amérique du Nord', lat: 25.7617, lng: -80.1918, currency: 'USD', emoji: '🌴', popularHighlights: ['South Beach', 'Art Déco'] },
  { city: 'Montréal', country: 'Canada', region: 'Amérique du Nord', lat: 45.5017, lng: -73.5673, currency: 'CAD', emoji: '🍁', popularHighlights: ['Vieux-Montréal', 'Mont Royal'] },
  { city: 'Vancouver', country: 'Canada', region: 'Amérique du Nord', lat: 49.2827, lng: -123.1207, currency: 'CAD', emoji: '🌲', popularHighlights: ['Stanley Park', 'Capilano'] },
  { city: 'Mexico', country: 'Mexique', region: 'Amérique Latine', lat: 19.4326, lng: -99.1332, currency: 'MXN', emoji: '🌮', popularHighlights: ['Zócalo', 'Teotihuacan', 'Frida Kahlo'] },
  { city: 'Cancún / Tulum', country: 'Mexique', region: 'Amérique Latine', lat: 21.1619, lng: -86.8515, currency: 'MXN', emoji: '🤿', popularHighlights: ['Chichen Itza', 'Cénotes', 'Tulum'] },
  { city: 'Rio de Janeiro', country: 'Brésil', region: 'Amérique du Sud', lat: -22.9068, lng: -43.1729, currency: 'BRL', emoji: '⛰️', popularHighlights: ['Christ Rédempteur', 'Copacabana'] },
  { city: 'Buenos Aires', country: 'Argentine', region: 'Amérique du Sud', lat: -34.6037, lng: -58.3816, currency: 'ARS', emoji: '💃', popularHighlights: ['La Boca', 'San Telmo', 'Teatro Colón'] },
  { city: 'Cusco / Machu Picchu', country: 'Pérou', region: 'Amérique du Sud', lat: -13.5319, lng: -71.9675, currency: 'PEN', emoji: '🦙', popularHighlights: ['Machu Picchu', 'Vallée Sacrée'] },

  // Océanie, Afrique, Moyen-Orient
  { city: 'Sydney', country: 'Australie', region: 'Océanie', lat: -33.8688, lng: 151.2093, currency: 'AUD', emoji: '🦘', popularHighlights: ['Opéra de Sydney', 'Bondi Beach'] },
  { city: 'Melbourne', country: 'Australie', region: 'Océanie', lat: -37.8136, lng: 144.9631, currency: 'AUD', emoji: '☕', popularHighlights: ['Great Ocean Road', 'Ruelles Street Art'] },
  { city: 'Auckland', country: 'Nouvelle-Zélande', region: 'Océanie', lat: -36.8485, lng: 174.7633, currency: 'NZD', emoji: '🥝', popularHighlights: ['Sky Tower', 'Waiheke'] },
  { city: 'Dubaï', country: 'Émirats Arabes Unis', region: 'Moyen-Orient', lat: 25.2048, lng: 55.2708, currency: 'AED', emoji: '🏙️', popularHighlights: ['Burj Khalifa', 'Désert safari'] },
  { city: 'Le Caire', country: 'Égypte', region: 'Afrique', lat: 30.0444, lng: 31.2357, currency: 'EGP', emoji: '🐫', popularHighlights: ['Pyramides de Gizeh', 'Sphinx'] },
  { city: 'Marrakech', country: 'Maroc', region: 'Afrique', lat: 31.6295, lng: -7.9811, currency: 'MAD', emoji: '🕌', popularHighlights: ['Jemaa el-Fna', 'Jardin Majorelle'] },
  { city: 'Le Cap (Cape Town)', country: 'Afrique du Sud', region: 'Afrique', lat: -33.9249, lng: 18.4241, currency: 'ZAR', emoji: '🐧', popularHighlights: ['Table Mountain', 'Cap de Bonne-Espérance'] }
];

// Rich, curated high-definition destinations covers
export const DESTINATION_PHOTOS: Record<string, string> = {
  italie: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=80',
  florence: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1400&q=80',
  venise: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1400&q=80',
  toscane: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',

  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
  nice: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80',

  japon: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80',
  osaka: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1400&q=80',

  chine: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=80',
  pekin: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=80',
  beijing: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=80',
  shanghai: 'https://images.unsplash.com/photo-1538428494232-9d0d8a3ab403?auto=format&fit=crop&w=1400&q=80',
  guilin: 'https://images.unsplash.com/photo-1537531390312-d53f472eb962?auto=format&fit=crop&w=1400&q=80',

  espagne: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=80',
  barcelone: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=80',
  madrid: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1400&q=80',
  seville: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1400&q=80',

  grece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80',
  santorin: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80',
  athenes: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=1400&q=80',

  etatsunis: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1400&q=80',
  usa: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1400&q=80',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1400&q=80',
  californie: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80',
  sanfrancisco: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80',
  losangeles: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1400&q=80',
  miami: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1400&q=80',

  canada: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1400&q=80',
  montreal: 'https://images.unsplash.com/photo-1519178151972-2436d9d1c166?auto=format&fit=crop&w=1400&q=80',
  vancouver: 'https://images.unsplash.com/photo-1560814304-4f05b62af116?auto=format&fit=crop&w=1400&q=80',

  royaumeuni: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
  londres: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
  angleterre: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
  ecosse: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=80',
  irlande: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=1400&q=80',

  portugal: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1400&q=80',
  lisbonne: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1400&q=80',
  porto: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=80',

  thailande: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
  phuket: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80',

  indonesie: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',

  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
  hanoi: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',

  islande: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1400&q=80',
  suisse: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=80',
  norvege: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&w=1400&q=80',
  croatie: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80',
  dubrovnik: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80',

  bresil: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80',
  rio: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80',

  mexique: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1400&q=80',
  cancun: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1400&q=80',

  perou: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1400&q=80',
  maroc: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1400&q=80',
  marrakech: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1400&q=80',
  egypte: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1400&q=80',

  australie: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=80',

  allemagne: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1400&q=80',
  autriche: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1400&q=80',
  paysbas: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1400&q=80',
  turquie: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1400&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
  inde: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80',
};

export const DEFAULT_TRAVEL_PHOTO = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80';

export function getAutoCoverForDestination(destinationOrCountry: string): string {
  if (!destinationOrCountry) return DEFAULT_TRAVEL_PHOTO;
  const clean = destinationOrCountry
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  for (const [key, url] of Object.entries(DESTINATION_PHOTOS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return url;
    }
  }

  // Check city match
  const cityMatch = WORLD_CITIES.find(
    (c) =>
      clean.includes(c.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')) ||
      clean.includes(c.country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''))
  );
  if (cityMatch) {
    const countryKey = cityMatch.country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    if (DESTINATION_PHOTOS[countryKey]) return DESTINATION_PHOTOS[countryKey];
  }

  return DEFAULT_TRAVEL_PHOTO;
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
  const norm = destinationOrCountry
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Direct city / country match in WORLD_CITIES
  const match = WORLD_CITIES.find((c) => {
    const cCity = c.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cCountry = c.country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes(cCity) || norm.includes(cCountry) || cCity.includes(norm);
  });
  if (match) return match.emoji;

  // 2. High-precision rulebook for all continents
  if (norm.includes('japon') || norm.includes('japan') || norm.includes('tokyo') || norm.includes('kyoto') || norm.includes('osaka')) return '⛩️';
  if (norm.includes('chine') || norm.includes('china') || norm.includes('pekin') || norm.includes('shanghai') || norm.includes('beijing')) return '🏮';
  if (norm.includes('itali') || norm.includes('italy') || norm.includes('rome') || norm.includes('florence') || norm.includes('venis') || norm.includes('milan')) return '🏛️';
  if (norm.includes('franc') || norm.includes('paris') || norm.includes('marseille') || norm.includes('lyon') || norm.includes('nice')) return '🗼';
  if (norm.includes('espagn') || norm.includes('spain') || norm.includes('barcelon') || norm.includes('madrid') || norm.includes('sevill')) return '🥘';
  if (norm.includes('grec') || norm.includes('greece') || norm.includes('athen') || norm.includes('santorin') || norm.includes('mykonos')) return '🏛️';
  if (norm.includes('usa') || norm.includes('etats-unis') || norm.includes('new york') || norm.includes('californi') || norm.includes('miami')) return '🗽';
  if (norm.includes('anglet') || norm.includes('uk') || norm.includes('londres') || norm.includes('london') || norm.includes('britain')) return '🎡';
  if (norm.includes('ecosse') || norm.includes('scotland') || norm.includes('edinburgh')) return '🏰';
  if (norm.includes('irland') || norm.includes('dublin')) return '🍀';
  if (norm.includes('australi') || norm.includes('sydney') || norm.includes('melbourne')) return '🦘';
  if (norm.includes('zeland') || norm.includes('auckland')) return '🥝';
  if (norm.includes('thailand') || norm.includes('bangkok') || norm.includes('phuket')) return '🛕';
  if (norm.includes('bali') || norm.includes('indonesi') || norm.includes('jakarta')) return '🌺';
  if (norm.includes('vietnam') || norm.includes('hanoi') || norm.includes('saigon')) return '🍜';
  if (norm.includes('islande') || norm.includes('iceland') || norm.includes('reykjavik')) return '🧊';
  if (norm.includes('suiss') || norm.includes('switzerland') || norm.includes('genev') || norm.includes('zurich')) return '🏔️';
  if (norm.includes('norveg') || norm.includes('norway') || norm.includes('oslo') || norm.includes('fjord')) return '🏔️';
  if (norm.includes('sued') || norm.includes('sweden') || norm.includes('stockholm')) return '⛵';
  if (norm.includes('danemark') || norm.includes('denmark') || norm.includes('copenhagu')) return '🧜‍♀️';
  if (norm.includes('allemag') || norm.includes('germany') || norm.includes('berlin') || norm.includes('munich')) return '🍺';
  if (norm.includes('belg') || norm.includes('bruxell')) return '🍫';
  if (norm.includes('pays-bas') || norm.includes('holland') || norm.includes('amsterdam')) return '🚲';
  if (norm.includes('portugal') || norm.includes('lisbon') || norm.includes('porto')) return '🚋';
  if (norm.includes('autrich') || norm.includes('austria') || norm.includes('vienn')) return '🎻';
  if (norm.includes('tcheq') || norm.includes('pragu')) return '🏰';
  if (norm.includes('hongri') || norm.includes('budapest')) return '♨️';
  if (norm.includes('croati') || norm.includes('dubrovnik') || norm.includes('split')) return '🛡️';
  if (norm.includes('turqui') || norm.includes('turkey') || norm.includes('istanbul')) return '🕌';
  if (norm.includes('maroc') || norm.includes('morocco') || norm.includes('marrakech')) return '🕌';
  if (norm.includes('egypt') || norm.includes('caire')) return '🐫';
  if (norm.includes('dubai') || norm.includes('emirats')) return '🏙️';
  if (norm.includes('bresil') || norm.includes('brazil') || norm.includes('rio')) return '⛰️';
  if (norm.includes('argentin') || norm.includes('buenos aires')) return '💃';
  if (norm.includes('mexiq') || norm.includes('mexico') || norm.includes('cancun')) return '🌮';
  if (norm.includes('perou') || norm.includes('peru') || norm.includes('cusco') || norm.includes('machu')) return '🦙';
  if (norm.includes('canad') || norm.includes('montreal') || norm.includes('quebec')) return '🍁';
  if (norm.includes('inde') || norm.includes('india') || norm.includes('delhi')) return '🕌';
  if (norm.includes('coree') || norm.includes('korea') || norm.includes('seoul')) return '🥢';
  if (norm.includes('plage') || norm.includes('beach') || norm.includes('ile') || norm.includes('island')) return '🏝️';
  if (norm.includes('montagne') || norm.includes('mountain') || norm.includes('alpes')) return '🏔️';
  if (norm.includes('desert') || norm.includes('safari')) return '🏜️';

  return '📍';
}

export function getAutoCoordsForDestination(destinationOrCountry: string): { lat?: number; lng?: number } {
  if (!destinationOrCountry) return {};
  const norm = destinationOrCountry
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const match = WORLD_CITIES.find((c) => {
    const cCity = c.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cCountry = c.country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes(cCity) || norm.includes(cCountry) || cCity.includes(norm);
  });
  if (match) return { lat: match.lat, lng: match.lng };
  return {};
}

// Color palette for trip destinations timeline badges
export const STEP_COLORS = [
  { bg: '#c6a56a', text: '#0b0f14', border: '#e8c992', label: 'Or' },
  { bg: '#3b82f6', text: '#ffffff', border: '#60a5fa', label: 'Azur' },
  { bg: '#10b981', text: '#ffffff', border: '#34d399', label: 'Émeraude' },
  { bg: '#f59e0b', text: '#0b0f14', border: '#fbbf24', label: 'Ambre' },
  { bg: '#ec4899', text: '#ffffff', border: '#f472b6', label: 'Rose' },
  { bg: '#8b5cf6', text: '#ffffff', border: '#a78bfa', label: 'Violet' },
  { bg: '#14b8a6', text: '#ffffff', border: '#2dd4bf', label: 'Turquoise' },
  { bg: '#f97316', text: '#ffffff', border: '#fb923c', label: 'Corail' },
];

export function getStepColor(index: number) {
  return STEP_COLORS[index % STEP_COLORS.length];
}
