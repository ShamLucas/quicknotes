from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite : fichier local
SQLALCHEMY_DATABASE_URL = "sqlite:///./quicknotes.db"

# Création du moteur de base de données
# check_same_thread=False est nécessaire pour SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Factory de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour les modèles
Base = declarative_base()