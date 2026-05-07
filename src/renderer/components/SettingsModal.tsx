import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Settings } from '../types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState<Settings>(state.settings)

  if (!open) return null

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    onClose()
  }

  const fields = [
    { key: 'focusDuration' as const, label: '专注时长（分钟）' },
    { key: 'breakDuration' as const, label: '短休息时长（分钟）' },
    { key: 'longBreakDuration' as const, label: '长休息时长（分钟）' },
    { key: 'longBreakInterval' as const, label: '长休息间隔（番茄数）' }
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#222',
          borderRadius: 12,
          padding: 28,
          width: 340
        }}
      >
        <h2 style={{ margin: '0 0 20px', color: '#eee', fontSize: 18 }}>设置</h2>

        {fields.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: 13,
                marginBottom: 4
              }}
            >
              {label}
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={form[key]}
              onChange={e =>
                setForm({ ...form, [key]: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#eee',
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginTop: 20
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              background: '#444'
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              background: '#e74c3c'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
