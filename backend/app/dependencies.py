from app.database import SessionLocal

def get_db():
    """"
    Génère une session DB pour chaque requête.
    La session est fermée automatiquement après la requête.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()