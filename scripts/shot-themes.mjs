import { chromium } from '@playwright/test'
const b = await chromium.launch()
for (const scheme of ['dark', 'light']) {
  const p = await b.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 1.5, colorScheme: scheme })
  await p.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' })
  await p.fill('#field-email', 'dev@payloadcms.com'); await p.fill('#field-password', 'test')
  await p.click('button[type="submit"]'); await p.waitForURL('**/admin', { timeout: 20000 }).catch(()=>{})
  await p.locator('.nav-toggler').first().click().catch(()=>{})
  await p.waitForTimeout(1500)
  await p.screenshot({ path: `theme-${scheme}.png`, clip: { x: 0, y: 0, width: 1000, height: 760 } })
  console.log(`saved theme-${scheme}.png`)
  await p.close()
}
await b.close()
