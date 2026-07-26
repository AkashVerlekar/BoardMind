const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\91915\\.gemini\\antigravity\\brain\\a3f73d85-917e-4e8a-8e6f-81498624af95';

async function runDemo() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Track console logs to verify no errors
  let consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));
  page.on('requestfailed', request => consoleErrors.push(`Failed Request: ${request.url()}`));

  // 1. Dashboard Home (Desktop)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // Wait for API
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_home_desktop.png'), fullPage: true });

  // 2. Change Reporting Period
  await page.select('#period-select', 'quarter');
  await new Promise(r => setTimeout(r, 2000)); // Wait for API
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_period_quarter.png') });

  // 3. Drill-down: Revenue
  // Find the Revenue metric card
  const cards = await page.$$('.glass-panel');
  // Revenue is usually the first metric card after the summary and health cards
  if (cards.length > 2) {
    await cards[2].click();
    await new Promise(r => setTimeout(r, 1000)); // Wait for modal animation
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_revenue_modal.png') });
    // Click outside to close
    await page.mouse.click(10, 10);
    await new Promise(r => setTimeout(r, 500));
  }

  // 4. Drill-down: Health Score
  // Health score widget is usually the second card (index 1)
  if (cards.length > 1) {
    await cards[1].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_health_modal.png') });
    await page.mouse.click(10, 10);
    await new Promise(r => setTimeout(r, 500));
  }

  // 5. Tablet & Mobile Layouts
  await page.setViewport({ width: 768, height: 1024 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_tablet.png'), fullPage: true });

  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'demo_mobile.png'), fullPage: true });

  await browser.close();

  // Output console error summary
  console.log("Console Errors Detected: ", consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error(consoleErrors);
  }
}

runDemo().catch(console.error);
