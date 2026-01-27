from fastapi import FastAPI

# Créer l'instance de l'application
app = FastAPI()

# Défini une route GET sur "/"
@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}