# Pomodoro Timer 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Electron + React + TypeScript 的桌面番茄钟应用

**Architecture:** electron-vite 脚手架，React 渲染进程 + 主进程 IPC 通信。使用 Context+Reducer 管理计时/待办/设置状态，electron-store 持久化数据，recharts 渲染统计图表。

**Tech Stack:** electron-vite, React 18, TypeScript, electron-store, recharts, electron-builder

---

### Task 1: 脚手架初始化

- [ ] **Step 1: 使用 electron-vite 脚手架创建项目**

```bash
# 项目根目录为 E:/Code/Cursor/Timer（当前目录）
# 所有文件直接放在当前目录下，不使用子目录
# 注意：已有 docs/superpowers/ 目录（spec 和 plan 文件），保留它们

pnpm create @quick-start/electron . -- --template react-ts
```

- [ ] **Step 2: 安装依赖**

```bash
pnpm add electron-store recharts
pnpm add -D @types/electron-store
```

- [ ] **Step 3: 清理模板文件，保留基础骨架**

删除模板自带的示例文件，保留：
- `electron/main.ts`
- `electron/preload.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.html`
- `package.json`

- [ ] **Step 4: 创建项目目录结构**

```bash
mkdir -p src/components src/store src/types resources/sounds
```

- [ ] **Step 5: 初始化 git 并连接远程仓库并提交**

```bash
git init
git remote add origin https://github.com/LJT1218XX/pomodoro-timer.git
git add .
git commit -m "chore: scaffold electron-vite project"
git push -u origin main
```

### Task 2: 类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
export type TimerMode = 'focus' | 'break' | 'longBreak';
export type TimerStatus = 'stopped' | 'running' | 'paused';

export interface PomodoroSession {
  id: string;
  date: string;
  startTime: number;
  duration: number;
  type: TimerMode;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  pomodoroCount: number;
}

export interface Settings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  totalDuration: number;
  currentPomodoros: number;
}

export interface AppState {
  timer: TimerState;
  todos: Todo[];
  sessions: PomodoroSession[];
  settings: Settings;
}

export type AppAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'FINISH_SESSION' }
  | { type: 'SWITCH_MODE'; payload: { mode: TimerMode } }
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'INCREMENT_TODO_POMO'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_SESSION'; payload: PomodoroSession }
  | { type: 'LOAD_DATA'; payload: { sessions: PomodoroSession[]; todos: Todo[]; settings: Settings } };
```

- [ ] **Step 2: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: add type definitions"
```

### Task 3: Store / 状态管理 + electron-store IPC

**Files:**
- Create: `src/store/AppContext.tsx`
- Modify: `electron/main.ts`
- Modify: `electron/preload.ts`

- [ ] **Step 1: 修改 electron/main.ts — 设置 electron-store 主进程 IPC**

覆盖为：

```typescript
import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
import { join } from 'path';
import Store from 'electron-store';

const store = new Store({
  schema: {
    sessions: { type: 'array', default: [] },
    todos: { type: 'array', default: [] },
    settings: {
      type: 'object',
      default: {
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
      },
    },
  },
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// IPC handlers
ipcMain.handle('store:get', (_event, key: string) => {
  return store.get(key);
});

ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
  store.set(key, value);
});

ipcMain.handle('notification:show', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 2: 修改 preload.ts — 暴露安全 API**

覆盖为：

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
  },
  notification: {
    show: (title: string, body: string) => ipcRenderer.invoke('notification:show', title, body),
  },
});
```

- [ ] **Step 3: 创建 `src/store/AppContext.tsx`**

```typescript
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { AppState, AppAction, TimerMode, PomodoroSession } from '../types';
import { DEFAULT_SETTINGS } from '../types';

declare global {
  interface Window {
    electronAPI: {
      store: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
      };
      notification: {
        show: (title: string, body: string) => Promise<void>;
      };
    };
  }
}

const initialState: AppState = {
  timer: {
    mode: 'focus',
    status: 'stopped',
    timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
    totalDuration: DEFAULT_SETTINGS.focusDuration * 60,
    currentPomodoros: 0,
  },
  todos: [],
  sessions: [],
  settings: DEFAULT_SETTINGS,
};

function getTimeLeftForMode(mode: TimerMode, settings: AppState['settings']): number {
  switch (mode) {
    case 'focus': return settings.focusDuration * 60;
    case 'break': return settings.breakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, timer: { ...state.timer, status: 'running' } };

    case 'PAUSE_TIMER':
      return { ...state, timer: { ...state.timer, status: 'paused' } };

    case 'RESET_TIMER': {
      const totalDuration = getTimeLeftForMode(state.timer.mode, state.settings);
      return { ...state, timer: { ...state.timer, status: 'stopped', timeLeft: totalDuration, totalDuration } };
    }

    case 'TICK': {
      const newTimeLeft = state.timer.timeLeft - 1;
      return { ...state, timer: { ...state.timer, timeLeft: newTimeLeft } };
    }

    case 'FINISH_SESSION': {
      const newPomodoros = state.timer.mode === 'focus'
        ? state.timer.currentPomodoros + 1
        : state.timer.currentPomodoros;
      return { ...state, timer: { ...state.timer, status: 'stopped', currentPomodoros: newPomodoros } };
    }

    case 'SWITCH_MODE': {
      const totalDuration = getTimeLeftForMode(action.payload.mode, state.settings);
      return {
        ...state,
        timer: { ...state.timer, mode: action.payload.mode, status: 'stopped', timeLeft: totalDuration, totalDuration },
      };
    }

    case 'ADD_TODO': {
      const newTodo = {
        id: crypto.randomUUID(),
        text: action.payload,
        completed: false,
        createdAt: Date.now(),
        pomodoroCount: 0,
      };
      return { ...state, todos: [...state.todos, newTodo] };
    }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t),
      };

    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };

    case 'INCREMENT_TODO_POMO':
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.payload ? { ...t, pomodoroCount: t.pomodoroCount + 1 } : t),
      };

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: newSettings,
        timer: {
          ...state.timer,
          timeLeft: getTimeLeftForMode(state.timer.mode, newSettings),
          totalDuration: getTimeLeftForMode(state.timer.mode, newSettings),
        },
      };
    }

    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };

    case 'LOAD_DATA':
      return {
        ...state,
        sessions: action.payload.sessions || [],
        todos: action.payload.todos || [],
        settings: action.payload.settings || DEFAULT_SETTINGS,
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevModeRef = useRef(state.timer.mode);

  // 加载持久化数据
  useEffect(() => {
    (async () => {
      const [sessions, todos, settings] = await Promise.all([
        window.electronAPI.store.get('sessions') as Promise<PomodoroSession[]>,
        window.electronAPI.store.get('todos'),
        window.electronAPI.store.get('settings'),
      ]);
      dispatch({ type: 'LOAD_DATA', payload: { sessions: sessions as PomodoroSession[], todos: todos as PomodoroSession[], settings: settings as PomodoroSession[] } });
    })();
  }, []);

  // 计时器 tick
  useEffect(() => {
    if (state.timer.status === 'running') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.timer.status]);

  // 计时结束处理
  useEffect(() => {
    if (state.timer.status === 'running' && state.timer.timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);

      const now = new Date();
      const session: PomodoroSession = {
        id: crypto.randomUUID(),
        date: now.toISOString().slice(0, 10),
        startTime: now.getTime(),
        duration: state.timer.totalDuration / 60,
        type: state.timer.mode,
        completed: true,
      };

      dispatch({ type: 'FINISH_SESSION' });
      dispatch({ type: 'ADD_SESSION', payload: session });

      // 通知
      if (state.timer.mode === 'focus') {
        window.electronAPI.notification.show('番茄钟', '专注时间结束，该休息了！');
      } else {
        window.electronAPI.notification.show('番茄钟', '休息结束，开始专注吧！');
      }
    }
  }, [state.timer.timeLeft, state.timer.status]);

  // 保存数据到 electron-store
  useEffect(() => {
    window.electronAPI.store.set('sessions', state.sessions);
  }, [state.sessions]);

  useEffect(() => {
    window.electronAPI.store.set('todos', state.todos);
  }, [state.todos]);

  useEffect(() => {
    window.electronAPI.store.set('settings', state.settings);
  }, [state.settings]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
```

- [ ] **Step 4: 提交**

```bash
git add electron/main.ts electron/preload.ts src/store/AppContext.tsx
git commit -m "feat: add state management and electron-store IPC"
```

### Task 4: 进度环组件 ProgressRing

**Files:**
- Create: `src/components/ProgressRing.tsx`

- [ ] **Step 1: 创建 SVG 进度环**

```typescript
import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 6,
  color = '#e74c3c',
  bgColor = '#2c2c2c',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    </svg>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ProgressRing.tsx
git commit -m "feat: add ProgressRing SVG component"
```

### Task 5: 计时器组件 Timer

**Files:**
- Create: `src/components/Timer.tsx`

- [ ] **Step 1: 创建计时器组件**

```typescript
import React from 'react';
import ProgressRing from './ProgressRing';
import { useApp } from '../store/AppContext';
import type { TimerMode } from '../types';

const modeLabels: Record<TimerMode, string> = {
  focus: '专注',
  break: '短休息',
  longBreak: '长休息',
};

const modeColors: Record<TimerMode, string> = {
  focus: '#e74c3c',
  break: '#27ae60',
  longBreak: '#2980b9',
};

export default function Timer() {
  const { state, dispatch } = useApp();
  const { timer } = state;

  const minutes = Math.floor(timer.timeLeft / 60);
  const seconds = timer.timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = 1 - timer.timeLeft / timer.totalDuration;

  const handleStart = () => dispatch({ type: 'START_TIMER' });
  const handlePause = () => dispatch({ type: 'PAUSE_TIMER' });
  const handleReset = () => dispatch({ type: 'RESET_TIMER' });
  const handleModeSwitch = (mode: TimerMode) => dispatch({ type: 'SWITCH_MODE', payload: { mode } });

  const isStopped = timer.status === 'stopped';

  return (
    <div style={{ textAlign: 'center' }}>
      {/* 模式切换标签 */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {(Object.keys(modeLabels) as TimerMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => handleModeSwitch(mode)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: timer.mode === mode ? `2px solid ${modeColors[mode]}` : '2px solid transparent',
              background: timer.mode === mode ? modeColors[mode] : 'transparent',
              color: timer.mode === mode ? '#fff' : '#888',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      {/* 进度环 + 时间 */}
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
            color: '#eee',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {display}
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        {timer.status === 'running' ? (
          <button onClick={handlePause} style={btnStyle}>暂停</button>
        ) : (
          <button
            onClick={handleStart}
            style={{ ...btnStyle, background: modeColors[timer.mode] }}
            disabled={!isStopped}
          >
            {isStopped ? '开始' : '继续'}
          </button>
        )}
        <button onClick={handleReset} style={{ ...btnStyle, background: '#555' }}>重置</button>
      </div>

      {/* 番茄计数 */}
      <p style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
        今日已完成 {state.sessions.filter(s => s.date === new Date().toISOString().slice(0, 10) && s.type === 'focus' && s.completed).length} 个番茄
      </p>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 28px',
  borderRadius: 8,
  border: 'none',
  color: '#fff',
  fontSize: 16,
  cursor: 'pointer',
  transition: 'all 0.2s',
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Timer.tsx
git commit -m "feat: add Timer component with mode switching"
```

### Task 6: 待办面板组件 TodoPanel

**Files:**
- Create: `src/components/TodoPanel.tsx`

- [ ] **Step 1: 创建待办面板**

```typescript
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function TodoPanel() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_TODO', payload: input.trim() });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

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
            outline: 'none',
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
              opacity: todo.completed ? 0.5 : 1,
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
                textDecoration: todo.completed ? 'line-through' : 'none',
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
                padding: 0,
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
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/TodoPanel.tsx
git commit -m "feat: add TodoPanel component"
```

### Task 7: 设置弹窗组件 SettingsModal

**Files:**
- Create: `src/components/SettingsModal.tsx`

- [ ] **Step 1: 创建设置弹窗**

```typescript
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import type { Settings } from '../types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState<Settings>(state.settings);

  if (!open) return null;

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    onClose();
  };

  const fields = [
    { key: 'focusDuration', label: '专注时长（分钟）' },
    { key: 'breakDuration', label: '短休息时长（分钟）' },
    { key: 'longBreakDuration', label: '长休息时长（分钟）' },
    { key: 'longBreakInterval', label: '长休息间隔（番茄数）' },
  ] as const;

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
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#222',
          borderRadius: 12,
          padding: 28,
          width: 340,
        }}
      >
        <h2 style={{ margin: '0 0 20px', color: '#eee', fontSize: 18 }}>设置</h2>

        {fields.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: 13, marginBottom: 4 }}>{label}</label>
            <input
              type="number"
              min={1}
              max={120}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: Number(e.target.value) })}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btnStyle, background: '#444' }}>取消</button>
          <button onClick={handleSave} style={{ ...btnStyle, background: '#e74c3c' }}>保存</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #444',
  background: '#1a1a1a',
  color: '#eee',
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 6,
  border: 'none',
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/SettingsModal.tsx
git commit -m "feat: add SettingsModal component"
```

### Task 8: 统计页面组件 Stats

**Files:**
- Create: `src/components/Stats.tsx`

- [ ] **Step 1: 创建统计页面**

```typescript
import React from 'react';
import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Stats() {
  const { state } = useApp();

  // 最近 7 天统计
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const count = state.sessions.filter(
      s => s.date === dateStr && s.type === 'focus' && s.completed
    ).length;
    const totalMinutes = state.sessions
      .filter(s => s.date === dateStr && s.type === 'focus' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
    return { date: dayLabel, count, minutes: totalMinutes };
  }).reverse();

  const totalPomodoros = state.sessions.filter(s => s.type === 'focus' && s.completed).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = state.sessions
    .filter(s => s.date === todayStr && s.type === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div style={{ padding: '0 20px' }}>
      <h2 style={{ margin: '0 0 24px', color: '#eee', fontSize: 20 }}>统计</h2>

      {/* 总览卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#e74c3c' }}>{totalPomodoros}</div>
          <div style={{ color: '#888', fontSize: 13 }}>总番茄数</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#27ae60' }}>{Math.round(todayMinutes)}</div>
          <div style={{ color: '#888', fontSize: 13 }}>今日专注（分钟）</div>
        </div>
      </div>

      {/* 本周趋势图 */}
      <h3 style={{ margin: '0 0 12px', color: '#aaa', fontSize: 15 }}>本周趋势</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={last7Days}>
          <XAxis dataKey="date" stroke="#555" fontSize={12} />
          <YAxis stroke="#555" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#333', border: 'none', borderRadius: 8, color: '#eee' }}
            formatter={(value: number) => [`${value} 个`, '番茄']}
          />
          <Bar dataKey="count" fill="#e74c3c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* 历史记录 */}
      <h3 style={{ margin: '20px 0 12px', color: '#aaa', fontSize: 15 }}>最近记录</h3>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>
        {[...state.sessions].reverse().slice(0, 20).map(s => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #2a2a2a',
              fontSize: 13,
              color: '#999',
            }}
          >
            <span>{s.date}</span>
            <span>{s.type === 'focus' ? '专注' : s.type === 'break' ? '短休息' : '长休息'} {s.duration}分钟</span>
          </div>
        ))}
        {state.sessions.length === 0 && (
          <p style={{ color: '#555', textAlign: 'center', margin: '20px 0' }}>暂无记录</p>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  background: '#1a1a1a',
  borderRadius: 10,
  padding: '16px 20px',
  textAlign: 'center',
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Stats.tsx
git commit -m "feat: add Stats component with charts and history"
```

### Task 9: 主应用组件 App 和全局样式

**Files:**
- Create: `src/App.tsx`
- Create: `src/App.css`
- Modify: `src/main.tsx`
- Modify: `src/index.html`

- [ ] **Step 1: 创建 `src/App.tsx`**

```typescript
import React, { useState } from 'react';
import './App.css';
import Timer from './components/Timer';
import TodoPanel from './components/TodoPanel';
import Stats from './components/Stats';
import SettingsModal from './components/SettingsModal';
import { AppProvider } from './store/AppContext';

function AppContent() {
  const [tab, setTab] = useState<'timer' | 'stats'>('timer');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app">
      {/* 顶栏 */}
      <header className="header">
        <div className="tabs">
          <button
            className={`tab ${tab === 'timer' ? 'active' : ''}`}
            onClick={() => setTab('timer')}
          >
            专注
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            统计
          </button>
        </div>
        <button className="settings-btn" onClick={() => setSettingsOpen(true)} title="设置">
          ⚙️
        </button>
      </header>

      {/* 内容区 */}
      <div className="content">
        {tab === 'timer' ? (
          <>
            <div className="timer-area">
              <Timer />
            </div>
            <div className="sidebar">
              <TodoPanel />
            </div>
          </>
        ) : (
          <div className="stats-area">
            <Stats />
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

- [ ] **Step 2: 创建 `src/App.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #121212;
  color: #eee;
  overflow: hidden;
  user-select: none;
  -webkit-app-region: no-drag;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  -webkit-app-region: drag;
  border-bottom: 1px solid #2a2a2a;
}

.tabs {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.tab {
  padding: 6px 18px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #eee;
  background: #2a2a2a;
}

.tab.active {
  color: #fff;
  background: #e74c3c;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  -webkit-app-region: no-drag;
}

.settings-btn:hover {
  background: #2a2a2a;
}

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.timer-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.sidebar {
  width: 280px;
  border-left: 1px solid #2a2a2a;
  padding: 20px 16px;
  overflow-y: auto;
}

.stats-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

- [ ] **Step 3: 修改 `src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: 修改 `src/index.html`** — 确认内容正确

确认 `src/index.html` 包含 `<div id="root"></div>` 并正确引入 `/src/main.tsx`（electron-vite 默认配置即可，无需修改）。

- [ ] **Step 5: 提交**

```bash
git add src/App.tsx src/App.css src/main.tsx
git commit -m "feat: add main App layout with routing and styles"
```

### Task 10: 配置 electron-builder 打包

**Files:**
- Modify: `electron-builder.yml`

- [ ] **Step 1: 修改 electron-builder.yml**

```yaml
appId: com.pomodoro.timer
productName: 番茄钟
directories:
  buildResources: build
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.{js,ts,mjs,cjs}'
  - '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
  - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
win:
  target:
    - nsis
  artifactName: ${productName}-Setup-${version}.${ext}
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
extraResources:
  - from: resources/
    to: resources/
```

- [ ] **Step 2: 提交**

```bash
git add electron-builder.yml
git commit -m "chore: configure electron-builder for Windows packaging"
```

### Task 11: 验证构建

- [ ] **Step 1: 运行 dev 模式验证**

```bash
pnpm dev
```
确认窗口正常显示，计时器、待办、切换、设置弹窗均正常工作。

- [ ] **Step 2: 运行构建验证**

```bash
pnpm build
```
确认构建成功，输出目录 `out/` 下生成安装包。

- [ ] **Step 3: 最终提交**

```bash
git add .
git push
```
