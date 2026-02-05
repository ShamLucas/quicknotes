# QuickNotes Backend

API FastAPI + SQLite + SQLAlchemy

## Setup

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer le venv
source venv/bin/activate  # macOS/Linux
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

## Commandes

```bash
# Lancer le serveur de dev
uvicorn app.main:app --reload

# Lancer sur un port spécifique
uvicorn app.main:app --reload --port 8000

# Recréer la base de données
rm quicknotes.db
python -c "from app.database import engine, Base; from app.models import Note, Tag; Base.metadata.create_all(bind=engine)"
```

## Endpoints

- `GET /notes` - Liste des notes
- `POST /notes` - Créer une note
- `GET /notes/{id}` - Détail d'une note
- `PUT /notes/{id}` - Modifier une note
- `DELETE /notes/{id}` - Supprimer une note
- `GET /tags` - Liste des tags
- `POST /tags` - Créer un tag

## Documentation API

Serveur lancé : http://localhost:8000/docs (Swagger UI)
