import { mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const renderDir = `${root}/renders`
await mkdir(renderDir, { recursive: true })
const browser = await chromium.launch({ headless: true })

try {
  for (const pose of ['welcome', 'point', 'approve', 'calendar']) {
    const page = await browser.newPage({ viewport: { width: 360, height: 420 } })
    await page.goto(pathToFileURL(`${root}/character/${pose}.svg`).href)
    await page.screenshot({ path: `${renderDir}/character-${pose}.png`, omitBackground: true })
    await page.close()
  }

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;width:1920px;height:1080px;overflow:hidden;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#fff;background:radial-gradient(circle at 82% 18%,#315da0 0,#172d52 31%,#0f1b34 72%)}
    .glow{position:absolute;border-radius:999px;filter:blur(1px);opacity:.18}.g1{width:520px;height:520px;right:-130px;top:-170px;background:#7aa0ff}.g2{width:430px;height:430px;left:-170px;bottom:-210px;background:#25b78e}
    main{position:relative;display:grid;height:100%;place-items:center;text-align:center;padding:90px}.brand{display:inline-flex;align-items:center;gap:18px;font-size:34px;font-weight:800}.mark{display:grid;width:58px;height:58px;place-items:center;border-radius:17px 17px 17px 6px;background:linear-gradient(145deg,#7ca0ff,#4670df);box-shadow:0 12px 32px #060d1f66}.mark i{display:flex;align-items:flex-end;gap:4px;height:27px}.mark b{display:block;width:5px;border-radius:5px;background:white}.mark b:nth-child(1){height:12px}.mark b:nth-child(2){height:21px}.mark b:nth-child(3){height:27px}
    h1{margin:70px 0 18px;font-size:78px;line-height:1.02;letter-spacing:-3px}p{margin:0;color:#c6d4ed;font-size:27px}.cta{margin-top:54px;padding:17px 31px;border-radius:14px;color:#13213d;background:#fff;font-size:24px;font-weight:800;box-shadow:0 18px 45px #050a1866}
    .contacts{display:flex;gap:22px;margin-top:42px}.contacts span{padding:15px 21px;border:1px solid #ffffff2b;border-radius:12px;background:#ffffff0d;color:#e8eef9;font-size:21px}.site{position:absolute;bottom:58px;color:#91a8cb;font-size:19px}
  </style></head><body><i class="glow g1"></i><i class="glow g2"></i><main><div><div class="brand"><span class="mark"><i><b></b><b></b><b></b></i></span>RevPilot</div><h1>Décidez plus tôt.<br/>Vendez au bon prix.</h1><p>Découvrez le potentiel caché dans vos réservations.</p><div class="cta">Demandez votre démonstration</div><div class="contacts"><span>07 55 68 32 85</span><span>mohamed.echchkoubi@gmail.com</span></div></div><div class="site">moha84100.github.io/revpilot/</div></main></body></html>`)
  await page.screenshot({ path: `${renderDir}/cta.png` })
  await page.close()
} finally {
  await browser.close()
}

console.log(`Assets graphiques prêts dans ${renderDir}.`)
