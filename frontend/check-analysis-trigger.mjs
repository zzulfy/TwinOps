import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  try {
    await page.evaluateOnNewDocument(() => {
      const baseReport = {
        id: 100,
        deviceCode: "AGGREGATED",
        metricSummary: "auto-generated",
        prediction: "stable",
        confidence: 0.9,
        riskLevel: "low",
        recommendedAction: "observe",
        status: "success",
        errorMessage: null,
        createdAt: "2026-01-01 00:00:00",
      };
      const reports = [baseReport];
      const triggerBodies = [];
      window.__analysisSmoke = { reports, triggerBodies };
      localStorage.setItem("twinops_admin_token", "smoke-token");
      localStorage.setItem(
        "twinops_admin_identity",
        JSON.stringify({ username: "admin", displayName: "Admin", role: "admin" })
      );
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : String(input);
        const parsedUrl = new URL(requestUrl, window.location.origin);
        if (!parsedUrl.pathname.startsWith("/api/analysis/reports")) {
          return originalFetch(input, init);
        }
        if (parsedUrl.pathname.endsWith("/trigger")) {
          triggerBodies.push(init?.body);
          const nextId = reports[0].id + 1;
          reports.unshift({
            ...baseReport,
            id: nextId,
            createdAt: "2026-01-01 00:01:00",
          });
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
                data: {
                  triggerId: "manual-20260101000100",
                  status: "processing",
                  targetCount: 2,
                  acceptedCount: 1,
                  failedCount: 0,
                },
              }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (parsedUrl.pathname === "/api/analysis/reports") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: reports,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        const detailMatch = parsedUrl.pathname.match(/^\/api\/analysis\/reports\/(\d+)$/);
        if (detailMatch) {
          const matched = reports.find((item) => item.id === Number(detailMatch[1]));
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: matched ?? reports[0],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        return originalFetch(input, init);
      };
    });
    await page.goto(`${BASE_URL}#/analysis`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".trigger-form");
    await page.click(".trigger-form button");
    await page.waitForSelector(".status.success", { timeout: 15000 });
    const triggerText = await page.$eval(".status.success", (el) => el.textContent || "");
    if (!triggerText.includes("任务ID")) {
      throw new Error(`unexpected trigger message: ${triggerText}`);
    }
    const smokeState = await page.evaluate(() => window.__analysisSmoke);
    if (!smokeState || smokeState.reports.length < 2) {
      throw new Error("expected reports list to contain newly generated aggregated report");
    }
    if (smokeState.reports[0].deviceCode !== "AGGREGATED") {
      throw new Error(`unexpected first report device code: ${smokeState.reports[0].deviceCode}`);
    }
    if (
      smokeState.triggerBodies.length !== 1 ||
      (smokeState.triggerBodies[0] !== undefined && smokeState.triggerBodies[0] !== null)
    ) {
      throw new Error(`expected trigger request without payload, got: ${String(smokeState.triggerBodies[0])}`);
    }
    console.log("PASS analysis trigger smoke");
  } catch (error) {
    console.error("FAIL analysis trigger smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
