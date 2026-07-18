import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8')
const [home, dashboard, notFound, sitemap, robots] = await Promise.all([
  read('index.html'),
  read('app/index.html'),
  read('404.html'),
  read('sitemap.xml'),
  read('robots.txt'),
])

function assert(condition, message) {
  if (!condition) throw new Error(`SEO verification failed: ${message}`)
}

assert(home.includes('<title>Logiciel revenue management hôtel | RevPilot</title>'), 'homepage title')
assert(home.includes('content="index, follow, max-image-preview:large"'), 'homepage robots')
assert(home.includes('rel="canonical" href="https://moha84100.github.io/revpilot/"'), 'homepage canonical')
assert(home.includes('application/ld+json'), 'homepage structured data')

const jsonLd = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
assert(Boolean(jsonLd), 'structured data block')
JSON.parse(jsonLd)

assert(dashboard.includes('<title>RevPilot — Pilotage hôtelier</title>'), 'dashboard title')
assert(dashboard.includes('content="noindex, nofollow"'), 'dashboard noindex')
assert(dashboard.includes('rel="canonical" href="https://moha84100.github.io/revpilot/app/"'), 'dashboard canonical')
assert(dashboard.includes('="../assets/'), 'dashboard asset paths')
assert(dashboard.includes('href="../favicon.svg"'), 'dashboard favicon path')

assert(notFound.includes('content="noindex, nofollow"'), '404 noindex')
assert(!notFound.includes('rel="canonical"'), '404 has no canonical')
assert(!notFound.includes('type="module"'), '404 has no application bundle')
assert(sitemap.includes('<loc>https://moha84100.github.io/revpilot/</loc>'), 'sitemap homepage')
assert(!sitemap.includes('/app/'), 'sitemap excludes dashboard')
assert(robots.includes('Sitemap: https://moha84100.github.io/revpilot/sitemap.xml'), 'robots sitemap')

console.log('SEO build verification passed')
