import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const pages = [
  { path: "/", name: "home" },
  { path: "/properties", name: "properties" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/builders", name: "builders" },
  { path: "/payment-plans", name: "payment-plans" },
];

// find a real property slug for the detail page
await page.goto("http://localhost:3000/properties", { waitUntil: "load", timeout: 15000 });
const firstHref = await page.locator('a[href^="/properties/"]').first().getAttribute("href");
if (firstHref) pages.push({ path: firstHref, name: "property-detail" });

for (const p of pages) {
  await page.goto(`http://localhost:3000${p.path}`, { waitUntil: "load", timeout: 15000 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/screenshots/light-${p.name}.png`, fullPage: true });
}

// flip to dark via the actual toggle button (desktop navbar), then re-shoot
await page.goto("http://localhost:3000/", { waitUntil: "load", timeout: 15000 });
await page.click('button[aria-label="Switch to dark mode"], button[aria-label="Toggle theme"]');
await page.waitForTimeout(400);
const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
console.log("dark class applied:", isDark);

for (const p of pages) {
  await page.goto(`http://localhost:3000${p.path}`, { waitUntil: "load", timeout: 15000 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/screenshots/dark-${p.name}.png`, fullPage: true });
}

// verify persistence across reload
await page.reload({ waitUntil: "load", timeout: 15000 });
const stillDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
console.log("dark persists after reload:", stillDark);

await browser.close();
