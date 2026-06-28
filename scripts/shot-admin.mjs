// Host-only: screenshot the admin dashboard so we can see the nav/icon.
//   npx playwright install chromium && node scripts/shot-admin.mjs
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' })
await page.fill('#field-email', 'dev@payloadcms.com')
await page.fill('#field-password', 'test')
await page.click('button[type="submit"]')
await page.waitForURL('**/admin', { timeout: 20000 }).catch(() => {})
await page.waitForTimeout(2500)
await page.screenshot({ path: 'admin-dash.png' })
// Tight crop of the top-left nav header where the icon lives.
await page.screenshot({ path: 'admin-nav.png', clip: { x: 0, y: 0, width: 360, height: 160 } })
console.log('saved admin-dash.png + admin-nav.png')
await browser.close()
