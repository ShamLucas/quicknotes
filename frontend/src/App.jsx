import { useState, useEffect } from "react"
import { fetchNotes, createNote, deleteNote } from "./services/api"

function App() {

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
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
      alert("Le titre est requis")
      return
    }

    try {
      setSubmitting(true)
      await createNote({ title: title.trim(), content: content.trim() || null })

      setTitle("")
      setContent("")

      await loadNotes()
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette note?")) {
      return
    }

    try {
      await deleteNote(id)
      await loadNotes()
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>QuickNotes</h1>

      {/* Formulaire de création de note */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={submitting}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Note"}
        </button>
      </form>

      {/* Liste des notes */}
      {notes.length === 0 ? (
        <p>Aucune note.</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              {note.content && <p>{note.content}</p>}
              <button onClick={() => handleDelete(note.id)}>Supprimer</button>
            </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default App
