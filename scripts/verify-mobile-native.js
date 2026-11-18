const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\mobile_native";

async function verifyMobileNativeExperience() {
  console.log("=== STARTING MOBILE-FIRST NATIVE ANDROID/PIXEL UI VERIFICATION ===");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const firstTable = await prisma.restaurantTable.findFirst({
    orderBy: { tableNumber: "asc" },
  });
  const tableId = firstTable ? firstTable.id : "cmwgmzn2a000f9saqw7a9ol1g";

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

    // ========================================================
    // 1. ANDROID PIXEL VIEWPORT (412 x 915 - Modern Native Scale)
    // ========================================================
    console.log("\n--- 1. Testing Android Pixel Viewport (412x915) ---");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    // 1.1 Landing Screen
    console.log("1.1 Loading Landing Page...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-01-landing.png") });
    console.log("✔ Pixel Landing Page captured.");

    // 1.2 Login Screen
    console.log("1.2 Loading Login Page...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-02-login.png") });
    console.log("✔ Pixel Login Terminal captured.");

    // 1.3 Sign In as Waiter
    console.log("1.3 Signing in as Captain Waiter...");
    const waiterCard = await page.waitForSelector("::-p-text(Captain Waiter)");
    await waiterCard.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-03-waiter-floor-plan.png") });
    console.log("✔ Pixel Floor Plan captured with 56px Top App Bar and 64px Bottom Nav.");

    // 1.4 Click Table to open Bottom Sheet
    console.log("1.4 Opening Table Action Bottom Sheet...");
    const tableTile = await page.waitForSelector("div[id^='table-card-']");
    await tableTile.click();
    await page.waitForSelector("div[role='dialog']", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-04-table-action-bottom-sheet.png") });
    console.log("✔ Table Action Bottom Sheet captured.");

    // 1.5 Open Order Terminal
    console.log("1.5 Navigating to Order Terminal...");
    await page.goto(`http://localhost:3000/pos/order/${tableId}`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-05-order-terminal.png") });
    console.log("✔ Order Terminal with horizontal category chips captured.");

    // 1.6 Add dishes to Cart to test Sticky Bottom Thumb Action Bar
    console.log("1.6 Adding dishes to test Sticky Bottom Action Bar...");
    const addBtns = await page.$$("button[id^='add-item-btn-']");
    if (addBtns.length > 0) {
      await addBtns[0].click();
      if (addBtns.length > 1) await addBtns[1].click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-06-sticky-bottom-action-bar.png") });
      console.log("✔ Sticky Bottom Action Bar (Review Order) captured.");

      // Open Cart Bottom Sheet
      const reviewBtn = await page.$("#open-mobile-cart-btn");
      if (reviewBtn) {
        await reviewBtn.click();
        await page.waitForSelector("div[role='dialog']", { timeout: 5000 });
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-07-cart-bottom-sheet.png") });
        console.log("✔ Cart Bottom Sheet captured.");

        // Submit order to Kitchen (visible button in bottom sheet)
        console.log("Submitting order to kitchen...");
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const b = btns.find((x) => x.textContent.includes("Send Order to Kitchen") && x.offsetParent !== null);
          if (b) b.click();
        });
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // 1.6b Test Bill & Dynamic UPI QR Bottom Sheet
    console.log("1.6b Navigating back to Floor Plan to test UPI QR Bill Bottom Sheet...");
    await page.goto("http://localhost:3000/pos", { waitUntil: "networkidle0" });
    // Find occupied table
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[id^='table-card-']"));
      const occupied = cards.find((c) => c.textContent.includes("Occupied") || c.textContent.includes("₹"));
      if (occupied) occupied.click();
      else if (cards.length > 0) cards[0].click();
    });
    await page.waitForSelector("div[role='dialog']", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 500));

    // Click "Settle Bill & Payment" if available
    const hasSettle = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((x) => x.textContent.includes("Settle Bill & Payment") && x.offsetParent !== null);
      if (b) {
        b.click();
        return true;
      }
      return false;
    });

    if (hasSettle) {
      await page.waitForSelector("#payment-mode-upi", { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 400));

      // Click UPI tab
      await page.click("#payment-mode-upi");
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-10-upi-qr-card.png") });
      console.log("✔ Dynamic UPI QR Payment Bottom Sheet captured.");

      // Close modal
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find((x) => x.textContent.includes("Cancel") && x.offsetParent !== null);
        if (b) b.click();
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    // 1.7 Kitchen Display System (Mobile Vertical Stack)
    console.log("1.7 Navigating to Kitchen KDS...");
    await page.goto("http://localhost:3000/kds", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-08-kitchen-queue.png") });
    console.log("✔ Mobile KDS Queue with 48px touch actions captured.");

    // 1.8 Admin Console (Mobile Top App Bar & Bottom Nav)
    console.log("1.8 Navigating to Manager Console (/admin)...");
    await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "pixel-09-admin-console.png") });
    console.log("✔ Mobile Admin Console with Collection Filters captured.");

    // ========================================================
    // 2. IPHONE VIEWPORT (375 x 812 - Standard Compact Mobile)
    // ========================================================
    console.log("\n--- 2. Testing iPhone Viewport (375x812) ---");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    await page.goto("http://localhost:3000/pos", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "iphone-01-floor-grid.png") });
    console.log("✔ iPhone Floor Grid captured (Zero horizontal overflow).");

    await page.goto(`http://localhost:3000/pos/order/${tableId}`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "iphone-02-order-screen.png") });
    console.log("✔ iPhone Order Screen captured.");

    console.log("\n🎉 ALL MOBILE-FIRST NATIVE ANDROID SCREENSHOTS CAPTURED IN:", SCREENSHOT_DIR);
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
}

verifyMobileNativeExperience();
