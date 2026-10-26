# Fond cartographique de Shahrabad

Sources vérifiées le 17 octobre 2026 : [politique OpenMaps France](https://openmaps.fr/tile-usage-policy.html), [service OpenMaps France](https://openmaps.fr/), [politique des tuiles OSM](https://operations.osmfoundation.org/policies/tiles/).

Le fond par défaut est OpenTopoMap-R sur `https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png`. Le service OpenMaps autorise les projets gratuits non commerciaux de volume limité, sans clé API ni inscription préalable ; la limite publiée est 500 000 tuiles par mois. Il reste en disponibilité best-effort, sans garantie. L’attribution contient les liens OpenTopoMap-R, Donation et OpenStreetMap. Un autre fournisseur devra être configuré avant un déploiement commercial ou de grande ampleur.

Le mode Plan optionnel utilise l’URL officielle `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, sans sous-domaines retirables. Le navigateur fournit son User-Agent normal et son référent. La politique de référent est `strict-origin-when-cross-origin` dans la page et le calque Leaflet. Il n’y a ni proxy anonyme, ni téléchargement de zones, ni préchargement hors consultation, ni cache-busting. Les caches HTTP du navigateur sont respectés.

Leaflet conserve les marqueurs et la route ; les tuiles se chargent à l’arrêt de l’interaction. Le sélecteur permet de changer de fond et un état d’échec apparaît si le service ne répond pas. Les données du voyage sont indépendantes de la disponibilité des tuiles.

Les services Esri ont été examinés mais non retenus car leurs exigences de licence et d’identification par compte ne sont pas adaptées à cette version sans clé : [discussion d’usage ArcGIS](https://community.esri.com/t5/arcgis-online-questions/can-you-use-arcgis-online-world-street-map-mapserver-for-tiles/td-p/243328), [couches tuilées Esri](https://developers.arcgis.com/esri-leaflet/api-reference/esri-leaflet/tiled-map-layer/).
