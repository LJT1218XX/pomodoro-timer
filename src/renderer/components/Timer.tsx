import React from 'react'
import ProgressRing from './ProgressRing'
import { useApp } from '../store/AppContext'
import type { TimerMode } from '../types'

const modeLabels: Record<TimerMode, string> = {
  focus: '专注',
  break: '短休息',
  longBreak: '长休息'
}

const modeColors: Record<TimerMode, string> = {
  focus: '#e74c3c',
  break: '#27ae60',
  longBreak: '#2980b9'
}

export default function Timer() {
  const { state, dispatch } = useApp()
  const { timer } = state

  const minutes = Math.floor(Math.max(timer.timeLeft, 0) / 60)
  const seconds = Math.max(timer.timeLeft, 0) % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = timer.totalDuration > 0 ? 1 - timer.timeLeft / timer.totalDuration : 0

  const handleStart = () => dispatch({ type: 'START_TIMER' })
  const handlePause = () => dispatch({ type: 'PAUSE_TIMER' })
  const handleReset = () => dispatch({ type: 'RESET_TIMER' })
  const handleModeSwitch = (mode: TimerMode) => dispatch({ type: 'SWITCH_MODE', payload: { mode } })

  const isRunning = timer.status === 'running'
  const isStopped = timer.status === 'stopped'

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}
      >
        {(Object.keys(modeLabels) as TimerMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => handleModeSwitch(mode)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border:
                timer.mode === mode
                  ? `2px solid ${modeColors[mode]}`
                  : '2px solid transparent',
              background: timer.mode === mode ? modeColors[mode] : 'transparent',
              color: timer.mode === mode ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s'
            }}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <ProgressRing progress={progress} color={modeColors[timer.mode]} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 48,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {display}
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={isRunning ? handlePause : handleStart}
          style={{
            padding: '10px 28px',
            borderRadius: 8,
            border: 'none',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            background: modeColors[timer.mode],
            transition: 'all 0.2s',
            opacity: isRunning || isStopped ? 1 : 0.6
          }}
        >
          {isRunning ? '暂停' : isStopped ? '开始' : '继续'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 28px',
            borderRadius: 8,
            border: 'none',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            background: 'var(--btn-secondary)',
            transition: 'all 0.2s'
          }}
        >
          重置
        </button>
      </div>

      <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>
        今日已完成{' '}
        {state.sessions.filter(
          s =>
            s.date === new Date().toISOString().slice(0, 10) &&
            s.type === 'focus' &&
            s.completed
        ).length }{' '}
        个番茄
      </p>
    </div>
  )
}
