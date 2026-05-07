# 主题系统 — 设计文档

## 概述

为 Pomodoro Timer 添加 CSS 变量驱动的主题系统，支持内置预设主题切换和跟随系统深色/浅色模式。

## 技术方案

CSS 自定义属性（CSS 变量）+ `data-theme` 属性切换。无需修改 React 组件代码，所有颜色变化通过 CSS 变量自动应用。

## 主题与颜色变量

### 变量命名规范

```
--bg-primary:      主背景
--bg-secondary:    卡片/面板背景
--bg-tertiary:     输入框背景
--bg-hover:        悬停状态背景
--text-primary:    主文字颜色
--text-secondary:  次要文字
--text-muted:      弱化/占位符文字
--border-color:    边框
--accent-focus:    专注模式强调色
--accent-break:    短休息强调色
--accent-longbreak: 长休息强调色
--scrollbar-thumb: 滚动条颜色
--modal-overlay:   弹窗遮罩
```

### 预设主题

| 主题 | data-theme | 色系 |
|------|-----------|------|
| 深色 | `dark` | #121212 主背景 + #1a1a1a 卡片 |
| 浅色 | `light` | #f5f5f5 主背景 + #ffffff 卡片 |
| 森林 | `forest` | #1a2e1a 主背景 + #2a3e2a 卡片 |
| 跟随系统 | `system` | 自动匹配 `prefers-color-scheme` 选择 dark/light |

### 各主题变量值

```css
/* 深色（默认） */
[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #1a1a1a;
  --bg-hover: #2a2a2a;
  --text-primary: #eee;
  --text-secondary: #ccc;
  --text-muted: #888;
  --border-color: #2a2a2a;
  --accent-focus: #e74c3c;
  --accent-break: #27ae60;
  --accent-longbreak: #2980b9;
  --scrollbar-thumb: #444;
  --modal-overlay: rgba(0,0,0,0.6);
}

/* 浅色 */
[data-theme="light"] {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #ffffff;
  --bg-hover: #e8e8e8;
  --text-primary: #222;
  --text-secondary: #555;
  --text-muted: #999;
  --border-color: #ddd;
  --accent-focus: #c0392b;
  --accent-break: #27ae60;
  --accent-longbreak: #2980b9;
  --scrollbar-thumb: #ccc;
  --modal-overlay: rgba(0,0,0,0.3);
}

/* 森林 */
[data-theme="forest"] {
  --bg-primary: #1a2e1a;
  --bg-secondary: #2a3e2a;
  --bg-tertiary: #2a3e2a;
  --bg-hover: #3a4e3a;
  --text-primary: #d4e4c4;
  --text-secondary: #a0c090;
  --text-muted: #708060;
  --border-color: #3a4e3a;
  --accent-focus: #e67e22;
  --accent-break: #2ecc71;
  --accent-longbreak: #3498db;
  --scrollbar-thumb: #4a5e4a;
  --modal-overlay: rgba(0,0,0,0.6);
}
```

## 数据模型

`Settings` 类型新增字段：

```typescript
interface Settings {
  // ... 现有字段
  theme: 'dark' | 'light' | 'forest' | 'system';
}
```

默认值：`'dark'`

## 跟随系统实现

`data-theme="system"` 时，通过 `matchMedia('prefers-color-scheme: dark')` 监听系统深色模式变化，动态切换实际生效的主题。

使用一个 `useEffect` 在 AppProvider 中监听，当系统主题变化时在 `<html>` 上设置对应的 `data-theme` 值（dark 或 light）。

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/App.css` | 修改 | 替换所有硬编码颜色为 CSS 变量 + 新增主题变量块 |
| `src/renderer/types/index.ts` | 修改 | Settings 新增 `theme` 字段 |
| `src/renderer/store/AppContext.tsx` | 修改 | 添加主题切换逻辑 + 系统主题监听 |
| `src/renderer/components/SettingsModal.tsx` | 修改 | 新增主题选择器 UI |
