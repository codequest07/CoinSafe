import { getDuePlans, executeBatch } from "./services/savingsService";

async function test() {
  try {
    const plans = await getDuePlans();
    console.log("🧾 Due plans found:", plans.length);
    if (plans.length === 0) {
      console.log("✅ No due plans to process.");
      return;
    }

    const batchSize = plans.length >= 30 ? 30 : plans.length;
    console.log(`🚀 Executing batch with size ${batchSize}...`);

    const result = await executeBatch(0, batchSize);
    console.log("✅ Batch Execution Result:");
    console.log("   Successful (dueAddresses):", result.dueAddresses);
    console.log("   Skipped (skippedAddresses):", result.skippedAddresses);
  } catch (err) {
    console.error("❌ Error during test execution:", err);
  }
}

test();
