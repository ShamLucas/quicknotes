# QuickNotes API

Application minimaliste de capture de notes avec tags.  
Projet de sprint technique (2 semaines) pour consolidation fullstack Python/React.

## Stack

- **Backend** : FastAPI + SQLite + SQLAlchemy
- **Frontend** : React (Vite) + CSS
- **Outils** : Claude Code (coaching), Git

## Objectifs du sprint

- [ ] API REST complète (CRUD notes + tags)
- [ ] Frontend React fonctionnel
- [ ] Tests unitaires
- [ ] Speedrun filmé en fin de sprint

## Journal des sessions

| Session | Date | Durée | Focus | Lien |
|---------|------|-------|-------|------|
| 1 | 2025-01-27 | 4h | Setup + modèle Note | [session-01](docs/sessions/session-01.md) |
| 2 | - | 4h | Tags + recherche | [session-02](docs/sessions/session-02.md) |
| 3 | - | 4h | Init React + composants | [session-03](docs/sessions/session-03.md) |
| 4 | - | 4h | CRUD React + CSS | [session-04](docs/sessions/session-04.md) |
| 5 | - | 4h | Polish + refacto | [session-05](docs/sessions/session-05.md) |
| 6 | - | 4h | Session sans IA | [session-06](docs/sessions/session-06.md) |

## Lancer le projet
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Auteur

Lucas — Sprint de préparation reprise d'études informatique