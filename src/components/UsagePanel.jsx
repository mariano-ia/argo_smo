import { useState, useEffect } from 'react'

const USAGE_KEY = 'argo_smo_usage'

function loadUsage() {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '[]') } catch { return [] }
}

export function saveUsageEvent(type, tokens) {
  const usage = loadUsage()
  usage.push({ date: new Date().toISOString(), type, tokens })
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage))
}

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function getMonthStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  return d
}

const COSTS = {
  content: 0.003,
  image: 0.0006,
}

function calcCost(events) {
  return events.reduce((sum, e) => {
    const rate = COSTS[e.type] || 0.002
    return sum + (e.tokens / 1000) * rate
  }, 0)
}

function calcGenerations(events) {
  return events.filter(e => e.type === 'content').length
}

export default function UsagePanel() {
  const [usage, setUsage] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setUsage(loadUsage())
    const interval = setInterval(() => setUsage(loadUsage()), 5000)
    return () => clearInterval(interval)
  }, [])

  const weekStart = getWeekStart()
  const monthStart = getMonthStart()

  const weekly = usage.filter(e => new Date(e.date) >= weekStart)
  const monthly = usage.filter(e => new Date(e.date) >= monthStart)
  const historical = usage

  const periods = [
    { label: 'Esta semana', events: weekly },
    { label: 'Este mes', events: monthly },
    { label: 'Histórico', events: historical },
  ]

  const totalGenerations = calcGenerations(historical)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: 12, fontWeight: 500, color: '#86868B',
          background: 'transparent', border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: totalGenerations > 0 ? '#955FB5' : '#ccc', display: 'inline-block' }} />
        IA · {totalGenerations} generaciones
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 200,
          background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 14, padding: 20, minWidth: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Consumo de IA
          </div>
          {periods.map(({ label, events }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#86868B', marginBottom: 4 }}>{label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>
                  {calcGenerations(events)} generaciones
                </span>
                <span style={{ fontSize: 13, color: '#955FB5', fontWeight: 500 }}>
                  ~${calcCost(events).toFixed(3)}
                </span>
              </div>
              <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: '#F0F0F0' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: '#955FB5',
                  width: historical.length ? `${Math.min(100, (events.length / Math.max(historical.length, 1)) * 100)}%` : '0%',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#86868B', marginBottom: 2 }}>Costo estimado total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F' }}>
              ~${calcCost(historical).toFixed(3)}
            </div>
            <div style={{ fontSize: 11, color: '#86868B', marginTop: 2 }}>Claude + Nano Banana</div>
          </div>
        </div>
      )}
    </div>
  )
}
