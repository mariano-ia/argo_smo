import { useEffect, useRef, useState } from 'react'
import { renderTemplate, getTemplateDimensions } from '../renderer.js'

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
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')

    const carousel = data.carousel || {}

    if (activeSlide === 'carr01') {
      const slide = carousel.slide01 || {}
      if (bgImage) {
        const image = new Image()
        image.onload = () => renderTemplate(ctx, 'carr01', slide.pilar || data.pilar, slide.headline || data.headline, image)
        image.src = bgImage
      } else {
        renderTemplate(ctx, 'carr01', slide.pilar || data.pilar, slide.headline || data.headline, null)
      }
    } else if (activeSlide === 'carr05') {
      const slide = carousel.slide05 || {}
      renderTemplate(ctx, 'carr05', '', slide.headline || data.headline, null, { subline: slide.subline })
    } else {
      const slideKey = `slide0${activeSlide.slice(-1)}`
      const slide = carousel[slideKey] || {}
      const num = parseInt(activeSlide.slice(-1))
      renderTemplate(ctx, activeSlide, '', slide.titulo || '', null, { body: slide.body || '' })
    }
  }, [data, bgImage, activeSlide])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `argo-carousel-${activeSlide}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadAll = async () => {
    for (const slide of slides) {
      setActiveSlide(slide)
      await new Promise(r => setTimeout(r, 300))
      const canvas = canvasRef.current
      if (!canvas) continue
      const link = document.createElement('a')
      link.download = `argo-carousel-${slide}-${new Date().toISOString().slice(0,10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      await new Promise(r => setTimeout(r, 200))
    }
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSlideText = () => {
    if (!data?.carousel) return ''
    const c = data.carousel
    if (activeSlide === 'carr01') return `${c.slide01?.headline || ''}`
    if (activeSlide === 'carr02') return `${c.slide02?.titulo || ''}\n\n${c.slide02?.body || ''}`
    if (activeSlide === 'carr03') return `${c.slide03?.titulo || ''}\n\n${c.slide03?.body || ''}`
    if (activeSlide === 'carr04') return `${c.slide04?.titulo || ''}\n\n${c.slide04?.body || ''}`
    if (activeSlide === 'carr05') return `${c.slide05?.headline || ''}\n${c.slide05?.subline || ''}`
    return ''
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0A66C2' }} />
          <span style={styles.label}>LinkedIn · Carrusel</span>
          {data && <span style={styles.pilarBadge}>{data.pilar}</span>}
        </div>
        {data && (
          <div style={styles.tabs}>
            {slides.map(s => (
              <button
                key={s}
                onClick={() => setActiveSlide(s)}
                style={{ ...styles.tab, ...(activeSlide === s ? styles.tabActive : {}) }}
              >
                {SLIDE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={styles.canvasWrap}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Generando carrusel...</span>
          </div>
        ) : data ? (
          <canvas ref={canvasRef} style={styles.canvas} />
        ) : (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: 32 }}>🎠</span>
            <span style={{ color: '#86868B', fontSize: 14, marginTop: 8 }}>El carrusel aparecerá acá</span>
          </div>
        )}
      </div>

      {/* Copy section */}
      {data && (
        <div style={styles.copySection}>
          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>{SLIDE_LABELS[activeSlide]}</div>
            <div style={{ ...styles.copyText, maxHeight: 120, overflowY: 'auto' }}>{getSlideText()}</div>
            <button style={styles.copyBtn} onClick={() => copyText(getSlideText())}>
              {copied ? '✓ Copiado' : 'Copiar texto'}
            </button>
          </div>

          <div style={styles.copyBlock}>
            <div style={styles.copyLabel}>Copy del post</div>
            <div style={{ ...styles.copyText, maxHeight: 100, overflowY: 'auto' }}>{data.copy}</div>
            <div style={styles.hashtags}>{data.hashtags}</div>
            <button style={styles.copyBtn} onClick={() => copyText(data.copy + '\n\n' + data.hashtags)}>
              Copiar copy + hashtags
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={styles.downloadBtn} onClick={download}>
              ↓ Slide actual
            </button>
            <button style={{ ...styles.downloadBtn, background: '#1D1D1F' }} onClick={downloadAll}>
              ↓ Todas las slides
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  label: { fontSize: 14, fontWeight: 600, color: '#1D1D1F' },
  pilarBadge: { fontSize: 11, fontWeight: 500, color: '#955FB5', background: 'rgba(149,95,181,0.1)', padding: '3px 8px', borderRadius: 20 },
  tabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tab: { fontSize: 11, fontWeight: 500, color: '#86868B', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  tabActive: { color: '#955FB5', background: 'rgba(149,95,181,0.1)', border: '1px solid rgba(149,95,181,0.3)' },
  canvasWrap: { background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
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
  downloadBtn: { fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#955FB5', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', flex: 1, textAlign: 'center' },
}
