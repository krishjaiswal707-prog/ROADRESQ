const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Test at the exact viewport mentioned: 1138 x 943
  await page.setViewport({ width: 1138, height: 943, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'redesigned_dashboard_screenshot.jpg', quality: 95, type: 'jpeg' });
  await browser.close();
  console.log('SCREENSHOT_CAPTURED_SUCCESSFULLY');
})();
