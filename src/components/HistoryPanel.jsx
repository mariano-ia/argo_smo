import { useState } from 'react'

export default function HistoryPanel({ history, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [engInput, setEngInput] = useState('')

  const saveEngagement = (id) => {
    const val = parseInt(engInput)
    if (isNaN(val)) return
    const updated = history.map(p => p.id === id ? { ...p, engagement: val } : p)
    onUpdate(updated)
    setEditing(null)
    setEngInput('')
  }

  if (history.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={{ fontSize: 24 }}>📊</span>
        <span style={{ color: '#86868B', fontSize: 13, marginTop: 6 }}>
          Los posts generados aparecerán acá.<br />Podés cargar el engagement después de publicar.
        </span>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      {history.slice().reverse().map(post => (
        <div key={post.id} style={styles.row}>
          <div style={styles.rowLeft}>
            <div style={styles.date}>{post.date}</div>
            <div style={styles.meta}>
              <span style={{ ...styles.badge, background: post.platform === 'instagram' ? '#fce4ec' : '#e3f2fd', color: post.platform === 'instagram' ? '#c2185b' : '#1565c0' }}>
                {post.platform === 'instagram' ? 'IG' : 'LI'}
              </span>
              <span style={styles.pilar}>{post.pilar}</span>
            </div>
            <div style={styles.headline} title={post.headline}>
              {post.headline?.replace(/\\n/g, ' ').slice(0, 60)}...
            </div>
          </div>
          <div style={styles.rowRight}>
            {editing === post.id ? (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="engagement"
                  value={engInput}
                  onChange={e => setEngInput(e.target.value)}
                  style={styles.engInput}
                  autoFocus
                />
                <button style={styles.saveBtn} onClick={() => saveEngagement(post.id)}>✓</button>
                <button style={styles.cancelBtn} onClick={() => setEditing(null)}>✕</button>
              </div>
            ) : (
              <button
                style={styles.engBtn}
                onClick={() => { setEditing(post.id); setEngInput(post.engagement || '') }}
              >
                {post.engagement ? `${post.engagement} eng.` : '+ engagement'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '32px 16px', textAlign: 'center', gap: 4,
  },
  row: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 12, padding: '12px 14px', gap: 12,
  },
  rowLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  rowRight: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  date: { fontSize: 11, color: '#86868B', fontWeight: 500 },
  meta: { display: 'flex', alignItems: 'center', gap: 6 },
  badge: { fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6 },
  pilar: { fontSize: 11, color: '#955FB5', fontWeight: 500 },
  headline: { fontSize: 12, color: '#1D1D1F', lineHeight: 1.4 },
  engBtn: {
    fontSize: 11, fontWeight: 500, color: '#955FB5',
    background: 'rgba(149,95,181,0.08)', border: '1px solid rgba(149,95,181,0.2)',
    borderRadius: 8, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  engInput: {
    fontSize: 12, width: 90, border: '1px solid #955FB5',
    borderRadius: 6, padding: '4px 8px', outline: 'none',
  },
  saveBtn: {
    fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: '#955FB5',
    border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
  },
  cancelBtn: {
    fontSize: 12, color: '#86868B', background: 'transparent',
    border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
  },
}
