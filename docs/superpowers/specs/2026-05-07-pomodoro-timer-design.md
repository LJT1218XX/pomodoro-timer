# Pomodoro Timer — 设计文档

## 概述

一个基于 Electron + React + TypeScript 的跨平台桌面番茄钟应用，支持标准番茄工作法计时、待办清单管理、历史统计和桌面通知。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | electron-vite | 快速搭建 Electron + Vite 开发环境，支持 HMR |
| 渲染进程 | React 18 + TypeScript | UI 组件化开发 |
| 状态管理 | React Context + useReducer | 轻量，无需 Redux |
| 数据持久化 | electron-store | JSON 文件存储，自动读写 |
| 通知 | Electron Notification API | 系统原生通知 + 提示音 |
| 图表 | recharts | 统计页柱状图 |
| 打包 | electron-builder | 输出 Windows 安装包 |

## 功能需求

### 1. 番茄计时（专注模式）
- 标准 25 分钟专注倒计时，结束后 5 分钟休息
- 每 4 个番茄后触发 15 分钟长休息
- 进度环视觉反馈
- 计时结束弹出系统通知 + 提示音
- 暂停/继续/重置

### 2. 自定义设置
- 专注时长（分钟）
- 休息时长（分钟）
- 长休息时长（分钟）
- 长休息间隔（番茄个数）
- 设置持久化保存

### 3. 待办清单
- 添加/删除待办事项
- 标记完成（每完成一个番茄可关联到待办）
- 待办关联番茄计数

### 4. 统计
- 今日完成番茄数
- 本周番茄趋势图（柱状图）
- 每日专注总时长
- 历史记录累计

### 5. 桌面通知
- 专注结束通知 + 提示音
- 休息结束通知 + 提示音
- Electron Notification API

## 数据模型

```typescript
// 番茄记录
interface PomodoroSession {
  id: string;
  date: string;         // "2026-05-07"
  startTime: number;    // timestamp ms
  duration: number;     // 实际专注分钟
  type: 'focus' | 'break' | 'longBreak';
  completed: boolean;
}

// 待办事项
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  pomodoroCount: number;
}

// 设置
interface Settings {
  focusDuration: number;       // default 25 min
  breakDuration: number;       // default 5 min
  longBreakDuration: number;   // default 15 min
  longBreakInterval: number;   // default 4 个番茄
}
```

## 目录结构

```
pomodoro-timer/
├── electron/
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # preload 脚本
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.html
│   ├── components/
│   │   ├── Timer.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── TodoPanel.tsx
│   │   ├── SettingsModal.tsx
│   │   └── Stats.tsx
│   ├── store/
│   │   └── AppContext.tsx
│   └── types/
│       └── index.ts
├── resources/
│   └── sounds/
│       └── bell.mp3
├── package.json
├── electron.vite.config.ts
├── electron-builder.yml
└── tsconfig.json
```

## 页面布局

```
┌──────────────────────────────────────────────┐
│  [专注]  [统计]              [⚙️ 设置]       │
├─────────────────────┬────────────────────────┤
│                     │                        │
│     ╭───────╮       │   📝 待办清单          │
│    ╱  25:00  ╲      │   ┌────────────────┐   │
│   │   ╭───╮   │     │   │ ☐ 完成项目文档   │   │
│    ╲  │█  │  ╱      │   │ ☑ 设计数据库    │   │
│     ╰──╯───╯       │   │ ☐ ...           │   │
│                     │   └────────────────┘   │
│    [开始] [重置]     │                        │
│                     │   🍅 今日完成: 2       │
└─────────────────────┴────────────────────────┘
```

## 状态管理

AppContext 提供全局状态，useReducer 管理 action：

```typescript
type State = {
  timer: {
    mode: 'focus' | 'break' | 'longBreak' | 'idle';
    status: 'stopped' | 'running' | 'paused';
    timeLeft: number;        // 秒
    totalDuration: number;   // 秒
    currentPomodoros: number; // 本轮完成的番茄数
  };
  todos: Todo[];
  sessions: PomodoroSession[];
  settings: Settings;
};

type Action =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'FINISH_SESSION' }
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOAD_DATA'; payload: { sessions: PomodoroSession[]; todos: Todo[]; settings: Settings } };
```

## 数据流

1. 应用启动 → preload 暴露 `electronStore` API → 渲染进程读取持久化数据 → dispatch `LOAD_DATA`
2. 计时器运行 → `setInterval` 每秒 dispatch `TICK` → timeLeft 递减
3. 计时结束 → dispatch `FINISH_SESSION` → 保存 session → 弹出通知 → 切换到休息
4. 设置变更 → dispatch `UPDATE_SETTINGS` → 同步写入 electron-store
5. 待办操作 → dispatch 对应 action → 同步写入 electron-store
6. 统计页 → 从 sessions 数据按日期聚合 → recharts 渲染

## 非功能需求

- 计时器精度：使用 `setInterval` 每秒更新，主进程使用 `setTimeout` 校准
- 数据持久化：electron-store 以 JSON 保存在用户数据目录
- 窗口关闭时保持后台运行（可选：托盘图标）
- 打包体积控制在 100MB 以内
