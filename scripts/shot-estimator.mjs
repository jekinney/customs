import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:3000/estimator', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.screenshot({ path: 'estimator.png', fullPage: false })
console.log('saved estimator.png')
await b.close()
