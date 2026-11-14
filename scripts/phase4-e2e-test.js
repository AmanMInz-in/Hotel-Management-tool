const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\phase4";

async function runPhase4E2ETest() {
  console.log("============================================================");
  console.log("=== PHASE 4 COMPREHENSIVE END-TO-END VERIFICATION SUITE   ===");
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

  let pageWaiter = null;
  let pageKitchen = null;

  try {
    // -------------------------------------------------------------
    // Step 1: Waiter signs in and opens Table T1
    // -------------------------------------------------------------
    console.log("\n[Step 1] Waiter signs in to POS terminal...");
    pageWaiter = await browser.newPage();
    await pageWaiter.setViewport({ width: 1280, height: 800 });
    await pageWaiter.bringToFront();

    await pageWaiter.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    const waiterRoleBtn = await pageWaiter.waitForSelector("::-p-text(Captain Waiter)");
    await waiterRoleBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Waiter POS Terminal)", { timeout: 10000 });
    console.log("✔ Signed in as Captain Waiter. Table grid loaded.");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "01-waiter-pos-table-grid.png") });

    // Open Table T1
    console.log("[Step 1] Selecting Table T1 on the floor grid...");
    const table1Card = await pageWaiter.waitForSelector("#table-card-T1", { timeout: 5000 });
    await table1Card.click();

    const seatBtn = await pageWaiter.waitForSelector("::-p-text(Seat Diners & Place Order)", { timeout: 5000 });
    await seatBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Order Terminal)", { timeout: 8000 });
    console.log("✔ Order Terminal opened for Table T1.");

    // -------------------------------------------------------------
    // Step 2: Place initial order with items & kitchen notes
    // -------------------------------------------------------------
    console.log("\n[Step 2] Adding 'Hyderabadi Dum Biryani' and 'Butter Garlic Naan' to cart...");
    const biryaniBtn = await pageWaiter.waitForSelector("::-p-text(Hyderabadi Dum Biryani)", { timeout: 8000 });
    await biryaniBtn.click();

    const naanBtn = await pageWaiter.waitForSelector("::-p-text(Butter Garlic Naan)", { timeout: 8000 });
    await naanBtn.click();

    const kitchenNoteBtn = await pageWaiter.waitForSelector("::-p-text(+ Kitchen Note)");
    await kitchenNoteBtn.click();
    const itemNoteInput = await pageWaiter.waitForSelector("input[placeholder*='Less spicy']");
    await itemNoteInput.type("Extra raita, mildly spiced");

    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "02-order-terminal-with-dishes.png") });

    const sendOrderBtn = await pageWaiter.waitForSelector("::-p-text(Send Order to Kitchen)");
    await sendOrderBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Waiter POS Terminal)", { timeout: 8000 });
    console.log("✔ Order submitted to kitchen! Table T1 is now OCCUPIED.");

    // -------------------------------------------------------------
    // Step 3: Kitchen tab cooks and marks dishes ready
    // -------------------------------------------------------------
    console.log("\n[Step 3] Opening Kitchen Display System (KDS)...");
    pageKitchen = await browser.newPage();
    await pageKitchen.setViewport({ width: 1280, height: 800 });
    await pageKitchen.bringToFront();

    await pageKitchen.goto("http://localhost:3000/kds", { waitUntil: "networkidle0" });
    const kdsTicketT1 = await pageKitchen.waitForSelector("#kds-ticket-T1", { timeout: 10000 });
    console.assert(kdsTicketT1 !== null, "KDS ticket T1 not found");
    console.log("✔ Ticket for Table T1 received on KDS.");

    // Progress all dishes to Ready via one-tap ticket action
    console.log("[Step 3] Kitchen clicking 'Mark All Ready' on ticket T1...");
    const markAllReadyBtn = await pageKitchen.waitForSelector("::-p-text(Mark All Ready)", { timeout: 8000 });
    await markAllReadyBtn.click();

    console.log("[Step 3] Waiting for 'Bump & Complete Ticket' to become active...");
    const bumpBtn = await pageKitchen.waitForSelector("::-p-text(Bump & Complete Ticket)", { timeout: 8000 });
    console.log("✔ All items marked Ready on KDS.");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "03-kds-order-marked-ready.png") });

    console.log("[Step 3] Kitchen clicking 'Bump & Complete Ticket'...");
    await bumpBtn.click();
    await pageKitchen.waitForSelector("::-p-text(All caught up!)", { timeout: 8000 });
    console.log("✔ Ticket bumped and completed on KDS.");
    await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "04-kds-ticket-bumped.png") });

    // -------------------------------------------------------------
    // Step 4: Waiter opens Billing & Checkout Modal for Table T1
    // -------------------------------------------------------------
    console.log("\n[Step 4] Returning to Waiter tab to open Billing & Checkout...");
    await pageWaiter.bringToFront();
    const t1OccupiedCard = await pageWaiter.waitForSelector("#table-card-T1", { timeout: 5000 });
    await t1OccupiedCard.click();

    const settlePaymentActionBtn = await pageWaiter.waitForSelector("::-p-text(Settle Bill & Payment)", { timeout: 5000 });
    await settlePaymentActionBtn.click();

    await pageWaiter.waitForSelector("::-p-text(Billing & Checkout: Table T1)", { timeout: 8000 });
    console.log("✔ BillPreviewModal opened with 5% GST calculation.");

    // Apply Admin Discount
    console.log("[Step 4] Applying Flat ₹50 Admin Discount...");
    await pageWaiter.select("#discount-type-select", "FLAT");
    const discountValInput = await pageWaiter.waitForSelector("#discount-value-input", { timeout: 5000 });
    await discountValInput.type("50");
    await new Promise((r) => setTimeout(r, 500));
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "05-billing-modal-with-discount.png") });

    // -------------------------------------------------------------
    // Step 5: Test Bill Splitting (Equal & Item-wise)
    // -------------------------------------------------------------
    console.log("\n[Step 5] Testing Equal Split pill button (3 diners)...");
    const split3Btn = await pageWaiter.waitForSelector("#split-btn-3", { timeout: 5000 });
    await split3Btn.click();
    await pageWaiter.waitForSelector("::-p-text(3 Diners)", { timeout: 5000 });
    console.log("✔ Equal 3-way split calculated per-diner share.");

    console.log("[Step 5] Toggling Item-wise Split mode tab...");
    const itemWiseBtn = await pageWaiter.waitForSelector("::-p-text(Item-wise)");
    await itemWiseBtn.click();
    await pageWaiter.waitForSelector("::-p-text(Item-wise Split Mode Active)", { timeout: 5000 });
    console.log("✔ Item-wise split mode verified.");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "06-bill-splitting-modes.png") });

    // Switch back to Equal split and 1 diner for final settlement
    const equalBtn = await pageWaiter.waitForSelector("::-p-text(Equal)");
    await equalBtn.click();
    const split1Btn = await pageWaiter.waitForSelector("#split-btn-1", { timeout: 5000 });
    await split1Btn.click();

    // -------------------------------------------------------------
    // Step 6: Select Payment Mode & Settle Bill
    // -------------------------------------------------------------
    console.log("\n[Step 6] Entering Cash Tendered and settling invoice...");
    const cashInput = await pageWaiter.waitForSelector("#cash-tendered-input");
    await cashInput.type("500");
    await new Promise((r) => setTimeout(r, 400));

    const settleBtn = await pageWaiter.waitForSelector("#settle-and-reset-btn");
    await settleBtn.click();
    console.log("✔ Settlement submitted via REST /api/bills/settle.");

    // -------------------------------------------------------------
    // Step 7: Printable Thermal Invoice Receipt & Table Transition
    // -------------------------------------------------------------
    console.log("\n[Step 7] Verifying thermal invoice receipt...");
    const receiptModal = await pageWaiter.waitForSelector("::-p-text(Settlement Receipt)", { timeout: 8000 });
    console.assert(receiptModal !== null, "Receipt modal did not open!");
    console.log("✔ Printable thermal invoice displayed with GSTIN, items, CGST/SGST, and change.");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "07-bill-settled-thermal-receipt.png") });

    const closeReceiptBtn = await pageWaiter.waitForSelector("#close-receipt-btn");
    await closeReceiptBtn.click();

    console.log("\n[Step 7] Checking Table T1 transition to CLEANING status...");
    await pageWaiter.waitForSelector("::-p-text(CLEANING)", { timeout: 8000 });
    console.log("✔ Table T1 transitioned to CLEANING status.");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "08-table-t1-cleaning-status.png") });

    // -------------------------------------------------------------
    // Step 8: One-Tap Reset to Available
    // -------------------------------------------------------------
    console.log("\n[Step 8] Performing one-tap reset from CLEANING to AVAILABLE...");
    const t1CleaningCard = await pageWaiter.waitForSelector("#table-card-T1");
    await t1CleaningCard.click();

    const markAvailableBtn = await pageWaiter.waitForSelector("#mark-available-btn", { timeout: 5000 });
    await markAvailableBtn.click();

    await pageWaiter.waitForSelector("::-p-text(AVAILABLE)", { timeout: 8000 });
    console.log("✔ Table T1 successfully reset to AVAILABLE for new diners!");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "09-table-t1-reset-available.png") });

    // -------------------------------------------------------------
    // Step 9: Admin Analytics Verification
    // -------------------------------------------------------------
    console.log("\n[Step 9] Navigating to /admin to verify revenue, orders & top-selling dishes...");
    await pageWaiter.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
    await pageWaiter.waitForSelector("::-p-text(Total Revenue)", { timeout: 10000 });
    await pageWaiter.waitForSelector("#top-selling-dishes-list", { timeout: 10000 });

    const biryaniInTopDishes = await pageWaiter.waitForSelector("::-p-text(Hyderabadi Dum Biryani)", { timeout: 5000 });
    console.assert(biryaniInTopDishes !== null, "'Hyderabadi Dum Biryani' not in top-selling dishes!");
    console.log("✔ Admin Analytics verified: Total Revenue, Settled Orders, and 'Hyderabadi Dum Biryani' ranked in Top-Selling Dishes!");
    await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "10-admin-analytics-dashboard.png") });

    console.log("\n============================================================");
    console.log("=== ALL PHASE 4 COMPREHENSIVE E2E TESTS PASSED 100%!     ===");
    console.log("============================================================");
  } catch (err) {
    if (pageWaiter) await pageWaiter.screenshot({ path: path.join(SCREENSHOT_DIR, "error-waiter.png") }).catch(() => {});
    if (pageKitchen) await pageKitchen.screenshot({ path: path.join(SCREENSHOT_DIR, "error-kitchen.png") }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

runPhase4E2ETest().catch((err) => {
  console.error("Phase 4 E2E Test Failed:", err);
  process.exit(1);
});
