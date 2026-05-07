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
  focus: '#d46a3e',
  break: '#4a9e6a',
  longBreak: '#4a8fbf'
}

export default function Timer() {
  const { state, dispatch } = useApp()
  const { timer } = state

  const minutes = Math.floor(Math.max(timer.timeLeft, 0) / 60)
  const seconds = Math.max(timer.timeLeft, 0) % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = timer.totalDuration > 0 ? 1 - timer.timeLeft / timer.totalDuration : 0

  const isRunning = timer.status === 'running'
  const isStopped = timer.status === 'stopped'

  return (
    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
      {/* Mode pills */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
          marginBottom: 32,
          background: 'var(--bg-secondary)',
          padding: 3,
          borderRadius: 10
        }}
      >
        {(Object.keys(modeLabels) as TimerMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'SWITCH_MODE', payload: { mode } })}
            className={`pill-btn ${timer.mode === mode ? 'pill-active' : ''}`}
            style={{
              padding: '7px 20px',
              borderRadius: 7,
              border: 'none',
              background: timer.mode === mode ? modeColors[mode] : 'transparent',
              color: timer.mode === mode ? '#fff' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: timer.mode === mode ? 600 : 400,
              cursor: timer.status === 'stopped' ? 'pointer' : 'default',
              opacity: timer.status !== 'stopped' && timer.mode !== mode ? 0.4 : 1,
              letterSpacing: '0.3px'
            }}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <ProgressRing progress={progress} color={modeColors[timer.mode]} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 300,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '4px',
              lineHeight: 1
            }}
          >
            {display}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            {timer.status === 'running'
              ? '进行中'
              : timer.status === 'paused'
                ? '已暂停'
                : '准备就绪'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 32, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          onClick={() =>
            isRunning
              ? dispatch({ type: 'PAUSE_TIMER' })
              : dispatch({ type: 'START_TIMER' })
          }
          className={`btn-primary ${isStopped ? 'btn-start' : ''}`}
          style={{
            padding: '12px 36px',
            borderRadius: 10,
            border: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            background: modeColors[timer.mode],
            opacity: isRunning || isStopped ? 1 : 0.7,
            letterSpacing: '0.5px',
            boxShadow: `0 4px 16px ${modeColors[timer.mode]}33`
          }}
        >
          {isRunning ? '暂停' : isStopped ? '开始' : '继续'}
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET_TIMER' })}
          className="btn-secondary-hover"
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 14,
            cursor: 'pointer',
            background: 'var(--btn-secondary)'
          }}
        >
          重置
        </button>
      </div>

      {/* Today count */}
      <p
        style={{
          marginTop: 24,
          color: 'var(--text-muted)',
          fontSize: 13,
          letterSpacing: '0.3px'
        }}
      >
        今日已完成{' '}
        <span style={{ color: modeColors.focus, fontWeight: 600 }}>
          {state.sessions.filter(
            s =>
              s.date === new Date().toISOString().slice(0, 10) &&
              s.type === 'focus' &&
              s.completed
          ).length }
        </span>{' '}
        个番茄
      </p>
    </div>
  )
}
