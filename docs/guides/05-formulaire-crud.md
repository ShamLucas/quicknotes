# 05 - Formulaire et interactions CRUD

## Objectif

Rendre le frontend interactif : créer des notes via un formulaire et les supprimer.

À la fin de ce guide, tu auras :
- Un formulaire pour créer une note
- Un bouton supprimer sur chaque note
- Un CRUD complet fonctionnel (frontend + backend)

## Concepts clés

### Controlled components (composants contrôlés)

En React, un input "contrôlé" a sa valeur gérée par le state :

```jsx
// Contrôlé : React gère la valeur
const [title, setTitle] = useState('')
<input value={title} onChange={(e) => setTitle(e.target.value)} />

// Non contrôlé : le DOM gère la valeur
<input ref={inputRef} />
```

**Pourquoi contrôlé ?**
- Source de vérité unique (le state)
- Facilite la validation
- Permet de réagir aux changements en temps réel

### Gestion des formulaires

Pattern classique :

```jsx
function handleSubmit(e) {
  e.preventDefault()  // Empêche le rechargement de la page
  // ... logique de soumission
}

<form onSubmit={handleSubmit}>
  <input ... />
  <button type="submit">Envoyer</button>
</form>
```

### Mise à jour optimiste vs pessimiste

| Approche | Description | UX |
|----------|-------------|-----|
| **Pessimiste** | Attend la réponse serveur avant de mettre à jour l'UI | Plus lent mais sûr |
| **Optimiste** | Met à jour l'UI immédiatement, rollback si erreur | Plus rapide mais complexe |

Pour ce guide, on utilise l'approche **pessimiste** (plus simple).

## Étapes

### 1. Ajouter la fonction updateNote dans api.js

Tu as déjà `fetchNotes`, `createNote`, `deleteNote`. Ajoute `updateNote` pour être complet.

Modifie `frontend/src/services/api.js` :

```javascript
export async function updateNote(id, note) {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour')
  }
  return response.json()
}
```

### 2. Créer le formulaire de création

Modifie `frontend/src/App.jsx` pour ajouter un formulaire.

**Ajoute les imports et states nécessaires :**

```jsx
import { useState, useEffect } from "react"
import { fetchNotes, createNote, deleteNote } from "./services/api"

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Nouveaux states pour le formulaire
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ... loadNotes reste pareil
```

**Ajoute la fonction de soumission :**

```jsx
async function handleSubmit(e) {
  e.preventDefault()

  if (!title.trim()) {
    alert('Le titre est requis')
    return
  }

  try {
    setSubmitting(true)
    await createNote({ title: title.trim(), content: content.trim() || null })

    // Réinitialiser le formulaire
    setTitle('')
    setContent('')

    // Recharger la liste
    await loadNotes()
  } catch (err) {
    alert('Erreur : ' + err.message)
  } finally {
    setSubmitting(false)
  }
}
```

**Ajoute le formulaire dans le JSX (avant la liste) :**

```jsx
return (
  <div>
    <h1>QuickNotes</h1>

    {/* Formulaire de création */}
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
      </div>
      <div>
        <textarea
          placeholder="Contenu (optionnel)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Création...' : 'Créer la note'}
      </button>
    </form>

    {/* Liste des notes */}
    {notes.length === 0 ? (
      // ... reste du code
```

### 3. Ajouter la suppression

**Ajoute la fonction de suppression :**

```jsx
async function handleDelete(id) {
  if (!confirm('Supprimer cette note ?')) {
    return
  }

  try {
    await deleteNote(id)
    await loadNotes()  // Recharger la liste
  } catch (err) {
    alert('Erreur : ' + err.message)
  }
}
```

**Ajoute le bouton dans chaque note :**

```jsx
<ul>
  {notes.map(note => (
    <li key={note.id}>
      <strong>{note.title}</strong>
      {note.content && <p>{note.content}</p>}
      <button onClick={() => handleDelete(note.id)}>
        Supprimer
      </button>
    </li>
  ))}
</ul>
```

### 4. Code complet de App.jsx

Voici le fichier complet pour référence :

```jsx
import { useState, useEffect } from "react"
import { fetchNotes, createNote, deleteNote } from "./services/api"

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // States pour le formulaire
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }

    try {
      setSubmitting(true)
      await createNote({ title: title.trim(), content: content.trim() || null })
      setTitle('')
      setContent('')
      await loadNotes()
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette note ?')) {
      return
    }

    try {
      await deleteNote(id)
      await loadNotes()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error}</p>

  return (
    <div>
      <h1>QuickNotes</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <textarea
            placeholder="Contenu (optionnel)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Création...' : 'Créer la note'}
        </button>
      </form>

      <hr />

      {notes.length === 0 ? (
        <p>Aucune note.</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              {note.content && <p>{note.content}</p>}
              <button onClick={() => handleDelete(note.id)}>
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
```

### 5. Tester le CRUD complet

1. Lance le backend et le frontend (deux terminaux)
2. Crée une note via le formulaire
3. Vérifie qu'elle apparaît dans la liste
4. Supprime-la
5. Vérifie qu'elle disparaît

### 6. Commit

```bash
git add frontend/src/
git commit -m "feat(frontend): add create and delete interactions"
```

## Code de référence

### Validation côté client

```jsx
// Validation basique
if (!title.trim()) {
  alert('Le titre est requis')
  return
}

// Validation avec état d'erreur (meilleure UX)
const [errors, setErrors] = useState({})

function validate() {
  const newErrors = {}
  if (!title.trim()) newErrors.title = 'Titre requis'
  if (title.length > 100) newErrors.title = 'Titre trop long'
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Désactiver le bouton pendant la soumission

```jsx
<button type="submit" disabled={submitting || !title.trim()}>
  {submitting ? 'Création...' : 'Créer'}
</button>
```

Double protection :
- `submitting` : évite les doubles soumissions
- `!title.trim()` : désactive si le titre est vide

### Raccourci pour les handlers onChange

```jsx
// Version longue
onChange={(e) => setTitle(e.target.value)}

// Si tu as plusieurs champs, tu peux factoriser
const [form, setForm] = useState({ title: '', content: '' })

function handleChange(e) {
  const { name, value } = e.target
  setForm(prev => ({ ...prev, [name]: value }))
}

<input name="title" value={form.title} onChange={handleChange} />
<textarea name="content" value={form.content} onChange={handleChange} />
```

## Pièges courants

### 1. Oublier e.preventDefault()

```jsx
// FAUX - la page se recharge
function handleSubmit(e) {
  createNote({ title })
}

// CORRECT
function handleSubmit(e) {
  e.preventDefault()
  createNote({ title })
}
```

Sans `preventDefault()`, le formulaire déclenche une navigation HTTP classique.

### 2. Modifier le state directement

```jsx
// FAUX - mutation directe
notes.push(newNote)
setNotes(notes)

// CORRECT - nouveau tableau
setNotes([...notes, newNote])
```

React ne détecte pas les mutations. Il faut créer un nouveau tableau/objet.

### 3. Ne pas attendre loadNotes après une action

```jsx
// FAUX - la liste n'est pas à jour
await createNote({ title })
// L'UI montre l'ancienne liste

// CORRECT
await createNote({ title })
await loadNotes()  // Recharge la liste
```

### 4. Oublier de gérer l'état submitting

Sans `submitting`, l'utilisateur peut :
- Cliquer plusieurs fois → plusieurs créations
- Modifier les inputs pendant la requête

### 5. Envoyer des strings vides au lieu de null

```jsx
// FAUX - envoie "" comme content
await createNote({ title, content })

// CORRECT - envoie null si vide
await createNote({
  title: title.trim(),
  content: content.trim() || null
})
```

Le backend attend `null` pour les champs optionnels vides.

## Pour aller plus loin

### Documentation
- [React - Forms](https://react.dev/reference/react-dom/components/form)
- [React - useState](https://react.dev/reference/react/useState)

### Améliorations possibles
- **Édition inline** : cliquer sur une note pour la modifier
- **Feedback visuel** : message "Note créée !" qui disparaît
- **Tri des notes** : par date, par titre
- **Confirmation modale** : au lieu de `confirm()` natif

### Pattern custom hook (plus tard)

```jsx
// hooks/useNotes.js
function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() { ... }
  async function create(note) { ... }
  async function remove(id) { ... }

  return { notes, loading, error, load, create, remove }
}

// App.jsx
function App() {
  const { notes, loading, create, remove } = useNotes()
  // ...
}
```

Permet de réutiliser la logique dans plusieurs composants.

---

## Checklist de validation

- [ ] `updateNote` ajouté dans `api.js`
- [ ] Formulaire avec inputs contrôlés (title, content)
- [ ] `handleSubmit` avec `e.preventDefault()`
- [ ] État `submitting` pour éviter les doubles soumissions
- [ ] Bouton supprimer sur chaque note
- [ ] `confirm()` avant suppression
- [ ] Créer une note → elle apparaît dans la liste
- [ ] Supprimer une note → elle disparaît
- [ ] Pas d'erreur dans la console
- [ ] Commit effectué
