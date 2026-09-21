import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'todos.json')
  : path.join(__dirname, 'todos.json')

export function readTodos() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialPath = path.join(__dirname, 'todos.json')
      if (fs.existsSync(initialPath)) {
        const initialData = fs.readFileSync(initialPath, 'utf-8')
        fs.writeFileSync(DATA_FILE, initialData, 'utf-8')
        return JSON.parse(initialData)
      }
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function writeTodos(todos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8')
  } catch (err) {
    console.error('Eroare la scriere:', err)
  }
}