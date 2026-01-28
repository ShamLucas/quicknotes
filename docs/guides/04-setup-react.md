# 04 - Setup Frontend React

## Objectif

Mettre en place l'application React pour QuickNotes et la connecter au backend FastAPI.

À la fin de ce guide, tu auras :
- Une app React fonctionnelle avec Vite
- CORS configuré côté FastAPI
- Un premier appel API qui affiche les notes

## Concepts clés

### Vite vs Create React App

| Aspect | Create React App | Vite |
|--------|------------------|------|
| **Vitesse** | Lent (Webpack) | Ultra-rapide (ESBuild) |
| **Config** | Cachée (eject pour modifier) | Simple et accessible |
| **HMR** | Correct | Instantané |
| **Maintenance** | Quasi-abandonné | Activement maintenu |

**Verdict :** Vite est le nouveau standard pour les projets React.

### CORS (Cross-Origin Resource Sharing)

Quand ton frontend (localhost:5173) appelle ton backend (localhost:8000), le navigateur bloque par défaut : c'est une requête "cross-origin".

CORS est un mécanisme qui permet au serveur de dire "j'accepte les requêtes de cette origine".

```
Frontend (5173) ---> Navigateur ---> Backend (8000)
                         |
                    "Origine différente !"
                    "Backend, tu acceptes ?"
                         |
                    Backend : "Oui, 5173 est autorisé"
```

Sans CORS configuré → erreur dans la console du navigateur.

### Structure React recommandée

```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages/vues principales
│   ├── services/       # Appels API
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Étapes

### 1. Créer une branche pour le frontend

```bash
# Depuis main (après avoir mergé la branche backend)
git checkout -b feature/frontend
```

### 2. Configurer CORS côté FastAPI

Avant de créer le frontend, configure le backend pour accepter les requêtes cross-origin.

Modifie `backend/app/main.py` pour ajouter le middleware CORS :

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Nouveau !

from app.database import engine, Base
from app.models.note import Note
from app.routers import notes

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL du frontend Vite
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(notes.router)


@app.get("/")
def read_root():
    return {"message": "QuickNotes API"}
```

**Note :** En production, tu restreindras `allow_origins` à ton domaine réel.

### 3. Créer l'application React avec Vite

```bash
# Depuis la racine du projet quicknotes/
npm create vite@latest frontend -- --template react

# Aller dans le dossier
cd frontend

# Installer les dépendances
npm install
```

Décortiquons la commande :
- `npm create vite@latest` : utilise le CLI de Vite
- `frontend` : nom du dossier à créer
- `--template react` : template React (JSX, pas TypeScript pour l'instant)

### 4. Nettoyer le boilerplate

Vite génère du code de démo. Nettoie pour partir sur une base propre.

**Supprime les fichiers inutiles :**
```bash
rm src/App.css
rm src/assets/react.svg
```

**Simplifie `src/App.jsx` :**

```jsx
function App() {
  return (
    <div>
      <h1>QuickNotes</h1>
      <p>Frontend en construction...</p>
    </div>
  )
}

export default App
```

**Simplifie `src/index.css` (garde juste une base) :**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  padding: 20px;
}
```

### 5. Lancer le serveur de développement

```bash
# Depuis frontend/
npm run dev
```

Ouvre `http://localhost:5173` → tu dois voir "QuickNotes".

### 6. Créer le service API

Crée la structure pour les appels API.

```bash
mkdir -p src/services
```

Crée `frontend/src/services/api.js` :

```javascript
const API_URL = 'http://localhost:8000'

export async function fetchNotes() {
  const response = await fetch(`${API_URL}/notes`)
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des notes')
  }
  return response.json()
}

export async function createNote(note) {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la création de la note')
  }
  return response.json()
}

export async function deleteNote(id) {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression')
  }
}
```

### 7. Afficher les notes dans App.jsx

Modifie `src/App.jsx` pour récupérer et afficher les notes :

```jsx
import { useState, useEffect } from 'react'
import { fetchNotes } from './services/api'

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      setLoading(true)
      const data = await fetchNotes()
      setNotes(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error}</p>

  return (
    <div>
      <h1>QuickNotes</h1>

      {notes.length === 0 ? (
        <p>Aucune note. Crée-en une via l'API !</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              {note.content && <p>{note.content}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
```

### 8. Tester la connexion

1. **Lance le backend** (dans un terminal) :
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Lance le frontend** (dans un autre terminal) :
   ```bash
   cd frontend
   npm run dev
   ```

3. **Crée une note via Swagger** : `http://localhost:8000/docs`
   - POST /notes avec `{"title": "Test", "content": "Hello"}`

4. **Rafraîchis le frontend** : `http://localhost:5173`
   - Tu dois voir ta note !

### 9. Commit

```bash
# Depuis la racine du projet
git add backend/app/main.py frontend/
git commit -m "feat: setup React frontend with Vite and API connection"
```

## Code de référence

### Pattern async/await avec useEffect

```jsx
// FAUX - useEffect ne peut pas être async directement
useEffect(async () => {
  const data = await fetchNotes()  // ❌ Ne fais pas ça
}, [])

// CORRECT - définir une fonction async à l'intérieur
useEffect(() => {
  async function load() {
    const data = await fetchNotes()
    setNotes(data)
  }
  load()
}, [])

// CORRECT - ou en version condensée
useEffect(() => {
  fetchNotes().then(setNotes)
}, [])
```

### Gestion d'état loading/error/data

```jsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

// Pattern try/catch/finally
async function loadData() {
  try {
    setLoading(true)
    const result = await fetchSomething()
    setData(result)
    setError(null)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)  // Toujours exécuté
  }
}
```

### Variable d'environnement pour l'URL API

Pour éviter de hardcoder l'URL, tu peux utiliser les variables d'environnement Vite :

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

Crée `.env` dans `frontend/` :
```
VITE_API_URL=http://localhost:8000
```

**Note :** Les variables Vite doivent commencer par `VITE_` pour être exposées au client.

## Pièges courants

### 1. Erreur CORS dans la console

```
Access to fetch at 'http://localhost:8000/notes' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Causes possibles :**
- CORS pas configuré côté FastAPI
- Backend pas redémarré après la modif
- Mauvaise URL dans `allow_origins`

**Solution :** Vérifie que le middleware CORS est bien ajouté et que le backend a redémarré.

### 2. "Failed to fetch" sans erreur CORS

**Cause :** Le backend n'est pas lancé.

**Solution :** Vérifie que uvicorn tourne sur le port 8000.

### 3. Les notes ne s'affichent pas après création

**Cause :** Le frontend ne rafraîchit pas automatiquement.

**Solution :** Pour l'instant, rafraîchis manuellement la page. On ajoutera la création depuis le frontend dans le prochain guide.

### 4. Port 5173 déjà utilisé

```
Error: Port 5173 is already in use
```

**Solution :**
```bash
# Trouver et tuer le processus
lsof -i :5173
kill -9 <PID>

# Ou utiliser un autre port
npm run dev -- --port 3000
```

### 5. Oublier le tableau de dépendances de useEffect

```jsx
// FAUX - se déclenche à chaque render (boucle infinie !)
useEffect(() => {
  fetchNotes().then(setNotes)
})

// CORRECT - se déclenche une seule fois au montage
useEffect(() => {
  fetchNotes().then(setNotes)
}, [])  // ← tableau vide = au montage seulement
```

## Pour aller plus loin

### Documentation
- [Vite - Getting Started](https://vitejs.dev/guide/)
- [React - useEffect](https://react.dev/reference/react/useEffect)
- [FastAPI - CORS](https://fastapi.tiangolo.com/tutorial/cors/)

### Prochaines étapes
- Formulaire pour créer une note
- Bouton supprimer
- Composants séparés (NoteList, NoteItem, NoteForm)
- Styles avec CSS modules ou Tailwind

### Structure cible pour la suite

```
frontend/src/
├── components/
│   ├── NoteList.jsx
│   ├── NoteItem.jsx
│   └── NoteForm.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```

---

## Checklist de validation

- [ ] CORS configuré dans `backend/app/main.py`
- [ ] Backend redémarré et accessible sur `localhost:8000`
- [ ] `frontend/` créé avec Vite
- [ ] `npm run dev` lance le serveur sur `localhost:5173`
- [ ] `src/services/api.js` contient `fetchNotes()`
- [ ] `App.jsx` affiche "Chargement..." puis les notes (ou "Aucune note")
- [ ] Pas d'erreur CORS dans la console du navigateur
- [ ] Créer une note via Swagger → elle apparaît dans le frontend
- [ ] Commit effectué
