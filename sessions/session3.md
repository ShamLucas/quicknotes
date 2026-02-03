# Session 3 - 03/02/2026

**Durée** : 09:12 → ~11:00 (~1h45)

---

## Réalisé

### Housekeeping
- Ajout de `.vite` dans `.gitignore` (cache Vite qui polluait git status)
- Extraction des commentaires Q/R de `App.jsx` → `docs/guides/05-react-state-notes.md`

### Guide 06 - Modèle Tag Many-to-Many
- Création du guide `docs/guides/06-modele-tag-many-to-many.md`
- Implémentation complète :
  - `backend/app/models/tag.py` (modèle Tag + table d'association `note_tags`)
  - Modification de `backend/app/models/note.py` (relation `tags`)
  - `backend/app/schemas/tag.py` (TagBase, TagCreate, TagResponse)
  - Modification de `backend/app/schemas/note.py` (TagInNote, tag_ids)
  - Export dans `models/__init__.py`
- Recréation de la base de données

---

## Concepts appris

- Relation many-to-many avec SQLAlchemy
- Table d'association via `Table()` vs classe modèle
- `back_populates` pour relations bidirectionnelles
- Éviter les imports circulaires avec des schémas "légers" (TagInNote)

---

## Points d'attention

- Penser à activer le venv avant de lancer des commandes Python
- Nommage : `tag_ids` (pas `tags_ids`)

---

## Prochaines étapes

- [ ] Créer le router `/tags` (CRUD)
- [ ] Modifier le router `/notes` pour gérer les tags à la création/modification
- [ ] Tester les endpoints avec les tags
- [ ] (Frontend) Afficher/sélectionner les tags sur les notes
