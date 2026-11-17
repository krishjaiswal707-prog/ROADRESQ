const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click on 'Hospital Directory' tab
  const buttons = await page.$$('nav button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Hospital Directory')) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: 'hospital_directory_screenshot.jpg', quality: 95, type: 'jpeg' });
  await browser.close();
  console.log('HOSPITAL_SCREENSHOT_SUCCESS');
})();
