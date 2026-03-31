const C = {
  purple: '#955FB5',
  orange: '#F97316',
  dark: '#1D1D1F',
  light: '#F5F5F7',
  white: '#FFFFFF',
  gray: '#86868B',
  lavender: '#BBBCFF',
}

function sp(hex, opacity = 1) {
  return hex + (opacity < 1 ? Math.round(opacity * 255).toString(16).padStart(2, '0') : '')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawBg(ctx, img, x, y, w, h) {
  if (!img) return
  const scale = Math.max(w / img.width, h / img.height)
  const sw = img.width * scale, sh = img.height * scale
  const sx = x + (w - sw) / 2, sy = y + (h - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh)
}

function wrapLines(ctx, text, x, y, maxW, lineH) {
  const lines = text.replace(/\\n/g, '\n').split('\n')
  let cy = y
  for (const line of lines) {
    const words = line.split(' ')
    let cur = ''
    for (const word of words) {
      const test = cur ? cur + ' ' + word : word
      if (ctx.measureText(test).width > maxW && cur) {
        ctx.fillText(cur, x, cy)
        cy += lineH
        cur = word
      } else cur = test
    }
    if (cur) { ctx.fillText(cur, x, cy); cy += lineH }
  }
  return cy
}

export function renderIgA(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = C.light; ctx.fillRect(0, 0, W, H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip(); drawBg(ctx, img, 0, 0, W, H); ctx.restore() }
  const grad = ctx.createLinearGradient(0, H * 0.38, 0, H)
  grad.addColorStop(0, 'rgba(29,29,31,0)')
  grad.addColorStop(1, 'rgba(29,29,31,0.96)')
  ctx.fillStyle = grad; ctx.fillRect(0, H * 0.38, W, H * 0.62)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, W, 8)
  ctx.fillStyle = 'rgba(149,95,181,0.15)'
  roundRect(ctx, 56, 48, 224, 48, 24); ctx.fill()
  ctx.font = '600 22px Inter, sans-serif'; ctx.fillStyle = C.purple
  ctx.fillText('Argo Method', 76, 80)
  ctx.font = '500 24px Inter, sans-serif'; ctx.fillStyle = C.orange
  ctx.letterSpacing = '2px'; ctx.fillText(pilar.toUpperCase(), 56, 790)
  ctx.letterSpacing = '0px'
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.white
  wrapLines(ctx, headline, 56, 852, W - 80, 70)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 1008, W, 72)
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('argomethod.com', 56, 1050)
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(1013, 1044, 11, 0, Math.PI*2); ctx.fill()
}

export function renderIgB(ctx, W, H, pilar, headline) {
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(870, -100, 350, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(249,115,22,0.18)'; ctx.beginPath(); ctx.arc(0, 900, 200, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W, 6)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, 56, 52, 200, 44, 22); ctx.fill()
  ctx.font = '500 20px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('Argo Method', 76, 82)
  ctx.font = 'bold 340px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillText('12', -30, 620)
  ctx.font = '500 24px Inter, sans-serif'; ctx.fillStyle = C.orange
  ctx.fillText(pilar.toUpperCase(), 56, 800)
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.white
  wrapLines(ctx, headline, 56, 852, W - 80, 70)
  ctx.fillStyle = 'rgba(29,29,31,0.5)'; ctx.fillRect(0, 1008, W, 72)
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('argomethod.com', 56, 1050)
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(1013, 1044, 10, 0, Math.PI*2); ctx.fill()
}

export function renderIgC(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, W, 12)
  ctx.font = '600 21px Inter, sans-serif'; ctx.fillStyle = C.purple
  ctx.fillText('Argo Method', 56, 80)
  if (img) {
    ctx.save(); roundRect(ctx, 56, 130, W - 112, 540, 16); ctx.clip()
    drawBg(ctx, img, 56, 130, W - 112, 540); ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(187,188,255,0.4)'; roundRect(ctx, 56, 130, W - 112, 540, 16); ctx.fill()
  }
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = C.orange
  ctx.fillText(pilar.toUpperCase(), 56, 720)
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.dark
  wrapLines(ctx, headline, 56, 768, W - 80, 70)
  ctx.fillStyle = C.orange; ctx.fillRect(56, 972, 80, 4)
  ctx.font = '500 20px Inter, sans-serif'; ctx.fillStyle = C.gray
  ctx.fillText('argomethod.com', 152, 996)
}

export function renderLiA(ctx, W, H, pilar, headline, img) {
  const imgW = 660
  const panelX = imgW + 20
  const panelW = W - panelX - 24
  ctx.fillStyle = C.dark; ctx.fillRect(0, 0, W, H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,imgW,H); ctx.clip(); drawBg(ctx, img, 0, 0, imgW, H); ctx.restore() }
  else { ctx.fillStyle = 'rgba(187,188,255,0.18)'; ctx.fillRect(0, 0, imgW, H) }
  const grad = ctx.createLinearGradient(imgW, 0, 0, 0)
  grad.addColorStop(0, 'rgba(29,29,31,0)'); grad.addColorStop(1, 'rgba(29,29,31,0.85)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, imgW, H)
  ctx.fillStyle = C.dark; ctx.fillRect(imgW, 0, W - imgW, H)
  ctx.fillStyle = C.orange; ctx.fillRect(imgW, 0, W - imgW, 5)
  // Right panel: Argo label
  ctx.font = '600 17px Inter, sans-serif'; ctx.fillStyle = C.purple
  ctx.fillText('Argo Method', panelX, 48)
  // Pilar
  ctx.font = '700 11px Inter, sans-serif'; ctx.fillStyle = C.orange
  ctx.letterSpacing = '1px'; ctx.fillText(pilar.toUpperCase(), panelX, 82); ctx.letterSpacing = '0px'
  // Headline — max 3 lines at 32px, maxW = panelW
  ctx.font = 'bold 32px Inter, sans-serif'; ctx.fillStyle = C.white
  const endY = wrapLines(ctx, headline, panelX, 120, panelW, 42)
  // Static descriptor — positioned after headline with gap
  const descY = Math.max(endY + 20, 280)
  ctx.font = '15px Inter, sans-serif'; ctx.fillStyle = C.gray
  ctx.fillText('Argo identifica el arquetipo', panelX, descY)
  ctx.fillText('conductual en 12 minutos.', panelX, descY + 22)
  // CTA button
  const btnY = Math.max(descY + 60, 380)
  ctx.fillStyle = C.purple; roundRect(ctx, panelX, btnY, panelW, 40, 20); ctx.fill()
  ctx.font = '500 15px Inter, sans-serif'; ctx.fillStyle = C.white
  ctx.fillText('argomethod.com', panelX + 16, btnY + 26)
  // Left overlay: big quote from first line of headline
  const q = headline.replace(/\\n/g, ' ').replace(/\n/g, ' ').slice(0, 65)
  ctx.font = 'bold 38px Inter, sans-serif'; ctx.fillStyle = C.white
  wrapLines(ctx, `"${q}"`, 40, 220, imgW - 80, 50)
}

export function renderLiB(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = C.dark; ctx.fillRect(0, 0, W, H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip(); drawBg(ctx, img, 0, 0, W, H); ctx.restore() }
  else { ctx.fillStyle = 'rgba(187,188,255,0.18)'; ctx.fillRect(0, 0, W, H) }
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, 'rgba(29,29,31,0.1)'); grad.addColorStop(1, 'rgba(29,29,31,0.88)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W, 6)
  ctx.fillStyle = C.purple; roundRect(ctx, 56, 40, 190, 40, 20); ctx.fill()
  ctx.font = '500 18px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('Argo Method', 75, 65)
  ctx.font = '500 13px Inter, sans-serif'; ctx.fillStyle = C.orange
  ctx.fillText(pilar.toUpperCase(), 56, 374)
  ctx.font = 'bold 52px Inter, sans-serif'; ctx.fillStyle = C.white
  wrapLines(ctx, headline, 56, 414, 900, 62)
  ctx.font = '500 16px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('argomethod.com', 940, 600)
}

export function renderLiC(ctx, W, H, pilar, headline) {
  ctx.fillStyle = C.dark; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, 8, H)
  ctx.fillStyle = C.orange; ctx.fillRect(800, 0, 400, 5)
  ctx.font = '600 19px Inter, sans-serif'; ctx.fillStyle = C.purple
  ctx.fillText('Argo Method', 1000, 55)
  ctx.font = 'bold 62px Inter, sans-serif'; ctx.fillStyle = C.white
  wrapLines(ctx, `"${headline}"`, 80, 120, 1100, 76)
  ctx.font = '500 18px Inter, sans-serif'; ctx.fillStyle = C.gray
  ctx.fillText('— Argo Method, perfilamiento conductual', 80, 530)
  ctx.font = '500 15px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('argomethod.com', 980, 600)
}

export function getTemplateDimensions(template) {
  return template.startsWith('li') ? { w: 1200, h: 627 } : { w: 1080, h: 1080 }
}

export function renderTemplate(ctx, template, pilar, headline, img) {
  const { w, h } = getTemplateDimensions(template)
  if (template === 'igA') renderIgA(ctx, w, h, pilar, headline, img)
  else if (template === 'igB') renderIgB(ctx, w, h, pilar, headline)
  else if (template === 'igC') renderIgC(ctx, w, h, pilar, headline, img)
  else if (template === 'liA') renderLiA(ctx, w, h, pilar, headline, img)
  else if (template === 'liB') renderLiB(ctx, w, h, pilar, headline, img)
  else if (template === 'liC') renderLiC(ctx, w, h, pilar, headline)
}
