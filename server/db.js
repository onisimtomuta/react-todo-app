import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'db.json')

export function readTodos() {
  if (!fs.existsSync(DB_FILE)) {
    return []
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeTodos(todos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(todos, null, 2))
}
