from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models.note import Note  # Importer les modèles pour créer les tables
from app.routers import notes

# Créer l'instance de l'application
app = FastAPI()

# Configurer le middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

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