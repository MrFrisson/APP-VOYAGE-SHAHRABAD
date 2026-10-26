# Sources externes — carte sombre et suivi des vols

Vérifié le 17 octobre 2026. La [FAQ officielle CARTO](https://docs.carto.com/faqs/carto-basemaps) indique que les tuiles raster requièrent une clé depuis le 25 septembre 2026. Elles ne doivent pas être utilisées anonymement ni leur avertissement masqué. En revanche, les styles vectoriels fonctionnent actuellement sans clé ; CARTO recommande néanmoins d’en demander une pour anticiper une éventuelle évolution. Le style vectoriel sombre publié est `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` et ses crédits CARTO/OpenStreetMap doivent être visibles. [Présentation et styles officiels](https://carto.com/basemaps/).

Le projet utilise une carte Leaflet avec marqueurs et route. L’intégration vectorielle prévue conserve ces éléments via le calque MapLibre/Leaflet, et évite le relief des fonds topographiques. Ce changement n’exige pas d’envoyer les documents de voyage à CARTO.

Un service Flightradar24 est proposé dans la configuration de l’utilisateur mais n’est pas activé. Aucun accès de vol utilisable n’a été trouvé dans l’environnement. Les fonctions du suivi doivent afficher leur état de connexion réel, sans inventer un statut, et les documents personnels doivent rester locaux.

## Suivi fournisseur

La [documentation officielle Flightradar24](https://fr24api.flightradar24.com/docs/endpoints) et sa [spécification OpenAPI](https://fr24api.flightradar24.com/documentation/Flightradar24-API.yaml) confirment `GET /api/flight-summary/light` et `GET /api/live/flight-positions/full`, avec `Authorization: Bearer …` et `Accept-Version: v1`. Le filtre `flights` accepte les numéros commerciaux ; les limites de période se basent sur `first_seen` en UTC. Les schémas fournissent `datetime_takeoff`, `datetime_landed`, `last_seen`, `flight_ended`, ainsi que positions `lat`, `lon`, `timestamp` et `eta`. Aucun champ d’annulation, retard ou porte n’est disponible dans ces endpoints ; l’intégration ne les invente pas. [Création et accès au token](https://fr24api.flightradar24.com/docs/getting-started).

L’[adaptateur officiel Leaflet/MapLibre](https://github.com/maplibre/maplibre-gl-leaflet) est chargé en version0.1.4 avec MapLibre6.14.0. Sa distribution ESM et son worker CDN suivent les [instructions officielles MapLibre](https://www.maplibre.org/maplibre-gl-js/docs/). Dans la Preview, le fond Dark Matter a été chargé et les contrôles ont confirmé `loaded=true`, `isStyleLoaded=true` et un calendrier réellement ouvert de327px, sans modifier les voyages sauvegardés.
