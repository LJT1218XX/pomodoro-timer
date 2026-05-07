import React, { useState } from 'react'
import './App.css'
import Timer from './components/Timer'
import TodoPanel from './components/TodoPanel'
import Stats from './components/Stats'
import TitleBar from './components/TitleBar'
import SettingsModal from './components/SettingsModal'
import { AppProvider, useApp } from './store/AppContext'

function AppContent() {
  const [tab, setTab] = useState<'timer' | 'stats'>('timer')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { state } = useApp()

  const todoCount = state.todos.filter(t => !t.completed).length

  return (
    <div className="app">
      <TitleBar />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {tab === 'timer' && (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? '收起待办' : '展开待办'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {sidebarOpen ? (
                  // 收起图标：三条横线
                  <>
                    <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  // 展开图标：三条横线 + 待办数
                  <>
                    <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
              {!sidebarOpen && todoCount > 0 && (
                <span className="sidebar-badge">{todoCount}</span>
              )}
            </button>
          )}
          <button
            className="settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="content">
        {tab === 'timer' ? (
          <>
            <div className="timer-area">
              <Timer />
            </div>
            <div className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
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
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
