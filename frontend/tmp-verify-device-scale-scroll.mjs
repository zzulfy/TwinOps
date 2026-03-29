import puppeteer from "puppeteer";

const APP_URL = process.env.APP_URL || "http://127.0.0.1:4173/";

const run = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(APP_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector(".weather-scroll-area");

    const longListCheck = await page.evaluate(async () => {
      const container = document.querySelector(".weather-scroll-area");
      const items = Array.from(document.querySelectorAll(".widget-weather-item"));

      if (!container || items.length === 0) {
        return { ok: false, reason: "missing_container_or_items" };
      }

      const hasOverflow = container.scrollHeight > container.clientHeight + 1;
      container.scrollTop = container.scrollHeight;
      await new Promise((resolve) => setTimeout(resolve, 80));

      const last = items[items.length - 1];
      const cRect = container.getBoundingClientRect();
      const lRect = last.getBoundingClientRect();
      const reachable = lRect.bottom <= cRect.bottom + 1;

      return {
        ok: hasOverflow && reachable,
        hasOverflow,
        reachable,
        clientHeight: container.clientHeight,
        scrollHeight: container.scrollHeight,
      };
    });

    const shortListCheck = await page.evaluate(async () => {
      const container = document.querySelector(".weather-scroll-area");
      const items = Array.from(document.querySelectorAll(".widget-weather-item"));

      if (!container || items.length < 2) {
        return { ok: false, reason: "insufficient_items" };
      }

      items.forEach((el, idx) => {
        el.style.display = idx < 2 ? "" : "none";
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      const noUnnecessaryOverflow = container.scrollHeight <= container.clientHeight + 1;

      items.forEach((el) => {
        el.style.display = "";
      });

      return {
        ok: noUnnecessaryOverflow,
        noUnnecessaryOverflow,
        clientHeight: container.clientHeight,
        scrollHeight: container.scrollHeight,
      };
    });

    const visualCheck = await page.evaluate(() => {
      const panel = document.querySelector(".layout-panel");
      const card = document.querySelector(".widget-weather-item");

      if (!panel || !card) {
        return { ok: false, reason: "missing_panel_or_card" };
      }

      const panelStyles = window.getComputedStyle(panel);
      const cardStyles = window.getComputedStyle(card);
      const hasPanelRadius = panelStyles.borderRadius !== "0px";
      const hasCardGradient = cardStyles.backgroundImage.includes("gradient");

      return {
        ok: hasPanelRadius && hasCardGradient,
        hasPanelRadius,
        hasCardGradient,
      };
    });

    console.log("LONG_LIST", JSON.stringify(longListCheck));
    console.log("SHORT_LIST", JSON.stringify(shortListCheck));
    console.log("VISUAL", JSON.stringify(visualCheck));

    if (!longListCheck.ok || !shortListCheck.ok || !visualCheck.ok) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
};

run().catch((err) => {
  console.error("VERIFY_ERROR", err);
  process.exitCode = 1;
});
