// Node.js serverless function (NOT edge) - 60s timeout
export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' })
  }

  const { prompt, platform } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  const isLI = platform === 'linkedin'
  const fullPrompt = `${prompt}, high quality, sport photography, natural light, no text, no logos, no watermarks, ${isLI ? 'horizontal landscape composition, wide shot' : 'square composition, dynamic angle'}, photorealistic, professional photography`

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
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: fullPrompt }],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: isLI ? '16:9' : '1:1' }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: 'OpenRouter error', raw: data })
    }

    const message = data?.choices?.[0]?.message
    const imageUrl = message?.images?.[0]?.image_url?.url

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image returned', messageKeys: message ? Object.keys(message) : null, raw: JSON.stringify(data).slice(0, 600) })
    }

    if (imageUrl.startsWith('data:')) {
      return res.status(200).json({ image: imageUrl })
    }

    const imgResp = await fetch(imageUrl)
    const imgBuffer = await imgResp.arrayBuffer()
    const contentType = imgResp.headers.get('content-type') || 'image/png'
    const bytes = new Uint8Array(imgBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)

    return res.status(200).json({ image: `data:${contentType};base64,${base64}` })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
