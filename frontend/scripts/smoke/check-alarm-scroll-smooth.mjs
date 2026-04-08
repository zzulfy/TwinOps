import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

const alarmRows = Array.from({ length: 18 }, (_, idx) => ({
  id: idx + 1,
  name: `ROW-${idx + 1}`,
  event: `event-${idx + 1}`,
  type: (idx % 3) + 1,
  time: `2026-01-01 10:${String(idx).padStart(2, "0")}:00`,
  status: idx % 2 === 0 ? "new" : "resolved",
}));

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.evaluateOnNewDocument((rows) => {
      localStorage.setItem("tw_auto_refresh_interval_ms", "60000");
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
                alarms: rows,
                faultRate: { labels: ["10:00"], values: [23] },
                resourceUsage: { labels: ["10:00"], values: [42] },
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
                history: [{ time: "10:00", value: 23.0, forecast: false, confidence: null }],
                forecast: [{ time: "10:01", value: 24.0, forecast: true, confidence: 88.0 }],
                granularity: "minute",
                precision: 1,
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (parsedUrl.pathname === "/api/alarms") {
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: rows }),
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

        return new Response(
          JSON.stringify({ success: true, message: "ok", data: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };
    }, alarmRows);

    await page.goto(`${BASE_URL}#/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.includes("ROW-1"));
    await page.waitForSelector(".item-viewport");

    const firstBefore = await page.$eval(
      ".item-list .item:first-child .item-name",
      (el) => el.textContent || ""
    );
    await new Promise((resolve) => {
      setTimeout(resolve, 3800);
    });
    const firstAfterWait = await page.$eval(
      ".item-list .item:first-child .item-name",
      (el) => el.textContent || ""
    );
    if (firstBefore !== firstAfterWait) {
      throw new Error("alarm list still auto-rotates without user action");
    }

    const manualScrollApplied = await page.$eval(".item-viewport", (el) => {
      const viewport = el;
      if (viewport.scrollHeight <= viewport.clientHeight) {
        return false;
      }
      viewport.scrollTop = 120;
      return viewport.scrollTop > 0;
    });
    if (!manualScrollApplied) {
      throw new Error("manual scrolling is not working on alarm viewport");
    }

    console.log("PASS alarm manual scroll smoke");
  } catch (error) {
    console.error("FAIL alarm manual scroll smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
