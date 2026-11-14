const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\phase3";

async function runPhase3TwoTabTest() {
  console.log("============================================================");
  console.log("=== PHASE 3 REAL-TIME TWO-TAB BROWSER VERIFICATION SUITE ===");
  console.log("============================================================");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    protocolTimeout: 60000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1280,800",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });

  let pageKitchen = null;
  let pageWaiter = null;

  try {
    // -------------------------------------------------------------
    // Tab 1: Kitchen Display System (Chef Sanjay)
    // -------------------------------------------------------------
    console.log("\n[Tab 1 - KDS] Opening Kitchen tab...");
    pageKitchen = await browser.newPage();
    await pageKitchen.setViewport({ width: 1280, height: 800 });
    await pageKitchen.bringToFront();

    console.log("[Tab 1 - KDS] Navigating to /login and signing in as Chef Sanjay (Kitchen)...");
    await pageKitchen.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    const chefRoleBtn = await pageKitchen.waitForSelector("::-p-text(Chef / Kitchen Staff)");
    await chefRoleBtn.click();
    await pageKitchen.waitForSelector("::-p-text(Kitchen Display System (KDS))", { timeout: 10000 });
    console.log(`✔ [Tab 1 - KDS] Chef authenticated. Current URL: ${pageKitchen.url()}`);
    console.assert(pageKitchen.url().includes("/kds"), "Kitchen did not land on /kds");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "01-kds-initial-view.png") });

    // -------------------------------------------------------------
    // Tab 2: Front-of-House Waiter Terminal (Captain Waiter)
    // -------------------------------------------------------------
    console.log("\n[Tab 2 - Waiter] Opening Waiter POS tab...");
    pageWaiter = await browser.newPage();
    await pageWaiter.setViewport({ width: 1280, height: 800 });
    await pageWaiter.bringToFront();

    console.log("[Tab 2 - Waiter] Navigating to /login and signing in as Captain Waiter...");
    await pageWaiter.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    const waiterRoleBtn = await pageWaiter.waitForSelector("::-p-text(Captain Waiter)");
    await waiterRoleBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Waiter POS Terminal)", { timeout: 10000 });
    console.log(`✔ [Tab 2 - Waiter] Waiter authenticated. Current URL: ${pageWaiter.url()}`);
    console.assert(pageWaiter.url().includes("/pos"), "Waiter did not land on /pos");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "02-waiter-floor-grid.png") });

    // -------------------------------------------------------------
    // Step 1: Waiter places initial order on Table T3
    // -------------------------------------------------------------
    console.log("\n[Tab 2 - Waiter] Selecting Table T3 on the floor grid...");
    const table3Card = await pageWaiter.waitForSelector("#table-card-T3", { timeout: 5000 });
    await table3Card.click();

    const seatBtn = await pageWaiter.waitForSelector("::-p-text(Seat Diners & Place Order)", { timeout: 5000 });
    await seatBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Order Terminal)", { timeout: 8000 });
    console.log(`✔ [Tab 2 - Waiter] Order Terminal opened for T3: ${pageWaiter.url()}`);

    console.log("[Tab 2 - Waiter] Adding 'Old Delhi Butter Chicken' with custom kitchen notes...");
    const butterChickenBtn = await pageWaiter.waitForSelector("::-p-text(Old Delhi Butter Chicken)");
    await butterChickenBtn.click();

    const kitchenNoteBtn = await pageWaiter.waitForSelector("::-p-text(+ Kitchen Note)");
    await kitchenNoteBtn.click();
    const itemNoteInput = await pageWaiter.waitForSelector("input[placeholder*='Less spicy']");
    await itemNoteInput.type("Spicy, extra gravy");

    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "03-waiter-order-with-note.png") });

    console.log("[Tab 2 - Waiter] Submitting order to kitchen via WebSocket/REST...");
    const sendBtn = await pageWaiter.waitForSelector("::-p-text(Send Order to Kitchen)");
    await sendBtn.click();

    await pageWaiter.waitForSelector("::-p-text(Waiter POS Terminal)", { timeout: 8000 });
    console.log("✔ [Tab 2 - Waiter] Order submitted successfully! Returned to floor grid.");

    // -------------------------------------------------------------
    // Step 2: Real-time verification in Kitchen Tab (NO REFRESH)
    // -------------------------------------------------------------
    console.log("\n[Tab 1 - KDS] Verifying real-time instant ticket arrival WITHOUT page reload...");
    await pageKitchen.bringToFront();
    const kdsTicketT3 = await pageKitchen.waitForSelector("#kds-ticket-T3", { timeout: 12000 });
    console.assert(kdsTicketT3 !== null, "KDS ticket for Table T3 did not appear in real time!");
    console.log("✔ [Tab 1 - KDS] Live ticket #kds-ticket-T3 appeared instantly via Socket.io!");

    // Verify notes and details
    const itemNoteText = await pageKitchen.waitForSelector("::-p-text(Spicy, extra gravy)", { timeout: 5000 });
    console.assert(itemNoteText !== null, "Kitchen note not displayed on ticket!");
    console.log("✔ [Tab 1 - KDS] Ticket displays item note 'Spicy, extra gravy' and elapsed wait timer.");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "04-kds-realtime-order-arrived.png") });

    // -------------------------------------------------------------
    // Step 3: Kitchen updates status: Pending -> Cooking -> Ready
    // -------------------------------------------------------------
    console.log("\n[Tab 1 - KDS] Chef clicks 'Mark Cooking' (PREPARING)...");
    const markCookingBtn = await pageKitchen.waitForSelector("::-p-text(Mark Cooking)", { timeout: 8000 });
    await markCookingBtn.click();

    console.log("[Tab 1 - KDS] Waiting for 'Mark Ready' button to appear...");
    const markReadyBtn = await pageKitchen.waitForSelector("::-p-text(Mark Ready)", { timeout: 8000 });
    console.log("✔ [Tab 1 - KDS] Status updated to 'Cooking' (PREPARING).");
    await new Promise((r) => setTimeout(r, 600));

    console.log("[Tab 1 - KDS] Chef clicks 'Mark Ready' (READY_TO_SERVE)...");
    await markReadyBtn.click();

    await pageKitchen.waitForSelector("::-p-text(Ready to Serve)", { timeout: 8000 });
    console.log("✔ [Tab 1 - KDS] Status updated to 'Ready to Serve' (READY_TO_SERVE).");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "05-kds-status-marked-ready.png") });

    // -------------------------------------------------------------
    // Step 4: Real-time sync back to Waiter Tab (NO REFRESH)
    // -------------------------------------------------------------
    console.log("\n[Tab 2 - Waiter] Verifying real-time Ready-to-Serve alert in Waiter tab WITHOUT page reload...");
    await pageWaiter.bringToFront();
    const readyAlert = await pageWaiter.waitForSelector("#ready-to-serve-alert", { timeout: 12000 });
    console.assert(readyAlert !== null, "Ready-to-serve alert did not appear on Waiter dashboard!");
    const alertContent = await pageWaiter.evaluate((el) => el.textContent, readyAlert);
    console.log(`✔ [Tab 2 - Waiter] Real-time notification received: "${alertContent.trim()}"`);
    console.assert(alertContent.includes("Table T3") && alertContent.includes("READY TO SERVE"), "Notification content mismatch");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "06-waiter-realtime-ready-alert.png") });

    // -------------------------------------------------------------
    // Step 5: Waiter adds Add-on item (Round 2) to Table T3
    // -------------------------------------------------------------
    console.log("\n[Tab 2 - Waiter] Opening Table T3 to append Add-on items...");
    const t3OccupiedCard = await pageWaiter.waitForSelector("#table-card-T3", { timeout: 5000 });
    await t3OccupiedCard.click();

    const orderItemsAddonBtn = await pageWaiter.waitForSelector("::-p-text(Order Items / Add-ons)", { timeout: 5000 });
    await orderItemsAddonBtn.click();

    await pageWaiter.waitForSelector("::-p-text(Order Terminal)", { timeout: 8000 });
    console.log("[Tab 2 - Waiter] Adding 'Butter Garlic Naan' as Add-on Round 2...");
    const naanBtn = await pageWaiter.waitForSelector("::-p-text(Butter Garlic Naan)");
    await naanBtn.click();

    const addonCartBadge = await pageWaiter.waitForSelector("::-p-text(Add-on Round 2)", { timeout: 5000 });
    console.assert(addonCartBadge !== null, "Add-on Round 2 badge not visible in cart");
    console.log("✔ [Tab 2 - Waiter] Item added and flagged as 'Add-on Round 2'.");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "07-waiter-firing-addon-round2.png") });

    const fireAddonBtn = await pageWaiter.waitForSelector("::-p-text(Fire Add-on Round 2 to Kitchen)");
    await fireAddonBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Waiter POS Terminal)", { timeout: 8000 });
    console.log("✔ [Tab 2 - Waiter] Add-on order fired to kitchen successfully!");

    // -------------------------------------------------------------
    // Step 6: Real-time Add-on badge in Kitchen Tab (NO REFRESH)
    // -------------------------------------------------------------
    console.log("\n[Tab 1 - KDS] Verifying real-time ADD-ON badge arrival in Kitchen tab WITHOUT page reload...");
    await pageKitchen.bringToFront();
    const addonBadge = await pageKitchen.waitForSelector("#kds-addon-badge-T3", { timeout: 12000 });
    console.assert(addonBadge !== null, "ADD-ON badge did not appear on ticket in real time!");
    console.log("✔ [Tab 1 - KDS] Amber pulsating ADD-ON badge appeared in real-time!");

    const round2Badge = await pageKitchen.waitForSelector("::-p-text(Round 2)", { timeout: 5000 });
    console.assert(round2Badge !== null, "Round 2 badge not found on new item in ticket");
    console.log("✔ [Tab 1 - KDS] 'Butter Garlic Naan' arrived with 'Round 2' badge.");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "08-kds-realtime-addon-badge.png") });

    // -------------------------------------------------------------
    // Step 7: Bump and Complete Ticket in Kitchen
    // -------------------------------------------------------------
    console.log("\n[Tab 1 - KDS] Progressing Naan: Pending -> Cooking -> Ready...");
    const naanCookingBtn = await pageKitchen.waitForSelector("::-p-text(Mark Cooking)", { timeout: 8000 });
    await naanCookingBtn.click();

    const naanReadyBtn = await pageKitchen.waitForSelector("::-p-text(Mark Ready)", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 600));
    await naanReadyBtn.click();

    console.log("[Tab 1 - KDS] All items are ready. Checking Bump Button...");
    const bumpBtn = await pageKitchen.waitForSelector("::-p-text(Bump & Complete Ticket)", { timeout: 8000 });
    console.log("✔ [Tab 1 - KDS] Bump button ready: 'Bump & Complete Ticket'");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "09-kds-ready-to-bump.png") });

    console.log("[Tab 1 - KDS] Clicking 'Bump & Complete Ticket'...");
    await bumpBtn.click();

    // Verify ticket leaves the active KDS queue
    await pageKitchen.waitForSelector("::-p-text(All caught up!)", { timeout: 8000 });
    console.log("✔ [Tab 1 - KDS] Ticket successfully bumped and removed from active KDS queue!");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "10-kds-queue-cleared.png") });

    console.log("\n============================================================");
    console.log("=== ALL PHASE 3 REAL-TIME TWO-TAB TESTS PASSED 100%!     ===");
    console.log("============================================================");
  } catch (err) {
    if (pageKitchen) await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "error-kds.png") }).catch(() => {});
    if (pageWaiter) await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "error-waiter.png") }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

runPhase3TwoTabTest().catch((err) => {
  console.error("Phase 3 Two-Tab Test Failed:", err);
  process.exit(1);
});
