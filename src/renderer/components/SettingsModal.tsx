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
    { value: 'dark' as const, label: '深色', color: '#1a1614' },
    { value: 'light' as const, label: '浅色', color: '#f2ede8' },
    { value: 'forest' as const, label: '森林', color: '#162212' },
    { value: 'system' as const, label: '跟随系统', color: '' }
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
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          padding: 32,
          width: 360,
          boxShadow: 'var(--card-shadow)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2
          style={{
            margin: '0 0 24px',
            color: 'var(--text-primary)',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.3px'
          }}
        >
          设置
        </h2>

        {fields.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                color: 'var(--text-muted)',
                fontSize: 12,
                marginBottom: 6,
                letterSpacing: '0.3px'
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
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              color: 'var(--text-muted)',
              fontSize: 12,
              marginBottom: 8,
              letterSpacing: '0.3px'
            }}
          >
            主题
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {themeOptions.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, theme: value })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border:
                    form.theme === value
                      ? '2px solid var(--accent-focus)'
                      : '2px solid transparent',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'border-color 0.2s'
                }}
              >
                {color && (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: color,
                      border: '1px solid var(--border-color)',
                      display: 'inline-block'
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
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              background: 'var(--btn-secondary)',
              transition: 'background 0.2s'
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--accent-focus)',
              transition: 'opacity 0.2s'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
