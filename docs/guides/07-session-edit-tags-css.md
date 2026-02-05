# Session 4 : Édition, Tags Frontend, CSS

## Vue d'ensemble

| Bloc | Durée | Objectif |
|------|-------|----------|
| 1 | ~45min | Édition de notes |
| 2 | ~1h | Intégration tags frontend |
| 3 | ~45min | CSS propre |

---

# Bloc 1 : Édition de notes

## Objectif

Cliquer sur une note → le formulaire se pré-remplit → modifier → sauvegarder.

## Concepts clés

### Mode formulaire

Tu as besoin de distinguer deux états :
- **Mode création** : formulaire vide, submit → `createNote`
- **Mode édition** : formulaire pré-rempli, submit → `updateNote`

Pattern classique : un state `editingNote` qui contient soit `null` (création) soit l'objet note (édition).

### UX à décider

Quand on clique sur une note :
- Option A : Remplacer le formulaire de création par un formulaire d'édition
- Option B : Afficher un formulaire inline dans la note
- **Recommandé pour commencer** : Option A (plus simple)

---

## Étapes

### 1. Ajouter l'état `editingNote`

```jsx
const [editingNote, setEditingNote] = useState(null)
```

### 2. Modifier le comportement du formulaire

Le `handleSubmit` doit :
- Si `editingNote` est null → `createNote`
- Sinon → `updateNote(editingNote.id, {...})`

### 3. Pré-remplir le formulaire quand on édite

Quand on clique sur une note :
```jsx
function handleEdit(note) {
  setEditingNote(note)
  setTitle(note.title)
  setContent(note.content || "")
}
```

### 4. Réinitialiser après save

Après un save réussi :
```jsx
setEditingNote(null)
setTitle("")
setContent("")
```

### 5. Ajouter un bouton "Annuler"

Visible uniquement en mode édition, remet le formulaire en mode création.

### 6. Importer `updateNote`

Tu l'as déjà dans `api.js`, il faut juste l'importer dans `App.jsx`.

---

## Code de référence

### handleSubmit modifié

```jsx
async function handleSubmit(e) {
  e.preventDefault()

  if (!title.trim()) {
    alert("Le titre est requis")
    return
  }

  try {
    setSubmitting(true)

    if (editingNote) {
      // Mode édition
      await updateNote(editingNote.id, {
        title: title.trim(),
        content: content.trim() || null
      })
    } else {
      // Mode création
      await createNote({
        title: title.trim(),
        content: content.trim() || null
      })
    }

    // Reset
    setEditingNote(null)
    setTitle("")
    setContent("")
    await loadNotes()

  } catch (err) {
    alert("Erreur: " + err.message)
  } finally {
    setSubmitting(false)
  }
}
```

### Bouton dynamique

```jsx
<button type="submit" disabled={submitting}>
  {submitting
    ? "Saving..."
    : editingNote
      ? "Update"
      : "Add Note"}
</button>

{editingNote && (
  <button type="button" onClick={handleCancel}>
    Cancel
  </button>
)}
```

### Rendre la note cliquable

```jsx
<li key={note.id} onClick={() => handleEdit(note)} style={{cursor: 'pointer'}}>
```

**Attention** : Le bouton "Supprimer" est dans le `<li>`, donc son clic va aussi déclencher `handleEdit`. Il faut stopper la propagation :

```jsx
<button onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}>
  Supprimer
</button>
```

---

## Pièges courants

1. **Oublier `e.stopPropagation()`** sur le bouton delete → cliquer sur "Supprimer" ouvre aussi le mode édition

2. **Ne pas réinitialiser `editingNote`** après save → le formulaire reste en mode édition

3. **Confondre `updateNote` et `createNote`** dans le if/else

---

# Bloc 2 : Intégration tags frontend

## Objectif

- Afficher les tags de chaque note
- Permettre d'ajouter des tags à la création/édition

## Concepts clés

### Ce que l'API retourne déjà

Selon ton schéma backend, `GET /notes` retourne :
```json
{
  "id": 1,
  "title": "Ma note",
  "content": "...",
  "tags": [{"id": 1, "name": "urgent"}, {"id": 2, "name": "dev"}]
}
```

### Ce que l'API attend

Pour créer/modifier une note avec des tags :
```json
{
  "title": "Ma note",
  "content": "...",
  "tag_ids": [1, 2]
}
```

---

## Étapes

### 1. Ajouter une fonction API pour les tags

Dans `api.js` :

```js
export async function fetchTags() {
  const response = await fetch(`${API_URL}/tags`)
  if (!response.ok) throw new Error('Failed to fetch tags')
  return response.json()
}

export async function createTag(name) {
  const response = await fetch(`${API_URL}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  if (!response.ok) throw new Error('Failed to create tag')
  return response.json()
}
```

### 2. Charger les tags au démarrage

```jsx
const [tags, setTags] = useState([])
const [selectedTagIds, setSelectedTagIds] = useState([])

useEffect(() => {
  loadNotes()
  loadTags()
}, [])

async function loadTags() {
  try {
    const data = await fetchTags()
    setTags(data)
  } catch (err) {
    console.error("Failed to load tags:", err)
  }
}
```

### 3. Afficher les tags d'une note

Dans la liste :
```jsx
<li key={note.id}>
  <strong>{note.title}</strong>
  {note.tags && note.tags.length > 0 && (
    <span className="tags">
      {note.tags.map(tag => (
        <span key={tag.id} className="tag">{tag.name}</span>
      ))}
    </span>
  )}
  ...
</li>
```

### 4. Sélectionner des tags dans le formulaire

Approche simple : checkboxes

```jsx
<div className="tag-selector">
  {tags.map(tag => (
    <label key={tag.id}>
      <input
        type="checkbox"
        checked={selectedTagIds.includes(tag.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedTagIds([...selectedTagIds, tag.id])
          } else {
            setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id))
          }
        }}
      />
      {tag.name}
    </label>
  ))}
</div>
```

### 5. Envoyer les tag_ids au submit

```jsx
await createNote({
  title: title.trim(),
  content: content.trim() || null,
  tag_ids: selectedTagIds
})
```

### 6. Pré-remplir les tags en mode édition

```jsx
function handleEdit(note) {
  setEditingNote(note)
  setTitle(note.title)
  setContent(note.content || "")
  setSelectedTagIds(note.tags ? note.tags.map(t => t.id) : [])
}
```

### 7. Réinitialiser les tags après save

```jsx
setSelectedTagIds([])
```

---

## Bonus : Créer un tag à la volée

Si tu veux permettre de créer un nouveau tag depuis le formulaire :

```jsx
const [newTagName, setNewTagName] = useState("")

async function handleCreateTag() {
  if (!newTagName.trim()) return

  try {
    const tag = await createTag(newTagName.trim())
    setTags([...tags, tag])
    setSelectedTagIds([...selectedTagIds, tag.id])
    setNewTagName("")
  } catch (err) {
    alert("Erreur: " + err.message)
  }
}
```

---

## Pièges courants

1. **Oublier de reset `selectedTagIds`** après submit

2. **`tag_ids` vs `tags`** : l'API attend `tag_ids` (liste d'entiers), pas `tags` (liste d'objets)

3. **Tags non chargés** : si `loadTags` échoue silencieusement, les checkboxes seront vides

---

# Bloc 3 : CSS propre

## Objectif

Layout lisible, pas fancy mais clean. Pas de framework CSS, juste du CSS vanilla.

## Concepts clés

### Structure visuelle cible

```
+------------------------------------------+
|  QuickNotes                              |
+------------------------------------------+
|  [Formulaire]                            |
|  Titre: [________________]               |
|  Content: [______________]               |
|  Tags: [ ] urgent [ ] dev [+]            |
|  [Add Note]                              |
+------------------------------------------+
|  Notes                                   |
|  +------------------------------------+  |
|  | Ma première note          urgent   |  |
|  | Contenu de la note...              |  |
|  |                        [Supprimer] |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | Autre note                    dev  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

---

## Étapes

### 1. Créer `frontend/src/App.css`

### 2. L'importer dans `App.jsx`

```jsx
import './App.css'
```

### 3. Structurer le HTML avec des classes

```jsx
<div className="app">
  <header className="header">
    <h1>QuickNotes</h1>
  </header>

  <main className="main">
    <section className="form-section">
      <form onSubmit={handleSubmit} className="note-form">
        ...
      </form>
    </section>

    <section className="notes-section">
      <h2>Notes</h2>
      <ul className="notes-list">
        ...
      </ul>
    </section>
  </main>
</div>
```

---

## Code de référence CSS

### Reset et base

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.5;
}
```

### Layout

```css
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
}
```

### Formulaire

```css
.note-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.note-form input,
.note-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.note-form textarea {
  min-height: 100px;
  resize: vertical;
}

.note-form button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.note-form button:hover {
  background: #2980b9;
}

.note-form button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
```

### Liste de notes

```css
.notes-list {
  list-style: none;
}

.notes-list li {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.notes-list li:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

### Tags

```css
.tag {
  display: inline-block;
  background: #e8f4f8;
  color: #2980b9;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 5px;
}

.tag-selector {
  margin: 10px 0;
}

.tag-selector label {
  margin-right: 15px;
  cursor: pointer;
}
```

### Boutons d'action

```css
.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-cancel {
  background: #95a5a6;
  margin-left: 10px;
}
```

---

## Pièges courants

1. **Oublier `box-sizing: border-box`** → les padding cassent les widths

2. **CSS non importé** → rien ne s'applique

3. **Spécificité** : si un style ne s'applique pas, vérifie qu'il n'est pas overridé

4. **Flexbox oublié** : pour aligner titre + tags sur la même ligne :
   ```css
   .note-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
   }
   ```

---

## Checklist fin de session

- [ ] Clic sur note → formulaire pré-rempli
- [ ] Update fonctionne
- [ ] Bouton Annuler remet en mode création
- [ ] Tags affichés sur chaque note
- [ ] Sélection de tags dans le formulaire
- [ ] tag_ids envoyés à l'API
- [ ] CSS appliqué, layout propre
- [ ] Commit final fait
