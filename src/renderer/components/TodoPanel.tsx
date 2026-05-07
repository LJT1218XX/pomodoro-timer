import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../store/AppContext'

function EditableTodo({ todo }: { todo: ReturnType<typeof useApp>['state']['todos'][number] }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)
  const { dispatch } = useApp()

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = () => {
    if (text.trim() && text !== todo.text) {
      dispatch({ type: 'DELETE_TODO', payload: todo.id })
      dispatch({ type: 'ADD_TODO', payload: text.trim() })
    }
    setEditing(false)
  }

  return (
    <div
      className="todo-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--bg-primary)',
        opacity: todo.completed ? 0.4 : 1
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
          height: 16,
          flexShrink: 0
        }}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') { setText(todo.text); setEditing(false) }
          }}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            borderBottom: '1px solid var(--accent-focus)',
            padding: '1px 0'
          }}
        />
      ) : (
        <span
          onDoubleClick={() => !todo.completed && setEditing(true)}
          style={{
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: 13,
            textDecoration: todo.completed ? 'line-through' : 'none',
            cursor: todo.completed ? 'default' : 'pointer'
          }}
          title="双击编辑"
        >
          {todo.text}
        </span>
      )}
      <span style={{ color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 }}>🍅 {todo.pomodoroCount}</span>
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
          transition: 'opacity 0.2s',
          flexShrink: 0
        }}
        title="删除"
      >
        ×
      </button>
    </div>
  )
}

export default function TodoPanel() {
  const { state, dispatch } = useApp()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_TODO', payload: input.trim() })
      setInput('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  // 自动排序：未完成的在前，已完成的在后
  const sortedTodos = [...state.todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return a.createdAt - b.createdAt
  })

  const emptyQuotes = [
    '写下第一个任务吧',
    '专注从计划开始',
    '今天想完成什么？',
    '番茄钟准备好了',
  ]
  const emptyText = emptyQuotes[Math.floor(Math.random() * emptyQuotes.length)]

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
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加待办，回车即创建"
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
          title="添加"
        >
          +
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sortedTodos.map(todo => (
          <EditableTodo key={todo.id} todo={todo} />
        ))}
        {state.todos.length === 0 && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 13,
              textAlign: 'center',
              margin: '32px 0',
              lineHeight: 1.8,
              letterSpacing: '0.3px'
            }}
          >
            {emptyText}
            <br />
            <span style={{ fontSize: 11, opacity: 0.6 }}>回车快速添加 · 双击可编辑</span>
          </p>
        )}
      </div>
    </div>
  )
}
