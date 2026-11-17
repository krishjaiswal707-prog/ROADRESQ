const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const html = fs.readFileSync('routing_engine_code.html', 'utf8');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  const element = await page.waitForSelector('.window');
  await element.screenshot({ path: 'routing_engine_code_screenshot.jpg', quality: 95, type: 'jpeg' });
  await browser.close();
  console.log('SCREENSHOT_DONE');
})();

