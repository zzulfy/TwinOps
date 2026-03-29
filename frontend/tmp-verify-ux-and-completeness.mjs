import puppeteer from 'puppeteer';

const base = 'http://127.0.0.1:8090/#';

const fail = (msg) => {
  throw new Error(msg);
};

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto(`${base}/devices`, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.waitForSelector('.device-detail-panel', { timeout: 20000 });

    const directCount = await page.$$eval('.device-detail-panel', (els) => els.length);
    if (directCount < 10) fail(`Expected >=10 device panels on /devices, got ${directCount}`);

    const pageOverflow = await page.$eval('.device-page', (el) => getComputedStyle(el).overflowY);
    if (pageOverflow !== 'auto' && pageOverflow !== 'scroll') {
      fail(`Expected .device-page overflow-y to be auto/scroll, got ${pageOverflow}`);
    }

    const titleColor = await page.$eval('.title', (el) => getComputedStyle(el).color);

    await page.goto(`${base}/`, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.waitForSelector('.detail-entry', { timeout: 20000 });

    const scaleLabelColor = await page.$eval('.weather-label', (el) => getComputedStyle(el).color);
    const scaleValueColor = await page.$eval('.weather-value', (el) => getComputedStyle(el).color);

    await page.click('.detail-entry');
    await page.waitForFunction(() => location.hash.includes('/devices'), { timeout: 20000 });
    await page.waitForSelector('.device-detail-panel', { timeout: 20000 });

    const navCount = await page.$$eval('.device-detail-panel', (els) => els.length);
    if (navCount < 10) fail(`Expected >=10 device panels after dashboard navigation, got ${navCount}`);

    console.log('VERIFY_OK');
    console.log(`directCount=${directCount}`);
    console.log(`navCount=${navCount}`);
    console.log(`pageOverflow=${pageOverflow}`);
    console.log(`titleColor=${titleColor}`);
    console.log(`scaleLabelColor=${scaleLabelColor}`);
    console.log(`scaleValueColor=${scaleValueColor}`);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error('VERIFY_FAIL');
  console.error(err?.message || err);
  process.exit(1);
});
