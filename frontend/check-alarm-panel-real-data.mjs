import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

const byStatus = {
  new: [
    {
      id: 1,
      name: "A-NEW",
      event: "new-event",
      type: 3,
      time: "2026-01-01 10:00:00",
      status: "new",
    },
  ],
  acknowledged: [
    {
      id: 2,
      name: "A-ACK",
      event: "ack-event",
      type: 2,
      time: "2026-01-01 10:01:00",
      status: "acknowledged",
    },
  ],
  resolved: [
    {
      id: 3,
      name: "A-RES",
      event: "res-event",
      type: 1,
      time: "2026-01-01 10:02:00",
      status: "resolved",
    },
  ],
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.evaluateOnNewDocument((dataset) => {
      localStorage.setItem("tw_auto_refresh_interval_ms", "800");
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
                alarms: dataset.new,
                faultRate: { labels: ["10:00"], values: [23] },
                resourceUsage: { labels: ["10:00"], values: [42] },
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (parsedUrl.pathname === "/api/alarms") {
          const status = parsedUrl.searchParams.get("status") || "new";
          const payload = dataset[status] || [];
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: payload }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (parsedUrl.pathname === "/api/devices") {
          return new Response(
            JSON.stringify({ success: true, message: "ok", data: [] }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "ok", data: {} }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      };
    }, byStatus);

    await page.goto(`${BASE_URL}#/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".status-tabs .tab-btn");
    await page.waitForFunction(() => document.body.innerText.includes("A-NEW"));

    const buttons = await page.$$(".status-tabs .tab-btn");
    await buttons[1].click();
    await page.waitForFunction(() => document.body.innerText.includes("A-ACK"));
    await page.waitForFunction(() => !document.body.innerText.includes("A-NEW"));

    const contrastOk = await page.$eval(".item-status.is-acknowledged", (el) => {
      const style = window.getComputedStyle(el);
      return style.color !== style.backgroundColor;
    });
    if (!contrastOk) {
      throw new Error("acknowledged badge color and background are visually identical");
    }

    await buttons[2].click();
    await page.waitForFunction(() => document.body.innerText.includes("A-RES"));
    await page.waitForFunction(() => !document.body.innerText.includes("A-ACK"));

    console.log("PASS alarm panel real data + contrast smoke");
  } catch (error) {
    console.error("FAIL alarm panel real data + contrast smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
