export const config = { maxDuration: 30 }

const ARGO_SYSTEM_PROMPT = `Sos el departamento de marketing de Argo Method. Operás de forma autónoma.

## Qué es Argo Method
Sistema de perfilamiento conductual para jóvenes deportistas. Combina metodología DISC, ritmo interno (Motor) y alineación con el entorno deportivo para generar 12 arquetipos deportivos con 36 variantes únicas de informe.

Cómo funciona: el adulto registra al deportista. El niño juega La Odisea del Argo, una aventura interactiva de 12 minutos. El adulto recibe un informe con el arquetipo, el motor de rendimiento y el lenguaje exacto para conectar con ese deportista.

Los 12 arquetipos: Impulsor Dinámico, Impulsor Rítmico, Impulsor Sereno, Conector Dinámico, Conector Rítmico, Conector Sereno, Sostenedor Dinámico, Sostenedor Rítmico, Sostenedor Sereno, Estratega Dinámico, Estratega Rítmico, Estratega Observador.

Público objetivo: clubes, federaciones, academias, colegios con programas deportivos. Decisores: directores deportivos, coordinadores, entrenadores.

## Pilares de contenido
1. Ciencia y metodología — DISC aplicado al deporte, arquetipos, perfilado conductual
2. Educación deportiva — cómo motivar, comunicarse, detectar perfiles
3. Producto / funcionalidades — qué hace Argo, cómo se usa, casos de uso

## Tono de voz
Profesional pero humano. Frases cortas. Sin rodeos. Sin marketing vacío ("revolucionario", "disruptivo"). Datos concretos cuando los hay. Primera persona del plural para la marca.

## Límites de caracteres ESTRICTOS
- Pilar (etiqueta): máx 22 caracteres
- Headline Instagram (máx 3 líneas): máx 80 caracteres totales
- Copy Instagram: máx 300 caracteres
- Hashtags Instagram: 8-10 hashtags
- Headline LinkedIn (máx 3 líneas): máx 65 caracteres totales  
- Copy LinkedIn: máx 900 caracteres, puede tener más desarrollo
- Hashtags LinkedIn: 3-5 hashtags

## Tu tarea
Cuando recibas el historial de posts anteriores y sus métricas, analizá qué pilares y formatos funcionaron mejor. Elegí el contenido del día evitando repetir el pilar del post más reciente.

Respondé SIEMPRE con este JSON exacto (sin markdown, sin explicaciones, sin backticks):
{
  "date": "fecha de hoy en formato DD/MM/YYYY",
  "instagram": {
    "pilar": "etiqueta máx 22 chars EN MAYUSCULAS",
    "headline": "frase impactante máx 80 chars, separar líneas con \\n",
    "copy": "copy completo listo para publicar",
    "hashtags": "#hashtag1 #hashtag2 ...",
    "imagePrompt": "photorealistic scene of young athletes aged 8 to 16 years old training sport, natural light, no text, no logos, cinematic lighting, square composition",
    "template": "igA"
  },
  "linkedin": {
    "pilar": "etiqueta máx 22 chars EN MAYUSCULAS",
    "headline": "frase impactante máx 65 chars, separar líneas con \\n",
    "copy": "copy completo con más desarrollo para LinkedIn",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3",
    "imagePrompt": "photorealistic scene of a coach working with young athletes aged 8 to 16 years old, natural light, no text, no logos, professional sport photography, horizontal",
    "template": "liA",
    "carousel": {
      "slide01": { "headline": "titular portada impactante máx 80 chars", "pilar": "ETIQUETA" },
      "slide02": { "titulo": "Titulo slide 2 máx 60 chars", "body": "Contenido de la slide 2, desarrollado y claro, máx 180 chars." },
      "slide03": { "titulo": "Titulo slide 3", "body": "Contenido de la slide 3." },
      "slide04": { "titulo": "Titulo slide 4", "body": "Contenido de la slide 4." },
      "slide05": { "headline": "Frase de cierre poderosa", "subline": "14 días gratis. Sin tarjeta de crédito." }
    }
  }
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' })
  }

  let body
  try {
    body = req.body || {}
  } catch {
    body = {}
  }

  const { recentPosts = [] } = body

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  let historyContext = 'No hay posts anteriores registrados. Es el primer día.'
  if (recentPosts.length > 0) {
    const postLines = recentPosts.slice(0, 10).map(p =>
      `- ${p.date} | ${p.platform} | Pilar: ${p.pilar} | Engagement: ${p.engagement || 'sin datos'} | Template: ${p.template || '-'}`
    ).join('\n')
    historyContext = `Historial reciente (últimos ${recentPosts.length} posts):\n${postLines}`
  }

  const userMessage = `Hoy es ${today}.

${historyContext}

Generá el contenido de hoy para Instagram y LinkedIn. Elegí pilares y temas que complementen lo que ya se publicó. Si hay métricas, priorizá los pilares que más engagement tuvieron.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: ARGO_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    let parsed
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return res.status(500).json({ error: 'Parse error', raw: text })
    }

    return res.status(200).json(parsed)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
