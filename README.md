# chefs.dev — Job Board

Projet Epitech T-WEB-501, réalisé en binôme.

chefs.dev est un site d'offres d'emploi pour les métiers de l'informatique dans la restauration. Les candidats peuvent chercher des offres, les garder en favori et postuler. Les recruteurs publient les offres de leur entreprise et lisent les candidatures. Un admin gère toute la base.

## Technologies

- Front-end : React (Vite) et CSS
- Back-end : Python avec Flask
- Base de données : MySQL

## Prérequis

- Node.js et npm
- Python 3
- MySQL

## Arborescence

```
.
├── database/
│   └── database_setup.sql
├── backend/
│   ├── app.py
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
└── job-board-front/
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── auth.js
        ├── index.css
        └── components/
```

## Lancer le projet

### 1. Créer la base

```bash
mysql -u root -p < database/database_setup.sql
```

### 2. Lancer le back

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Compléter le fichier `.env` avec ses identifiants MySQL et une `SECRET_KEY` (une phrase secrète au choix).

```bash
python seed.py
python app.py
```

`seed.py` remplit la base avec des données de test. Le back tourne sur `http://localhost:5001`.

### 3. Lancer le front

Dans un autre terminal :

```bash
cd job-board-front
npm install
cp .env.example .env
npm run dev
```

Le site est sur `http://localhost:5173`.

### Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | *hidden* |
| Candidat | jane@chefs.dev | jane123 |
| Recruteur | employer@chefs.dev | employer123 |

## Base de données

- **companies** : les entreprises
- **people** : les comptes, avec un rôle (`admin`, `user` ou `employer`). Un employer est rattaché à une entreprise.
- **advertisements** : les offres, chacune liée à une entreprise
- **applications** : les candidatures, liées à une offre (et au compte du candidat s'il est connecté)
- **favourites** : les offres mises en favori par chaque personne

## Routes de l'API

Toutes les routes commencent par `/api`.

| Méthode | Route | Rôle | Accès |
|---|---|---|---|
| POST | `/auth/signup` | Créer un compte | Public |
| POST | `/auth/login` | Se connecter | Public |
| GET / PUT | `/auth/me` | Voir / modifier son profil | Connecté |
| GET | `/advertisements` | Liste des offres | Public |
| GET | `/advertisements/<id>` | Détail d'une offre | Public |
| POST / PUT / DELETE | `/advertisements` | Gérer les offres | Recruteur de l'entreprise ou admin |
| POST | `/advertisements/<id>/applications` | Postuler | Public |
| GET | `/advertisements/<id>/applications` | Candidatures d'une offre | Recruteur de l'entreprise ou admin |
| GET | `/me/applications` | Ses candidatures | Connecté |
| GET / POST / DELETE | `/me/favourites` | Gérer ses favoris | Connecté |
| GET | `/companies` | Liste des entreprises | Public |
| POST / PUT / DELETE | `/companies` | Gérer les entreprises | Admin |
| GET / DELETE | `/applications` | Gérer toutes les candidatures | Admin |
| GET / PUT / DELETE | `/people` | Gérer les comptes | Admin |

## Pages

- **Accueil** : liste des offres, recherche, filtres, détail d'une offre et candidature
- **Connexion** et **création de compte** (candidat ou recruteur)
- **Candidat** : mon profil, mes candidatures, mes favoris
- **Recruteur** : mes informations, mes offres et leurs candidatures
- **Admin** : gestion des offres, entreprises, candidatures et comptes