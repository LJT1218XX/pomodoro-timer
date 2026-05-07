import React, { useState, useEffect } from 'react'

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.window.isMaximized().then(setMaximized)
  }, [])

  const handleMinimize = () => window.electronAPI.window.minimize()
  const handleMaximize = () => {
    window.electronAPI.window.maximize()
    setMaximized(!maximized)
  }
  const handleClose = () => window.electronAPI.window.close()

  return (
    <div className="titlebar">
      <span className="titlebar-title">番茄钟</span>

      <div className="titlebar-controls">
        <button className="titlebar-btn" onClick={handleMinimize} title="最小化">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="4.5" width="8" height="1" fill="currentColor" />
          </svg>
        </button>
        <button className="titlebar-btn" onClick={handleMaximize} title={maximized ? '还原' : '最大化'}>
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0.5" y="2" width="7" height="7" rx="1" fill="var(--bg-secondary)" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="1" y="1" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button className="titlebar-btn titlebar-close" onClick={handleClose} title="关闭">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
