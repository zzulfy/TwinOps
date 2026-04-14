import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("tw_auto_refresh_interval_ms", "60000");
      localStorage.setItem("twinops_admin_token", "smoke-token");
      localStorage.setItem(
        "twinops_admin_identity",
        JSON.stringify({ username: "admin", displayName: "Admin", role: "admin" })
      );
      window.__resolvePatchCount = 0;

      const byStatus = {
        new: [
          {
            id: 10,
            name: "DEV001",
            event: "new-alarm-event",
            type: 3,
            time: "10:00",
            status: "new",
          },
        ],
        resolved: [
          {
            id: 11,
            name: "DEV001",
            event: "resolved-alarm-event",
            type: 2,
            time: "10:01",
            status: "resolved",
          },
        ],
      };

      window.fetch = async (input, init) => {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : String(input);
        const parsedUrl = new URL(requestUrl, window.location.origin);

        if (parsedUrl.pathname === "/api/devices") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: [
                {
                  deviceCode: "DEV001",
                  name: "1# 服务器机柜",
                  type: "服务器机柜",
                  status: "warning",
                  serialNumber: "SN-001",
                  location: "A-01",
                  temperature: 33,
                  humidity: 44,
                  voltage: 220,
                  current: 10,
                  power: 2100,
                  cpuLoad: 50,
                  memoryUsage: 45,
                  diskUsage: 30,
                  networkTraffic: 120,
                  alarms: [],
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (parsedUrl.pathname === "/api/watchlist") {
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: [] }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (parsedUrl.pathname === "/api/alarms") {
          const status = parsedUrl.searchParams.get("status") || "new";
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: byStatus[status] || [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (parsedUrl.pathname === "/api/alarms/10/status" && (init?.method || "GET") === "PATCH") {
          const body = init?.body ? JSON.parse(String(init.body)) : {};
          if (body.status !== "resolved") {
            return new Response(JSON.stringify({ success: false, message: "invalid status", data: null }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          window.__resolvePatchCount += 1;
          return new Response(
            JSON.stringify({
              success: true,
              message: "ok",
              data: {
                id: 10,
                name: "DEV001",
                event: "new-alarm-event",
                type: 3,
                time: "10:00",
                status: "resolved",
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "ok", data: {} }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };
    });

    await page.goto(`${BASE_URL}#/devices/DEV001`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".alarm-tab-btn");
    await page.waitForFunction(() => document.body.innerText.includes("new-alarm-event"));
    await page.waitForFunction(() => !document.body.innerText.includes("已确认"));

    await page.click(".alarm-action-btn");
    await page.waitForFunction(() => window.__resolvePatchCount === 1);

    const tabButtons = await page.$$(".alarm-tab-btn");
    await tabButtons[1].click();
    await page.waitForFunction(() => document.body.innerText.includes("resolved-alarm-event"));
    await page.waitForFunction(() => document.querySelectorAll(".alarm-action-btn").length === 0);

    console.log("PASS device alarm two-status smoke");
  } catch (error) {
    console.error("FAIL device alarm two-status smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
