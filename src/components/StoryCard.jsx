import { useEffect, useRef, useState } from 'react'
import { renderTemplate } from '../renderer.js'

export default function StoryCard({ data, bgImage, loading }) {
  const canvasRef = useRef(null)
  const [template, setTemplate] = useState('storyA')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = 1080; canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (template === 'storyA' && bgImage) {
      const img = new Image()
      img.onload = () => renderTemplate(ctx, template, data.pilar, data.headline, img)
      img.src = bgImage
    } else {
      renderTemplate(ctx, template, data.pilar, data.headline, null)
    }
  }, [data, bgImage, template])

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = `argo-story-${template}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E1306C' }} />
          <span style={S.label}>Instagram · Story</span>
          {data && <span style={S.badge}>{data.pilar}</span>}
        </div>
        {data && (
          <div style={{ display: 'flex', gap: 4 }}>
            {['storyA','storyB'].map(t => (
              <button key={t} onClick={() => setTemplate(t)}
                style={{ ...S.tab, ...(template === t ? S.tabActive : {}) }}>
                {t === 'storyA' ? 'Imagen' : 'Violeta'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={S.canvasWrap}>
        {loading ? (
          <div style={S.loadingBox}><div style={S.spinner} /><span style={{ fontSize: 13, color: '#86868B' }}>Generating story...</span></div>
        ) : data ? (
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={S.loadingBox}><span style={{ fontSize: 32 }}>📱</span><span style={{ color: '#86868B', fontSize: 14, marginTop: 8 }}>La story aparecerá acá</span></div>
        )}
      </div>

      {data && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={S.labelSm}>Headline</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: '#1D1D1F', whiteSpace: 'pre-wrap' }}>{data.headline?.replace(/\\n/g, '\n')}</div>
            <button style={S.copyBtn} onClick={() => { navigator.clipboard.writeText(data.headline?.replace(/\\n/g, '\n')); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
              {copied ? '✓ Copied' : 'Copy text'}
            </button>
          </div>
          <button style={S.dlBtn} onClick={download}>↓ Download Story PNG</button>
        </div>
      )}
    </div>
  )
}

const S = {
  card: { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  label: { fontSize: 14, fontWeight: 600, color: '#1D1D1F' },
  badge: { fontSize: 11, fontWeight: 500, color: '#955FB5', background: 'rgba(149,95,181,0.1)', padding: '3px 8px', borderRadius: 20 },
  tab: { fontSize: 11, fontWeight: 500, color: '#86868B', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  tabActive: { color: '#955FB5', background: 'rgba(149,95,181,0.1)', border: '1px solid rgba(149,95,181,0.3)' },
  canvasWrap: { background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 },
  spinner: { width: 32, height: 32, border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #955FB5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  labelSm: { fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.06em' },
  copyBtn: { fontSize: 12, fontWeight: 500, color: '#1D1D1F', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', width: 'fit-content' },
  dlBtn: { fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#E1306C', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', textAlign: 'center' },
}
