import { useState, useEffect } from "react"
import { fetchNotes } from "./services/api"

function App() {

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await fetchNotes()
      setNotes(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>QuickNotes</h1>
      
      {notes.length === 0 ? (
        <p>Aucune note.</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <strong>{note.id}</strong>
              {note.content && <p>{note.content}</p>}
            </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default App
