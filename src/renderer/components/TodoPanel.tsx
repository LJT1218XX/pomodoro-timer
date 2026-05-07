import React, { useState } from 'react'
import { useApp } from '../store/AppContext'

export default function TodoPanel() {
  const { state, dispatch } = useApp()
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_TODO', payload: input.trim() })
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <h3 style={{ margin: '0 0 12px', color: '#ccc', fontSize: 16 }}>待办清单</h3>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加待办..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #444',
            background: '#1a1a1a',
            color: '#eee',
            fontSize: 14,
            outline: 'none'
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#e74c3c',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 18
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {state.todos.map(todo => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 6,
              background: '#1a1a1a',
              opacity: todo.completed ? 0.5 : 1
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
              style={{ cursor: 'pointer', accentColor: '#e74c3c' }}
            />
            <span
              style={{
                flex: 1,
                color: '#ddd',
                fontSize: 14,
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </span>
            <span style={{ color: '#888', fontSize: 12 }}>🍅 {todo.pomodoroCount}</span>
            <button
              onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: 16,
                padding: 0
              }}
            >
              ×
            </button>
          </div>
        ))}
        {state.todos.length === 0 && (
          <p style={{ color: '#555', fontSize: 13, textAlign: 'center', margin: '20px 0' }}>
            还没有待办事项
          </p>
        )}
      </div>
    </div>
  )
}
