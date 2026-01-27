# Session 1 — 27 janvier 2026

## Métriques
- **Durée prévue** : 4h
- **Durée réelle** : 3h
- **Commits** : 9

## Objectifs de la session
- [x] Setup repo + structure
- [x] Init FastAPI
- [x] Modèle Note
- [x] Routes CRUD /notes

## Ce qui a été fait
- Structure projet backend avec venv
- FastAPI + uvicorn configurés
- Modèle SQLAlchemy Note + schémas Pydantic
- CRUD complet sur /notes (5 endpoints)
- 3 guides générés dans docs/guides/

## Temps par tâche
| Tâche | Estimé | Réel | Écart |
|-------|--------|------|-------|
| Setup structure | 30min | 40min | +10min |
| Init FastAPI | 45min | (inclus ci-dessus) | - |
| Modèle Note | 45min | 1h30 | +45min |
| Routes CRUD | 1h30 | 1h15 | -15min |

## Ce qui a bien marché
- Le mode tuto fonctionne bien : guides clairs, progression logique
- Swagger UI pour tester rapidement les endpoints

## Difficultés rencontrées
- Erreur uvicorn au démarrage (fichier main.py vide)
- Redirection 307 avec curl (`/notes` → `/notes/`)
- Tendance à recopier sans assez réfléchir au code

## Apprentissages clés
- Distinction SQLAlchemy (ORM, persistance) vs Pydantic (validation)
- Pydantic : validation automatique des données entrantes/sortantes
- FastAPI : Dependency Injection avec `Depends()`
- Structure projet FastAPI (routers, models, schemas)

## Tips techniques découverts
- `curl -L` pour suivre les redirections
- Swagger UI auto-générée sur `/docs`
- Convention Conventional Commits (feat, fix, docs...)
- `model_dump(exclude_unset=True)` pour les updates partiels

## Axes d'amélioration pour la prochaine session
- Relire les 3 guides générés avant de coder
- Essayer de coder sans regarder le guide, puis vérifier
- Approfondir Pydantic et SQLAlchemy (docs officielles)

## Notes libres
Bonne première session. Le format tuto guide + code soi-même fonctionne.
Besoin de repasser sur le code pour bien intégrer les concepts avant de passer au frontend.

---

## Workflow de session
```
DÉBUT SESSION
    │
    ▼
┌─────────────────────────────────┐
│  Claude Code (terminal VSCode)  │
│  - Génère guides dans docs/     │
│  - Répond aux questions         │
│  - Review ton code              │
└─────────────────────────────────┘
    │
    ▼
Tu codes, tu commites (règle toilettes)
    │
    ▼
FIN SESSION
    │
    ▼
┌─────────────────────────────────┐
│  Claude.ai (ici)                │
│  - Tu colles ton compte-rendu   │
│  - On débrief ensemble          │
│  - Ajustements backlog si besoin│
└─────────────────────────────────┘
```
