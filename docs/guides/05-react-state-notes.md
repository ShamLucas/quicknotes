# React State & Lifecycle - Notes d'apprentissage

Questions/réponses issues de l'exploration du composant `App.jsx`.

---

## useState - Gestion de l'état

### La syntaxe de base

```jsx
const [notes, setNotes] = useState([])
//       ↑        ↑              ↑
//    valeur   fonction      valeur initiale
//   actuelle  de mise       (1er rendu seulement)
//             à jour
```

**Q : Quand je survole `notes`, TypeScript affiche `never[]`. Que signifie ce type ?**

C'est un tableau qui "ne contient jamais d'éléments" selon TypeScript. Cela arrive parce que TypeScript ne peut pas déduire le type des éléments à partir d'un tableau vide `[]`. Pour corriger, on pourrait typer explicitement : `useState<Note[]>([])`.

**Q : Comment TypeScript devine-t-il que c'est un tableau ?**

Par inférence de type : la valeur initiale est `[]`, donc TypeScript déduit que la variable est un tableau.

**Q : `notes` est-il un composant ?**

Non. `notes` est une **variable d'état** qui appartient au composant `App`. Le composant, c'est la fonction `App` elle-même. On déclare ici 6 variables d'état (`notes`, `loading`, `error`, `title`, `content`, `submitting`), leurs fonctions de mise à jour, et leurs valeurs initiales.

**Q : Qu'est-ce que le "state" dans React ?**

Le state, c'est l'ensemble des variables d'état déclarées avec `useState` dans un composant. Quand le state change, React re-rend le composant.

---

## useEffect - Cycle de vie

```jsx
useEffect(() => {
  loadNotes()
}, [])
```

**Q : Que signifie le tableau vide `[]` ?**

C'est le tableau des dépendances. Vide = l'effet s'exécute une seule fois, après le premier rendu. C'est l'équivalent de "au chargement de la page".

**Q : À quel moment du cycle de vie useEffect s'exécute-t-il ?**

Après le rendu du composant. Avec `[]`, cela donne :
1. Premier rendu (avec état initial)
2. useEffect s'exécute → appelle `loadNotes()`
3. `loadNotes()` met à jour l'état avec `setNotes()`
4. Deuxième rendu (avec les notes chargées)

**Q : Pourquoi ça ne crée pas une boucle infinie de rendus ?**

Parce que `useEffect` avec `[]` ne s'exécute qu'une seule fois. Si on avait mis `[notes]` comme dépendance, là oui, chaque mise à jour de `notes` déclencherait l'effet, qui rechargerait les notes, qui déclencherait l'effet... boucle infinie.

---

## async/await vs Promises

```jsx
// Version async/await
async function loadNotes() {
  const data = await fetchNotes()
  setNotes(data)
}

// Version Promise
function loadNotes() {
  fetchNotes().then(data => setNotes(data))
}
```

**Q : Quelle différence entre les deux ?**

Fonctionnellement, aucune. Les deux font la même chose.

**Q : Alors pourquoi utiliser async/await ?**

Pour la lisibilité quand il y a plusieurs opérations asynchrones enchaînées. Le code se lit de haut en bas, comme du code synchrone. Dans un cas simple comme ici, c'est surtout une question de convention d'équipe.

---

## Événements

```jsx
<input onChange={e => setTitle(e.target.value)} />
```

**Q : C'est quoi `e` ?**

L'objet événement (Event). Ici, c'est l'événement "changement de valeur de l'input". `e.target` est l'élément HTML qui a déclenché l'événement, et `e.target.value` est sa valeur actuelle.

---

## Récapitulatif du flux de données

```
Page load
    ↓
Premier rendu (notes = [], loading = true)
    ↓
useEffect déclenché
    ↓
loadNotes() appelé
    ↓
API appelée (fetchNotes)
    ↓
setNotes(data) + setLoading(false)
    ↓
Deuxième rendu (notes = [...], loading = false)
```
