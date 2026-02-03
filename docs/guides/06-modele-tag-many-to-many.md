# Modèle Tag avec relation Many-to-Many

## Objectif

Ajouter un système de tags aux notes. Une note peut avoir plusieurs tags, et un tag peut être associé à plusieurs notes. C'est une relation **many-to-many** classique.

## Concepts clés

### Relation Many-to-Many en SQL

En SQL, une relation many-to-many nécessite une **table d'association** (ou table de jonction) :

```
notes              note_tags           tags
+----+-------+     +---------+--------+     +----+------+
| id | title |     | note_id | tag_id |     | id | name |
+----+-------+     +---------+--------+     +----+------+
| 1  | React |     | 1       | 1      |     | 1  | dev  |
| 2  | SQL   |     | 1       | 2      |     | 2  | urgent|
+----+-------+     | 2       | 1      |     +----+------+
                   +---------+--------+
```

La note "React" a les tags "dev" et "urgent". La note "SQL" a le tag "dev".

### En SQLAlchemy

SQLAlchemy gère cette table d'association de deux façons :
1. **Table simple** (sans données supplémentaires) → utilise `Table()`
2. **Modèle complet** (si tu veux ajouter des colonnes comme `created_at`) → utilise une classe

On va utiliser la première approche, plus simple.

---

## Étapes

### 1. Créer le fichier `backend/app/models/tag.py`

```python
from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

# Table d'association (pas de classe, juste une table)
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True)
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    # Relation vers notes (via la table d'association)
    notes = relationship("Note", secondary=note_tags, back_populates="tags")
```

**Points importants :**
- `Table()` crée une table sans modèle Python associé
- `primary_key=True` sur les deux colonnes = clé primaire composite
- `ForeignKey` crée les contraintes de clé étrangère
- `secondary=note_tags` dit à SQLAlchemy d'utiliser cette table pour la relation
- `back_populates` crée la relation bidirectionnelle

### 2. Modifier `backend/app/models/note.py`

Ajouter la relation inverse dans le modèle Note :

```python
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Ajouter cette ligne
    tags = relationship("Tag", secondary="note_tags", back_populates="notes")
```

**Note :** `secondary="note_tags"` peut être une string (nom de la table) ou l'objet `note_tags` importé.

### 3. Exporter le nouveau modèle dans `backend/app/models/__init__.py`

```python
from app.models.note import Note
from app.models.tag import Tag, note_tags
```

### 4. Créer les schémas Pydantic `backend/app/schemas/tag.py`

```python
from pydantic import BaseModel

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int

    model_config = {
        "from_attributes": True
    }
```

### 5. Mettre à jour les schémas Note pour inclure les tags

Dans `backend/app/schemas/note.py` :

```python
from datetime import datetime
from pydantic import BaseModel

# Importer TagResponse (attention aux imports circulaires)
class TagInNote(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class NoteBase(BaseModel):
    title: str
    content: str | None = None

class NoteCreate(NoteBase):
    tag_ids: list[int] = []  # Liste d'IDs de tags existants

class NoteUpdate(NoteBase):
    title: str | None = None
    content: str | None = None
    tag_ids: list[int] | None = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    tags: list[TagInNote] = []  # Tags inclus dans la réponse

    model_config = {
        "from_attributes": True
    }
```

**Note :** On crée `TagInNote` au lieu d'importer `TagResponse` pour éviter les imports circulaires.

### 6. Recréer la base de données

SQLite ne supporte pas `ALTER TABLE` pour ajouter des contraintes. Le plus simple :

```bash
cd backend
rm quicknotes.db
python -c "from app.database import engine, Base; from app.models import Note, Tag; Base.metadata.create_all(bind=engine)"
```

---

## Code de référence - Router tags

Voici la structure de base pour `backend/app/routers/tags.py` :

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagResponse

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("/", response_model=list[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()

@router.post("/", response_model=TagResponse, status_code=201)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    # Vérifier si le tag existe déjà
    existing = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")

    db_tag = Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag
```

---

## Pièges courants

### 1. Import circulaire
Si tu importes `TagResponse` dans `note.py` et `NoteResponse` dans `tag.py`, Python plante. Solution : créer des schémas "légers" (`TagInNote`, `NoteInTag`) dans chaque fichier.

### 2. Oublier `back_populates`
Sans `back_populates` des deux côtés, la relation ne fonctionne que dans un sens.

### 3. Lazy loading
Par défaut, `note.tags` fait une requête SQL à chaque accès. Pour charger les tags en une seule requête :
```python
from sqlalchemy.orm import joinedload

db.query(Note).options(joinedload(Note.tags)).all()
```

### 4. Ajouter un tag à une note
```python
# Récupérer le tag
tag = db.query(Tag).filter(Tag.id == tag_id).first()

# L'ajouter à la note
note.tags.append(tag)
db.commit()
```

### 5. Retirer un tag
```python
note.tags.remove(tag)
db.commit()
```

---

## Pour aller plus loin

- **Cascade delete** : Que se passe-t-il si on supprime un tag ? (indice : `cascade` dans `relationship`)
- **Tag unique par nom** : Déjà géré avec `unique=True`
- **Recherche par tag** : `db.query(Note).filter(Note.tags.any(Tag.name == "urgent"))`
