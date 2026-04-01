import { useEffect, useRef, useState } from 'react'
import { renderTemplate } from '../renderer.js'

const SLIDE_LABELS = {
  carr01: 'Portada',
  carr02: 'Slide 2',
  carr03: 'Slide 3',
  carr04: 'Slide 4',
  carr05: 'Cierre',
}

export default function CarouselCard({ data, bgImage, loading }) {
  const [activeSlide, setActiveSlide] = useState('carr01')
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const slides = ['carr01', 'carr02', 'carr03', 'carr04', 'carr05']

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = 1080; canvas.height = 1080
    const ctx = canvas.getContext('2d')
    const c = data.carousel || {}

    if (activeSlide === 'carr01') {
      const s = c.slide01 || {}
      if (bgImage) {
        const img = new Image()
        img.onload = () => renderTemplate(ctx, 'carr01', s.pilar || data.pilar, s.headline || data.headline, img)
        img.src = bgImage
      } else {
        renderTemplate(ctx, 'carr01', s.pilar || data.pilar, s.headline || data.headline, null)
      }
    } else if (activeSlide === 'carr05') {
      const s = c.slide05 || {}
      renderTemplate(ctx, 'carr05', '', s.headline || data.headline, null, { subline: s.subline })
    } else {
      const num = activeSlide.slice(-1)
      const s = c[`slide0${num}`] || {}
      renderTemplate(ctx, activeSlide, '', s.titulo || '', null, { body: s.body || '' })
    }
  }, [data, bgImage, activeSlide])

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = `argo-carr-${activeSlide}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  const downloadAll = async () => {
    for (const slide of slides) {
      setActiveSlide(slide)
      await new Promise(r => setTimeout(r, 350))
      const canvas = canvasRef.current; if (!canvas) continue
      const link = document.createElement('a')
      link.download = `argo-carr-${slide}-${new Date().toISOString().slice(0,10)}.png`
      link.href = canvas.toDataURL('image/png'); link.click()
      await new Promise(r => setTimeout(r, 200))
    }
  }

  const getSlideText = () => {
    if (!data?.carousel) return ''
    const c = data.carousel
    if (activeSlide === 'carr01') return c$`{c.slide01?.headline || ''}`
    if (activeSlide === 'carr02') return `${c.slide02?.titulo || ''}\n\n${c.slide02?.body || ''}`
    if (activeSlide === 'carr03') return `${c.slide03?.titulo || ''}\n\n${c.slide03?.body || ''}`
    if (activeSlide === 'carr04') return `${c.slide04?.titulo || ''}\n\n${c.slide04?.body || ''}`
    if (activeSlide === 'carr05') return `${c.slide05?.headline || ''}\n${c.slide05?.subline || ''}`
    return ''
  }

  return (
    <div style={S}.card}>
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0A66C2' }} />
          <span style={S.label}>LinkedIn · Carrusel</span>
          {data && <span style={S.pilarBadge}>{data.pilar}</span>}
        </div>
        {data && (
          <div style={S.tabs}>
            {slides.map(s => (
              <button key={s} onClick={() => setActiveSlide(s)}
                style={{ ...S.tab, ...(activeSlide === s ? S.tabActive : {}) }}>
                {SLIDE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={S.canvasWrap}>
        {loading ? (
          <div style={S.loadingBox}>
            <div style={S.spinner} />
            <span style={{ fontSize: 13, color: '#86868B' }}>Generando carrusel...</span>
          </div>
        ) : data ? (
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={S.loadingBox}>
            <span style={{ fontSize: 32 }}>🎠</span>
            <span style={{ color: '#86868B', fontSize: 14, marginTop: 8 }}>El carrusel aparecerá acá</span>
          </div>
        )}
      </div>

      {data && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={S.labelSm}>{SLIDE_LABELS[activeSlide]}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: '#1D1D1F', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>
              {getSlideText()}
            </div>
            <button style={S.copyBtn} onClick={() => { navigator.clipboard.writeText(getSlideText()); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
              {copied ? '✑ Copiado' : 'Copiar texto'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={S.labelSm}>Copy del post</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: '#1D1D1F', maxHeight: 100, overflowY: 'auto' }}>{data.copy}</div>
            <div style={{ fontSize: 12, color: '#955FB5' }}>{data.hashtags}</div>
            <button style={S.copyBtn} onClick={() => navigator.clipboard.writeText(data.copy + '\n\n' + data.hashtags)}>
              Copiar copy + hashtags
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.dlBtn} onClick={download}>Ↄ Slide actual</button>
            <button style={{ ...S.dlBtn, background: '#1D1D1F' }} onClick={downloadAll}>Ↄ Todas las slides</button>
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  card: { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  label: { fontSize: 14, fontWeight: 600, color: '#1D1D1F' },
  labelSm: { fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.06em' },
  pilarBadge: { fontSize: 11, fontWeight: 500, color: '#955FB5', background: 'rgba(149,95,181,0.1)', padding: '3px 8px', borderRadius: 20 },
  tabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tab: { fontSize: 11, fontWeight: 500, color: '#86868B', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  tabActive: { color: '#955FB5', background: 'rgba(149,95,181,0.1)', border: '1px solid rgba(149,95,181,0.3)' },
  canvasWrap: { background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 },
  spinner: { width: 32, height: 32, border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #955FB5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  copyBtn: { fontSize: 12, fontWeight: 500, color: '#1D1D1F', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', width: 'fit-content' },
  dlBtn: { fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#955FB5', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', flex: 1, textAlign: 'center' },
}
