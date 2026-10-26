import { TravelAppData } from '../types/travel';
import { INITIAL_TRAVEL_DATA } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'voyageur_app_data_v2';
const LEGACY_STORAGE_KEY = 'voyageur_app_data_v1';

export function loadTravelData(): TravelAppData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips)) {
        return ensureDataIntegrity(parsed);
      }
    }

    // Check legacy v1 key
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      if (parsedV1 && parsedV1.trips) {
        const migrated = ensureDataIntegrity(parsedV1);
        saveTravelData(migrated);
        return migrated;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved travel data from localStorage:', err);
  }

  // Initialize with complete initial data
  saveTravelData(INITIAL_TRAVEL_DATA);
  return INITIAL_TRAVEL_DATA;
}

export function saveTravelData(data: TravelAppData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write travel data to localStorage:', err);
  }
}

export function exportDataAsJson(data: TravelAppData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `voyageur-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importDataFromJson(jsonString: string): TravelAppData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.trips)) {
    throw new Error('Le format du fichier JSON importé est invalide ou incompatible.');
  }
  const verified = ensureDataIntegrity(parsed);
  saveTravelData(verified);
  return verified;
}

export function resetToDemoData(): TravelAppData {
  saveTravelData(INITIAL_TRAVEL_DATA);
  return INITIAL_TRAVEL_DATA;
}

/**
 * Ensures backward compatibility, fallback arrays, and default active trip
 */
function ensureDataIntegrity(data: Partial<TravelAppData>): TravelAppData {
  const trips = Array.isArray(data.trips) ? data.trips : INITIAL_TRAVEL_DATA.trips;
  const activeTripId = data.activeTripId && trips.some((t) => t.id === data.activeTripId)
    ? data.activeTripId
    : (trips[0]?.id || '');

  return {
    trips,
    activeTripId,
    steps: Array.isArray(data.steps) ? data.steps : INITIAL_TRAVEL_DATA.steps,
    activities: Array.isArray(data.activities) ? data.activities : INITIAL_TRAVEL_DATA.activities,
    accommodations: Array.isArray(data.accommodations) ? data.accommodations : INITIAL_TRAVEL_DATA.accommodations,
    transports: Array.isArray(data.transports) ? data.transports : INITIAL_TRAVEL_DATA.transports,
    expenses: Array.isArray(data.expenses) ? data.expenses : INITIAL_TRAVEL_DATA.expenses,
    documents: Array.isArray(data.documents) ? data.documents : INITIAL_TRAVEL_DATA.documents,
    links: Array.isArray(data.links) ? data.links : INITIAL_TRAVEL_DATA.links,
    notes: Array.isArray(data.notes) ? data.notes : INITIAL_TRAVEL_DATA.notes,
    firebaseConfig: data.firebaseConfig,
    cloudSyncEnabled: !!data.cloudSyncEnabled,
    updatedAt: data.updatedAt,
  };
}
