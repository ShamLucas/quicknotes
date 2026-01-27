from fastapi import FastAPI

from app.database import engine, Base
from app.models.note import Note  # Importer les modèles pour créer les tables
from app.routers import notes

# Créer l'instance de l'application
app = FastAPI()

# Créer les tables dans la base de données
Base.metadata.create_all(bind=engine)

# Inclure le routeur des notes
app.include_router(notes.router)

# Défini une route GET sur "/"
@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}