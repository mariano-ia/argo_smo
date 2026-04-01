import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export async function saveUsageEvent(type, tokens) {
  await supabase.from('usage_events').insert({ type, tokens })
}

function getWeekStart() {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay()); return d
}
function getMonthStart() {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(1); return d
}

const COSTS = { content: 0.003, image: 0.0006 }

function calcCost(events) {
  return events.reduce((sum, e) => sum + (e.tokens / 1000) * (COSTS[e.type] || 0.002), 0)
}
function calcGenerations(events) {
  return events.filter(e => e.type === 'content').length
}

export default function UsagePanel() {
  const [usage, setUsage] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('usage_events').select('*').order('created_at', { ascending: true })
      if (data) setUsage(data)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  const weekStart = getWeekStart()
  const monthStart = getMonthStart()
  const weekly = usage.filter(e => new Date(e.created_at) >= weekStart)
  const monthly = usage.filter(e => new Date(e.created_at) >= monthStart)
  const periods = [
    { label: 'This week', events: weekly },
    { label: 'This month', events: monthly },
    { label: 'All time', events: usage },
  ]
  const totalGenerations = calcGenerations(usage)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ fontSize: 12, fontWeight: 500, color: '#86868B', background: 'transparent', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: totalGenerations > 0 ? '#955FB5' : '#ccc', display: 'inline-block' }} />
        IA · {totalGenerations} generations
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 200, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: 20, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            AI Usage
          </div>
          {periods.map(({ label, events }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#86868B', marginBottom: 4 }}>{label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{calcGenerations(events)} generations</span>
                <span style={{ fontSize: 13, color: '#955FB5', fontWeight: 500 }}>~${calcCost(events).toFixed(3)}</span>
              </div>
              <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: '#F0F0F0' }}>
                <div style={{ height: '100%', borderRadius: 2, background: '#955FB5', width: usage.length ? `${Math.min(100, (events.length / Math.max(usage.length, 1)) * 100)}%` : '0%', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#86868B', marginBottom: 2 }}>Estimated total cost</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F' }}>~${calcCost(usage).toFixed(3)}</div>
            <div style={{ fontSize: 11, color: '#86868B', marginTop: 2 }}>Claude + Nano Banana</div>
          </div>
        </div>
      )}
    </div>
  )
}
