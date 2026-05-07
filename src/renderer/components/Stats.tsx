import React from 'react'
import { useApp } from '../store/AppContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function Stats() {
  const { state } = useApp()

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`
    const count = state.sessions.filter(
      s => s.date === dateStr && s.type === 'focus' && s.completed
    ).length
    return { date: dayLabel, count }
  }).reverse()

  const totalPomodoros = state.sessions.filter(
    s => s.type === 'focus' && s.completed
  ).length

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayMinutes = state.sessions
    .filter(s => s.date === todayStr && s.type === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0)

  return (
    <div style={{ padding: '0 28px' }}>
      <h2
        style={{
          margin: '0 0 28px',
          color: 'var(--text-primary)',
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.3px'
        }}
      >
        统计
      </h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 300,
              color: 'var(--accent-focus)',
              lineHeight: 1.1
            }}
          >
            {totalPomodoros}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            总番茄数
          </div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 300,
              color: 'var(--accent-break)',
              lineHeight: 1.1
            }}
          >
            {Math.round(todayMinutes)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            今日专注（分钟）
          </div>
        </div>
      </div>

      <h3
        style={{
          margin: '0 0 16px',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.3px'
        }}
      >
        本周趋势
      </h3>
      <div className="card" style={{ padding: '16px 16px 8px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last7Days}>
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 12
              }}
              formatter={(value: number) => [`${value} 个`, '番茄']}
            />
            <Bar
              dataKey="count"
              fill="var(--accent-focus)"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'saturate(0.8)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3
        style={{
          margin: '24px 0 12px',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.3px'
        }}
      >
        最近记录
      </h3>
      <div style={{ maxHeight: 160, overflowY: 'auto', paddingRight: 4 }}>
        {[...state.sessions]
          .reverse()
          .slice(0, 20)
          .map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: 12,
                color: 'var(--text-muted)'
              }}
            >
              <span>{s.date}</span>
              <span>
                {s.type === 'focus'
                  ? '专注'
                  : s.type === 'break'
                    ? '短休息'
                    : '长休息'}{' '}
                {s.duration}分钟
              </span>
            </div>
          ))}
        {state.sessions.length === 0 && (
          <p
            style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              margin: '24px 0',
              fontSize: 12
            }}
          >
            暂无记录
          </p>
        )}
      </div>
    </div>
  )
}
