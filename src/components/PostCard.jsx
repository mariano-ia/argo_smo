import { useEffect, useRef, useState } from 'react'
import { renderTemplate, getTemplateDimensions } from '../renderer.js'

const TEMPLATE_LABELS = {
  igA: 'IG — Imagen + overlay',
  igB: 'IG — Fondo violeta',
  igC: 'IG — Minimalista',
  liA: 'LI — Split panel',
  liB: 'LI — Full bleed',
  liC: 'LI — Solo texto',
}

export default function PostCard({ platform, data, bgImage, loading }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(null)
  const [template, setTemplate] = useState(data?.template || (platform === 'instagram' ? 'igA' : 'liA'))

  const templateOptions = platform === 'instagram'
    ? ['igA', 'igB', 'igC']
    : ['liA', 'liB', 'liC']

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const { w, h } = getTemplateDimensions(template)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    let img = null
    if (bgImage) {
      const image = new Image()
      image.onload = () => {
        renderTemplate(ctx, template, data.pilar, data.headline, image)
      }
      image.src = bgImage
    } else {
      renderTemplate(ctx, template, data.pilar, data.headline, null)
    }
  }, [data, bgImage, template])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `argo-${platform}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const isIG = platform === 'instagram'
  const accentColor = isIG ? '#E1306C' : '#0A66C2'
  const platformLabel = isIG ? 'Instagram' : 'LinkedIn'

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...styles.platformDot, background: accentColor }} />
          <span style={styles.platformLabel}>{platformLabel}</span>
          {data && <span style={styles.pilarBadge}>{data.pilar}</span>}
        </div>
        {data && (
          <select
            value={template}
            onChange={e => setTemplate(e.target.value)}
            style={styles.select}
          >
            {templateOptions.map(t => (
              <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
            ))}
          </select>
        )}
      </div>

      <div style={styles.canvasWrap}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Generando con Nano Banana...</span>
          </div>
        ) : data ? (
          <canvas ref={canvasRef} style={styles.canvas} />
        ) : (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: 32 }}>🎨</span>
            <span style={{ color: '#86868B', fontSize: 14, marginTop: 8 }}>La pieza aparecerá acá</span>
          </div>
        )}
      </div>

      {data && (
        <div style={styles.copySection}>
          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>Headline de la pieza</div>
            <div style={styles.copyText}>{data.headline?.replace(/\\n/g, '\n')}</div>
            <button style={styles.copyBtn} onClick={() => copyText(data.headline?.replace(/\\n/g, '\n'), 'hl-' + platform)}>
              {copied === 'hl-' + platform ? '✓ Copiado' : 'Copiar headline'}
            </button>
          </div>

          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>Copy del post</div>
            <div style={{ ...styles.copyText, maxHeight: 120, overflowY: 'auto' }}>{data.copy}</div>
            <div style={styles.hashtags}>{data.hashtags}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={styles.copyBtn} onClick={() => copyText(data.copy, 'cp-' + platform)}>
                {copied === 'cp-' + platform ? '✓ Copiado' : 'Copiar copy'}
              </button>
              <button style={styles.copyBtn} onClick={() => copyText(data.copy + '\n\n' + data.hashtags, 'all-' + platform)}>
                {copied === 'all-' + platform ? '✓ Copiado' : 'Copiar todo'}
              </button>
            </div>
          </div>

          <button style={styles.downloadBtn} onClick={download}>
            ↓ Descargar imagen PNG
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformDot: { width: 10, height: 10, borderRadius: '50%' },
  platformLabel: { fontSize: 14, fontWeight: 600, color: '#1D1D1F' },
  pilarBadge: {
    fontSize: 11, fontWeight: 500, color: '#955FB5',
    background: 'rgba(149,95,181,0.1)', padding: '3px 8px',
    borderRadius: 20, letterSpacing: '0.05em',
  },
  select: {
    fontSize: 12, color: '#1D1D1F', border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 8, padding: '4px 8px', background: '#F5F5F7',
    outline: 'none', cursor: 'pointer',
  },
  canvasWrap: {
    background: '#F0F0F0',
    aspectRatio: '1 / 1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  canvas: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  loadingBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  spinner: {
    width: 32, height: 32, border: '3px solid rgba(0,0,0,0.1)',
    borderTop: '3px solid #955FB5', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: 13, color: '#86868B' },
  emptyBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 4,
  },
  copySection: { padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  copyBlock: { display: 'flex', flexDirection: 'column', gap: 6 },
  copyLabel: { fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.06em' },
  copyText: { fontSize: 13, lineHeight: 1.5, color: '#1D1D1F', whiteSpace: 'pre-wrap' },
  hashtags: { fontSize: 12, color: '#955FB5', lineHeight: 1.4 },
  copyBtn: {
    fontSize: 12, fontWeight: 500, color: '#1D1D1F',
    background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
    width: 'fit-content',
  },
  downloadBtn: {
    fontSize: 13, fontWeight: 600, color: '#FFFFFF',
    background: '#955FB5', border: 'none',
    borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
    textAlign: 'center',
  },
}
