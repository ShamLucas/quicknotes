# 03 - Routes CRUD /notes

## Objectif

Créer les endpoints REST pour gérer les notes (Create, Read, Update, Delete).

À la fin de ce guide, tu auras :
- `POST /notes` : créer une note
- `GET /notes` : lister toutes les notes
- `GET /notes/{id}` : récupérer une note
- `PUT /notes/{id}` : modifier une note
- `DELETE /notes/{id}` : supprimer une note

## Concepts clés

### REST en 30 secondes

| Opération | Méthode HTTP | Endpoint | Corps |
|-----------|--------------|----------|-------|
| Créer | POST | /notes | `{title, content}` |
| Lister | GET | /notes | - |
| Lire un | GET | /notes/{id} | - |
| Modifier | PUT | /notes/{id} | `{title, content}` |
| Supprimer | DELETE | /notes/{id} | - |

### Dependency Injection dans FastAPI

FastAPI utilise `Depends()` pour injecter des dépendances dans les routes.

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/notes")
def list_notes(db: Session = Depends(get_db)):
    # db est injecté automatiquement
    ...
```

**Pourquoi `yield` et pas `return` ?**
- `yield` permet d'exécuter du code après la route (cleanup)
- Le `finally` garantit que la session est fermée, même en cas d'erreur

### Structure recommandée

```
backend/app/
├── main.py           # Point d'entrée, inclut le router
├── database.py       # Config DB
├── dependencies.py   # get_db et autres dépendances
├── models/
│   └── note.py
├── schemas/
│   └── note.py
└── routers/          # Nouveau !
    ├── __init__.py
    └── notes.py      # Routes CRUD pour /notes
```

Séparer les routes dans `routers/` garde le code organisé quand l'app grandit.

## Étapes

### 1. Créer le fichier de dépendances

Crée `backend/app/dependencies.py` :

```python
from app.database import SessionLocal


def get_db():
    """
    Génère une session DB pour chaque requête.
    La session est fermée automatiquement après la requête.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 2. Créer le router des notes

Crée les dossiers et fichiers :
```bash
mkdir -p app/routers
touch app/routers/__init__.py
```

Crée `backend/app/routers/notes.py` avec les 5 routes CRUD.

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(
    prefix="/notes",
    tags=["notes"]  # Groupe dans la doc Swagger
)


@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle note."""
    db_note = Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)  # Recharge pour avoir l'id et les dates
    return db_note


@router.get("/", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db)):
    """Lister toutes les notes."""
    return db.query(Note).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """Récupérer une note par son ID."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    """Modifier une note existante."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    # Appliquer uniquement les champs fournis
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Supprimer une note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None  # 204 = No Content
```

### 3. Connecter le router à l'app

Modifie `backend/app/main.py` pour inclure le router :

```python
from fastapi import FastAPI

from app.database import engine, Base
from app.models.note import Note
from app.routers import notes  # Nouveau !

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Inclure le router
app.include_router(notes.router)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 4. Tester avec Swagger UI

```bash
# Depuis backend/
uvicorn app.main:app --reload
```

Ouvre `http://localhost:8000/docs` et teste chaque endpoint :

1. **POST /notes** : Crée une note
   ```json
   {"title": "Ma première note", "content": "Hello world"}
   ```
   → Tu dois recevoir un 201 avec l'objet créé (id, dates incluses)

2. **GET /notes** : Liste les notes
   → Tu dois voir ta note dans la liste

3. **GET /notes/1** : Récupère la note 1
   → Détail de la note

4. **PUT /notes/1** : Modifie le titre
   ```json
   {"title": "Titre modifié"}
   ```
   → Le titre change, le content reste

5. **DELETE /notes/1** : Supprime la note
   → 204 No Content

6. **GET /notes/1** : Vérifie la suppression
   → 404 Not Found

### 5. Tester avec curl (optionnel)

```bash
# Créer
curl -X POST http://localhost:8000/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Test curl", "content": "Contenu"}'

# Lister
curl http://localhost:8000/notes

# Lire
curl http://localhost:8000/notes/1

# Modifier
curl -X PUT http://localhost:8000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Modifié"}'

# Supprimer
curl -X DELETE http://localhost:8000/notes/1
```

### 6. Commit

```bash
git add backend/app/dependencies.py backend/app/routers/ backend/app/main.py
git commit -m "feat(backend): add CRUD routes for notes"
```

### 7. Merger la branche et préparer la suite

Le backend est fonctionnel. Merge ta branche dans main avant de passer au frontend.

```bash
# Pousser les derniers changements
git push

# Retourner sur main et merger
git checkout main
git merge featur/setup-backend
git push
```

## Code de référence

### Différence entre `model_dump()` et `dict()`

```python
# Pydantic v2
note.model_dump()              # Tous les champs
note.model_dump(exclude_unset=True)  # Seulement les champs fournis

# Pydantic v1 (ancienne syntaxe)
note.dict()
note.dict(exclude_unset=True)
```

### Pattern pour éviter la répétition du "get or 404"

```python
def get_note_or_404(note_id: int, db: Session = Depends(get_db)) -> Note:
    note = db.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note: Note = Depends(get_note_or_404)):
    return note
```

Tu peux implémenter ça plus tard si tu veux DRY ton code.

### Codes HTTP importants

| Code | Signification | Quand l'utiliser |
|------|---------------|------------------|
| 200 | OK | GET, PUT réussis |
| 201 | Created | POST réussi |
| 204 | No Content | DELETE réussi |
| 400 | Bad Request | Données invalides |
| 404 | Not Found | Ressource inexistante |
| 422 | Unprocessable Entity | Validation Pydantic échouée |

## Pièges courants

### 1. Oublier `db.commit()`

```python
# FAUX - la note n'est pas persistée
db.add(note)
return note

# CORRECT
db.add(note)
db.commit()
db.refresh(note)
return note
```

### 2. Oublier `db.refresh()` après commit

```python
# FAUX - note.id sera None
db.add(note)
db.commit()
return note  # id = None !

# CORRECT
db.add(note)
db.commit()
db.refresh(note)  # Recharge depuis la DB
return note  # id = 1
```

### 3. Import circulaire avec les routers

```python
# FAUX dans routers/notes.py
from app.main import app  # Import circulaire !

# CORRECT - utiliser APIRouter
from fastapi import APIRouter
router = APIRouter()
```

### 4. Oublier d'inclure le router

```python
# FAUX - les routes ne sont pas accessibles
from app.routers import notes
# ... mais pas de include_router

# CORRECT
app.include_router(notes.router)
```

### 5. PUT vs PATCH

- **PUT** : remplace toute la ressource (tous les champs requis)
- **PATCH** : mise à jour partielle (seulement les champs fournis)

On utilise PUT ici avec `exclude_unset=True` pour avoir un comportement PATCH-like. C'est un raccourci courant, mais techniquement pas 100% REST.

## Pour aller plus loin

### Documentation
- [FastAPI Path Parameters](https://fastapi.tiangolo.com/tutorial/path-params/)
- [FastAPI Request Body](https://fastapi.tiangolo.com/tutorial/body/)
- [SQLAlchemy Query API](https://docs.sqlalchemy.org/en/20/orm/queryguide/)

### Améliorations possibles
- **Pagination** : `GET /notes?skip=0&limit=10`
- **Recherche** : `GET /notes?q=terme`
- **Tri** : `GET /notes?sort=created_at&order=desc`
- **Filtres** : `GET /notes?created_after=2024-01-01`

### Pattern Repository (plus tard)

Séparer la logique DB dans un fichier `repositories/note.py` :

```python
# repositories/note.py
class NoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Note]:
        return self.db.query(Note).all()

    def get_by_id(self, note_id: int) -> Note | None:
        return self.db.query(Note).filter(Note.id == note_id).first()

    # etc.
```

Utile quand la logique devient complexe. Pas nécessaire pour l'instant.

---

## Checklist de validation

- [ ] `backend/app/dependencies.py` existe avec `get_db()`
- [ ] `backend/app/routers/notes.py` a les 5 routes CRUD
- [ ] `backend/app/main.py` inclut le router
- [ ] `uvicorn app.main:app --reload` démarre sans erreur
- [ ] `http://localhost:8000/docs` montre les routes /notes
- [ ] POST /notes crée une note (vérifie dans la liste)
- [ ] GET /notes/{id} retourne la note
- [ ] PUT /notes/{id} modifie la note
- [ ] DELETE /notes/{id} supprime la note (puis 404)
- [ ] Commit effectué
