# 02 - Modèle Note

## Objectif

Créer le modèle de données `Note` pour l'application QuickNotes.

À la fin de ce guide, tu auras :
- Un modèle SQLAlchemy pour la persistance en base (SQLite)
- Un schéma Pydantic pour la validation des données entrantes/sortantes
- Une base de données SQLite initialisée

## Concepts clés

### SQLAlchemy vs Pydantic : deux rôles différents

| Aspect | SQLAlchemy | Pydantic |
|--------|------------|----------|
| **Rôle** | ORM (mapping objet-relationnel) | Validation de données |
| **Utilisé pour** | Définir les tables, requêter la DB | Valider les requêtes API, sérialiser les réponses |
| **Où ça vit** | `models/` | `schemas/` |

**Pourquoi les deux ?**
- SQLAlchemy gère la persistance (comment stocker)
- Pydantic gère le contrat API (ce qu'on accepte/renvoie)

Exemple concret :
- Le modèle SQLAlchemy a un champ `created_at` auto-généré → l'utilisateur ne l'envoie pas
- Le schéma Pydantic pour la création n'a pas `created_at`, mais celui pour la réponse l'a

### Structure des dossiers

```
backend/app/
├── __init__.py
├── main.py
├── database.py      # Configuration connexion DB
├── models/          # Modèles SQLAlchemy
│   ├── __init__.py
│   └── note.py
└── schemas/         # Schémas Pydantic
    ├── __init__.py
    └── note.py
```

### SQLite

Base de données fichier, parfaite pour le développement :
- Pas de serveur à installer
- Un simple fichier `.db`
- Compatible SQL standard

## Étapes

### 1. Installer SQLAlchemy

```bash
# Depuis backend/, avec venv activé
pip install sqlalchemy

# Mettre à jour requirements.txt
pip freeze > requirements.txt
```

### 2. Créer la configuration de la base de données

Crée `backend/app/database.py`.

Ce fichier doit contenir :
- L'URL de connexion SQLite (un fichier `quicknotes.db`)
- Le moteur SQLAlchemy (`create_engine`)
- La session factory (`sessionmaker`)
- La classe de base pour les modèles (`declarative_base`)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite : fichier local
SQLALCHEMY_DATABASE_URL = "sqlite:///./quicknotes.db"

# Création du moteur
# check_same_thread=False nécessaire pour SQLite avec FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Factory de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour les modèles
Base = declarative_base()
```

### 3. Créer le modèle SQLAlchemy

Crée les dossiers et fichiers :
```bash
mkdir -p app/models
touch app/models/__init__.py
```

Crée `backend/app/models/note.py`.

Le modèle `Note` doit avoir :
- `id` : entier, clé primaire, auto-incrémenté
- `title` : string, obligatoire
- `content` : texte, optionnel
- `created_at` : datetime, valeur par défaut = maintenant
- `updated_at` : datetime, mis à jour automatiquement

```python
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### 4. Créer les schémas Pydantic

Crée les dossiers et fichiers :
```bash
mkdir -p app/schemas
touch app/schemas/__init__.py
```

Crée `backend/app/schemas/note.py`.

Tu as besoin de plusieurs schémas :
- `NoteBase` : champs communs (title, content)
- `NoteCreate` : pour la création (hérite de NoteBase)
- `NoteUpdate` : pour la mise à jour (tous les champs optionnels)
- `NoteResponse` : pour les réponses API (avec id, dates)

```python
from datetime import datetime
from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str
    content: str | None = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

**Note sur `model_config` :**
- Anciennement `class Config: orm_mode = True` (Pydantic v1)
- Permet à Pydantic de lire les attributs d'un objet SQLAlchemy

### 5. Initialiser la base de données

Modifie `backend/app/main.py` pour créer les tables au démarrage.

```python
from fastapi import FastAPI

from app.database import engine, Base
from app.models.note import Note  # Import nécessaire pour que Base connaisse le modèle

app = FastAPI()

# Crée les tables si elles n'existent pas
Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

### 6. Tester que tout fonctionne

```bash
# Depuis backend/
uvicorn app.main:app --reload
```

Si ça démarre sans erreur, un fichier `quicknotes.db` devrait apparaître dans `backend/`.

Tu peux vérifier la structure avec SQLite :
```bash
# Installer sqlite3 si nécessaire (souvent pré-installé sur macOS)
sqlite3 quicknotes.db ".schema"
```

Tu devrais voir la table `notes` avec ses colonnes.

### 7. Mettre à jour .gitignore

Ajoute dans `.gitignore` à la racine du projet :

```
# Database
*.db
```

### 8. Commit

```bash
git add .gitignore backend/app/main.py backend/app/database.py backend/app/models/ backend/app/schemas/ backend/requirements.txt
git commit -m "feat(backend): add Note model and Pydantic schemas"
```

## Code de référence

### Pourquoi séparer NoteCreate et NoteResponse ?

```python
# Requête entrante (POST /notes)
# L'utilisateur envoie :
{
    "title": "Ma note",
    "content": "Contenu..."
}

# Réponse sortante
# L'API renvoie :
{
    "id": 1,
    "title": "Ma note",
    "content": "Contenu...",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
}
```

L'utilisateur ne choisit pas l'ID ni les dates → ils ne sont pas dans `NoteCreate`.

### Pattern de session (pour plus tard)

```python
# Dependency injection pour obtenir une session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Tu utiliseras ça dans les routes pour accéder à la DB.

## Pièges courants

### 1. Import circulaire

```python
# PROBLÈME : database.py importe Note, et Note importe Base de database.py
```
**Solution :** `database.py` ne doit jamais importer les modèles. C'est `main.py` qui importe les deux.

### 2. Oublier d'importer le modèle avant `create_all`

```python
# FAUX - la table ne sera pas créée
Base.metadata.create_all(bind=engine)

# CORRECT - importer le modèle AVANT
from app.models.note import Note
Base.metadata.create_all(bind=engine)
```

SQLAlchemy ne "scanne" pas les fichiers. Il faut que le modèle soit importé pour qu'il soit enregistré dans `Base.metadata`.

### 3. Pydantic v1 vs v2

```python
# Pydantic v1 (ancienne syntaxe)
class Config:
    orm_mode = True

# Pydantic v2 (nouvelle syntaxe)
model_config = {"from_attributes": True}
```

FastAPI récent utilise Pydantic v2. Vérifie ta version : `pip show pydantic`.

### 4. Chemin SQLite incorrect

```python
# Chemin relatif - dépend d'où tu lances uvicorn
"sqlite:///./quicknotes.db"

# Si tu lances depuis un autre dossier, le fichier sera créé ailleurs
```

**Solution :** Lance toujours uvicorn depuis `backend/`.

### 5. Oublier `check_same_thread=False`

```
sqlalchemy.exc.ProgrammingError: SQLite objects created in a thread can only be used in that same thread
```

FastAPI est async et peut utiliser plusieurs threads. SQLite par défaut ne le permet pas.

## Pour aller plus loin

### Documentation
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [Pydantic Models](https://docs.pydantic.dev/latest/concepts/models/)
- [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)

### Concepts à explorer ensuite
- **Relations** : ForeignKey, relationship() pour lier des tables
- **Migrations** : Alembic pour gérer l'évolution du schéma
- **Indexes** : optimiser les requêtes fréquentes

### Commandes SQLite utiles

```bash
# Ouvrir la base
sqlite3 quicknotes.db

# Voir les tables
.tables

# Voir le schéma d'une table
.schema notes

# Requête simple
SELECT * FROM notes;

# Quitter
.quit
```

---

## Checklist de validation

- [ ] `pip show sqlalchemy` affiche une version 2.x
- [ ] `backend/app/database.py` existe et se lance sans erreur
- [ ] `backend/app/models/note.py` définit la classe Note
- [ ] `backend/app/schemas/note.py` définit les 4 schémas
- [ ] `uvicorn app.main:app --reload` démarre sans erreur
- [ ] `quicknotes.db` est créé dans `backend/`
- [ ] `sqlite3 quicknotes.db ".schema"` affiche la table notes
- [ ] `*.db` ajouté au `.gitignore`
- [ ] Commit effectué (inclut main.py, database.py, models/, schemas/)
