import { chromium } from "playwright";

const pages = [
  { url: "http://localhost:3000/", name: "home", full: true },
  { url: "http://localhost:3000/properties", name: "properties", full: true },
  { url: "http://localhost:3000/properties/10-marla-residential-plot-top-city-1-block-a", name: "property-detail", full: true },
  { url: "http://localhost:3000/builders", name: "builders", full: true },
  { url: "http://localhost:3000/payment-plans", name: "payment-plans", full: true },
  { url: "http://localhost:3000/admin/login", name: "admin-login", full: false },
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function autoScroll(pg) {
  await pg.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const distance = 250;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        total += distance;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 250);
    });
  });
  await pg.waitForTimeout(1000);
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.waitForTimeout(500);
}

for (const p of pages) {
  await page.goto(p.url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(400);
  if (p.full) await autoScroll(page);
  await page.screenshot({ path: `/tmp/screenshots/${p.name}.png`, fullPage: p.full });
  console.log(`captured ${p.name}`);
}

// Mobile home page
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
await mobilePage.waitForTimeout(400);
await autoScroll(mobilePage);
await mobilePage.screenshot({ path: "/tmp/screenshots/home-mobile.png", fullPage: true });
console.log("captured home-mobile");

await browser.close();
