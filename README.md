# Argo SMO — Generador de contenido

Genera el contenido diario de Argo Method para Instagram y LinkedIn. Un clic, piezas listas para descargar.

## Stack
- React + Vite (frontend)
- Vercel serverless functions (backend)
- Anthropic Claude (decisión de contenido via skill de marketing)
- OpenRouter / Nano Banana (generación de imágenes)

## Setup en Vercel

1. Conectá este repo en vercel.com
2. En **Settings → Environment Variables** agregá:
   - `ANTHROPIC_API_KEY` = tu key de Anthropic (sk-ant-...)
   - `OPENROUTER_API_KEY` = tu key de OpenRouter (sk-or-...)
3. Deploy

## Desarrollo local

```bash
npm install
```

Creá un archivo `.env.local`:

ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

npm run dev
