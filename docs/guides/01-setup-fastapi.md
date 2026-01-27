# 01 - Setup FastAPI

## Objectif

Mettre en place l'environnement de développement FastAPI pour le projet QuickNotes.

**Pourquoi FastAPI ?**
- Performance : basé sur Starlette (ASGI), parmi les frameworks Python les plus rapides
- Typage : validation automatique avec Pydantic
- Documentation : Swagger UI générée automatiquement
- Moderne : support natif de `async/await`

À la fin de ce guide, tu auras un serveur qui répond sur `http://localhost:8000` avec une doc interactive sur `/docs`.

## Concepts clés

### ASGI vs WSGI
- **WSGI** (Web Server Gateway Interface) : standard synchrone (Flask, Django classique)
- **ASGI** (Asynchronous Server Gateway Interface) : standard asynchrone, gère les WebSockets, HTTP/2

FastAPI utilise ASGI, ce qui permet de gérer plusieurs requêtes en parallèle sans bloquer.

### Uvicorn
Serveur ASGI léger et rapide. C'est lui qui fait tourner ton application FastAPI.

### Structure type d'un projet FastAPI
```
backend/
├── app/
│   ├── __init__.py
│   └── main.py        # Point d'entrée
├── requirements.txt
└── venv/              # Environnement virtuel (gitignore)
```

## Étapes

### 1. Créer une branche de travail

```bash
# Depuis la racine du projet quicknotes/
git checkout -b feature/setup-backend

# Vérifie que tu es sur la bonne branche
git branch
```

**Convention de nommage des branches :**
- `feature/xxx` : nouvelle fonctionnalité
- `fix/xxx` : correction de bug
- `refactor/xxx` : refactoring sans changement de comportement

### 2. Créer le dossier backend et l'environnement virtuel

```bash
mkdir -p backend/app
cd backend

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement (macOS/Linux)
source venv/bin/activate

# Tu devrais voir (venv) au début de ton prompt
```

### 3. Installer les dépendances

```bash
# Toujours avec l'environnement activé
pip install fastapi uvicorn

# Figer les versions
pip freeze > requirements.txt
```

### 4. Créer les fichiers de base

Crée `backend/app/__init__.py` (fichier vide, nécessaire pour que Python reconnaisse le dossier comme un package).

Crée `backend/app/main.py` avec ton premier endpoint.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

### 5. Lancer le serveur

```bash
# Depuis le dossier backend/
uvicorn app.main:app --reload
```

Décortiquons cette commande :
- `app.main` : chemin Python vers le module (dossier `app/`, fichier `main.py`)
- `:app` : nom de l'instance FastAPI dans ce fichier
- `--reload` : redémarre automatiquement quand tu modifies le code

### 6. Tester

- Navigateur : `http://localhost:8000` → tu dois voir ta réponse JSON
- Documentation Swagger : `http://localhost:8000/docs`
- Documentation ReDoc : `http://localhost:8000/redoc`

### 7. Committer et pousser

```bash
# Revenir à la racine du projet
cd ..

# Vérifier ce qui va être commité
git status

# Ajouter les fichiers (pas le venv !)
git add backend/app/ backend/requirements.txt

# Commit
git commit -m "feat(backend): setup FastAPI avec endpoint health"

# Pousser la branche
git push -u origin feature/setup-backend
```

**Convention de commit (Conventional Commits) :**
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `refactor:` refactoring
- `test:` ajout de tests

## Code de référence

### main.py minimal

```python
from fastapi import FastAPI

# Créer l'instance de l'application
app = FastAPI()

# Définir une route GET sur "/"
@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

### Version async (équivalent)

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello World"}
```

Pour l'instant, les deux versions sont équivalentes. La version `async` devient utile quand tu fais des opérations I/O (base de données, appels API externes).

### Ajouter un deuxième endpoint

```python
@app.get("/health")
def health_check():
    return {"status": "ok"}
```

## Pièges courants

### 1. "Module not found" au lancement
```
ModuleNotFoundError: No module named 'app'
```
**Cause** : Tu n'es pas dans le bon dossier.
**Solution** : Lance uvicorn depuis `backend/`, pas depuis `backend/app/`.

### 2. L'environnement virtuel n'est pas activé
```
command not found: uvicorn
```
**Solution** : `source venv/bin/activate` avant de lancer.

### 3. Port déjà utilisé
```
ERROR: [Errno 48] Address already in use
```
**Solution** :
- Soit tu as déjà un serveur qui tourne (tue-le avec Ctrl+C)
- Soit change de port : `uvicorn app.main:app --reload --port 8001`

### 4. Oublier `__init__.py`
Python ne reconnaît pas `app/` comme un package sans ce fichier.

### 5. Mauvaise syntaxe dans la commande uvicorn
```bash
# FAUX
uvicorn main:app
uvicorn app/main:app

# CORRECT
uvicorn app.main:app
```
C'est un chemin Python (avec des points), pas un chemin fichier.

## Pour aller plus loin

### Documentation officielle
- [FastAPI - First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [Uvicorn](https://www.uvicorn.org/)

### Concepts à explorer ensuite
- **Path parameters** : `@app.get("/items/{item_id}")`
- **Query parameters** : `@app.get("/items?skip=0&limit=10")`
- **Pydantic models** : validation des données entrantes
- **Dependency Injection** : pattern central de FastAPI

### Commandes utiles
```bash
# Voir les routes disponibles
# → Va sur /docs, tout est listé

# Tester avec curl
curl http://localhost:8000/
curl http://localhost:8000/health

# Arrêter le serveur
Ctrl+C
```

---

## Checklist de validation

- [ ] Branche `feature/setup-backend` créée
- [ ] `backend/venv/` existe et est activé
- [ ] `pip list` montre fastapi et uvicorn
- [ ] `backend/app/__init__.py` existe (même vide)
- [ ] `backend/app/main.py` contient ton code
- [ ] `uvicorn app.main:app --reload` démarre sans erreur
- [ ] `http://localhost:8000` retourne du JSON
- [ ] `http://localhost:8000/docs` affiche Swagger UI
- [ ] Commit effectué avec message conventionnel
- [ ] Branche poussée sur origin
