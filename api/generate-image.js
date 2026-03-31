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

  const isLI = platform === 'linkedin'
  const width = isLI ? 1200 : 1024
  const height = isLI ? 628 : 1024

  const fullPrompt = `${prompt}, high quality, sport photography, natural light, no text, no logos, no watermarks, ${isLI ? 'horizontal composition, wide shot' : 'square composition, dynamic angle'}`

  try {
    // Using OpenRouter with black-forest-labs/flux-schnell for image generation
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argomethod.com',
        'X-Title': 'Argo SMO'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-schnell',
        prompt: fullPrompt,
        n: 1,
        size: `${width}x${height}`,
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'OpenRouter error', raw: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const imageUrl = data?.data?.[0]?.url
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image returned', raw: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
