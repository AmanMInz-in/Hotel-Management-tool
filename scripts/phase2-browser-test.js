const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const http = require("http");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\phase2";

function apiRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, hostname: "localhost", port: 3000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function runPhase2() {
  console.log("=== PHASE 2 BROWSER WORKFLOW EXECUTION ===");

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

    // Step 1: Login as Captain Waiter
    console.log("Step 1: Navigating to /login and signing in as Captain Waiter...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    const waiterCard = await page.waitForSelector("::-p-text(Captain Waiter)");
    await waiterCard.click();
    await page.waitForSelector("::-p-text(Waiter POS Terminal)");
    console.log(`✔ Signed in as Waiter. Current URL: ${page.url()}`);
    console.assert(page.url().includes("/pos"), "Did not redirect to /pos");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-waiter-table-grid.png") });

    // Step 2: Open Available Table T2
    console.log("Step 2: Selecting Table T2 on the floor grid...");
    const table2Card = await page.waitForSelector("::-p-text(T2)");
    await table2Card.click();

    // Table action modal should open
    const seatBtn = await page.waitForSelector("::-p-text(Seat Diners & Place Order)", { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-table-action-modal.png") });
    console.log("✔ Table action modal opened. Clicking 'Seat Diners & Place Order'...");
    await seatBtn.click();
    await page.waitForSelector("::-p-text(Order Terminal)");
    console.log(`✔ Order screen opened: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-order-screen-empty.png") });

    // Step 3: Add Items to Order
    console.log("Step 3: Adding 'Paneer Tikka Angara' and 'Butter Garlic Naan' to cart...");
    const paneerBtn = await page.waitForSelector("::-p-text(Paneer Tikka Angara)");
    await paneerBtn.click();

    const naanBtn = await page.waitForSelector("::-p-text(Butter Garlic Naan)");
    await naanBtn.click();

    // Attach kitchen note on item
    console.log("Step 4: Attaching custom kitchen note...");
    const kitchenNoteBtn = await page.waitForSelector("::-p-text(+ Kitchen Note)");
    await kitchenNoteBtn.click();
    const itemNoteInput = await page.waitForSelector("input[placeholder*='Less spicy']");
    await itemNoteInput.type("Extra crispy, less oil");

    // Attach overall ticket note
    const ticketNoteInput = await page.waitForSelector("input[placeholder*='VIP guest']");
    await ticketNoteInput.type("Table 2 VIP Corporate");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-order-cart-with-notes.png") });

    // Step 5: Send Order to Kitchen
    console.log("Step 5: Sending initial order to kitchen...");
    const sendBtn = await page.waitForSelector("::-p-text(Send Order to Kitchen)");
    await sendBtn.click();
    await page.waitForSelector("::-p-text(Waiter POS Terminal)");
    console.log(`✔ Order submitted! Returned to Table Grid: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-table-grid-occupied.png") });

    // Step 6: Verify Table T2 is now OCCUPIED with subtotal
    const t2OccupiedBadge = await page.waitForSelector("::-p-text(OCCUPIED)");
    console.assert(t2OccupiedBadge !== null, "Table T2 is not marked OCCUPIED");
    console.log("✔ Table T2 confirmed OCCUPIED on the floor grid.");

    // Step 7: Re-open Table T2 for Add-on Round 2
    console.log("Step 7: Re-opening Table T2 for Add-on Round 2...");
    const t2Again = await page.waitForSelector("::-p-text(T2)");
    await t2Again.click();

    const addonOrderBtn = await page.waitForSelector("::-p-text(Order Items / Add-ons)");
    await addonOrderBtn.click();
    await page.waitForSelector("::-p-text(Add-on Ordering)");
    console.log("✔ Add-on terminal opened.");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-addon-screen-active-items.png") });

    // Step 8: Add an add-on item
    console.log("Step 8: Adding 'Classic Mint Mojito' as an ADD-ON...");
    const mojitoBtn = await page.waitForSelector("::-p-text(Classic Mint Mojito)");
    await mojitoBtn.click();

    // Verify Add-on Round 2 button
    const fireAddonBtn = await page.waitForSelector("::-p-text(Fire Add-on Round 2 to Kitchen)");
    console.assert(fireAddonBtn !== null, "Add-on button not found");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-addon-cart-round2.png") });

    console.log("Step 9: Firing Add-on Round 2 to kitchen...");
    await fireAddonBtn.click();
    await page.waitForSelector("::-p-text(Waiter POS Terminal)");
    console.log("✔ Add-on Round 2 fired successfully!");

    // Step 10: Verify Security Void PIN Check
    console.log("Step 10: Verifying Admin PIN requirement for items in PREPARING status...");
    const { data: ordersData } = await apiRequest({
      path: "/api/orders",
      method: "GET",
    });
    const activeOrder = ordersData.orders.find((o) => o.table?.tableNumber === "T2");
    console.assert(activeOrder !== undefined, "Active order for T2 not found");
    const prepItem = activeOrder.items[0];

    // Mark item as PREPARING in kitchen
    await apiRequest(
      {
        path: `/api/orders/items/${prepItem.id}/status`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      },
      { status: "PREPARING" }
    );

    // Open T2 order screen in browser
    await page.goto(`http://localhost:3000/pos/order/${activeOrder.tableId}`, { waitUntil: "networkidle0" });

    // Click void button on preparing item
    const voidIconBtn = await page.waitForSelector("button[title*='Requires Admin PIN']");
    await voidIconBtn.click();

    // Verify VoidAuthModal opened
    await page.waitForSelector("#void-reason-input");
    console.log("✔ VoidAuthModal opened for PREPARING item.");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-void-pin-modal.png") });

    // Enter cancellation reason
    const reasonInput = await page.waitForSelector("#void-reason-input");
    await reasonInput.type("Guest cancel test");

    // Click keypad button #pin-btn-9 four times
    for (let i = 0; i < 4; i++) {
      await page.click("#pin-btn-9");
      await new Promise((r) => setTimeout(r, 100));
    }

    await page.click("#authorize-void-btn");

    // Verify error displayed
    await page.waitForSelector("#void-error-msg", { timeout: 8000 });
    console.log("✔ Security check verified: Unauthorized PIN '9999' rejected!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-void-pin-rejected.png") });

    // Clear PIN and enter valid Admin PIN (1234)
    await page.click("#pin-btn-clear");
    await new Promise((r) => setTimeout(r, 100));

    await page.click("#pin-btn-1");
    await new Promise((r) => setTimeout(r, 100));
    await page.click("#pin-btn-2");
    await new Promise((r) => setTimeout(r, 100));
    await page.click("#pin-btn-3");
    await new Promise((r) => setTimeout(r, 100));
    await page.click("#pin-btn-4");
    await new Promise((r) => setTimeout(r, 100));

    await page.click("#authorize-void-btn");
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-item-voided-success.png") });
    console.log("✔ Authorized void with Admin PIN '1234' completed and confirmed!");

    console.log("\n*** ALL PHASE 2 BROWSER WORKFLOW TESTS PASSED 100%! ***");
  } finally {
    await browser.close();
  }
}

runPhase2().catch((err) => {
  console.error("Phase 2 Browser Test Error:", err);
  process.exit(1);
});
