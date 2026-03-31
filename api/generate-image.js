export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { prompt, platform } = body
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 })
  }

  const aspectRatio = platform === 'linkedin' ? '16:9' : '1:1'
  const fullPrompt = `${prompt}, high quality, sport photography, natural light, no text, no logos, no watermarks, ${platform === 'linkedin' ? 'horizontal composition' : 'square composition'}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argomethod.com',
        'X-Title': 'Argo SMO'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        modalities: ['image'],
        messages: [{ role: 'user', content: fullPrompt }],
        image_config: { aspect_ratio: aspectRatio }
      })
    })

    const data = await response.json()
    const images = data.choices?.[0]?.message?.images
    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No image returned', raw: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ image: images[0] }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
