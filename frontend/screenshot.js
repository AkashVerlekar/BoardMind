const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\91915\\.gemini\\antigravity\\brain\\a3f73d85-917e-4e8a-8e6f-81498624af95';

async function takeScreenshots() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Desktop View
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_desktop.png'), fullPage: true });

  // Dashboard with Rule-Based Fallback is currently active because we don't have GEMINI_API_KEY.
  // We'll take a screenshot of that explicitly.
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_rule_based.png') });

  // Open Revenue KPI Drill-Down
  const kpiCards = await page.$$('.glass-panel');
  if (kpiCards.length > 2) {
    await kpiCards[2].click(); // Assuming 3rd card is a KPI card like Revenue
    await new Promise(r => setTimeout(r, 1000)); // wait for modal
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_drill_down.png') });
    // Click outside to close modal
    await page.mouse.click(10, 10);
    await new Promise(r => setTimeout(r, 500));
  }

  // Tablet View
  await page.setViewport({ width: 768, height: 1024 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_tablet.png'), fullPage: true });

  // Mobile View
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_mobile.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully.');
}

takeScreenshots().catch(console.error);
