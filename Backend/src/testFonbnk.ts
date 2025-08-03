import { FonbnkService } from "./services/FonbnkService";

// Test configuration
const testConfig = {
  signatureSecret: "test_secret_key",
  source: "test_source",
  environment: "sandbox" as const,
};

async function testFonbnkIntegration() {
  console.log("🧪 Testing Fonbnk Integration...\n");

  const fonbnkService = new FonbnkService(testConfig);

  try {
    // Test 1: Create payment URL
    console.log("1. Testing payment URL creation...");
    const paymentUrl = fonbnkService.createPaymentUrl({
      amount: 1000,
      currency: "NGN",
      country: "NG",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      redirectUrl: "https://example.com/success",
      customData: {
        userId: "test_user_123",
        planId: "test_plan_456",
      },
    });

    console.log("✅ Payment URL created successfully");
    console.log("URL:", paymentUrl);
    console.log("");

    // Test 2: Get supported countries
    console.log("2. Testing supported countries...");
    const countries = await fonbnkService.getSupportedCountries();
    console.log("✅ Supported countries:", countries);
    console.log("");

    // Test 3: Get supported currencies
    console.log("3. Testing supported currencies...");
    const currencies = await fonbnkService.getSupportedCurrencies();
    console.log("✅ Supported currencies:", currencies);
    console.log("");

    // Test 4: Test webhook processing
    console.log("4. Testing webhook processing...");
    const testWebhookPayload = {
      orderId: "test_order_123",
      status: "completed" as const,
      amount: 1000,
      currency: "NGN",
      transactionId: "tx_123456789",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      customData: {
        userId: "test_user_123",
        planId: "test_plan_456",
      },
      timestamp: new Date().toISOString(),
    };

    // Create a test signature
    const testSignature =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0X3VpZCJ9.test_signature";

    const webhookResult = fonbnkService.processWebhook(
      testWebhookPayload,
      testSignature
    );
    console.log("✅ Webhook processing test completed");
    console.log("Result:", webhookResult);
    console.log("");

    // Test 5: Test order status
    console.log("5. Testing order status...");
    const orderStatus = await fonbnkService.getOrderStatus("test_order_123");
    console.log("✅ Order status retrieved:", orderStatus);
    console.log("");

    console.log("🎉 All tests completed successfully!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Set up your environment variables in .env file");
    console.log("2. Register for a Fonbnk account");
    console.log("3. Update the configuration with your real credentials");
    console.log("4. Test with the sandbox environment");
    console.log("5. Configure webhook URL in your Fonbnk dashboard");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testFonbnkIntegration();
