// capture-frontend-console.js
// Usage: node tools/capture-frontend-console.js
// Requires Playwright to be installed. It will open http://localhost:5173 and record console messages.

const fs = require('fs');
(async () => {
  try {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const logs = [];
    page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' , timeout: 15000});
    // wait a bit for runtime errors
    await page.waitForTimeout(2000);
    const html = await page.content();
    fs.writeFileSync('tools/frontend-page.html', html, 'utf8');
    await page.screenshot({ path: 'tools/frontend-screenshot.png', fullPage: true });
    fs.writeFileSync('tools/frontend-console.json', JSON.stringify(logs, null, 2), 'utf8');
    console.log('Saved tools/frontend-screenshot.png and tools/frontend-console.json');
    await browser.close();
  } catch (e) {
    console.error('Playwright run failed:', e.message);
    process.exit(2);
  }
})();
