import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

const DEVICES = [
  {
    deviceCode: "DEV001",
    serialNumber: "SN-001",
    status: "warning",
    type: "server",
    location: "A1-01",
    temperature: 37.1,
    humidity: 42.6,
    power: 521.2,
    cpuLoad: 76.3,
    alarms: [{ id: 1, type: "warning", name: "温度异常", time: "2026-04-10 09:10:00" }],
  },
];

async function installMockFetch(page) {
  await page.evaluateOnNewDocument((mockDevices) => {
    localStorage.setItem("twinops_admin_token", "smoke-token");
    localStorage.setItem(
      "twinops_admin_identity",
      JSON.stringify({ username: "admin", displayName: "Admin", role: "admin" })
    );

    window.fetch = async (input) => {
      const requestUrl =
        typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      const parsedUrl = new URL(requestUrl, window.location.origin);

      if (parsedUrl.pathname === "/api/devices/simulation-consistency") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "ok",
            data: { consistent: true, message: "仿真设备与数据库设备一致" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (parsedUrl.pathname === "/api/devices/simulation-data") {
        return new Response(JSON.stringify({ success: true, message: "ok", data: mockDevices }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

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

      if (parsedUrl.pathname === "/api/alarms") {
        return new Response(JSON.stringify({ success: true, message: "ok", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
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

      return new Response(JSON.stringify({ success: true, message: "ok", data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
  }, DEVICES);
}

async function expectDialogHidden(page, reason) {
  const dialog = await page.$(".simulation-device-dialog");
  if (dialog) {
    throw new Error(`dialog should be closed after ${reason}`);
  }
}

async function openDialogByClickingDevice(page) {
  const scene = await page.$(".main-right");
  if (!scene) {
    throw new Error("main-right container not found");
  }
  const rect = await scene.boundingBox();
  if (!rect) {
    throw new Error("main-right container not found");
  }
  const clickPoints = [
    [0.15, 0.2],
    [0.25, 0.2],
    [0.35, 0.2],
    [0.45, 0.2],
    [0.55, 0.2],
    [0.65, 0.2],
    [0.75, 0.2],
    [0.85, 0.2],
    [0.15, 0.35],
    [0.25, 0.35],
    [0.35, 0.35],
    [0.45, 0.35],
    [0.55, 0.35],
    [0.65, 0.35],
    [0.75, 0.35],
    [0.85, 0.35],
    [0.15, 0.5],
    [0.25, 0.5],
    [0.35, 0.5],
    [0.45, 0.5],
    [0.55, 0.5],
    [0.65, 0.5],
    [0.75, 0.5],
    [0.85, 0.5],
    [0.15, 0.65],
    [0.25, 0.65],
    [0.35, 0.65],
    [0.45, 0.65],
    [0.55, 0.65],
    [0.65, 0.65],
    [0.75, 0.65],
    [0.85, 0.65],
    [0.15, 0.8],
    [0.25, 0.8],
    [0.35, 0.8],
    [0.45, 0.8],
    [0.55, 0.8],
    [0.65, 0.8],
    [0.75, 0.8],
    [0.85, 0.8],
  ];
  for (const [xRate, yRate] of clickPoints) {
    await page.mouse.click(rect.x + rect.width * xRate, rect.y + rect.height * yRate);
    const opened = await page
      .waitForFunction(() => Boolean(document.querySelector(".simulation-device-dialog")), {
        timeout: 1200,
      })
      .then(() => true)
      .catch(() => false);
    if (opened) {
      return;
    }
  }
  throw new Error("unable to open dialog by clicking simulation devices");
}

async function assertCentered(page) {
  const metrics = await page.evaluate(() => {
    const container = document.querySelector(".main-right");
    const dialog = document.querySelector(".simulation-device-dialog");
    if (!container || !dialog) {
      return null;
    }
    const containerRect = container.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    return {
      centerDx: Math.abs(dialogRect.left + dialogRect.width / 2 - (containerRect.left + containerRect.width / 2)),
      centerDy: Math.abs(dialogRect.top + dialogRect.height / 2 - (containerRect.top + containerRect.height / 2)),
    };
  });

  if (!metrics) {
    throw new Error("dialog or container not found for center check");
  }
  if (metrics.centerDx > 4 || metrics.centerDy > 4) {
    throw new Error(`dialog is not centered (dx=${metrics.centerDx}, dy=${metrics.centerDy})`);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);
  await page.setViewport({ width: 1366, height: 900 });

  try {
    await installMockFetch(page);
    await page.goto(`${BASE_URL}#/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".main-right", { timeout: 20000 });

    const hasFloatingLabel = await page.$(".scene-device-label");
    if (hasFloatingLabel) {
      throw new Error("floating device labels should not be rendered");
    }
    const hasTopOrBottomHint = await page.$(".scene-overlay-message, .scene-overlay-hint");
    if (hasTopOrBottomHint) {
      throw new Error("scene overlay hints should not be rendered");
    }
    await expectDialogHidden(page, "initial render");

    await openDialogByClickingDevice(page);
    await assertCentered(page);

    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector(".simulation-device-dialog"), { timeout: 8000 });
    await expectDialogHidden(page, "pressing Escape");

    await openDialogByClickingDevice(page);
    await page.click(".simulation-device-dialog .dialog-close");
    await page.waitForFunction(() => !document.querySelector(".simulation-device-dialog"), { timeout: 8000 });
    await expectDialogHidden(page, "clicking close button");

    await openDialogByClickingDevice(page);
    const scene = await page.$(".main-right");
    if (!scene) {
      throw new Error("main-right container not found");
    }
    const rect = await scene.boundingBox();
    if (!rect) {
      throw new Error("main-right container not found");
    }
    await page.mouse.click(rect.x + 12, rect.y + 12);
    await page.waitForFunction(() => !document.querySelector(".simulation-device-dialog"), { timeout: 8000 });
    await expectDialogHidden(page, "clicking blank scene");

    console.log("PASS centered device dialog smoke");
  } finally {
    await page.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error("FAIL centered device dialog smoke");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
