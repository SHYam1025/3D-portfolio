import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait a bit for 3D to render
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: '/Users/shyampathak/.gemini/antigravity/artifacts/landing.png' });
  
  // Scroll down a bit
  await page.evaluate(() => window.scrollBy(0, 1000));
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/shyampathak/.gemini/antigravity/artifacts/scrolled.png' });
  
  await browser.close();
})();
