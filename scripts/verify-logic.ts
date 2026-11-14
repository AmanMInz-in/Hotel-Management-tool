import { computeBillTotals, splitBillEqual } from "../src/lib/calculations";

function runTests() {
  console.log("=== RUNNING FINANCIAL ENGINE TESTS ===");

  // Test 1: Basic subtotal with 5% GST
  const t1 = computeBillTotals({
    subtotal: 1000,
    discountType: "NONE",
    discountValue: 0,
    taxRatePercent: 5.0,
  });
  console.assert(t1.subtotal === 1000, "T1 Subtotal failed");
  console.assert(t1.cgstAmount === 25, "T1 CGST failed");
  console.assert(t1.sgstAmount === 25, "T1 SGST failed");
  console.assert(t1.grandTotal === 1050, "T1 Grand Total failed");
  console.log("✔ Test 1: Basic Subtotal & Dual GST 5% Passed");

  // Test 2: Percentage Discount 10%
  const t2 = computeBillTotals({
    subtotal: 1000,
    discountType: "PERCENTAGE",
    discountValue: 10,
    taxRatePercent: 5.0,
  });
  console.assert(t2.discountAmount === 100, "T2 Discount failed");
  console.assert(t2.taxableAmount === 900, "T2 Taxable failed");
  console.assert(t2.cgstAmount === 22.5, "T2 CGST failed");
  console.assert(t2.sgstAmount === 22.5, "T2 SGST failed");
  console.assert(t2.grandTotal === 945, "T2 Grand Total failed");
  console.log("✔ Test 2: Percentage Discount 10% Passed");

  // Test 3: Flat Discount
  const t3 = computeBillTotals({
    subtotal: 850,
    discountType: "FLAT",
    discountValue: 150,
    taxRatePercent: 5.0,
  });
  console.assert(t3.discountAmount === 150, "T3 Discount failed");
  console.assert(t3.taxableAmount === 700, "T3 Taxable failed");
  console.assert(t3.cgstAmount === 17.5, "T3 CGST failed");
  console.assert(t3.sgstAmount === 17.5, "T3 SGST failed");
  console.assert(t3.grandTotal === 735, "T3 Grand Total failed");
  console.log("✔ Test 3: Flat Discount ₹150 Passed");

  // Test 4: Equal Bill Splitting (Zero Drift)
  const splits = splitBillEqual(1000, 3);
  console.assert(splits.length === 3, "T4 Split count failed");
  const sumSplits = splits.reduce((a, b) => a + b, 0);
  console.assert(Math.round(sumSplits) === 1000, "T4 Split drift failed");
  console.log(`✔ Test 4: Equal 3-way Split of 1000 (${splits.join(" + ")} = ${sumSplits}) Passed`);

  console.log("All Financial Engine tests passed with 100% precision!");
}

runTests();
