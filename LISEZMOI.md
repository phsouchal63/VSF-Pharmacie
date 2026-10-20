# VSF PHARM (sacs pharmacie VSF) — Phase 1 (modèle + API)

## Mise en place (≈ 5 min)
1. Drive → importer `Sacs_Pharmacie_modele.xlsx` → ouvrir avec Google Sheets → **Fichier > Enregistrer en tant que feuille Google Sheets**.
2. Dans la feuille : **Extensions > Apps Script**.
3. Remplacer le contenu de `Code.gs` par le fichier fourni. Afficher `appsscript.json` (Paramètres du projet > « Afficher le fichier manifeste ») et le remplacer aussi.
4. **Déployer > Nouveau déploiement > Application Web** : exécuter en tant que *moi*, accès *tout le monde*. Autoriser les droits demandés.
5. Copier l'URL de l'application web (sert à la PWA en phase 2).

## À renseigner dans la feuille
- `Educateurs` : une ligne par éducateur (id `EDU-00x`, nom, rôle `educateur`/`intendant`, actif). Laisser `sel` et `code_hash` vides.
- `Equipes` : passer `actif` à VRAI pour les sacs utilisés, renseigner `id_educateur`.
- `Articles` : saisir les EAN.
- Code provisoire : `000000`, changement obligatoire à la 1re connexion. Oubli de code : menu **Sacs pharmacie > Réinitialiser le code** (ligne sélectionnée de `Educateurs`).
- Ne pas modifier à la main : `Pointages`, `Besoins`, `Listes`.

## Règles de calcul
- Manque = max(0, cible − quantité constatée).
- Besoin ouvert (liste « À acheter ») = manque − besoins déjà « Acheté » non réassortis → pas de double comptage.
- Liste « Acheté » : les nouveaux besoins alimentent une nouvelle liste « À acheter ».
- Solder une liste (statut « Acheté » requis) : toutes ses lignes passent « réassorti ».
- Hypothèses sur les quantités du tableau : onglet `Légende`.

## Sécurité
Codes à 6 chiffres hachés (SHA-256 + sel), 5 essais max puis blocage 15 min, session 6 h. Niveau adapté à un usage club, pas à des données sensibles.

---

# Phase 2 — PWA éducateur

## Fichiers (dossier `pwa/`)
`index.html`, `manifest.webmanifest`, `sw.js` + dossier `assets/` à **copier depuis la charte** (`VSF-Charte-V3\assets`) : `vsf-logo.png`, `vsf-logo-white.svg`, `icon-512.png`.

## Hébergement (HTTPS obligatoire pour l'installation et le hors-ligne)
- Ex. GitHub Pages : déposer le contenu de `pwa/` (avec `assets/`) dans un dépôt, activer Pages. L'URL de l'API est déjà intégrée dans `index.html` (`DEFAULT_API`).
- Sur le téléphone : ouvrir l'URL → menu du navigateur → « Ajouter à l'écran d'accueil ».

## Usage éducateur
1. Choisir son nom, code provisoire `000000` → choisir un code personnel.
2. Équipe unique : ouverture directe du sac. Pour chaque ligne : **✓ Complet**, ou **− / +** pour la quantité constatée.
3. **Valider le pointage** (toutes les lignes doivent être vérifiées) → confirmation → **Envoyer**.
4. Sans réseau : le pointage reste sur le téléphone et part automatiquement au retour du réseau (rien n'est dupliqué).

## À savoir
- Brouillon conservé si l'appli est fermée en cours de pointage.
- Le sac doit avoir été ouvert une fois avec du réseau pour être disponible hors ligne.
- Après modification de `Code.gs`, redéployer (« Gérer les déploiements » > modifier > nouvelle version) ; l'URL ne change pas.

---

# Phase 3 — Vue intendant

Réservée au rôle `intendant` (onglet `Educateurs`). Onglets **Pointage** / **Besoins** sous l'en-tête.

1. **Besoins** : une carte par liste (À acheter, Acheté, Soldé) avec lignes et unités.
2. **Par article** (achat) : total à acheter par article, EAN, détail par équipe.
3. **Marquer comme acheté** : la liste passe « Acheté » ; les nouveaux manquants des sacs ouvrent une nouvelle liste « À acheter » (sans double comptage).
4. **Par équipe** (réassort) : cocher chaque ligne remise dans le sac.
5. **Solder la liste** : clôture la liste (avertissement si des lignes ne sont pas cochées).
6. Listes consultables hors ligne (dernière version reçue) ; les actions demandent du réseau.

Mise à jour : remplacer `index.html` et `sw.js` dans le dépôt. Si l'ancienne version s'affiche encore, recharger la page deux fois.

---

# Phase 4 — Bon de commande et codes EAN

## À faire (une seule fois)
1. Apps Script : remplacer `Code.gs` par le fichier fourni et **enregistrer**. Pas de nouveau déploiement nécessaire (l'API ne change pas).
2. Rouvrir le Sheet : menu **Sacs pharmacie > Contrôler les codes EAN**, puis autoriser les droits demandés. La 1re fois, Google demande une autorisation pour le contrôle automatique à la saisie.
3. GitHub : remplacer `index.html` et `sw.js`. Recharger la page deux fois.

## Codes EAN (onglet `Articles`, colonne `ean`)
- Contrôle automatique à chaque saisie : espaces et tirets retirés, zéros de tête restaurés, colonne mise au format texte.
- **Rouge** : EAN invalide (13 ou 8 chiffres, clé de contrôle fausse). **Orange** : EAN en double. Survoler la cellule : note explicative.
- Un EAN invalide n'est jamais imprimé en code-barres.

## Bon de commande (intendant)
- **Besoins > liste > Bon de commande** : un article par ligne, code-barres EAN-13 / EAN-8, quantité totale à acheter.
- **Imprimer / PDF** : A4. Choisir « Enregistrer au format PDF » comme imprimante pour obtenir un fichier.
- Les articles sans EAN valide gardent leur libellé, signalés « EAN à renseigner » ou « EAN invalide ».
- Consultable hors ligne (dernière version de la liste reçue).

## Bon de commande — mise en forme charte VSF v3
- A4 : logo, bloc émetteur (club + nom de l'intendant connecté, saisi dans `Educateurs`), tableau n° / désignation / code-barres / quantité, total, cadres de signature (émetteur, pharmacie avec cachet).
- Marges de page à 0 : le navigateur n'imprime plus l'URL ni la date. Si elle apparaît quand même : décocher « En-têtes et pieds de page » dans l'aperçu d'impression.


---

# Phase 5 — Trousses types (intendant)

## Mise à jour
1. Apps Script : remplacer `Code.gs`, enregistrer, puis **Déployer > Gérer les déploiements > modifier (crayon) > Version : Nouvelle version > Déployer**. L'URL ne change pas. (Nouvelles actions : `getTrousses`, `enregistrerTrousse`, `affecterCategorie`, `supprimerTrousse`.)
2. GitHub : remplacer `index.html` et `sw.js`, recharger la page deux fois.

## Utilisation (onglet **Trousses**, rôle `intendant`)
- **Par catégorie** : liste déroulante par catégorie pour choisir sa trousse (enregistré tout de suite).
- **Trousses types** : une carte par trousse, avec les catégories qui l'utilisent.
- **Nouvelle trousse** : démarre comme une copie d'une trousse existante (c'est aussi la façon de dupliquer).
- **Éditeur** : glisser la poignée (☰) pour réordonner, ou flèches haut/bas ; − / + pour la quantité cible (1 à 99) ; corbeille pour retirer ; **Ajouter un article** (recherche) depuis la base `Articles` ; nom modifiable ; **Enregistrer** applique le tout d'un coup.
- Les changements valent pour les **prochains pointages**. Les besoins déjà ouverts ne sont pas recalculés avant le prochain pointage de l'équipe.
- **Supprimer** une trousse : refusé tant qu'une catégorie l'utilise.
- Les articles (libellé, rôle, groupe, EAN) se gèrent toujours dans le Sheet (`Articles`).

## Phase 6 — Identité VSF PHARM (v5.1.0)

- Application renommée **VSF PHARM** (titre, bandeau, pied de page, bon de commande, nom installé).
- Bandeau : trame de points en **croix de pharmacie** (coin haut-droit), logo agrandi.
- Icône d'installation : blason + croix de points rouge en coin.
- Déploiement : dans GitHub, remplacer `index.html`, `sw.js`, `manifest.webmanifest` et **ajouter dans `assets/`** : `icon-512.png` (remplace), `icon-192.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-64.png`. `Code.gs` : aucun changement, pas de redéploiement.
- Recharger la page 2 fois. Pour l'icône sur le téléphone : désinstaller puis réinstaller l'appli (le nom et l'icône sont lus à l'installation).
- Le menu du Sheet reste « Sacs pharmacie ».
