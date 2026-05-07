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
