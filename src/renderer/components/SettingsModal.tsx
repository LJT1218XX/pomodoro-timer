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

  const themeOptions = [
    { value: 'dark' as const, label: '深色', color: '#121212' },
    { value: 'light' as const, label: '浅色', color: '#f5f5f5' },
    { value: 'forest' as const, label: '森林', color: '#1a2e1a' },
    { value: 'system' as const, label: '跟随系统', color: '' },
  ]

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
        background: 'var(--modal-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 28,
          width: 340
        }}
      >
        <h2 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: 18 }}>设置</h2>

        {fields.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                color: 'var(--text-muted)',
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
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
        ))}

        {/* 主题选择 */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              color: 'var(--text-muted)',
              fontSize: 13,
              marginBottom: 8
            }}
          >
            主题
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {themeOptions.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, theme: value })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border:
                    form.theme === value
                      ? '2px solid var(--accent-focus)'
                      : '2px solid transparent',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {color && (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: color,
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'inline-block',
                    }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

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
              color: 'var(--text-primary)',
              fontSize: 14,
              cursor: 'pointer',
              background: 'var(--bg-hover)'
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
