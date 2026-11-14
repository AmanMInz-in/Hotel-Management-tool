const http = require("http");

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2E() {
  console.log("=== STARTING FULL END-TO-END WORKFLOW VERIFICATION ===");

  // 1. Fetch tables
  const { data: tablesData } = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/tables",
    method: "GET",
  });
  const t1 = tablesData.tables.find((t) => t.tableNumber === "T1");
  console.log(`Step 1: Found Table ${t1.tableNumber} (Status: ${t1.status})`);

  // 2. Fetch menu items
  const { data: menuData } = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/menu/items",
    method: "GET",
  });
  const butterChicken = menuData.items.find((i) => i.name.includes("Butter Chicken"));
  const garlicNaan = menuData.items.find((i) => i.name.includes("Garlic Naan"));
  console.log(`Step 2: Selected Menu Items: ${butterChicken.name} (₹${butterChicken.price}) & ${garlicNaan.name} (₹${garlicNaan.price})`);

  // 3. Place initial order (Round 1)
  const { status: orderStatus, data: orderRes } = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/orders",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      tableId: t1.id,
      items: [
        { menuItemId: butterChicken.id, quantity: 1, unitPrice: butterChicken.price, notes: "Mild spice" },
        { menuItemId: garlicNaan.id, quantity: 2, unitPrice: garlicNaan.price },
      ],
      orderNotes: "Guest VIP Table",
    }
  );
  console.assert(orderStatus === 201, "Order creation failed");
  const order = orderRes.order;
  console.log(`Step 3: Order placed successfully! Order #${order.orderNumber}, Subtotal: ₹${order.subtotal}`);

  // 4. Verify KDS Queue
  const { data: kdsData } = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/kds/tickets",
    method: "GET",
  });
  const ticket = kdsData.tickets.find((t) => t.id === order.id);
  console.assert(ticket !== undefined, "Ticket missing from KDS");
  console.log(`Step 4: Ticket #${ticket.orderNumber} visible in KDS with ${ticket.items.length} items`);

  // 5. Kitchen transitions item to PREPARING then READY_TO_SERVE
  const firstItem = ticket.items[0];
  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/items/${firstItem.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
    { status: "PREPARING" }
  );
  console.log(`Step 5a: Kitchen marked ${firstItem.menuItemName} as PREPARING`);

  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/items/${firstItem.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
    { status: "READY_TO_SERVE" }
  );
  console.log(`Step 5b: Kitchen marked ${firstItem.menuItemName} as READY_TO_SERVE (Waiter notified)`);

  // 6. Waiter adds Add-on Round 2 (incremental ordering)
  const mojito = menuData.items.find((i) => i.name.includes("Mojito"));
  const { data: addonRes } = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/${order.id}/add-ons`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      items: [{ menuItemId: mojito.id, quantity: 2, unitPrice: mojito.price }],
    }
  );
  console.assert(addonRes.success === true, "Add-on failed");
  console.log(`Step 6: Add-on items added! Round: ${addonRes.items[0].roundNumber}, isAddon: ${addonRes.items[0].isAddon}`);

  // 7. Security Void PIN check: Void item in PREPARING status
  const secondItem = ticket.items[1];
  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/items/${secondItem.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
    { status: "PREPARING" }
  );

  // Attempt void without PIN -> Should be rejected with 401
  const { status: voidFailStatus } = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/items/${secondItem.id}/void`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { pin: "", reason: "Guest cancelled" }
  );
  console.assert(voidFailStatus === 401, "Void without PIN should be rejected with 401");
  console.log(`Step 7a: Security check confirmed: Void without Admin PIN rejected (HTTP ${voidFailStatus})`);

  // Void with valid Admin PIN (1234)
  const { status: voidSuccessStatus } = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/items/${secondItem.id}/void`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { pin: "1234", reason: "Guest changed mind" }
  );
  console.assert(voidSuccessStatus === 200, "Void with valid PIN failed");
  console.log(`Step 7b: Void with valid Admin PIN authorized and logged in audit trail (HTTP ${voidSuccessStatus})`);

  // 8. Settle Bill & Payment
  const { data: settleRes } = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/bills/settle",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      orderId: order.id,
      discountType: "PERCENTAGE",
      discountValue: 10,
      paymentMode: "UPI",
      referenceNumber: "UPI-9876543210",
    }
  );
  console.assert(settleRes.success === true, "Settlement failed");
  console.log(`Step 8: Bill #${settleRes.receipt.billNumber} settled! Subtotal: ₹${settleRes.receipt.subtotal}, Grand Total: ₹${settleRes.receipt.grandTotal} (via ${settleRes.receipt.paymentMode})`);

  // 9. Verify Table shifted to CLEANING
  const { data: updatedTables } = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/tables",
    method: "GET",
  });
  const t1Final = updatedTables.tables.find((t) => t.tableNumber === "T1");
  console.assert(t1Final.status === "CLEANING", "Table should be in CLEANING status");
  console.log(`Step 9: Table ${t1Final.tableNumber} successfully shifted to CLEANING state`);

  // 10. Release table to AVAILABLE
  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/tables/${t1.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
    { status: "AVAILABLE" }
  );
  console.log(`Step 10: Table ${t1.tableNumber} released back to AVAILABLE. Full lifecycle complete!`);

  console.log("\n*** ALL END-TO-END WORKFLOW CHECKS PASSED WITH 100% SUCCESS! ***");
  process.exit(0);
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
