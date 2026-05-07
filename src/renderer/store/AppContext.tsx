import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import type { AppState, AppAction, TimerMode, PomodoroSession } from '../types'
import { DEFAULT_SETTINGS } from '../types'

declare global {
  interface Window {
    electronAPI: {
      store: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
      }
      notification: {
        show: (title: string, body: string) => Promise<void>
      }
    }
  }
}

const initialState: AppState = {
  timer: {
    mode: 'focus',
    status: 'stopped',
    timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
    totalDuration: DEFAULT_SETTINGS.focusDuration * 60,
    currentPomodoros: 0
  },
  todos: [],
  sessions: [],
  settings: DEFAULT_SETTINGS
}

function getTimeLeftForMode(mode: TimerMode, settings: AppState['settings']): number {
  switch (mode) {
    case 'focus':
      return settings.focusDuration * 60
    case 'break':
      return settings.breakDuration * 60
    case 'longBreak':
      return settings.longBreakDuration * 60
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, timer: { ...state.timer, status: 'running' } }

    case 'PAUSE_TIMER':
      return { ...state, timer: { ...state.timer, status: 'paused' } }

    case 'RESET_TIMER': {
      const totalDuration = getTimeLeftForMode(state.timer.mode, state.settings)
      return {
        ...state,
        timer: { ...state.timer, status: 'stopped', timeLeft: totalDuration, totalDuration }
      }
    }

    case 'TICK': {
      return { ...state, timer: { ...state.timer, timeLeft: state.timer.timeLeft - 1 } }
    }

    case 'FINISH_SESSION': {
      const newPomodoros =
        state.timer.mode === 'focus'
          ? state.timer.currentPomodoros + 1
          : state.timer.currentPomodoros
      return { ...state, timer: { ...state.timer, status: 'stopped', currentPomodoros: newPomodoros } }
    }

    case 'SWITCH_MODE': {
      const totalDuration = getTimeLeftForMode(action.payload.mode, state.settings)
      return {
        ...state,
        timer: {
          ...state.timer,
          mode: action.payload.mode,
          status: 'stopped',
          timeLeft: totalDuration,
          totalDuration
        }
      }
    }

    case 'ADD_TODO': {
      const newTodo = {
        id: crypto.randomUUID(),
        text: action.payload,
        completed: false,
        createdAt: Date.now(),
        pomodoroCount: 0
      }
      return { ...state, todos: [...state.todos, newTodo] }
    }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        )
      }

    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) }

    case 'INCREMENT_TODO_POMO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, pomodoroCount: t.pomodoroCount + 1 } : t
        )
      }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload }
      return {
        ...state,
        settings: newSettings,
        timer: {
          ...state.timer,
          timeLeft: getTimeLeftForMode(state.timer.mode, newSettings),
          totalDuration: getTimeLeftForMode(state.timer.mode, newSettings)
        }
      }
    }

    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] }

    case 'LOAD_DATA':
      return {
        ...state,
        sessions: action.payload.sessions || [],
        todos: action.payload.todos || [],
        settings: action.payload.settings || DEFAULT_SETTINGS
      }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 主题切换
  useEffect(() => {
    const theme = state.settings.theme
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => {
        document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      }
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [state.settings.theme])

  // 加载持久化数据
  useEffect(() => {
    ;(async () => {
      try {
        const [sessions, todos, settings] = await Promise.all([
          window.electronAPI.store.get('sessions'),
          window.electronAPI.store.get('todos'),
          window.electronAPI.store.get('settings')
        ])
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            sessions: (sessions || []) as PomodoroSession[],
            todos: (todos || []) as PomodoroSession[],
            settings: (settings || DEFAULT_SETTINGS) as PomodoroSession[]
          }
        })
      } catch (err) {
        console.error('Failed to load store data:', err)
      }
    })()
  }, [])

  // 计时器 tick
  useEffect(() => {
    if (state.timer.status === 'running') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.timer.status])

  // 计时结束处理
  useEffect(() => {
    if (state.timer.status === 'running' && state.timer.timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      const now = new Date()
      const session: PomodoroSession = {
        id: crypto.randomUUID(),
        date: now.toISOString().slice(0, 10),
        startTime: now.getTime(),
        duration: state.timer.totalDuration / 60,
        type: state.timer.mode,
        completed: true
      }

      dispatch({ type: 'FINISH_SESSION' })
      dispatch({ type: 'ADD_SESSION', payload: session })

      // 通知
      if (state.timer.mode === 'focus') {
        window.electronAPI.notification.show('番茄钟', '专注时间结束，该休息了！')
      } else {
        window.electronAPI.notification.show('番茄钟', '休息结束，开始专注吧！')
      }
    }
  }, [state.timer.timeLeft, state.timer.status])

  // 保存数据到 electron-store
  useEffect(() => {
    window.electronAPI.store.set('sessions', state.sessions)
  }, [state.sessions])

  useEffect(() => {
    window.electronAPI.store.set('todos', state.todos)
  }, [state.todos])

  useEffect(() => {
    window.electronAPI.store.set('settings', state.settings)
  }, [state.settings])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
