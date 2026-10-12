// Renders assets/img/share-<lang>.png (1200×630) from the built home pages.
// Usage: serve the built site on http://127.0.0.1:8765 (GitHub Pages URL rules), then
//   node tools/share-images.mjs [output-dir]
// Requires Playwright (npm i playwright).
import { chromium } from 'playwright';
const out = process.argv[2] || new URL('../assets/img/', import.meta.url).pathname;
const pages = { en: '/', 'zh-Hans': '/zh-Hans/', 'zh-Hant': '/zh-Hant/', ja: '/ja/' };
const css = `
  .masthead, .skip, main > section:not(.hero), footer, .lang-suggest, .store-buttons, .store-note { display: none !important; }
  body { padding-top: 0 !important; background: #ffd600 !important; }
  .hero { width: 1200px; height: 630px; overflow: hidden; }
  .hero-grid { width: 1200px !important; height: 630px; min-height: 630px !important; margin: 0 !important; padding: 0 0 0 76px !important; grid-template-columns: 600px 1fr !important; grid-template-rows: 630px !important; align-items: center !important; gap: 0 !important; text-align: left !important; justify-items: start !important; }
  .hero-copy { display: block !important; }
  .app-badge { margin-bottom: 26px !important; }
  .display { font-size: 70px !important; }
  .hero .lead { font-size: 22px !important; max-width: 27em !important; margin-top: 22px !important; }
  .hero-art { align-self: start !important; width: 524px; height: 630px; padding: 48px 150px 0 0 !important; justify-content: center !important; }
  :lang(ja) .display { font-size: 54px !important; }
  :lang(zh-Hans) .display, :lang(zh-Hant) .display { font-size: 66px !important; }
  :lang(zh-Hans) .hero .lead, :lang(zh-Hant) .hero .lead, :lang(ja) .hero .lead { font-size: 20px !important; line-height: 1.75 !important; }
  .hero-device { width: 330px !important; }
  .hero-rings { display: block !important; }
  .hero-rings i { left: 80% !important; top: 72% !important; animation: none !important; opacity: 1 !important; transform: none !important; }
`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
for (const [lang, path] of Object.entries(pages)) {
  await page.goto(`http://127.0.0.1:8765${path}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: css });
  await page.evaluate(() => document.querySelectorAll('[data-device]').forEach(d => d.style.setProperty('--k', (d.getBoundingClientRect().width / 436).toFixed(4))));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/share-${lang}.png`, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`share-${lang}.png`);
}
await browser.close();
