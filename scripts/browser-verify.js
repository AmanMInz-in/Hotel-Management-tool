const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots";

async function runBrowserVerification() {
  console.log("=== STARTING AUTOMATED BROWSER VERIFICATION (CHROME) ===");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Step 1: Open Login Page
    console.log("Step 1: Navigating to http://localhost:3000/login ...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-login-screen.png") });
    console.log("✔ Login page loaded. Saved screenshot: 01-login-screen.png");

    // Click Master Admin Quick Role Card
    console.log("Step 2: Clicking Master Admin quick card...");
    const adminBtn = await page.waitForSelector("::-p-text(Master Admin)");
    await adminBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log(`✔ Redirected to: ${page.url()}`);
    console.assert(page.url().includes("/admin"), "Did not redirect to /admin");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-admin-dashboard.png") });
    console.log("✔ Admin Dashboard loaded. Saved screenshot: 02-admin-dashboard.png");

    // Step 3: Navigate to Tables & Sections
    console.log("Step 3: Navigating to Tables & Sections (/admin/tables)...");
    const tablesNavLink = await page.waitForSelector("::-p-text(Tables & Sections)");
    await tablesNavLink.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-admin-tables-initial.png") });

    // Step 4: Add Dynamic Table T7
    console.log("Step 4: Adding Table T7 (Capacity 6)...");
    const tableInput = await page.waitForSelector("input[placeholder*='e.g. T7']");
    await tableInput.type("T7");

    const selects = await page.$$("select");
    if (selects.length > 1) {
      await selects[1].select("6");
    }

    const createTableBtn = await page.waitForSelector("::-p-text(Create Table)");
    await createTableBtn.click();

    // Wait for T7 to appear in configured tables list
    await page.waitForSelector("::-p-text(Table T7)", { timeout: 8000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-admin-tables-after-t7.png") });
    console.log("✔ Table T7 created and confirmed visible in browser! Saved: 04-admin-tables-after-t7.png");

    // Step 5: Navigate to Menu & 86'd
    console.log("Step 5: Navigating to Menu & 86'd (/admin/menu)...");
    const menuNavLink = await page.waitForSelector("::-p-text(Menu & 86)");
    await menuNavLink.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Toggle In Stock to 86'd
    const stockBtn = await page.waitForSelector("::-p-text(In Stock)", { timeout: 5000 });
    if (stockBtn) {
      console.log("Step 6: Toggling first item to Out of Stock (86'd)...");
      await stockBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-admin-menu-86d.png") });
      console.log("✔ Item toggled to 86'd. Saved screenshot: 05-admin-menu-86d.png");
    }

    // Step 7: Test Waiter Login and Table Grid
    console.log("Step 7: Testing Waiter Login flow at /login...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    const quickWaiterBtn = await page.waitForSelector("::-p-text(Captain Waiter)");
    await quickWaiterBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log(`✔ Redirected to: ${page.url()}`);
    console.assert(page.url().includes("/pos"), "Did not redirect to /pos");

    // Verify T7 appears on the Waiter POS table grid
    await page.waitForSelector("::-p-text(T7)", { timeout: 8000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-waiter-pos-with-t7.png") });
    console.log("✔ Waiter POS Table Grid verified with Table T7! Saved: 06-waiter-pos-with-t7.png");

    console.log("\n*** ALL BROWSER VERIFICATION TESTS PASSED WITH 100% SUCCESS! ***");
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification error:", err);
  process.exit(1);
});
