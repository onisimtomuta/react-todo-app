import { useState, useEffect } from 'react'

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Ceva nu a mers bine.')
  }
  if (res.status === 204) return null
  return res.json()
}

export default function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/todos')
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    try {
      const newTodo = await api('/todos', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed }),
      })
      setTodos([...todos, newTodo])
      setText('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteTodo(id) {
    const previous = todos
    setTodos(todos.filter((t) => t.id !== id))
    try {
      await api(`/todos/${id}`, { method: 'DELETE' })
    } catch (err) {
      setError(err.message)
      setTodos(previous)
    }
  }

  async function toggleDone(id) {
    const target = todos.find((t) => t.id === id)
    const previous = todos
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    try {
      await api(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ done: !target.done }),
      })
    } catch (err) {
      setError(err.message)
      setTodos(previous)
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  async function saveEdit(id) {
    const trimmed = editingText.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    const previous = todos
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t)))
    setEditingId(null)
    try {
      await api(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ text: trimmed }),
      })
    } catch (err) {
      setError(err.message)
      setTodos(previous)
    }
  }

  async function moveTodo(index, direction) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= todos.length) return
    const previous = todos
    const updated = [...todos]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setTodos(updated)
    try {
      await api('/todos/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds: updated.map((t) => t.id) }),
      })
    } catch (err) {
      setError(err.message)
      setTodos(previous)
    }
  }

  const remaining = todos.filter((t) => !t.done).length

  return (
    <div className="page">
      <div className="grid-bg" aria-hidden="true" />
      <main className="panel">
        <header className="panel-header">
          <h1>
            Sarcini<span className="dot">.</span>
          </h1>
          <p className="subtitle">
            {loading
              ? 'se sincronizează cu serverul...'
              : todos.length === 0
              ? 'Nimic încă. Adaugă primul task mai jos.'
              : `${remaining} / ${todos.length} active`}
          </p>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)} aria-label="Închide eroarea">
              ✕
            </button>
          </div>
        )}

        <form className="add-form" onSubmit={addTodo}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="adaugă o sarcină nouă..."
            aria-label="Todo nou"
          />
          <button type="submit">adaugă</button>
        </form>

        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.id} className={todo.done ? 'todo done' : 'todo'}>
              <span className="index">{String(index + 1).padStart(2, '0')}</span>

              <button
                className="check"
                aria-label="Marchează ca terminat"
                onClick={() => toggleDone(todo.id)}
              >
                {todo.done && <span className="check-mark">✓</span>}
              </button>

              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  type="text"
                  value={editingText}
                  autoFocus
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <span className="todo-text" onDoubleClick={() => startEdit(todo)}>
                  {todo.text}
                </span>
              )}

              <div className="todo-actions">
                <button
                  className="icon-btn"
                  onClick={() => moveTodo(index, -1)}
                  disabled={index === 0}
                  aria-label="Mută mai sus"
                >
                  ↑
                </button>
                <button
                  className="icon-btn"
                  onClick={() => moveTodo(index, 1)}
                  disabled={index === todos.length - 1}
                  aria-label="Mută mai jos"
                >
                  ↓
                </button>
                <button className="icon-btn" onClick={() => startEdit(todo)} aria-label="Editează">
                  ✎
                </button>
                <button
                  className="icon-btn delete"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Șterge"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
