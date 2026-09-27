const path = require('path');
const { chromium } = require('@playwright/test');
const jwt = require(path.resolve(__dirname, '../../rayuela-NodeBackend/node_modules/jsonwebtoken'));
const fs = require('fs');

async function capture() {
  const token = jwt.sign(
    {
      userId: '69a22da6f71e7ee6ebbd1f16',
      role: 'Admin',
      email: 'lucas.matw+2@gmail.com',
      username: 'admin',
    },
    'secret',
    { expiresIn: '1d' }
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 2, // crisp high DPI screenshot
  });

  const page = await context.newPage();

  // Pre-seed localStorage
  await page.addInitScript(({ token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', 'admin');
    localStorage.setItem('user_id', '69a22da6f71e7ee6ebbd1f16');
    localStorage.setItem('role', 'Admin');
    localStorage.setItem('complete_name', 'Admin');
    localStorage.setItem('msg_login', '1');
  }, { token });

  const targetUrl = 'http://localhost:5173/admin/project/6a41715197daf01ca5f165a1/gamification/fading';
  console.log('Navigating to', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  // Wait for content to render
  await page.waitForTimeout(2000);

  const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Click "Sugerir insignia por indicador" to select candidate badge and show indicator alert
  const suggestBtn = page.getByRole('button', { name: /Sugerir insignia/i });
  if (await suggestBtn.isVisible()) {
    console.log('Clicking suggest button...');
    await suggestBtn.click();
    await page.waitForTimeout(600);
  }

  // Capture Visual 1: Fading trigger card with suggestion button, indicator alert card, and presets
  const visualsPath = path.join(screenshotsDir, 'fading-indicators-suggestion-ui.png');
  const startFadeCard = page.locator('.v-card:has-text("Iniciar un desvanecimiento")');
  if (await startFadeCard.isVisible()) {
    await startFadeCard.screenshot({ path: visualsPath });
  } else {
    await page.screenshot({ path: visualsPath });
  }
  console.log('Saved visuals screenshot to', visualsPath);

  // Scroll down to the timeseries chart at the bottom
  const chartCard = page.locator('.v-card:has-text("Evolución del Interés Comunitario")');
  const chartPath = path.join(screenshotsDir, 'badge-interest-timeseries-chart.png');
  if (await chartCard.isVisible()) {
    console.log('Scrolling chart into view...');
    await chartCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await chartCard.screenshot({ path: chartPath });
  } else {
    await page.screenshot({ path: chartPath });
  }
  console.log('Saved chart screenshot to', chartPath);

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
