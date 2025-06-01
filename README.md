# 📁 Squelette de projet : Flask + React + PostgreSQL

Ce projet constitue un **squelette de départ** pour construire une application web full-stack à base de :

* **Back-end** : Flask (Python)
* **Front-end** : React (Vite)
* **Base de données** : PostgreSQL

Le tout est prêt à être exécuté localement via **Docker** et **Docker Compose**.

---

## ✅ Objectif de ce squelette

Ce projet est destiné à servir de base pour votre propre développement.

**Ce que vous devez faire :**

1. **Cloner** ce dépôt
2. **Lancer l'application localement** (voir ci-dessous)
3. **Construire votre projet** à partir de cette structure

---

## ⚡ Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

### Pour Windows / MacOS / Linux :

* [Docker Desktop](https://www.docker.com/products/docker-desktop) (inclut Docker + Docker Compose)
* Git (pour cloner le projet)
* **Make** (outil pour exécuter des commandes automatisées)

  * Windows : installez via [Chocolatey](https://chocolatey.org/) : `choco install make`
  * MacOS : inclus avec Xcode : `xcode-select --install`
  * Linux : `sudo apt install make` (Debian/Ubuntu) ou `sudo dnf install make` (Fedora)

Vous pouvez vérifier leur installation avec :

```bash
docker --version
docker-compose --version
git --version
make --version
```

---

## 🔄 Installation et exécution locale

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd <nom-du-dossier>
```

### 2. Lancer l'application (backend, frontend et BDD)

```bash
make docker-build
```

ou directement :

```bash
docker-compose up --build
```

### 3. Accéder à l'application

* Frontend : [http://localhost:3000](http://localhost:3000)
* Backend API : [http://localhost:5009](http://localhost:5009)
* Base de données PostgreSQL :

  * Hôte : `localhost`
  * Port : `5432`
  * Utilisateur : `myuser`
  * Mot de passe : `mot_de_passe`
  * Base : `esme_inge`

---

## 🧐 Structure du projet

```
full-app/
├── backend/         # Application Flask + DB migrations
├── frontend/        # Application React (Vite)
├── docker-compose.yml
├── Makefile         # Commandes utiles pour dev
└── README.md
```

---

## 🚀 Commandes utiles (via `make`)

```bash
make docker-build   # Build et démarre tous les services
make docker-up      # Démarre sans rebuild
make docker-down    # Stoppe et supprime les conteneurs
make db-init        # Init migrations (une seule fois)
make db-migrate     # Crée une nouvelle migration
make db-upgrade     # Applique les migrations
make db-reset       # Supprime + recrée la base
```

---

## 🛠️ Conseils pour développement

* Codez dans `backend/` et `frontend/`
* Toute modification est automatiquement prise en compte au redémarrage des conteneurs
* Si erreur base de données : vérifiez les migrations (`make db-upgrade`)

---

## 📊 Problèmes courants

| Problème                           | Solution                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Frontend affiche 404 sur une route | NGINX est configuré pour rediriger vers `index.html`. Assurez-vous que le build est bon.   |
| Erreur de connexion DB             | Vérifiez si la base est bien démarrée (`docker ps`) et que les migrations sont appliquées. |
| Port déjà utilisé                  | Modifiez les ports dans `docker-compose.yml`.                                              |

---

## 🚫 Ce que vous ne devez pas modifier

* Ne changez pas le `docker-compose.yml` sauf si vous comprenez bien les impacts.
* Ne modifiez pas le `Dockerfile` sans refaire les builds.

---

## 🗓️ Prochaines étapes

1. Définissez les routes de votre API Flask
2. Construisez votre UI React
3. Ajoutez vos tables et migrations si besoin
4. Gérez l'authentification si nécessaire

Bon développement ! 🚀

## 👤 Comptes de test

Utilisez ces comptes pour tester les différentes fonctionnalités de l'application :

| Rôle           | Email                 | Mot de passe |
| -------------- | --------------------- | ------------ |
| Utilisateur    | `Test123@gmail.com`   | `Test123`    |
| Administrateur | `admintest@gmail.com` | `Admin123`   |

---

## 🧰 Répartition des tâches (Projet à 6)

| Membre     | Rôle principal                  | Détails                                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| **Romain** | Lead Développeur Full-Stack     | Intégration backend-frontend, réservations, retards, file d'attente FIFO |
| Antoine    | Développeur Backend             | Modèles SQLAlchemy, logique emprunt/retour, routes JWT                   |
| Roman      | Intégration Frontend / UI/UX    | Pages catalogue, historique, composants React, appels API                |
| Célina     | Base de données & Docker        | Migrations, PostgreSQL, volumes, Makefile                                |
| Zoé        | Tests & Cas d’usage utilisateur | Scénarios de test, Postman, validation des routes et permissions         |
| Paul       | Rédaction du rapport & README   | Documentation, captures d'écran, schéma de BDD                           |

---

## 🗾️ Routes API principales

Voici une liste des routes API principales disponibles :

* `POST /api/auth/register` : Inscription d'un nouvel utilisateur.
* `POST /api/auth/login` : Connexion et obtention d'un token JWT.
* `GET /api/auth/me` : Obtenir les informations de l'utilisateur connecté (requiert JWT).
* `GET /api/books/` : Lister tous les livres avec leur disponibilité.
* `GET /api/books/<int:book_id>` : Obtenir les détails d'un livre spécifique.
* `POST /api/books/` : Créer un nouveau livre (Admin requis).
* `POST /api/books/<int:book_id>/copies` : Ajouter des exemplaires à un livre (Admin requis).
* `DELETE /api/books/<int:book_id>/copies/<int:copy_id>` : Supprimer un exemplaire d'un livre (Admin requis).
* `GET /api/borrowings/` : Lister les emprunts de l'utilisateur connecté.
* `POST /api/borrowings/<int:copy_id>` : Emprunter un exemplaire spécifique.
* `PUT /api/borrowings/<int:borrowing_id>/return` : Retourner un emprunt spécifique.
* `GET /api/borrowings/overdue` : Lister tous les emprunts en retard (Admin requis).
* `GET /api/borrowings/penalties` : Obtenir le total des pénalités et les livres en retard pour l'utilisateur connecté.
* `GET /api/reservations/` : Lister les réservations de l'utilisateur connecté.
* `POST /api/reservations/<int:book_id>` : Créer une réservation pour un livre.
* `DELETE /api/reservations/<int:reservation_id>` : Annuler une réservation spécifique.
* `GET /api/reservations/book/<int:book_id>` : Lister les réservations pour un livre spécifique (Admin requis).
