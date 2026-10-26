# Shahrabad

Application statique de planification de voyages. Le point d’entrée est `index.html`. Cette version conserve l’organisation pays → villes et ajoute les dates cohérentes, la carte réparée, le portefeuille de billets locaux et les boutons préparatoires de partage entre amis.

## Créer et organiser un voyage

Choisis « Un seul pays » et renseigne le nom du pays, ou « Multi-pays » et renseigne le nom de ton voyage. Les dates se choisissent dans un calendrier sombre et doré. La devise d’affichage est conservée. Les champs sous-titre, présentation et URL de couverture ont été retirés du formulaire.

Pour un seul pays, ajoute directement les villes. Pour plusieurs pays, ajoute un pays, ouvre son sous-menu, puis ajoute ses villes. Une ville se crée avec son nom, son arrivée et son départ. Le nombre de nuits est calculé automatiquement. Les anciens champs invisibles ne sont pas effacés des anciennes données.

## Photos et emplacement automatiques

`src/destinations.js` interroge les guides mondiaux Wikivoyage, sans liste fixe de pays ou de villes ni clé API privée. Les photographies sont sélectionnées à partir de l’article correspondant au nom saisi ; les cartes et les drapeaux sont écartés. La version anglaise liée sert de repli lorsqu’une photo est absente de la version française. Les résultats sont mis en cache sur l’appareil. Les coordonnées sont utilisées seulement lorsqu’elles sont réellement fournies par le service.

Une connexion Internet est nécessaire pour une nouvelle recherche et pour charger une image non mise en cache par le navigateur. Si aucun article ou aucune photographie ne correspond, ou si le service est indisponible, un état explicite remplace la photo ; une image sans rapport n’est pas présentée comme celle de la destination. Un nom créatif de voyage ne garantit pas une correspondance géographique. Les noms simples, par exemple Japon, Chine, Afrique, Asie, Éthiopie ou Los Angeles, sont traités dynamiquement.

Chaque photo comporte un lien de crédit vers le guide original. Les licences et auteurs des photographies sont accessibles depuis ce guide et sa page d’image.

Sources vérifiées : [API et règles de réutilisation Wikivoyage](https://en.wikivoyage.org/wiki/Wikivoyage:How_to_re-use_Wikivoyage_guides), [bannières de voyage](https://en.wikivoyage.org/wiki/Template:Pagebanner). API publique : `https://fr.wikivoyage.org/w/api.php` et `https://en.wikivoyage.org/w/api.php`, avec `origin=*` et l’en-tête d’identification `Api-User-Agent`. Les requêtes utilisent `pageimages`, `coordinates`, `langlinks`, les redirections et une recherche de titre si nécessaire. Les photos viennent de Wikimedia Commons.

## Fichiers

`index.html` charge l’interface. `styles.css` contient les styles existants et les ajouts pays/villes. `src/app.js` contient les données, la navigation et les fonctionnalités existantes. `src/date-picker.js` et `styles/date-picker.css` fournissent les calendriers personnalisés. `src/destinations.js` isole le service de photos et de coordonnées. `manus-routes.json` déclare la route de la Preview WebDev. `app.config.ts` contient les métadonnées de projet.

## Sauvegarde et compatibilité

La clé `voyageur:data:v1` est volontairement conservée pour retrouver les données précédentes. Les voyages existants sont normalisés en mode un pays ou multi-pays et leurs villes sont rattachées à des pays sans effacer les activités, hébergements, transports, dépenses, documents ou liens. Les exports portent maintenant le nom `shahrabad-export-AAAA-MM-JJ.json` ; les exports antérieurs restent lisibles.

Les données et petites pièces jointes restent locales à chaque navigateur et appareil. Firebase n’est pas synchronisé et aucun stockage cloud ni partage multi-utilisateur n’est simulé. Fais un export JSON avant de vider les données du navigateur ou de changer d’appareil.

## Tester et publier

Pour tester : `python3 -m http.server 3000 --bind 0.0.0.0`, puis ouvrir `http://localhost:3000`.

Pour GitHub Pages, déposer `index.html`, `styles.css`, les dossiers `src/` et `styles/` à la racine du dépôt puis activer Pages depuis la branche correspondante. Tous les chemins locaux sont relatifs ; aucun serveur applicatif n’est obligatoire. Internet reste nécessaire pour Leaflet et les tuiles de carte, les polices et les nouvelles recherches d’images.

## Corrections : dates, billets et préparation entre amis

Les trois points de chaque carte ouvrent maintenant un menu permettant de modifier, dupliquer ou supprimer le voyage. Les boutons sont alignés. Le convertisseur utilise les couleurs sombres du carnet et dispose d’une inversion des devises ; l’état des taux ne reste plus bloqué au chargement lorsqu’on ouvre l’onglet Budget.

Le départ et le retour doivent être renseignés. Le retour s’ouvre à partir du départ choisi et les dates précédentes sont désactivées. Les nouvelles villes sont ajoutées après la dernière ville de leur pays, dans les dates du voyage et avant le pays suivant. Les nuits ne se chevauchent pas ; le jour de départ peut être celui de l’arrivée suivante. Activités, transports, hébergements et dépenses associées sont bornés à la ville ; les dépenses générales au voyage. Modifier une période ou un ordre qui rendrait des éléments existants incohérents produit un message, sans supprimer ni déplacer silencieusement ces éléments. Les hébergements supplémentaires sont proposés après les réservations existantes. Les dates passées restent utilisables.

Le fond par défaut est le relief OpenMaps France, avec attribution visible et sélecteur de fond ; le mode Plan utilise l’URL officielle OSM. La disponibilité des fonds externes n’est pas garantie. Conditions et sources dans `docs/cartographie.md`.

Les activités ont des catégories prédéfinies à choix multiples. Leurs coordonnées GPS ne sont plus dans le formulaire. Cliquer sur le nom d’une activité, d’un hébergement ou d’un transport ouvre sa carte billet. On peut ajouter une image ou un PDF local (1 Mo maximum), afficher le document original ou ouvrir un lien de réservation. Les boutons fichier/photo utilisent les possibilités du navigateur ; une caméra directe dépend de l’appareil. Les pièces sont enregistrées avec les données locales, jamais envoyées à un service. La capacité du navigateur reste limitée : conserver aussi une copie indépendante et exporter les données avant de vider le stockage.

Le bouton Scanner un billet est uniquement préparatoire. Aucun OCR, aucune extraction/redessin de QR, aucun ajout Google Wallet n’est encore implémenté. Un QR visible sur la pièce originale n’est pas présenté comme un QR généré par l’application.

Les boutons Inviter des amis, Payé par, Répartir et Voir les soldes sont également préparatoires, avec des messages explicites. Aucun ami fictif, aucune invitation envoyée, aucune synchronisation multi-utilisateur et aucun calcul de dettes ne sont simulés. Les participants invités et les comptes partagés seront à connecter lors d’une prochaine version.

Modules supplémentaires : `src/scheduling.js` porte les règles de périodes ; `src/tickets.js` et `styles/tickets.css` portent le portefeuille local. Vérifier avec `node tests/flows.test.cjs` et `node tests/scheduling.test.cjs` ; aucune dépendance Node n’est nécessaire.

## Carte sombre, dates corrigées et carnet aérien

Le clic des calendriers est désormais dédupliqué entre la modale et le formulaire : le calendrier ne se referme plus immédiatement, et les boutons mois précédent/suivant avancent d’un seul mois. Les bornes de date restent inchangées.

Le fond par défaut est désormais **CARTO Dark Matter vectoriel**, simple et sombre, rendu dans Leaflet par MapLibre. Les marqueurs et la route sont conservés ; le fond clair Positron reste disponible. WebGL et une connexion aux ressources CDN sont nécessaires. Les crédits OSM/CARTO sont visibles. Le fournisseur autorise actuellement les styles vectoriels sans clé, mais recommande d’en obtenir une pour anticiper une évolution ; le projet ne contourne pas les restrictions des tuiles raster. Sources dans `docs/carte-sombre-et-vols.md`.

La vue d’ensemble contient **Vols & documents** : ajouter/modifier un vol par numéro, compagnie, départ, arrivée, date, heure locale et lien de billet ; joindre une petite image ou un PDF ; ajouter un visa ou des pièces complémentaires ; ouvrir/modifier les documents. Les anciens transports de type Avion sont également visibles et ne sont pas supprimés. Les nouveaux vols globaux sont dans `trip.flights`, les documents dans `trip.documents` avec `flightId` et `kind`. La duplication réattribue les identifiants et associations.

### Suivi de vol : accès externe nécessaire

Le bouton Suivre le vol appelle `/api/flight-status`. Sans service connecté, il affiche **Suivi non connecté**, jamais un faux statut. Le suivi connecté montre la source et l’heure d’observation et peut se rafraîchir toutes les 60 secondes tant que la page reste ouverte et visible. Aucun document ni référence de réservation n’est transmis.

Le proxy facultatif est dans `server/index.mjs` et `server/flight-provider.mjs`. Pour l’utiliser sur un hébergement Node : configurer **FR24_API_KEY côté serveur uniquement**, puis lancer `node server/index.mjs` ; il sert aussi les fichiers statiques sur `PORT` ou 3000. Ne jamais placer la clé dans le HTML, le JavaScript public, une URL, un export JSON ou un dépôt Git. L’accès API Flightradar24 est distinct d’un compte grand public. Il n’est pas configuré dans la Preview actuelle.

Cette intégration utilise les observations et événements réels Flightradar24 : décollage/atterrissage et position lorsqu’ils sont fournis. Les horaires sont ceux du fournisseur en UTC ; le filtre de jour correspond à sa première détection UTC. **Elle ne fournit pas les statuts de retard/annulation, les horaires futurs ou les portes d’embarquement.** Aucun vol trouvé ne signifie pas qu’il est annulé. Les horaires du billet et de la compagnie restent la référence.

GitHub Pages continue de faire fonctionner toutes les fonctions locales, mais ne peut pas héberger le proxy Node : le suivi intégré y reste déconnecté tant qu’un backend adapté n’est pas ajouté. Les données FR24 ne sont jamais enregistrées dans localStorage ni dans les exports ; le proxy garde uniquement un cache mémoire d’une minute, sans stockage durable.

Vérifications supplémentaires : `node tests/date-picker-events.test.cjs`, `node tests/flights.test.cjs`, `node tests/flight-provider.test.mjs`, puis les tests de migration et de dates déjà fournis.

### Accès simplifié du 18 octobre 2026

Le panneau aérien n’occupe plus la vue d’ensemble. Le bouton **Vols & documents**, en haut du voyage, ouvre sa vue dédiée ; le bouton Vue d’ensemble permet de retrouver la route et la carte. Le bouton Dupliquer a été retiré du bandeau intérieur, mais demeure dans le menu des voyages sur l’accueil. Billets, visas, documents et formulaires restent inchangés. Le suivi n’est lié qu’à la vue des vols lorsqu’elle est ouverte. Test ciblé : `node tests/trip-layout.test.cjs`.

Le bouton **Vols & documents** est réversible : clique une deuxième fois dessus pour ranger le panneau et revenir à la vue précédente (vue d’ensemble, budget ou autre), sans quitter le voyage.

### Navigation du 19 octobre 2026

**Vols & documents** est maintenant un onglet de la barre Vue d’ensemble / Itinéraire / Calendrier / Planning / Budget / Ressources. Le bouton du bandeau a été retiré. L’onglet fonctionne comme les autres : choisis Vue d’ensemble ou un autre onglet pour changer de vue. Les billets et documents restent conservés.
