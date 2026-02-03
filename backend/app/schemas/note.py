from datetime import datetime
from pydantic import BaseModel

# Importer TagResponse (attention eux imports circulaires)

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
    tag_ids: list[int] = [] # Liste des IDs des tags associés

class NoteUpdate(NoteBase):
    title: str | None = None
    content: str | None = None
    tag_ids: list[int] | None = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    tags: list[TagInNote] = [] #Tags inclus dans la réponse

    model_config = {
        "from_attributes": True
    }