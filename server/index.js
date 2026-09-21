import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { readTodos, writeTodos } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/todos', (req, res) => {
  const todos = readTodos()
  res.json(todos)
})

app.post('/api/todos', (req, res) => {
  const text = (req.body.text || '').trim()
  if (!text) {
    return res.status(400).json({ error: 'Textul nu poate fi gol.' })
  }
  const todos = readTodos()
  const newTodo = { id: Date.now(), text, done: false }
  todos.push(newTodo)
  writeTodos(todos)
  res.status(201).json(newTodo)
})

app.put('/api/todos/reorder', (req, res) => {
  const { orderedIds } = req.body
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'Format invalid.' })
  }

  const todos = readTodos()
  const byId = new Map(todos.map((t) => [Number(t.id), t]))
  const reordered = orderedIds.map((id) => byId.get(Number(id))).filter(Boolean)

  writeTodos(reordered)
  res.json(reordered)
})

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todos = readTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'Todo inexistent.' })
  }
  if (typeof req.body.text === 'string') {
    const trimmed = req.body.text.trim()
    if (!trimmed) return res.status(400).json({ error: 'Textul nu poate fi gol.' })
    todos[index].text = trimmed
  }
  if (typeof req.body.done === 'boolean') {
    todos[index].done = req.body.done
  }
  writeTodos(todos)
  res.json(todos[index])
})

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todos = readTodos()
  const filtered = todos.filter((t) => t.id !== id)
  writeTodos(filtered)
  res.status(204).end()
})

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`)
})
export default app