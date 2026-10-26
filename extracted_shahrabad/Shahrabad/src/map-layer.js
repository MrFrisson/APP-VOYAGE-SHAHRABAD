/* Calque vectoriel CARTO Dark Matter, sans modifier les données du carnet. */
import { maplibreGL } from 'https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.4/dist/leaflet-maplibre-gl.mjs';

window.ShahrabadVectorLayer = options => maplibreGL(options);
window.dispatchEvent(new Event('shahrabad:map-ready'));
