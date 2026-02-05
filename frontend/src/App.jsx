import { useState, useEffect } from "react"
import { fetchNotes, createNote, deleteNote, updateNote, fetchTags, createTag } from "./services/api"
import './App.css'

function App() {

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [editingNote, setEditingNote] = useState(null)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [newTagName, setNewTagName] = useState("")

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

  async function handleCreateTag() {
    if (!newTagName.trim()) return

    try {
      const newTag = await createTag({ name: newTagName.trim() })
      setTags([...tags, newTag])
      setNewTagName("")
    } catch (err) {
      alert("Failed to create tag: " + err.message)
    }
  }

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

      if (editingNote) {
        // Mode édition
        await updateNote(
          editingNote.id, { 
            title: title.trim(), 
            content: content.trim() || null 
          })
      } else {
        // Mode création
        await createNote({ 
          title: title.trim(), 
          content: content.trim() || null,
          tags_ids: selectedTags 
        })
      }

      // Reset form
      setEditingNote(null)
      setTitle("")
      setContent("")
      setSelectedTags([])
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

  async function handleEdit(note) {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content || "")
    setSelectedTags(note.tags ? note.tags.map(tag => tag.id) : [])
  }

  async function handleCancel() {
    setEditingNote(null)
    setTitle("")
    setContent("")
    setSelectedTags([])
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="app">
      <header className="header">
        <h1>QuickNotes</h1>
      </header>

      <main className="main">
        <section className="form-section">
          {/* Formulaire de création de note */}
          <form onSubmit={handleSubmit} className="note-form">
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
            <div className="tag-selector">
              {tags.map(tag => (
                <label key={tag.id}>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id])
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id))
                      }
                    }}
                    />
                  {tag.name}
                </label>
              ))}
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingNote ? "Update Note" : "Add Note"}
            </button>

            {editingNote && (
              <button className="btn-cancel" type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </button>
            )}
          </form>

          </section>

          <section className="notes-section">
            <h2>Notes</h2>

            {/* Liste des notes */}
            {notes.length === 0 ? (
              <p>Aucune note.</p>
              ) : (
              <ul className="notes-list">
                {notes.map(note => (
                  <li key={note.id} onClick={() => handleEdit(note)} style={{ cursor: "pointer" }}>
                    <strong>{note.title}</strong>
                    {note.tags && note.tags.length > 0 && (
                      <span className="tags">
                        {note.tags.map(tag => (
                          <span key={tag.id} className="tag">{tag.name}</span>))}
                      </span>
                    )}
                    {note.content && <p>{note.content}</p>}
                    <button className="btn-delete" onClick={(e) => { e.stopPropagation(); 
                      handleDelete(note.id); }}>
                        Supprimer
                    </button>
                  </li>
                  ))}
              </ul>
            )}
          </section>
        </main>
    </div>
  )
}

export default App