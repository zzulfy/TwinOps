import puppeteer from "puppeteer";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:8090/";

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  try {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("twinops_admin_token", "expired-token");
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
        if (parsedUrl.pathname === "/api/dashboard/summary") {
          return new Response("", { status: 401 });
        }
        return originalFetch(input, init);
      };
    });

    await page.goto(`${BASE_URL}#/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() =>
      window.location.hash.startsWith("#/login?expired=1")
    );
    await page.waitForSelector(".expired-notice");
    const token = await page.evaluate(() =>
      localStorage.getItem("twinops_admin_token")
    );
    if (token) {
      throw new Error("admin session token not cleared after 401");
    }
    console.log("PASS auth expiry redirect smoke");
  } catch (error) {
    console.error("FAIL auth expiry redirect smoke");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
