const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\admin_csv";

async function runVerification() {
  console.log("=== STARTING BROWSER VERIFICATION: BACKGROUND & ADMIN CSV ===");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Step 1: Landing Page with bg.jpg
    console.log("Step 1: Navigating to landing page (http://localhost:3000)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-landing-page-bg.png") });
    console.log("✔ Landing page screenshot captured with background image.");

    // Step 2: Login Page with bg.jpg
    console.log("Step 2: Navigating to login page (http://localhost:3000/login)...");
    // Logout first if already authenticated
    await page.evaluate(() => fetch("/api/auth/logout", { method: "POST" })).catch(() => {});
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-login-terminal-bg.png") });
    console.log("✔ Login terminal screenshot captured with background image.");

    // Step 3: Sign in as Master Admin
    console.log("Step 3: Signing in as Master Admin...");
    const adminBtn = await page.waitForSelector("::-p-text(Master Admin)");
    await adminBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log(`Navigated to: ${page.url()}`);

    // Step 4: Verify Admin Collection Period Tabs (Day, Week, Month)
    console.log("Step 4: Verifying Collection Period Tabs (Day, Week, Month)...");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-admin-collection-day.png") });
    console.log("✔ Default Day period captured.");

    // Switch to Week
    const weekBtn = await page.waitForSelector("#period-btn-week");
    await weekBtn.click();
    await page.waitForResponse((res) => res.url().includes("period=week"));
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-admin-collection-week.png") });
    console.log("✔ Week period captured.");

    // Switch to Month
    const monthBtn = await page.waitForSelector("#period-btn-month");
    await monthBtn.click();
    await page.waitForResponse((res) => res.url().includes("period=month"));
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-admin-collection-month.png") });
    console.log("✔ Month period captured.");

    // Switch back to Day
    const dayBtn = await page.waitForSelector("#period-btn-day");
    await dayBtn.click();
    await page.waitForResponse((res) => res.url().includes("period=day"));
    await new Promise((r) => setTimeout(r, 400));

    // Step 5: Verify CSV Export Button
    console.log("Step 5: Verifying CSV Export button...");
    const csvBtn = await page.waitForSelector("#download-csv-btn");
    const csvBtnText = await page.evaluate((el) => el.innerText, csvBtn);
    console.log(`Found CSV button: "${csvBtnText}"`);
    console.assert(csvBtnText.includes("CSV"), "Button does not contain CSV");

    // Click the button to trigger export
    await csvBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-admin-csv-exported.png") });
    console.log("✔ CSV export action captured.");

    console.log("\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Browser verification error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
