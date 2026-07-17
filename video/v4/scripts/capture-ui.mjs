import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const v4Root = fileURLToPath(new URL('..', import.meta.url))
const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))
const appRoot = `${projectRoot}/app`
const nodeBin = `${projectRoot}/.tools/node/bin`
const npm = `${nodeBin}/npm`
const captureDir = `${v4Root}/captures`
const tmpDir = `${v4Root}/tmp/playwright-video`
const url = 'http://127.0.0.1:4173/?videoPresentation=v4'
const timeline = JSON.parse(await readFile(`${v4Root}/timeline.json`, 'utf8'))
const uiScenes = timeline.scenes.filter((scene) => scene.source === 'dashboard')

const commandEnv = { ...process.env, PATH: `${nodeBin}:${process.env.PATH ?? ''}` }
const build = spawnSync(npm, ['run', 'build'], { cwd: appRoot, env: commandEnv, stdio: 'inherit' })
if (build.status !== 0) process.exit(build.status ?? 1)

await mkdir(captureDir, { recursive: true })
await mkdir(tmpDir, { recursive: true })

const server = spawn(npm, ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: appRoot,
  env: commandEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
})

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch { /* le serveur démarre */ }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Le serveur RevPilot ne répond pas sur le port 4173.')
}

async function injectPointer(page) {
  await page.evaluate(() => {
    const pointer = document.createElement('div')
    pointer.id = 'revpilot-video-pointer'
    pointer.innerHTML = '<span></span>'
    document.body.append(pointer)
    const style = document.createElement('style')
    style.textContent = `
      #revpilot-video-pointer { position: fixed; z-index: 99999; left: 960px; top: 540px; width: 26px; height: 34px; pointer-events: none; transition: left .72s cubic-bezier(.22,.8,.24,1), top .72s cubic-bezier(.22,.8,.24,1); filter: drop-shadow(0 3px 4px rgba(15,28,52,.28)); }
      #revpilot-video-pointer span { display:block; width: 0; height: 0; border-top: 25px solid #13213d; border-right: 15px solid transparent; transform: rotate(-13deg); }
      #revpilot-video-pointer::after { content:''; position:absolute; left:4px; top:4px; width:8px; height:8px; border-radius:50%; border:2px solid #fff; }
      .revpilot-click-halo { position:fixed; z-index:99998; width:18px; height:18px; margin:-9px; border:3px solid rgba(56,103,214,.72); border-radius:50%; pointer-events:none; animation:revpilot-halo .55s ease-out forwards; }
      @keyframes revpilot-halo { to { width:66px; height:66px; margin:-33px; opacity:0; } }
    `
    document.head.append(style)
  })
}

async function selectorBox(page, selector) {
  const locator = page.locator(`[data-video="${selector}"]`).first()
  if (!await locator.count()) return null
  await locator.scrollIntoViewIfNeeded()
  return locator.boundingBox()
}

async function movePointer(page, selector, halo = false) {
  const box = await selectorBox(page, selector)
  if (!box) throw new Error(`Cible vidéo introuvable : ${selector}`)
  const x = box.x + box.width * .58
  const y = box.y + box.height * .54
  await page.evaluate(({ x, y }) => {
    const pointer = document.querySelector('#revpilot-video-pointer')
    if (pointer) {
      pointer.style.left = `${x}px`
      pointer.style.top = `${y}px`
    }
  }, { x, y })
  await page.waitForTimeout(760)
  if (halo) await page.evaluate(({ x, y }) => {
    const ring = document.createElement('i')
    ring.className = 'revpilot-click-halo'
    ring.style.left = `${x}px`
    ring.style.top = `${y}px`
    document.body.append(ring)
    setTimeout(() => ring.remove(), 650)
  }, { x, y })
  return box
}

async function perform(page, action) {
  if (action.type === 'mode') {
    const locator = page.getByRole('button', { name: 'Avancé' })
    await locator.scrollIntoViewIfNeeded()
    const box = await locator.boundingBox()
    if (box) await page.evaluate(({ x, y }) => {
      const pointer = document.querySelector('#revpilot-video-pointer')
      if (pointer) { pointer.style.left = `${x}px`; pointer.style.top = `${y}px` }
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 })
    await page.waitForTimeout(760)
    await locator.click()
    await page.waitForTimeout(450)
    return
  }
  if (action.type === 'scroll') {
    await page.locator(`[data-video="${action.target}"]`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    return
  }
  const locator = page.locator(`[data-video="${action.target}"]`).first()
  await movePointer(page, action.target, true)
  if (action.type === 'fill') await locator.fill(action.value)
  if (action.type === 'click') await locator.click()
  await page.waitForTimeout(420)
}

let browser
try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })
  const metadata = { width: 1920, height: 1080, scenes: [] }
  for (const scene of uiScenes) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      recordVideo: { dir: tmpDir, size: { width: 1920, height: 1080 } },
    })
    const recordingStarted = Date.now()
    const page = await context.newPage()
    const params = new URLSearchParams({ videoPresentation: 'v4' })
    if (scene.id === 'human-decision') params.set('demoPanel', 'decision')
    if (scene.id === 'events') params.set('demoMode', 'advanced')
    if (scene.id === 'alerts') params.set('demoPanel', 'notifications')
    await page.goto(`http://127.0.0.1:4173/?${params}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => { localStorage.removeItem('revpilot-decisions'); window.scrollTo(0, 0) })
    await injectPointer(page)
    await page.waitForTimeout(500)
    const leadIn = (Date.now() - recordingStarted) / 1000
    const started = Date.now()
    const events = [
      ...(scene.actions ?? []).map((action) => ({ at: action.at, kind: 'action', action })),
      ...(scene.zooms ?? []).map((zoom) => ({ at: zoom.at, kind: 'focus', zoom })),
    ].sort((a, b) => a.at - b.at)
    const boxes = {}
    for (const event of events) {
      const wait = event.at * 1000 - (Date.now() - started)
      if (wait > 0) await page.waitForTimeout(wait)
      if (event.kind === 'action') {
        if (scene.id === 'alerts' && event.action.target === 'notifications-trigger' && await page.locator('[data-video="notifications-drawer"]').count()) continue
        await perform(page, event.action)
      }
      else boxes[event.zoom.target] = await movePointer(page, event.zoom.target)
    }
    for (const selector of scene.selectors ?? []) {
      if (!boxes[selector]) boxes[selector] = await selectorBox(page, selector)
    }
    const remaining = scene.duration * 1000 - (Date.now() - started)
    if (remaining > 0) await page.waitForTimeout(remaining)
    const video = page.video()
    await context.close()
    const rawVideo = await video.path()
    const output = `${captureDir}/${scene.id}.webm`
    await rename(rawVideo, output)
    metadata.scenes.push({ id: scene.id, duration: scene.duration, leadIn, file: `${scene.id}.webm`, boxes })
    console.log(`Scène capturée : ${scene.id}`)
  }
  await writeFile(`${captureDir}/ui-flow-metadata.json`, `${JSON.stringify(metadata, null, 2)}\n`)
  console.log(`Captures terminées : ${captureDir}`)
} finally {
  if (browser) await browser.close().catch(() => undefined)
  server.kill('SIGTERM')
}
