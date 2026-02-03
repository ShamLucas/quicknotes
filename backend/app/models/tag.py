from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

# Table d'association (pas de classe, juste une table)
note_tags = Table(
    'note_tags',
    Base.metadata, 
    Column('note_id', Integer, ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)

    # Relation vers notes (via la table d'association)
    notes = relationship('Note', secondary=note_tags, back_populates='tags')