# Shahrabad — Carnet de route & Planificateur de voyages mondial

Application web moderne, réactive et mobile-first de planification d'itinéraires et de gestion de voyages dans le monde entier, conçue avec React 19, TypeScript, Tailwind CSS, Leaflet et Firebase (Firestore & Authentication).

---

## Fonctionnalités

- **Planification mondiale illimitée** : création de voyages multi-destinations sans restriction géographique.
- **Photos automatiques** : détection de la destination et attribution instantanée d'une photo représentative.
- **Carte interactive Leaflet** : rendu nocturne haute fidélité (OpenStreetMap stylisé aux couleurs Shahrabad), sans clé d'API payante.
- **Gestion des étapes** : calcul automatique des coordonnées géographiques, des émojis thématiques, calendrier dynamique et calcul des nuitées.
- **Budget & conversion de devises multi-monnaies** : conversion dynamique instantanée (EUR, CNY, USD, JPY, GBP, etc.) répercutée partout.
- **Hébergements, Transports, Activités & Documents** : suivi exhaustif avec gestion des billets et codes QR.
- **Sauvegarde hybride** : persistance automatique dans le stockage local du navigateur + synchronisation Cloud Firebase Firestore avec connexion Google sécurisée.
- **Portabilité des données** : export et import complets au format JSON en un clic.

---

## Installation et démarrage local

1. **Cloner le projet ou télécharger le code** :
   ```bash
   git clone https://github.com/VOTRE_PSEUDO/shahrabad.git
   cd shahrabad
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

4. **Compiler pour la production** :
   ```bash
   npm run build
   ```

---

## Configuration Firebase

La configuration Firebase Web est stockée dans `firebase-applet-config.json` et les règles de sécurité dans `firestore.rules`.
Chaque utilisateur connecté via Google dispose de son propre espace de stockage privé et sécurisé (`/users/{userId}/data/app_state`).
