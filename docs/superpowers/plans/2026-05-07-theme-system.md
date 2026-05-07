# 主题系统 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Pomodoro Timer 添加 CSS 变量驱动的主题系统，支持深色/浅色/森林三套预设主题和跟随系统模式

**Architecture:** 所有颜色提取为 CSS 自定义属性，通过 `data-theme` 属性切换。`system` 模式由 JS 监听 `prefers-color-scheme` 自动映射到 `dark`/`light`。

**Tech Stack:** CSS Custom Properties, React

---

### Task 1: 类型定义 — Settings 新增 theme 字段

**Files:**
- Modify: `src/renderer/types/index.ts:21-26`

- [ ] **Step 1: Settings 增加 theme 字段**

将 `Settings` 接口改为：

```typescript
export type ThemeMode = 'dark' | 'light' | 'forest' | 'system'

export interface Settings {
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  theme: ThemeMode
}
```

同时更新 `DEFAULT_SETTINGS`：

```typescript
export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  theme: 'dark',
}
```

- [ ] **Step 2: 提交**

```bash
git add src/renderer/types/index.ts
git commit -m "feat: add ThemeMode type and theme field to Settings"
```

### Task 2: CSS — 替换硬编码颜色为 CSS 变量 + 主题预设

**Files:**
- Modify: `src/renderer/App.css`（全文替换）

- [ ] **Step 1: 重写 App.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ===== 主题系统 ===== */

/* 深色（默认） */
[data-theme='dark'] {
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
  --scrollbar-thumb-hover: #555;
  --modal-overlay: rgba(0, 0, 0, 0.6);
}

/* 浅色 */
[data-theme='light'] {
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
  --scrollbar-thumb-hover: #bbb;
  --modal-overlay: rgba(0, 0, 0, 0.3);
}

/* 森林 */
[data-theme='forest'] {
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
  --scrollbar-thumb-hover: #5a6e5a;
  --modal-overlay: rgba(0, 0, 0, 0.6);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  user-select: none;
  -webkit-app-region: no-drag;
  transition: background 0.3s, color 0.3s;
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
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s;
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
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab.active {
  color: #fff;
  background: var(--accent-focus);
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
  background: var(--bg-hover);
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
  border-left: 1px solid var(--border-color);
  padding: 20px 16px;
  overflow-y: auto;
  transition: border-color 0.3s;
}

.stats-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/renderer/App.css
git commit -m "feat: replace hardcoded colors with CSS variables and add theme presets"
```

### Task 3: AppContext — 主题切换逻辑

**Files:**
- Modify: `src/renderer/store/AppContext.tsx`

- [ ] **Step 1: 添加主题应用 effect 到 AppProvider**

在 `timerRef` 定义之后（第 153 行之后），添加主题应用逻辑：

```typescript
  // 主题切换 effect
  useEffect(() => {
    const theme = state.settings.theme

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const applySystemTheme = () => {
        document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      }
      applySystemTheme()
      mq.addEventListener('change', applySystemTheme)
      return () => mq.removeEventListener('change', applySystemTheme)
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [state.settings.theme])
```

将此代码块插入到 AppProvider 函数体中，在 `const timerRef = useRef...` 之后、`// 加载持久化数据` 之前。

- [ ] **Step 2: 构建验证**

```bash
pnpm build
```
预期：main、preload、renderer 三环境编译通过。

- [ ] **Step 3: 提交**

```bash
git add src/renderer/store/AppContext.tsx
git commit -m "feat: add theme switching logic with system mode listener"
```

### Task 4: SettingsModal — 主题选择器 UI

**Files:**
- Modify: `src/renderer/components/SettingsModal.tsx`

- [ ] **Step 1: 在设置弹窗中添加主题选择器**

在 `fields` 数组定义之后、return 之前，添加主题选项配置：

```typescript
  const themeOptions = [
    { value: 'dark' as const, label: '深色', color: '#121212' },
    { value: 'light' as const, label: '浅色', color: '#f5f5f5' },
    { value: 'forest' as const, label: '森林', color: '#1a2e1a' },
    { value: 'system' as const, label: '跟随系统', color: '' },
  ]
```

在设置项列表 `{fields.map(...)}` 之后，保存按钮之前，添加主题选择器：

```tsx
        {/* 主题选择 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', color: '#aaa', fontSize: 13, marginBottom: 8 }}>
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
                  border: form.theme === value
                    ? '2px solid var(--accent-focus, #e74c3c)'
                    : '2px solid transparent',
                  background: 'var(--bg-secondary, #1a1a1a)',
                  color: 'var(--text-primary, #eee)',
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
```

- [ ] **Step 2: 构建验证**

```bash
pnpm build
```

- [ ] **Step 3: 提交**

```bash
git add src/renderer/components/SettingsModal.tsx
git commit -m "feat: add theme selector to settings modal"
```

### Task 5: 全面验证

- [ ] **Step 1: 运行 dev 模式测试**

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" pnpm dev
```
验证：
1. 打开设置弹窗，能看到主题选择器（深色/浅色/森林/跟随系统）
2. 切换主题，界面颜色实时变化
3. 重新打开应用，主题设置被持久化
4. 切换到「跟随系统」后，改变 Windows 深色/浅色模式设置，主题自动跟随

- [ ] **Step 2: 推送**

```bash
git push
```
