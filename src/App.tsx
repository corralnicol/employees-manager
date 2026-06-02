import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'
import './App.css'

type Todo = {
  id: string | number
  name: string | null
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos, error } = await supabase.from('todos').select()

      if (error) {
        console.error('Failed to load todos', error)
        return
      }

      setTodos((todos ?? []) as Todo[])
    }

    getTodos()
  }, [])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name ?? 'Untitled todo'}</li>
      ))}
    </ul>
  )
}
