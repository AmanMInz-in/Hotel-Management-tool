const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\ui_audit";

async function runUIAuditVerification() {
  console.log("=== STARTING UI/UX REFACTOR AUDIT & BROWSER VERIFICATION ===");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const firstTable = await prisma.restaurantTable.findFirst({
    orderBy: { tableNumber: "asc" },
  });
  const tableId = firstTable ? firstTable.id : "cmwgmzn1s00079saqhlx9vytj";
  console.log("Using Table ID:", tableId);

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

    const logoutAndGoToLogin = async () => {
      try {
        await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
        await page.evaluate(() => fetch("/api/auth/logout", { method: "POST" }));
      } catch (e) {}
      await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    };

    // ==========================================
    // 1. DESKTOP VIEWPORT (1280 x 800)
    // ==========================================
    console.log("\n--- 1. Testing Desktop Viewport (1280x800) ---");
    await page.setViewport({ width: 1280, height: 800 });

    // 1.1 Login Screen
    console.log("1.1 Navigating to /login...");
    await logoutAndGoToLogin();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-01-login.png") });
    console.log("✔ Desktop Login captured.");

    // 1.2 Sign in as Master Admin
    console.log("1.2 Logging in as Master Admin...");
    const adminRoleBtn = await page.waitForSelector("::-p-text(Master Admin)");
    await adminRoleBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-02-admin-console.png") });
    console.log("✔ Desktop Admin Console captured.");

    // 1.3 Admin Tables
    console.log("1.3 Navigating to /admin/tables...");
    await page.goto("http://localhost:3000/admin/tables", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-03-admin-tables.png") });
    console.log("✔ Desktop Admin Tables captured.");

    // 1.4 Admin Menu
    console.log("1.4 Navigating to /admin/menu...");
    await page.goto("http://localhost:3000/admin/menu", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-04-admin-menu.png") });
    console.log("✔ Desktop Admin Menu captured.");

    // 1.5 Waiter Floor Plan
    console.log("1.5 Logging in as Captain Waiter...");
    await logoutAndGoToLogin();
    const waiterRoleBtn = await page.waitForSelector("::-p-text(Captain Waiter)");
    await waiterRoleBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-05-waiter-floor-grid.png") });
    console.log("✔ Desktop Waiter Floor Grid captured.");

    // 1.6 Order Terminal & Drawer
    console.log(`1.6 Navigating directly to /pos/order/${tableId}...`);
    await page.goto(`http://localhost:3000/pos/order/${tableId}`, { waitUntil: "networkidle0" });
    // Click an item card to populate cart
    const addBtns = await page.$$("button[id^='add-item-btn-']");
    if (addBtns.length > 0) {
      await addBtns[0].click();
      if (addBtns.length > 1) await addBtns[1].click();
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-06-order-terminal.png") });
    console.log("✔ Desktop Order Terminal captured.");

    // 1.7 KDS Queue
    console.log("1.7 Navigating to /kds...");
    await page.goto("http://localhost:3000/kds", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-07-kitchen-queue.png") });
    console.log("✔ Desktop Kitchen Display System captured.");

    // ==========================================
    // 2. MOBILE VIEWPORT (375 x 812 - Touch Ergonomics)
    // ==========================================
    console.log("\n--- 2. Testing Mobile Viewport (375x812) ---");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    // 2.1 Mobile Login
    await logoutAndGoToLogin();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-01-login.png") });
    console.log("✔ Mobile Login captured.");

    // 2.2 Mobile Waiter Floor Plan
    const mobileWaiterBtn = await page.waitForSelector("::-p-text(Captain Waiter)");
    await mobileWaiterBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-02-floor-grid.png") });
    console.log("✔ Mobile Floor Grid captured.");

    // 2.3 Mobile Order Terminal
    await page.goto(`http://localhost:3000/pos/order/${tableId}`, { waitUntil: "networkidle0" });
    const mobAddBtns = await page.$$("button[id^='add-item-btn-']");
    if (mobAddBtns.length > 0) {
      await mobAddBtns[0].click();
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-03-order-terminal.png") });
    console.log("✔ Mobile Order Terminal captured.");

    // 2.4 Mobile KDS
    await page.goto("http://localhost:3000/kds", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-04-kitchen-queue.png") });
    console.log("✔ Mobile Kitchen Queue captured.");

    console.log("\n🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED IN:", SCREENSHOT_DIR);
  } catch (err) {
    console.error("Browser verification error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
}

runUIAuditVerification();
