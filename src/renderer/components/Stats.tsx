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
    <div style={{ padding: '0 20px' }}>
      <h2 style={{ margin: '0 0 24px', color: 'var(--text-primary)', fontSize: 20 }}>统计</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div
          style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            borderRadius: 10,
            padding: '16px 20px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: '#e74c3c' }}>
            {totalPomodoros}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>总番茄数</div>
        </div>
        <div
          style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            borderRadius: 10,
            padding: '16px 20px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: '#27ae60' }}>
            {Math.round(todayMinutes)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>今日专注（分钟）</div>
        </div>
      </div>

      <h3 style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: 15 }}>
        本周趋势
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={last7Days}>
          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            fontSize={12}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: 8,
              color: 'var(--text-primary)'
            }}
            formatter={(value: number) => [`${value} 个`, '番茄']}
          />
          <Bar dataKey="count" fill="#e74c3c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ margin: '20px 0 12px', color: 'var(--text-muted)', fontSize: 15 }}>
        最近记录
      </h3>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>
        {[...state.sessions]
          .reverse()
          .slice(0, 20)
          .map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: 13,
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
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
            暂无记录
          </p>
        )}
      </div>
    </div>
  )
}
