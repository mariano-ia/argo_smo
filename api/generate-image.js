export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }) }

  const { prompt, platform } = body
  if (!prompt) return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 })

  const isLI = platform === 'linkedin'
  const fullPrompt = `${prompt}, high quality, sport photography, natural light, no text, no logos, no watermarks, ${isLI ? 'horizontal landscape composition, wide shot' : 'square composition, dynamic angle'}, photorealistic, professional photography`

  try {
    // flux.2-max: free, image-only output, uses modalities: ['image']
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argomethod.com',
        'X-Title': 'Argo SMO'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux.2-max',
        messages: [{ role: 'user', content: fullPrompt }],
        modalities: ['image'],
        image_config: {
          aspect_ratio: isLI ? '16:9' : '1:1'
        }
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) }
    catch {
      return new Response(JSON.stringify({ error: 'Parse error', raw: rawText.slice(0, 400) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'OpenRouter error', status: response.status, raw: data }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Per OpenRouter docs: image is in message.images[0].image_url.url
    const message = data?.choices?.[0]?.message
    const imageUrl = message?.images?.[0]?.image_url?.url

    if (!imageUrl) {
      return new Response(JSON.stringify({
        error: 'No image returned',
        messageKeys: message ? Object.keys(message) : null,
        raw: JSON.stringify(data).slice(0, 600)
      }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    // If already base64 data URL, return as-is
    if (imageUrl.startsWith('data:')) {
      return new Response(JSON.stringify({ image: imageUrl }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // External URL: fetch and convert to base64 to avoid CORS issues in canvas
    try {
      const imgResp = await fetch(imageUrl)
      const imgBuffer = await imgResp.arrayBuffer()
      const contentType = imgResp.headers.get('content-type') || 'image/png'
      const bytes = new Uint8Array(imgBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)
      return new Response(JSON.stringify({ image: `data:${contentType};base64,${base64}` }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch {
      // Fallback: return URL directly
      return new Response(JSON.stringify({ image: imageUrl }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
