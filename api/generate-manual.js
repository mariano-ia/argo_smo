// API para generar contenido a partir de una idea manual
export const config = { maxDuration: 30 }

const PROMPT = `Sos el departamento de marketing de Argo Method. Recibirás una idea y generarás el contenido completo para Instagram, LinkedIn y carrusel.

## Argo Method
Sistema de perfilamiento conductual para jóvenes deportistas de 8 a 16 años. DISC + Motor = 12 arquetipos, 36 variantes. El niño juega 12 min. El adulto recibe el informe y el lenguaje exacto.
Público: clubes, federaciones, academias, colegios. Decisores: directores deportivos, coordinadores, entrenadores.

## Tono
Profesional pero humano. Frases cortas. Sin marketing vacío. Primera persona del plural.

## Límites
- Pilar: máx 22 chars EN MAYUSCULAS
- Headline IG: máx 80 chars, separar con \\n
- Copy IG: máx 300 chars
- Hashtags IG: 8-10
- Headline LI: máx 65 chars, separar con \\n
- Copy LI: máx 900 chars
- Hashtags LI: 3-5
- Carrusel: 5 slides. Titulo máx 60 chars. Body máx 180 chars.

Respondé SOLO JSON (sin markdown, sin backticks):
{ "instagram": { "pilar":"", "headline":"", "copy":"", "hashtags":"", "imagePrompt":"photorealistic scene of young athletes aged 8 to 16 years old training, natural light, no text, no logos, cinematic sport photography, square composition", "template":"igA" }, "linkedin": { "pilar":"", "headline":"", "copy":"", "hashtags":"", "imagePrompt":"photorealistic scene of a coach with young athletes aged 8 to 16 years old, natural light, no text, no logos, professional sport photography, horizontal", "template":"liA", "carousel": { "slide01":{"headline":"","pilar":""}, "slide02":{"titulo":"","body":""}, "slide03":{"titulo":"","body":""}, "slide04":{"titulo":"","body":""}, "slide05":{"headline":"","subline":"Probalo 14 días gratis. Sin tarjeta de crédito."} } } }`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' })
  const { idea } = req.body || {}
  if (!idea) return res.status(400).json({ error: 'Missing idea' })
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 2000, system: PROMPT, messages: [{ role: 'user', content: `Idea: ${idea}` }] })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    try { return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim())) }
    catch { return res.status(500).json({ error: 'Parse error', raw: text }) }
  } catch (e) { return res.status(500).json({ error: e.message }) }
}
