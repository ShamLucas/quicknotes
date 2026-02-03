# Session 2 — 28 janvier 2026

## Métriques
- **Durée prévue** : 3h (9h-12h)
- **Durée réelle** : ~2h (pause 15min incluse)
- **Commits** : 3

## Objectifs de la session
- [x] Vérifier que les guides 01-03 sont complets
- [x] Setup frontend React (guide 04)
- [x] Formulaire + interactions CRUD (guide 05)

## Ce qui a été fait
- Vérification guides 01-03 : tout OK
- Guide 04 : setup Vite + CORS + connexion API
- Guide 05 : formulaire création + suppression
- Mise à jour guides 03/04 pour intégrer le workflow Git (merge + nouvelle branche)
- Frontend CRUD complet fonctionnel

## Temps par tâche
| Tâche | Estimé | Réel | Écart |
|-------|--------|------|-------|
| Vérif guides 01-03 | 15min | 10min | -5min |
| Guide 04 + implémentation | 1h30 | 1h | -30min |
| Guide 05 + implémentation | 1h | 45min | -15min |

## Ce qui a bien marché
- La structure des guides permet d'avancer vite
- Concepts React (useState, useEffect, controlled components) bien intégrés
- Le CRUD complet fonctionne end-to-end

## Difficultés rencontrées
- Typo `npm create vite@lastest` → `latest`
- Confusion sur `npm fund` (pas une erreur, juste info)
- Workflow Git pas anticipé (branches) — corrigé en cours de session

## Apprentissages clés
- Vite > Create React App (vitesse, maintenance)
- CORS : mécanisme navigateur, config côté serveur
- Controlled components : le state React = source de vérité
- Pattern loading/error/data pour les appels async
- `e.preventDefault()` obligatoire sur les formulaires

## Tips techniques découverts
- `npm create vite@latest frontend -- --template react`
- `window.confirm()` pour confirmation simple
- `content.trim() || null` pour envoyer null au lieu de string vide
- État `submitting` pour éviter les doubles soumissions

## Axes d'amélioration pour la prochaine session
- Corriger `note.id` → `note.title` dans App.jsx ligne 101
- Refactorer en composants (NoteList, NoteItem, NoteForm)
- Ajouter du style (CSS ou Tailwind)

## Auto-évaluation
- **Difficulté ressentie** : 4/5
- **Commentaire** : Comprend l'essentiel mais pas encore capable d'écrire ce code sans exemple. Le format guide fonctionne bien.

## Notes libres
Session efficace, en avance sur le planning. Le frontend est fonctionnel mais l'autonomie sur React n'est pas encore là — normal à ce stade. Le workflow Git (branches par feature) est maintenant intégré dans les guides.

Prochaine session : soit refactoring composants, soit styling, soit tests. Penser à faire des mini-exercices de mémoire pour renforcer les patterns (loading/error/data, controlled components).
