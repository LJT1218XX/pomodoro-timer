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
    <div>
      <h3
        style={{
          margin: '0 0 16px',
          color: 'var(--text-secondary)',
          fontSize: 12,
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}
      >
        待办清单
      </h3>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加待办..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent-focus)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'opacity 0.2s'
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
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-primary)',
              opacity: todo.completed ? 0.4 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
              style={{
                cursor: 'pointer',
                accentColor: 'var(--accent-focus)',
                width: 16,
                height: 16
              }}
            />
            <span
              style={{
                flex: 1,
                color: 'var(--text-primary)',
                fontSize: 13,
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>🍅 {todo.pomodoroCount}</span>
            <button
              onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 15,
                padding: 0,
                opacity: 0.5,
                transition: 'opacity 0.2s'
              }}
            >
              ×
            </button>
          </div>
        ))}
        {state.todos.length === 0 && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 12,
              textAlign: 'center',
              margin: '28px 0',
              lineHeight: 1.6
            }}
          >
            还没有待办事项
          </p>
        )}
      </div>
    </div>
  )
}
