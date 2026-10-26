import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Step, Accommodation, Activity, Transport } from '../../types/travel';
import { buildGoogleMapsUrl } from '../../data/worldDestinations';
import { ExternalLink, Layers, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface LeafletMapProps {
  steps: Step[];
  accommodations: Accommodation[];
  activities: Activity[];
  transports: Transport[];
  tripTitle?: string;
}

type FilterCategory = 'all' | 'steps' | 'hotels' | 'activities' | 'transports';

export const LeafletMap: React.FC<LeafletMapProps> = ({
  steps,
  accommodations,
  activities,
  transports,
  tripTitle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<{
    title: string;
    category: string;
    address?: string;
    notes?: string;
    googleMapsUrl: string;
  } | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center
    const map = L.map(mapContainerRef.current, {
      center: [30.0, 110.0],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap high-speed tile layer (100% free, no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      className: 'shahrabad-map-tiles',
    }).addTo(map);

    // Subtle dark overlay to match the dark luxury gold & charcoal universe
    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update markers and route lines whenever data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: L.LatLngBounds = L.latLngBounds([]);
    let hasCoords = false;

    // 1. Plot Steps & connecting route polyline
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    const stepLatLngs: [number, number][] = [];

    sortedSteps.forEach((step, index) => {
      if (typeof step.lat === 'number' && typeof step.lng === 'number') {
        const latLng: [number, number] = [step.lat, step.lng];
        stepLatLngs.push(latLng);
        bounds.extend(latLng);
        hasCoords = true;

        if (activeFilter === 'all' || activeFilter === 'steps') {
          const emoji = step.emoji || '📍';
          const icon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #0b0f17; border: 2px solid #f59e0b; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 10px rgba(245, 158, 11, 0.4); cursor: pointer; transition: transform 0.2s ease;">
                <span style="font-size: 20px;">${emoji}</span>
                <span style="position: absolute; -top: 4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; background: #dc2626; color: white; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 1.5px solid #0b0f17;">${index + 1}</span>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          const gMapUrl = step.googleMapsUrl || buildGoogleMapsUrl(step.destination, step.lat, step.lng);

          const marker = L.marker(latLng, { icon }).addTo(layerGroup);
          marker.bindPopup(`
            <div style="font-family: inherit;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; font-weight: 700;">Étape ${index + 1}</span>
                <span style="font-size: 11px; color: #94a3b8;">${step.nights} nuit${step.nights > 1 ? 's' : ''}</span>
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #f8fafc;">${step.destination}</h4>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #cbd5e1;">${step.country}${step.region ? ` · ${step.region}` : ''}</p>
              ${step.notes ? `<p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; font-style: italic; background: #0f172a; padding: 6px 8px; border-radius: 6px;">${step.notes}</p>` : ''}
              <a href="${gMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #fbbf24; text-decoration: none; padding: 6px 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px;">
                <span>Ouvrir dans Google Maps</span> ↗
              </a>
            </div>
          `);

          marker.on('click', () => {
            setSelectedPlaceInfo({
              title: step.destination,
              category: `Étape ${index + 1} · ${step.country}`,
              notes: step.notes || step.transportToNext,
              googleMapsUrl: gMapUrl,
            });
          });
        }
      }
    });

    // Draw connecting journey route line
    if (stepLatLngs.length > 1 && (activeFilter === 'all' || activeFilter === 'steps')) {
      L.polyline(stepLatLngs, {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);
    }

    // 2. Plot Accommodations
    if (activeFilter === 'all' || activeFilter === 'hotels') {
      accommodations.forEach((hotel) => {
        if (typeof hotel.lat === 'number' && typeof hotel.lng === 'number') {
          const latLng: [number, number] = [hotel.lat, hotel.lng];
          bounds.extend(latLng);
          hasCoords = true;

          const icon = L.divIcon({
            className: 'custom-hotel-marker',
            html: `
              <div style="width: 36px; height: 36px; background: #312e81; border: 2px solid #818cf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 16px;">
                🏨
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const gMapUrl = hotel.googleMapsUrl || buildGoogleMapsUrl(`${hotel.name} ${hotel.city}`, hotel.lat, hotel.lng);

          const marker = L.marker(latLng, { icon }).addTo(layerGroup);
          marker.bindPopup(`
            <div style="font-family: inherit;">
              <span style="font-size: 11px; text-transform: uppercase; color: #a5b4fc; font-weight: 700;">Hébergement</span>
              <h4 style="margin: 2px 0 4px 0; font-size: 15px; font-weight: 700; color: #f8fafc;">${hotel.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">${hotel.address || hotel.city}</p>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
                ${hotel.nights} nuits · ${hotel.priceTotal} ${hotel.currency}
              </div>
              <a href="${gMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #a5b4fc; text-decoration: none; padding: 5px 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 6px;">
                <span>Voir sur Google Maps</span> ↗
              </a>
            </div>
          `);

          marker.on('click', () => {
            setSelectedPlaceInfo({
              title: hotel.name,
              category: `Hôtel · ${hotel.city}`,
              address: hotel.address,
              notes: hotel.notes,
              googleMapsUrl: gMapUrl,
            });
          });
        }
      });
    }

    // 3. Plot Activities
    if (activeFilter === 'all' || activeFilter === 'activities') {
      activities.forEach((act) => {
        if (typeof act.lat === 'number' && typeof act.lng === 'number') {
          const latLng: [number, number] = [act.lat, act.lng];
          bounds.extend(latLng);
          hasCoords = true;

          const icon = L.divIcon({
            className: 'custom-activity-marker',
            html: `
              <div style="width: 32px; height: 32px; background: #064e3b; border: 2px solid #34d399; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 15px;">
                🎯
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const gMapUrl = act.googleMapsUrl || buildGoogleMapsUrl(act.name, act.lat, act.lng);

          const marker = L.marker(latLng, { icon }).addTo(layerGroup);
          marker.bindPopup(`
            <div style="font-family: inherit;">
              <span style="font-size: 11px; text-transform: uppercase; color: #6ee7b7; font-weight: 700;">Activité · ${act.category}</span>
              <h4 style="margin: 2px 0 4px 0; font-size: 15px; font-weight: 700; color: #f8fafc;">${act.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">${act.address || ''}</p>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
                Date : ${act.date} ${act.time ? `à ${act.time}` : ''}
              </div>
              <a href="${gMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #6ee7b7; text-decoration: none; padding: 5px 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px;">
                <span>Voir sur Google Maps</span> ↗
              </a>
            </div>
          `);

          marker.on('click', () => {
            setSelectedPlaceInfo({
              title: act.name,
              category: `Activité · ${act.category}`,
              address: act.address,
              notes: act.description,
              googleMapsUrl: gMapUrl,
            });
          });
        }
      });
    }

    // 4. Plot Transports (Departures and Arrivals)
    if (activeFilter === 'all' || activeFilter === 'transports') {
      transports.forEach((tr) => {
        if (typeof tr.arrLat === 'number' && typeof tr.arrLng === 'number') {
          const latLng: [number, number] = [tr.arrLat, tr.arrLng];
          bounds.extend(latLng);
          hasCoords = true;

          const symbol = tr.type === 'flight' ? '✈️' : tr.type === 'train' ? '🚄' : '🚌';
          const icon = L.divIcon({
            className: 'custom-transport-marker',
            html: `
              <div style="width: 32px; height: 32px; background: #7f1d1d; border: 2px solid #f87171; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 15px;">
                ${symbol}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const gMapUrl = tr.googleMapsUrl || buildGoogleMapsUrl(tr.arrivalPlace, tr.arrLat, tr.arrLng);

          const marker = L.marker(latLng, { icon }).addTo(layerGroup);
          marker.bindPopup(`
            <div style="font-family: inherit;">
              <span style="font-size: 11px; text-transform: uppercase; color: #fca5a5; font-weight: 700;">Transport · ${tr.type}</span>
              <h4 style="margin: 2px 0 4px 0; font-size: 15px; font-weight: 700; color: #f8fafc;">${tr.arrivalPlace}</h4>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">Départ : ${tr.departurePlace}</p>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
                ${tr.carrier || ''} ${tr.transportNumber ? `(${tr.transportNumber})` : ''}
              </div>
              <a href="${gMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #fca5a5; text-decoration: none; padding: 5px 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
                <span>Voir sur Google Maps</span> ↗
              </a>
            </div>
          `);
        }
      });
    }

    // Auto-fit map to show all coordinates
    if (hasCoords && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [steps, accommodations, activities, transports, activeFilter]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetBounds = () => {
    if (!mapInstanceRef.current) return;
    const bounds: L.LatLngBounds = L.latLngBounds([]);
    let hasCoords = false;

    steps.forEach((s) => {
      if (typeof s.lat === 'number' && typeof s.lng === 'number') {
        bounds.extend([s.lat, s.lng]);
        hasCoords = true;
      }
    });

    if (hasCoords && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0f14] rounded-2xl border border-[rgba(198,165,106,0.25)] overflow-hidden shadow-2xl relative">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#111820]/95 backdrop-blur-md border-b border-[rgba(198,165,106,0.2)] z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c6a56a]" />
          <span className="text-xs font-semibold text-[#edf0eb] font-serif">
            {tripTitle ? `Carte : ${tripTitle}` : 'Carte Interactive Mondiale'}
          </span>
        </div>

        {/* Category Filters (Clean Segmented Tabs) */}
        <div className="flex items-center gap-1 p-1 bg-[#0b0f14] rounded-xl border border-[rgba(198,165,106,0.2)] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#c6a56a]/20 text-[#eadcc0] border border-[#c6a56a]/50 shadow-sm'
                : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            Tout afficher
          </button>
          <button
            onClick={() => setActiveFilter('steps')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'steps'
                ? 'bg-[#c6a56a]/20 text-[#eadcc0] border border-[#c6a56a]/50 shadow-sm'
                : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            ✦ Étapes ({steps.length})
          </button>
          <button
            onClick={() => setActiveFilter('hotels')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'hotels'
                ? 'bg-[rgba(121,181,155,0.2)] text-[#79b59b] border border-[rgba(121,181,155,0.4)] shadow-sm'
                : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            🏨 Hôtels ({accommodations.length})
          </button>
          <button
            onClick={() => setActiveFilter('activities')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'activities'
                ? 'bg-[rgba(198,165,106,0.2)] text-[#eadcc0] border border-[#c6a56a]/40 shadow-sm'
                : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            🎯 Activités ({activities.length})
          </button>
          <button
            onClick={() => setActiveFilter('transports')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'transports'
                ? 'bg-[rgba(184,79,75,0.2)] text-[#efaaa5] border border-[rgba(184,79,75,0.4)] shadow-sm'
                : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            ✈️ Transports ({transports.length})
          </button>
        </div>
      </div>

      {/* Leaflet Map DOM Canvas */}
      <div className="relative flex-1 min-h-[480px] w-full">
        <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-10" />

        {/* Map Floating Controls */}
        <div className="absolute right-4 bottom-5 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomIn}
            title="Zoom avant"
            className="w-10 h-10 rounded-xl bg-[#111820]/90 hover:bg-[#17212b] text-[#edf0eb] border border-[rgba(198,165,106,0.3)] shadow-lg flex items-center justify-center transition-transform active:scale-95"
          >
            <ZoomIn className="w-5 h-5 text-[#c6a56a]" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom arrière"
            className="w-10 h-10 rounded-xl bg-[#111820]/90 hover:bg-[#17212b] text-[#edf0eb] border border-[rgba(198,165,106,0.3)] shadow-lg flex items-center justify-center transition-transform active:scale-95"
          >
            <ZoomOut className="w-5 h-5 text-[#c6a56a]" />
          </button>
          <button
            onClick={handleResetBounds}
            title="Recentrer le voyage"
            className="w-10 h-10 rounded-xl bg-[#c6a56a] hover:bg-[#eadcc0] text-[#0b0f14] font-bold shadow-lg shadow-black/50 flex items-center justify-center transition-transform active:scale-95"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Place Overlay Card (if user clicked a marker) */}
        {selectedPlaceInfo && (
          <div className="absolute left-4 bottom-5 max-w-sm w-[calc(100%-2rem)] bg-[#111820]/95 backdrop-blur-md border border-[rgba(198,165,106,0.4)] rounded-2xl p-4 shadow-2xl z-20 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#c6a56a] uppercase tracking-wider">
                  {selectedPlaceInfo.category}
                </span>
                <h4 className="text-base font-serif font-bold text-[#edf0eb] mt-0.5">{selectedPlaceInfo.title}</h4>
              </div>
              <button
                onClick={() => setSelectedPlaceInfo(null)}
                className="text-[#98a2a8] hover:text-[#edf0eb] text-sm p-1"
              >
                ✕
              </button>
            </div>
            {selectedPlaceInfo.address && (
              <p className="text-xs text-[#98a2a8] mt-1.5">{selectedPlaceInfo.address}</p>
            )}
            {selectedPlaceInfo.notes && (
              <p className="text-xs text-[#edf0eb] mt-2 italic bg-[#0b0f14]/80 p-2.5 rounded-lg border border-[rgba(198,165,106,0.2)]">
                {selectedPlaceInfo.notes}
              </p>
            )}
            <div className="mt-3 flex items-center justify-end">
              <a
                href={selectedPlaceInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[rgba(198,165,106,0.15)] hover:bg-[rgba(198,165,106,0.25)] text-[#eadcc0] border border-[rgba(198,165,106,0.35)] transition-colors"
              >
                <span>Ouvrir dans Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c6a56a]" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Info */}
      <div className="px-4 py-2.5 bg-[#0b0f14] border-t border-[rgba(198,165,106,0.15)] flex items-center justify-between text-[11px] text-[#98a2a8]">
        <span>Leaflet Engine · OpenStreetMap cartographie mondiale sans quota</span>
        <span className="text-[#c6a56a] font-mono">✦ Shahrabad Nocturne</span>
      </div>
    </div>
  );
};
