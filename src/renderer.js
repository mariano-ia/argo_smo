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

function drawPilarChip(ctx, text, x, y) {
  ctx.font = '700 20px Inter, sans-serif'
  ctx.letterSpacing = '1.5px'
  const label = text.toUpperCase()
  const tw = ctx.measureText(label).width
  const padX = 24, r = 22, chipH = 44
  ctx.fillStyle = C.orange
  roundRect(ctx, x, y - 32, tw + padX * 2, chipH, r); ctx.fill()
  ctx.fillStyle = C.white
  ctx.fillText(label, x + padX, y)
  ctx.letterSpacing = '0px'
  return tw + padX * 2
}

function drawPilarChipSm(ctx, text, x, y) {
  ctx.font = '700 13px Inter, sans-serif'
  ctx.letterSpacing = '1px'
  const label = text.toUpperCase()
  const tw = ctx.measureText(label).width
  const padX = 14, r = 14, chipH = 30
  ctx.fillStyle = C.orange
  roundRect(ctx, x, y - 18, tw + padX * 2, chipH, r); ctx.fill()
  ctx.fillStyle = C.white
  ctx.fillText(label, x + padX, y)
  ctx.letterSpacing = '0px'
  return tw + padX * 2
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
        ctx.fillText(cur, x, cy); cy += lineH; cur = word
      } else cur = test
    }
    if (cur) { ctx.fillText(cur, x, cy); cy += lineH }
  }
  return cy
}

export function renderIgA(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = C.light; ctx.fillRect(0, 0, W, H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip(); drawBg(ctx, img, 0, 0, W, H); ctx.restore() }
  const g = ctx.createLinearGradient(0, H*0.38, 0, H)
  g.addColorStop(0, 'rgba(29,29,31,0)'); g.addColorStop(1, 'rgba(29,29,31,0.96)')
  ctx.fillStyle = g; ctx.fillRect(0, H*0.38, W, H*0.62)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, W, 8)
  ctx.fillStyle = 'rgba(149,95,181,0.15)'; roundRect(ctx, 56, 48, 224, 48, 24); ctx.fill()
  ctx.font = '600 22px Inter, sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Argo Method', 76, 80)
  drawPilarChip(ctx, pilar, 56, 800)
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx, headline, 56, 860, W-80, 70)
  ctx.fillStyle = C.purple; ctx.fillRect(0, 1008, W, 72)
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('argomethod.com', 56, 1050)
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(1013, 1044, 11, 0, Math.PI*2); ctx.fill()
}

export function renderIgB(ctx, W, H, pilar, headline) {
  ctx.fillStyle = C.purple; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(870,-100,350,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(249,115,22,0.18)'; ctx.beginPath(); ctx.arc(0,900,200,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W, 6)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx,16,52,200,44,22); ctx.fill()
  ctx.font = '500 20px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('Argo Method', 76,82)
  ctx.font = 'bold 340px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillText('12',-30,620)
  drawPilarChip(ctx, pilar, 56, 810)
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,headline,56,860,W-80,70)
  ctx.fillStyle = 'rgba(29,29,31,0.5)'; ctx.fillRect(0,1008,W,72)
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('argomethod.com',56,1050)
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(1013,1044,10,0,Math.PI*2); ctx.fill()
}

export function renderIgC(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = C.purple; ctx.fillRect(0,0,W,12)
  ctx.font = '600 21px Inter, sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Argo Method',56,80)
  if (img) { ctx.save(); roundRect(ctx,56,130,W-112,540,16); ctx.clip(); drawBg(ctx,img,56,130,W-112,540); ctx.restore() }
  else { ctx.fillStyle = 'rgba(187,188,255,0.4)'; roundRect(ctx,56,130,W-112,540,16); ctx.fill() }
  drawPilarChipSm(ctx,pilar,56,724)
  ctx.font = 'bold 58px Inter, sans-serif'; ctx.fillStyle = C.dark; wrapLines(ctx,headline,56,776,W-80,70)
  ctx.fillStyle = C.orange; ctx.fillRect(56,972,80,4)
  ctx.font = '500 20px Inter, sans-serif'; ctx.fillStyle = C.gray; ctx.fillText('argomethod.com',152,996)
}

export function renderLiA(ctx, W, H, pilar, headline, img) {
  const imgW=660, pX=imgW+20, pW=W-pX-24
  ctx.fillStyle = C.dark; ctx.fillRect(0,0,W,H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0.imgW,H); ctx.clip(); drawBg(ctx,img,0,0,imgW,H); ctx.restore() }
  else { ctx.fillStyle = 'rgba(187,188,255,0.18)'; ctx.fillRect(0,0,imgW,H) }
  const g = ctx.createLinearGradient(imgW,0,0,0)
  g.addColorStop(0,'rgba(29,29,31,0)'); g.addColorStop(1,'rgba(29,29,31,0.85)')
  ctx.fillStyle = g; ctx.fillRect(0,0,imgW,H)
  ctx.fillStyle = C.dark; ctx.fillRect(imgW,0,W-imgW,H)
  ctx.fillStyle = C.orange; ctx.fillRect(imgW,0,W-imgW,5)
  ctx.font = '600 17px Inter, sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Argo Method',pX,48)
  drawPilarChipSm(ctx,pilar,pX,90)
  ctx.font = 'bold 32px Inter, sans-serif'; ctx.fillStyle = C.white
  const eY = wrapLines(ctx,headline,pX,120,pW,42)
  const dY = Math.max(eY+20,280)
  ctx.font = '15px Inter, sans-serif'; ctx.fillStyle = C.gray
  ctx.fillText('Argo identifica el arquetipo',pX,dY); ctx.fillText('conductual en 12 minutos.',pY,dY+22)
  const bY = Math.max(dY)68,380)
  ctx.fillStyle = C.purple; roundRect(ctx,pX,bY,pW,40,20); ctx.fill()
  ctx.font = '500 15px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('argomethod.com',pX+16,bY+26)
  const q = headline.replace(/\\n/g,' ').replace(/\n/g,' ').slice(0,65)
  ctx.font = 'bold 38px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,`"${q}"`,40,220,imgW-80,50)
}

export function renderLiB(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = C.dark; ctx.fillRect(0,0,W,H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip(); drawBg(ctx,img,0,0,W,H); ctx.restore() }
  else { ctx.fillStyle = 'rgba(187,188,255,0.18)'; ctx.fillRect(0,0,W,H) }
  const g = ctx.createLinearGradient(0,0,W,0)
  g.addColorStop(0,'rgba(29,29,31,0.1)'); g.addColorStop(1,'rgba(29,29,31,0.88)')
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = C.orange; ctx.fillRect(0,0,W,6)
  ctx.fillStyle = C.purple; roundRect(ctx,56,40,190,40,20); ctx.fill()
  ctx.font = '500 18px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('Argo Method',75,65)
  drawPilarChipSm(ctx,pilar,56,378)
  ctx.font = 'bold 52px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,headline,56,424,900,62)
  ctx.font = '500 16px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('argomethod.com',940,600)
}

export function renderLiC(ctx, W, H, pilar, headline) {
  ctx.fillStyle = C.dark; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = C.purple; ctx.fillRect(0,0,8,H)
  ctx.fillStyle = C.orange; ctx.fillRect(800,0,400,5)
  ctx.font = '600 19px Inter, sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Argo Method',1000,55)
  ctx.font = 'bold 62px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,`"${headline}"`,80,120,1100,76)
  ctx.font = '500 18px Inter, sans-serif'; ctx.fillStyle = C.gray; ctx.fillText('— Argo Method, perfilamiento conductual',80,530)
  ctx.font = '500 15px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText('argomethod.com',980,600)
}

export function renderCarr01(ctx, W, H, pilar, headline, img) {
  ctx.fillStyle = '#2A2A35'; ctx.fillRect(0,0,W,H)
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip(); drawBg(ctx,img,0,0,W,H); ctx.restore() }
  const g = ctx.createLinearGradient(0,H*0.3,0,H)
  g.addColorStop(0,'rgba(29,29,31,0)'); g.addColorStop(1,'rgba(29,29,31,0.92)')
  ctx.fillStyle = g; ctx.fillRect(0,T*0.3,W,H*0.7)
  ctx.fillStyle = C.purple; ctx.fillRect(0,0,W,6)
  ctx.fillStyle = C.orange; ctx.fillRect(0,T-6,W,6)
  ctx.fillStyle = 'rgba(149,95,181,0.9)'; roundRect(ctx,56,52,180,40,20); ctx.fill()
  ctx.font = '600 18px Inter, sans-serif'; ctx.fillStyle = C.white; ctx.fillText('Argo Method',72,78)
  ctx.font = '500 18px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('01 / 05',940,78)
  drawPilarChip(ctx,pilar,56,708)
  ctx.font = 'bold 72px Inter, sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,headline,56,772,W-80,84)
  ctx.font = '500 22px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('Desliza y descubrilo  →',56,1020)
}

export function renderCarrContent(ctx, W, H, num, titulo body) {
  ctx.fillStyle = '#F5F5F7'; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = C.purple; ctx.fillRect(0,0,W,8)
  ctx.fillStyle = C.orange; ctx.fillRect(0,H-6,W,6)
  ctx.font = 'bold 480px Inter,sans-serif'; ctx.fillStyle = 'rgba(149,95,181,0.06)'; ctx.fillText(String(num),-40,620)
  ctx.font = '600 18px Inter,sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Argo Method',56,60)
  ctx.font = '500 18px Inter,sans-serif'; ctx.fillStyle = C.gray; ctx.fillText(`0${num} / 05`,940,60)
  ctx.fillStyle = C.orange; ctx.fillRect(56,290,80,5)
  ctx.font = 'bold 58px Inter,sans-serif'; ctx.fillStyle = C.dark; wrapLines(ctx,titulo,56,380,W-80,70)
  ctx.font = '400 30px Inter,sans-serif'; ctx.fillStyle = '#444'; wrapLines(ctx,body,56,530,W-80,44)
}

export function renderCarr05(ctx, W, H, headline, subline) {
  ctx.fillStyle = C.purple; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(870,-50,320,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(-60,950,260,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = C.orange; ctx.fillRect(0,0,W,6)
  ctx.font = '600 18px Inter,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('Argo Method',56,60)
  ctx.font = '500 18px Inter,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('05 / 05&,940,60)
  ctx.font = 'bold 72px Inter,sans-serif'; ctx.fillStyle = C.white; wrapLines(ctx,headline,56,280,W-80,86)
  ctx.font = '400 26px Inter,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(subline || '14 días gratis. Sin tarjeta de crédito.',56,570)
  ctx.fillStyle = C.white; roundRect(ctx,56,620,360,68,34); ctx.fill()
  ctx.font = '700 24px Inter,sans-serif'; ctx.fillStyle = C.purple; ctx.fillText('Iniciar prueba gratuita',86,662)
}

export function getTemplateDimensions(t) {
  return t.startsWith('li') ? { w:1200, h:627 } : { w:1080, h:1080 }
}

export function renderTemplate(ctx, t, pilar, headline, img, extra) {
  const { w, h } = getTemplateDimensions(t)
  if (t==='igA') renderIgA(ctx,w,h,pilar,headline,img)
  else if (t==='igB') renderIgB(ctx,w,h,pilar,headline)
  else if (t==='igC') renderIgC(ctx,w,h,pilar,headline,img)
  else if (t==='liA') renderLiA(ctx,w,h,pilar,headline,img)
  else if (t==='liB') renderLiB(ctx,w,h,pilar,headline,img)
  else if (t==='liC') renderLiC(ctx,w,h,pilar,headline)
  else if (t==='carr01') renderCarr01(ctx,w,h,pilar,headline,img)
  else if (t==='carr02') renderCarrContent(ctx,w,h,2,headline,extra?.body||'')
  else if (t==='carr03') renderCarrContent(ctx,w,h,2,headline,extra?.body||'')
  else if (t==='carr04') renderCarrContent(ctx,w,h,4,headline,extra?.body||'')
  else if (t==='carr05') renderCarr05(ctx,w,h,headline,extra?.subline)
}
