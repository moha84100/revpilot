import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url)
const source = await readFile(new URL('index.html', dist), 'utf8')

const dashboard = source
  .replace('<title>Logiciel revenue management hôtel | RevPilot</title>', '<title>Démonstration RevPilot — Pilotage hôtelier</title>')
  .replace('content="index, follow, max-image-preview:large"', 'content="noindex, nofollow"')
  .replace('href="https://moha84100.github.io/revpilot/"', 'href="https://moha84100.github.io/revpilot/app/"')
  .replace('href="./favicon.svg"', 'href="../favicon.svg"')
  .replaceAll('="./assets/', '="../assets/')

const notFound = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#183129" />
    <link rel="icon" href="/revpilot/favicon.svg" type="image/svg+xml" />
    <title>Page introuvable | RevPilot</title>
    <style>
      *{box-sizing:border-box}body{display:grid;min-height:100vh;margin:0;place-items:center;padding:24px;color:#f8f5ed;background:#183129;font-family:system-ui,sans-serif;text-align:center}main{max-width:640px}small{color:#d6bd89;font-weight:800;letter-spacing:.14em;text-transform:uppercase}h1{margin:18px 0;font-family:Georgia,serif;font-size:clamp(44px,8vw,78px);font-weight:500;line-height:1}p{color:#c4cec9;line-height:1.7}a{display:inline-block;margin-top:16px;padding:13px 20px;border-radius:999px;color:#183129;background:#d6bd89;font-weight:750;text-decoration:none}a:focus-visible{outline:3px solid white;outline-offset:4px}
    </style>
  </head>
  <body><main><small>Erreur 404</small><h1>Cette page n’existe pas.</h1><p>Revenez à l’accueil de RevPilot pour découvrir le produit ou accéder à la démonstration.</p><a href="/revpilot/">Revenir à l’accueil</a></main></body>
</html>`

const appDirectory = new URL('app/', dist)
await mkdir(appDirectory, { recursive: true })
await writeFile(new URL('index.html', appDirectory), dashboard)
await writeFile(new URL('404.html', dist), notFound)

console.log(`Generated ${join('dist', 'app', 'index.html')} and ${join('dist', '404.html')}`)
