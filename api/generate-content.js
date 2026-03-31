export const config = { runtime: 'edge' }

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
    "imagePrompt": "prompt en inglés para Nano Banana: escena fotorrealista de jóvenes deportistas, sin texto, sin logos, cinematic lighting, sport photography",
    "template": "igA"
  },
  "linkedin": {
    "pilar": "etiqueta máx 22 chars EN MAYUSCULAS",
    "headline": "frase impactante máx 65 chars, separar líneas con \\n",
    "copy": "copy completo con más desarrollo para LinkedIn",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3",
    "imagePrompt": "prompt en inglés para Nano Banana: escena fotorrealista de entrenador con jóvenes deportistas, sin texto, sin logos, professional photography",
    "template": "liA"
  }
}`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await req.json()
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
      return new Response(JSON.stringify({ error: 'Parse error', raw: text }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
