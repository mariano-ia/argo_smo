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
  const fullPrompt = `Generate an image: ${prompt}, high quality, sport photography, natural light, no text, no logos, no watermarks, ${isLI ? 'horizontal landscape composition, wide shot' : 'square composition, dynamic angle'}, photorealistic`

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
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: fullPrompt }],
        modalities: ['image', 'text'],
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) }
    catch {
      return new Response(JSON.stringify({ error: 'Parse error', raw: rawText.slice(0, 500) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'OpenRouter error', status: response.status, raw: data }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    const fullRaw = JSON.stringify(data)
    const content = data?.choices?.[0]?.message?.content
    let imageData = null

    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageData = part.image_url.url
          break
        }
        if (part.type === 'image' && part.source?.data) {
          imageData = `data:${part.source.media_type || 'image/jpeg'};base64,${part.source.data}`
          break
        }
      }
    } else if (typeof content === 'string' && content.startsWith('data:image')) {
      imageData = content
    }

    if (!imageData) {
      return new Response(JSON.stringify({ error: 'No image in response', fullRaw: fullRaw.slice(0, 1000) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ image: imageData }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
