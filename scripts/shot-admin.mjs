// Host-only: screenshot the admin dashboard so we can see the nav/icon.
//   npx playwright install chromium && node scripts/shot-admin.mjs
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 4 })
await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' })
await page.fill('#field-email', 'dev@payloadcms.com')
await page.fill('#field-password', 'test')
await page.click('button[type="submit"]')
await page.waitForURL('**/admin', { timeout: 20000 }).catch(() => {})
await page.waitForTimeout(2500)
await page.screenshot({ path: 'admin-dash.png' })
// Tight crop of the top-left nav header where the icon lives.
const dims = await page.evaluate(() => {
  const span = document.querySelector('.logo--gold')
  if (!span) return 'no .logo--gold found'
  const out = []
  let el = span
  for (let i = 0; i < 5 && el; i++) {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const cls = (el.getAttribute && el.getAttribute('class')) || ''
    out.push(`${el.tagName}.${cls.slice(0, 28)} box=${Math.round(r.width)}x${Math.round(r.height)} overflow=${cs.overflow}`)
    el = el.parentElement
  }
  return out
})
console.log('ICON CHAIN:', JSON.stringify(dims, null, 2))
const teeth = await page.evaluate(() => {
  const rect = document.querySelector('.logo--gold svg g rect')
  if (!rect) return 'no rect'
  const cs = getComputedStyle(rect)
  const r = rect.getBoundingClientRect()
  return { fill: cs.fill, display: cs.display, visibility: cs.visibility, w: Math.round(r.width), h: Math.round(r.height) }
})
console.log('TOOTH:', JSON.stringify(teeth))
await page.screenshot({ path: 'admin-nav.png', clip: { x: 0, y: 0, width: 360, height: 160 } })
// Tight high-DPI crop of just the gear icon.
await page.locator('.logo--gold').first().screenshot({ path: 'admin-icon.png' }).catch(() => {})
console.log('saved admin-dash.png + admin-nav.png + admin-icon.png')
await browser.close()
