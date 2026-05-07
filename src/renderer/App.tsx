import React, { useState } from 'react'
import './App.css'
import Timer from './components/Timer'
import TodoPanel from './components/TodoPanel'
import Stats from './components/Stats'
import TitleBar from './components/TitleBar'
import SettingsModal from './components/SettingsModal'
import { AppProvider } from './store/AppContext'

function AppContent() {
  const [tab, setTab] = useState<'timer' | 'stats'>('timer')
  const [settingsOpen, setSettingsOpen] = useState(false)

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
        <button
          className="settings-btn"
          onClick={() => setSettingsOpen(true)}
          title="设置"
        >
          ⚙️
        </button>
      </header>

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
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
