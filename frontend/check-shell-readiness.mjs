import puppeteer from 'puppeteer';

const BASE_URL = process.env.SMOKE_URL || 'http://127.0.0.1:8090/';
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

const REQUIRED_SELECTORS = ['.layout', '.layout-header', '.layout-main', '.main-left', '.main-right'];

async function assertShell(page, viewportName) {
  for (const selector of REQUIRED_SELECTORS) {
    await page.waitForSelector(selector, { timeout: 12000 });
  }

  const hasCanvas = await page.$('canvas');
  if (!hasCanvas) {
    throw new Error(`[${viewportName}] missing canvas renderer`);
  }
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.setDefaultTimeout(20000);

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await assertShell(page, viewport.name);

  await page.close();

  if (consoleErrors.length > 0) {
    throw new Error(`[${viewport.name}] console errors: ${consoleErrors.join(' | ')}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    for (const viewport of VIEWPORTS) {
      await runViewport(browser, viewport);
      console.log(`PASS shell readiness: ${viewport.name}`);
    }
    console.log('PASS shell readiness checks completed');
  } catch (error) {
    console.error('FAIL shell readiness checks');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
