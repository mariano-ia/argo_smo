import { useEffect, useRef, useState } from 'react'
import { renderTemplate, getTemplateDimensions } from '../renderer.js'

const TEMPLATE_LABELS = {
  igA: 'Image + overlay', igB: 'Solid purple', igC: 'Minimal',
  liA: 'Split panel', liB: 'Full bleed', liC: 'Text only',
}

export default function PostCard({ platform, data, bgImage, loading }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(null)
  const [template, setTemplate] = useState(data?.template || (platform === 'instagram' ? 'igA' : 'liA'))
  const templateOptions = platform === 'instagram' ? ['igA', 'igB', 'igC'] : ['liA', 'liB', 'liC']
  const isIG = platform === 'instagram'
  const accentColor = isIG ? '#E1306C' : '#0A66C2'
  const platformLabel = isIG ? 'Instagram' : 'LinkedIn'

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const { w, h } = getTemplateDimensions(template)
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    if (bgImage) {
      const image = new Image()
      image.onload = () => renderTemplate(ctx, template, data.pilar, data.headline, image)
      image.src = bgImage
    } else {
      renderTemplate(ctx, template, data.pilar, data.headline, null)
    }
  }, [data, bgImage, template])

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = `argo-${platform}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text); setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...styles.platformDot, background: accentColor }} />
          <span style={styles.platformLabel}>{platformLabel}</span>
          {data && <span style={styles.pilarBadge}>{data.pilar}</span>}
        </div>
        {data && (
          <div style={styles.templateTabs}>
            {templateOptions.map(t => (
              <button key={t} onClick={() => setTemplate(t)}
                style={{ ...styles.templateTab, ...(template === t ? styles.templateTabActive : {}) }}>
                {TEMPLATE_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.canvasWrap}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Generating with Nano Banana...</span>
          </div>
        ) : data ? (
          <canvas ref={canvasRef} style={styles.canvas} />
        ) : (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: 32 }}>🎨</span>
            <span style={{ color: '#86868B', fontSize: 14, marginTop: 8 }}>The piece will appear here</span>
          </div>
        )}
      </div>

      {data && (
        <div style={styles.copySection}>
          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>Headline</div>
            <div style={styles.copyText}>{data.headline?.replace(/\\n/g, '\n')}</div>
            <button style={styles.copyBtn} onClick={() => copyText(data.headline?.replace(/\\n/g, '\n'), 'hl-' + platform)}>
              {copied === 'hl-' + platform ? '✓ Copied' : 'Copy headline'}
            </button>
          </div>
          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>Post copy</div>
            <div style={{ ...styles.copyText, maxHeight: 120, overflowY: 'auto' }}>{data.copy}</div>
            <div style={styles.hashtags}>{data.hashtags}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={styles.copyBtn} onClick={() => copyText(data.copy, 'cp-' + platform)}>
                {copied === 'cp-' + platform ? '✓ Copied' : 'Copy text'}
              </button>
              <button style={styles.copyBtn} onClick={() => copyText(data.copy + '\n\n' + data.hashtags, 'all-' + platform)}>
                {copied === 'all-' + platform ? '✓ Copied' : 'Copy all'}
              </button>
            </div>
          </div>
          <button style={styles.downloadBtn} onClick={download}>↓ Download PNG</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  platformDot: { width: 10, height: 10, borderRadius: '50%' },
  platformLabel: { fontSize: 14, fontWeight: 600, color: '#1D1D1F' },
  pilarBadge: { fontSize: 11, fontWeight: 500, color: '#955FB5', background: 'rgba(149,95,181,0.1)', padding: '3px 8px', borderRadius: 20 },
  templateTabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  templateTab: { fontSize: 11, fontWeight: 500, color: '#86868B', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  templateTabActive: { color: '#955FB5', background: 'rgba(149,95,181,0.1)', border: '1px solid rgba(149,95,181,0.3)' },
  canvasWrap: { background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  canvas: { maxWidth: '100%', height: 'auto', display: 'block' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 },
  spinner: { width: 32, height: 32, border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #955FB5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: 13, color: '#86868B' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 60 },
  copySection: { padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  copyBlock: { display: 'flex', flexDirection: 'column', gap: 6 },
  copyLabel: { fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.06em' },
  copyText: { fontSize: 13, lineHeight: 1.5, color: '#1D1D1F', whiteSpace: 'pre-wrap' },
  hashtags: { fontSize: 12, color: '#955FB5', lineHeight: 1.4 },
  copyBtn: { fontSize: 12, fontWeight: 500, color: '#1D1D1F', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', width: 'fit-content' },
  downloadBtn: { fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#955FB5', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', textAlign: 'center' },
}
