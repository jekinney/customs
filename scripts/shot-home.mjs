import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 3 })
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.screenshot({ path: 'home-header.png', clip: { x: 0, y: 0, width: 420, height: 90 } })
console.log('saved home-header.png')
await b.close()
