from datetime import datetime
from pydantic import BaseModel

class NoteBase(BaseModel):
    title: str
    content: str | None = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    title: str | None = None
    content: str | None = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }