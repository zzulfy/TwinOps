import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("tw_auto_refresh_interval_ms", "800");
      localStorage.setItem("twinops_admin_token", "smoke-token");
      localStorage.setItem(
        "twinops_admin_identity",
        JSON.stringify({ username: "admin", displayName: "Admin", role: "admin" })
      );

      const reports = [
        {
          id: 301,
          deviceCode: "AGGREGATED",
          metricSummary: "summary-1",
          prediction: "stable",
          confidence: 0.95,
          riskLevel: "low",
          recommendedAction: "observe",
          status: "success",
          errorMessage: null,
          createdAt: "2026-01-01 10:00:00",
        },
      ];
      const fetchState = { listCalls: 0 };
      window.__analysisAutoRefreshSmoke = fetchState;

      window.fetch = async (input) => {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : String(input);
        const parsedUrl = new URL(requestUrl, window.location.origin);

        if (parsedUrl.pathname === "/api/analysis/reports") {
          fetchState.listCalls += 1;
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: reports }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const detailMatch = parsedUrl.pathname.match(/^\/api\/analysis\/reports\/(\d+)$/);
        if (detailMatch) {
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: reports[0] }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (parsedUrl.pathname.endsWith("/trigger")) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: {
                triggerId: "manual-trigger-id",
                status: "processing",
                targetCount: 1,
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

        if (parsedUrl.pathname === "/api/auth/me") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: { username: "admin", displayName: "Admin", role: "admin" },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "ok", data: [] }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      };
    });

    await page.goto(`${BASE_URL}#/analysis`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".report-id");
    await page.waitForSelector(".report-time");
    const titleText = await page.$eval(".report-id", (el) => el.textContent || "");
    if (!titleText.trim().startsWith("#")) {
      throw new Error(`unexpected report headline: ${titleText}`);
    }
    const aggrInHeadline = await page.$eval(".item-head", (el) =>
      (el.textContent || "").includes("AGGREGATED")
    );
    if (aggrInHeadline) {
      throw new Error("report headline still contains AGGREGATED");
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 2200);
    });

    const state = await page.evaluate(() => window.__analysisAutoRefreshSmoke);
    if (!state || state.listCalls < 2) {
      throw new Error(`expected auto-refresh list calls >=2, got ${state?.listCalls}`);
    }

    console.log("PASS analysis auto refresh + headline smoke");
  } catch (error) {
    console.error("FAIL analysis auto refresh + headline smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
