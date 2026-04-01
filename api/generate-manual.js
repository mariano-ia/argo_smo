export const config = { maxDuration: 30 }

const BRAND_CONTEXT = `
## Argo Method — brand context
Behavioral profiling system for young athletes aged 8–16. Combines DISC methodology, internal rhythm (Motor), and sport-environment alignment → 12 behavioral archetypes, 36 report variants.
How it works: adult registers athlete → child plays 12-min interactive adventure → adult gets report with archetype + exact language to connect with that athlete.
Audience: clubs, federations, academies, private schools. Decision makers: sports directors, coordinators, coaches.
Voice: professional but human, short sentences, no fluff, first person plural.
Content pillars: 1) Science & Method, 2) Sport Education, 3) Product.
`

const SYSTEM_PROMPT = `You are Argo Method's autonomous marketing department. You receive a content idea and generate complete posts for Instagram, LinkedIn, and a LinkedIn carousel.

${BRAND_CONTEXT}

## Output language
ALL content (copy, headlines, hashtags, carousel text) must be in ENGLISH.

## Strict character limits
- Pilar label: max 22 chars, ALL CAPS
- Instagram headline: max 80 chars, split lines with \\n
- Instagram copy: max 300 chars, 8–10 hashtags
- LinkedIn headline: max 65 chars, split lines with \\n
- LinkedIn copy: max 900 chars, 3–5 hashtags
- Carousel: 5 slides. Slide title max 60 chars. Body max 180 chars.

## Image prompt rules
- ONE sport only, specific realistic scenario
- Documentary/editorial style — looks like a real candid photo, not stock
- Natural or available light
- Aged 8 to 16 years old, no text, no logos
- Describe the exact scenario (e.g. "youth soccer player receiving tactical instructions from coach at sideline")

Respond ONLY with this exact JSON (no markdown, no backticks):
{ "instagram": { "pilar":"", "headline":"", "copy":"", "hashtags":"", "imagePrompt":"specific scene, aged 8 to 16, ONE sport, documentary style, natural light, no text, no logos", "template":"igA" }, "linkedin": { "pilar":"", "headline":"", "copy":"", "hashtags":"", "imagePrompt":"specific scene, aged 8 to 16, ONE sport, coach and athlete, documentary style, natural light, no text, no logos", "template":"liA", "carousel": { "slide01":{"headline":"","pilar":""}, "slide02":{"titulo":"","body":""}, "slide03":{"titulo":"","body":""}, "slide04":{"titulo":"","body":""}, "slide05":{"headline":"","subline":"Try it free for 14 days. No credit card required."} } } }`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' })
  const { idea } = req.body || {}
  if (!idea) return res.status(400).json({ error: 'Missing idea' })
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 2000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: `Content idea: ${idea}` }] })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || ''
    try {
      return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim()))
    } catch {
      return res.status(500).json({ error: 'Parse error', raw: text })
    }
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
