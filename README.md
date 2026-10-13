# T-WEB-501-MAR-5-1-job_board-2

# chefs.dev — Job Board

Site d'offres d'emploi pour les métiers de l'informatique dans la restauration.

## Technologies

- **Front-end** : React (Vite)
- **Back-end** : Python, Flask
- **Base de données** : MySQL

## Prérequis

- Node.js et npm
- Python 3
- MySQL

## Lancer le projet

### Base de données

```bash
mysql -u root -p < database_setup.sql
```

### Back-end

```bash
cd job-board-back
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Front-end

```bash
cd job-board-front
npm install
cp .env.example .env
npx json-server db.json --port 3000
npm run dev
```

Lancer json-server et `npm run dev` dans deux terminaux, puis ouvrir `http://localhost:5173`.

Comptes de test : `admin@chefs.dev` / `admin123` et `jane@chefs.dev` / `jane123`.

## Arborescence


## Base de données

- **companies** : les entreprises
- **people** : les utilisateurs, avec un champ `role` (admin, user, employer)
- **advertisements** : les offres, liées à une entreprise
- **applications** : les candidatures, liées à une offre (et à un compte si le candidat est connecté)

## Routes de l'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/companies` | Liste des entreprises |
| GET | `/api/companies/<id>` | Une entreprise |
| POST | `/api/companies` | Créer une entreprise |
| PUT | `/api/companies/<id>` | Modifier une entreprise |
| DELETE | `/api/companies/<id>` | Supprimer une entreprise |

En cours : routes pour les offres, les candidatures, les comptes et la connexion.

## Pages

- **Job board** : liste des offres, recherche, filtres, détail et candidature
- **Sign in** : connexion (l'admin est redirigé vers la page admin)
- **Create account** : création de compte
- **Admin** : gestion de la base (en cours)



connexion 
employeur
documentation 

ppt
tenue pro 

tres pro
pas un truc de fou 
exprimer sur ce qon en pense tout ça, retour critique