import puppeteer from 'puppeteer';

const BASE_URL = process.env.SMOKE_URL || 'http://127.0.0.1:8090/';
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

const REQUIRED_SELECTORS = [
  '.appshell-root',
  '.appshell-sidebar',
  '.appshell-content',
  '.layout',
  '.layout-main',
  '.main-left',
  '.main-right',
];

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

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("twinops_admin_token", "smoke-token");
    localStorage.setItem(
      "twinops_admin_identity",
      JSON.stringify({ username: "admin", displayName: "Admin", role: "admin" })
    );

    window.fetch = async (input) => {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : String(input);
      const parsedUrl = new URL(requestUrl, window.location.origin);

      if (parsedUrl.pathname === "/api/dashboard/summary") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "ok",
            data: {
              deviceScale: [],
              alarms: [],
              faultRate: { labels: ["10:00"], values: [10] },
              resourceUsage: { labels: ["10:00"], values: [20] },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (parsedUrl.pathname === "/api/alarms") {
        return new Response(
          JSON.stringify({ success: true, message: "ok", data: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (parsedUrl.pathname === "/api/auth/me") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "ok",
            data: { username: "admin", displayName: "Admin", role: "admin" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (parsedUrl.pathname === "/api/dashboard/fault-rate/trend") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "ok",
            data: {
              history: [{ time: "10:00", value: 10.0, forecast: false, confidence: null }],
              forecast: [{ time: "10:01", value: 11.0, forecast: true, confidence: 90.0 }],
              granularity: "minute",
              precision: 1,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "ok", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };
  });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(`${BASE_URL}#/`, { waitUntil: 'domcontentloaded' });
  await assertShell(page, viewport.name);

  await page.close();

  if (consoleErrors.length > 0) {
    throw new Error(`[${viewport.name}] console errors: ${consoleErrors.join(' | ')}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

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
