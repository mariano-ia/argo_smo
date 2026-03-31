import { useState, useEffect } from 'react'
import PostCard from './components/PostCard.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import UsagePanel, { saveUsageEvent } from './components/UsagePanel.jsx'
import { supabase } from './lib/supabase.js'

export default function App() {
  const [phase, setPhase] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [igData, setIgData] = useState(null)
  const [liData, setLiData] = useState(null)
  const [igImage, setIgImage] = useState(null)
  const [liImage, setLiImage] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Carga historial desde Supabase al iniciar
  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await supabase
        .from('posts_history')
        .select('*')
        .order('created_at', { ascending: true })
      if (!error && data) setHistory(data)
      setLoadingHistory(false)
    }
    loadHistory()
  }, [])

  const addToHistory = async (ig, li) => {
    const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const newPosts = [
      { date: today, platform: 'instagram', pilar: ig.pilar, headline: ig.headline, template: ig.template },
      { date: today, platform: 'linkedin', pilar: li.pilar, headline: li.headline, template: li.template },
    ]
    const { data } = await supabase.from('posts_history').insert(newPosts).select()
    if (data) setHistory(prev => [...prev, ...data])
  }

  const updateHistory = async (updated) => {
    setHistory(updated)
    const currentIds = updated.map(p => p.id)
    const removedIds = history.filter(p => !currentIds.includes(p.id)).map(p => p.id)
    if (removedIds.length > 0) {
      await supabase.from('posts_history').delete().in('id', removedIds)
    }
  }

  const generate = async () => {
    setPhase('generating-content')
    setStatusMsg('Claude está decidiendo el contenido del día...')
    setError(null)
    setIgData(null); setLiData(null); setIgImage(null); setLiImage(null)

    try {
      const recentPosts = history.slice(-12)
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recentPosts })
      })
      if (!contentRes.ok) throw new Error(`Error generando contenido: ${contentRes.status}`)
      const content = await contentRes.json()
      if (content.error) throw new Error(content.error)

      setIgData(content.instagram)
      setLiData(content.linkedin)
      await addToHistory(content.instagram, content.linkedin)
      await saveUsageEvent('content', 800)

      setPhase('generating-images')
      setStatusMsg('Nano Banana generando imágenes...')

      const [igImg, liImg] = await Promise.all([
        fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content.instagram.imagePrompt, platform: 'instagram' })
        }).then(r => r.json()).then(d => d.image || null).catch(() => null),

        fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content.linkedin.imagePrompt, platform: 'linkedin' })
        }).then(r => r.json()).then(d => d.image || null).catch(() => null),
      ])

      if (igImg) await saveUsageEvent('image', 500)
      if (liImg) await saveUsageEvent('image', 500)

      setIgImage(igImg)
      setLiImage(liImg)
      setPhase('done')
      setStatusMsg('Piezas listas. Revisá, descargá y publicá.')
    } catch (e) {
      setError(e.message)
      setPhase('error')
      setStatusMsg('')
    }
  }

  const isLoading = phase === 'generating-content' || phase === 'generating-images'
  const isGeneratingImages = phase === 'generating-images'

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoDot} />
            <span style={styles.logoText}>Argo</span>
            <span style={styles.logoSub}>SMO</span>
          </div>
          <div style={styles.headerRight}>
            <UsagePanel />
            <button style={styles.historyBtn} onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Ocultar historial' : `Historial (${history.length})`}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {showHistory && (
          <div style={styles.historySection}>
            <div style={styles.sectionTitle}>Historial de publicaciones</div>
            <HistoryPanel history={history} onUpdate={updateHistory} />
          </div>
        )}

        <div style={styles.hero}>
          <div style={styles.heroText}>
            {phase === 'idle' && 'Generá el contenido de hoy para Argo'}
            {isLoading && statusMsg}
            {phase === 'done' && statusMsg}
            {phase === 'error' && 'Algo salió mal'}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            style={{ ...styles.generateBtn, opacity: isLoading ? 0.7 : 1 }}
            onClick={generate}
            disabled={isLoading}
          >
            {isLoading ? (
              <><span style={styles.spinner} /> {phase === 'generating-content' ? 'Generando contenido...' : 'Generando imágenes...'}</>
            ) : (
              phase === 'done' ? 'Generar de nuevo' : 'Generar contenido de hoy'
            )}
          </button>

          {history.length > 0 && phase === 'idle' && (
            <div style={styles.historyHint}>
              Claude va a analizar tus últimos {Math.min(history.length, 12)} posts para decidir qué publicar hoy.
            </div>
          )}
        </div>

        {(igData || liData || isLoading) && (
          <div style={styles.grid}>
            <PostCard platform="instagram" data={igData} bgImage={igImage} loading={isGeneratingImages && igData && !igImage} />
            <PostCard platform="linkedin" data={liData} bgImage={liImage} loading={isGeneratingImages && liData && !liImage} />
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', background: '#F5F5F7' },
  header: { background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoDot: { width: 24, height: 24, borderRadius: '50%', background: '#955FB5' },
  logoText: { fontSize: 18, fontWeight: 700, color: '#1D1D1F' },
  logoSub: { fontSize: 12, fontWeight: 600, color: '#955FB5', background: 'rgba(149,95,181,0.1)', padding: '2px 8px', borderRadius: 20 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  historyBtn: { fontSize: 13, fontWeight: 500, color: '#1D1D1F', background: 'transparent', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  historySection: { background: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1D1D1F', marginBottom: 16 },
  hero: { textAlign: 'center', marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  heroText: { fontSize: 20, fontWeight: 600, color: '#1D1D1F' },
  errorBox: { background: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#C0392B', maxWidth: 500, textAlign: 'left' },
  generateBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, color: '#FFFFFF', background: '#955FB5', border: 'none', borderRadius: 14, padding: '14px 32px', cursor: 'pointer', transition: 'transform 0.1s, opacity 0.2s' },
  spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  historyHint: { fontSize: 13, color: '#86868B', background: 'rgba(149,95,181,0.06)', border: '1px solid rgba(149,95,181,0.15)', borderRadius: 10, padding: '8px 16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, animation: 'fadeIn 0.4s ease' },
}
