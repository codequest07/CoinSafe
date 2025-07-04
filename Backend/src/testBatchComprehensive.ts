import { getDuePlans, executeBatch } from "./services/savingsService";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;

async function testContractConnection() {
  console.log("🔗 Testing contract connection...");
  try {
    const balance = await provider.getBalance(contractAddress);
    console.log("✅ Contract balance:", ethers.formatEther(balance), "ETH");

    const signerBalance = await provider.getBalance(signer.address);
    console.log("✅ Signer balance:", ethers.formatEther(signerBalance), "ETH");

    return true;
  } catch (error) {
    console.error("❌ Contract connection failed:", error);
    return false;
  }
}

async function testGetDuePlans() {
  console.log("\n📋 Testing getDuePlans()...");
  try {
    const plans = await getDuePlans();
    console.log("✅ Due plans found:", plans.length);
    if (plans.length > 0) {
      console.log("   Sample addresses:", plans.slice(0, 3));
    }
    return plans;
  } catch (error) {
    console.error("❌ getDuePlans() failed:", error);
    return [];
  }
}

async function testBatchExecution(plans: string[]) {
  console.log("\n🚀 Testing batch execution...");
  if (plans.length === 0) {
    console.log("⚠️ No plans to execute - skipping batch test");
    return;
  }

  try {
    const batchSize = Math.min(plans.length, 5); // Test with smaller batch
    console.log(`   Testing with batch size: ${batchSize}`);

    const result = await executeBatch(0, batchSize);
    console.log("✅ Batch execution successful:");
    console.log("   Note: The contract event only provides execution counts, not specific addresses");
    console.log("   Successful executions: (see console log above for count)");
    console.log("   Skipped executions: (see console log above for count)");

    // The result arrays will be empty since the event doesn't provide addresses
    if (result.dueAddresses.length > 0) {
      console.log("   Successful addresses:", result.dueAddresses);
    }
    if (result.skippedAddresses.length > 0) {
      console.log("   Skipped addresses:", result.skippedAddresses);
    }
  } catch (error) {
    console.error("❌ Batch execution failed:", error);
  }
}

async function testEnvironmentVariables() {
  console.log("\n🔧 Testing environment variables...");
  const required = ["LISK_RPC_URL", "PRIVATE_KEY", "CONTRACT_ADDRESS"];

  for (const varName of required) {
    const value = process.env[varName];
    if (value) {
      console.log(
        `✅ ${varName}: ${
          varName === "PRIVATE_KEY" ? "***" + value.slice(-4) : value
        }`
      );
    } else {
      console.log(`❌ ${varName}: NOT SET`);
    }
  }
}

async function main() {
  console.log("🧪 Starting comprehensive savings service test...\n");

  // Test environment variables
  await testEnvironmentVariables();

  // Test contract connection
  const connectionOk = await testContractConnection();
  if (!connectionOk) {
    console.log("\n❌ Cannot proceed without contract connection");
    return;
  }

  // Test getting due plans
  const plans = await testGetDuePlans();

  // Test batch execution (if there are plans)
  await testBatchExecution(plans);

  console.log("\n✅ Comprehensive test completed!");
}

main().catch(console.error);
