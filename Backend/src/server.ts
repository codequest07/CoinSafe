import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";

// Routes
import AiRouter from "./Routes/AiRouter";
import CoinGeckoApiRouter from "./Routes/CoinGeckoApiRouter";
import BaseRouter from "./Routes/BaseRouter";
import WaitlistRouter from "./Routes/WaitlistRouter";
import faucetRouter from "./Routes/FaucetClaimRoute";
import FonbnkRouter from "./Routes/FonbnkRouter";
import MerklRouter from "./Routes/MerklRouter";
import NotificationRouter from "./Routes/NotificationRoutes";

// Models and Services
import { TransactionModel } from "./Models/TransactionModel";
import { GeminiService } from "./services/GeminiService";
import { SavingsPlanController } from "./controllers/SavingsPlanController";
import { savingsPlanRoutes } from "./Routes/SavingsAiRoutes";
import profileRoutes from "./Routes/ProfileRoutes";
import { batchAutomatedSavingsProcessor } from "./services/batchProcessor";
import { notificationService } from "./services/notificationService";

dotenv.config();
const app = express();
const port = process.env.PORT || 1234;

// Middleware
app.use(cors());
app.use(express.json());

// API Keys
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
const geminiApiKey = process.env.GEMINI_API_KEY || "";

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to CoinSafe!");
});

// Test endpoint to manually trigger batch processing
app.get("/api/test-batch", async (req: Request, res: Response) => {
  console.log("🧪 Manual batch processing triggered via API");
  try {
    await batchAutomatedSavingsProcessor();
    res.json({ success: true, message: "Batch processing completed" });
  } catch (error) {
    console.error("❌ Manual batch processing failed:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Initialize services
const transactionModel = new TransactionModel(etherscanApiKey);
const geminiService = new GeminiService(geminiApiKey);
const savingsPlanController = new SavingsPlanController(
  transactionModel,
  geminiService
);

// Mount routes
app.use("/", BaseRouter);
app.use("/api/ai", AiRouter);
app.use("/api/ai/", savingsPlanRoutes(savingsPlanController));
app.use("/api/waitlist", WaitlistRouter);
app.use("/api/faucet", faucetRouter);
app.use("/api/coingecko", CoinGeckoApiRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/fonbnk", FonbnkRouter);
app.use("/api/merkl", MerklRouter);
app.use("/api/notifications", NotificationRouter);

// MongoDB Connection
const mongodbUri = process.env.MONGO_URI || "";
// "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";

mongoose
  .connect(mongodbUri, {
    // Removed deprecated options
  } as ConnectOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schedule automated savings batch processing
// Run every hour at minute 0
console.log(
  "⏰ Setting up cron job for automated savings (every hour at minute 0)"
);
const cronJob = cron.schedule("0 * * * *", async () => {
  console.log("🕐 Running scheduled automated savings batch processing...");
  try {
    await batchAutomatedSavingsProcessor();
    console.log("✅ Scheduled batch processing completed");
  } catch (error) {
    console.error("❌ Scheduled batch processing failed:", error);
  }
});

// Schedule Merkl APR data collection
// Run daily at 12:00 PM UTC
console.log(
  "⏰ Setting up cron job for Merkl APR data collection (daily at 12:00 PM UTC)"
);
const merklCronJob = cron.schedule("0 12 * * *", async () => {
  console.log("🕐 Running scheduled Merkl APR data collection...");
  try {
    const { MerklController } = await import("./controllers/MerklController");
    const merklController = new MerklController();

    // Fetch data for all target opportunities
    const defaultOpportunities = [
      { opportunityName: "lisk", chainId: 1135 },
      { opportunityName: "usdt0", chainId: 1135 },
      { opportunityName: "usdc", chainId: 1135 },
    ];

    for (const opportunity of defaultOpportunities) {
      try {
        console.log(
          `📊 Fetching APR data for ${opportunity.opportunityName}...`
        );
        // Create mock request/response objects for the controller
        const mockReq = { body: opportunity };
        const mockRes = {
          json: (data: any) => {
            if (data.success) {
              console.log(
                `✅ Successfully collected APR data for ${opportunity.opportunityName}`
              );
            } else {
              console.log(
                `⚠️ Failed to collect APR data for ${opportunity.opportunityName}: ${data.error}`
              );
            }
          },
          status: () => ({
            json: (data: any) => console.log(`❌ Error: ${data.error}`),
          }),
        };

        await merklController.fetchAndStoreAPR(mockReq as any, mockRes as any);
      } catch (error) {
        console.error(
          `❌ Error collecting APR data for ${opportunity.opportunityName}:`,
          error
        );
      }
    }

    console.log("✅ Scheduled Merkl APR data collection completed");
  } catch (error) {
    console.error("❌ Scheduled Merkl APR data collection failed:", error);
  }
});

// Schedule morning notification at 8 AM daily
console.log(
  "⏰ Setting up cron job for morning notifications (daily at 8:00 AM)"
);
const morningNotifCron = cron.schedule("0 8 * * *", async () => {
  console.log("🌅 Sending morning notifications...");
  try {
    const result = await notificationService.sendMorningReminders();
    console.log(
      `✅ Morning notifications: ${result.successCount} sent, ${result.failureCount} failed`
    );
  } catch (error) {
    console.error("❌ Morning notifications failed:", error);
  }
});

// Schedule evening notification at 8 PM daily
console.log(
  "⏰ Setting up cron job for evening notifications (daily at 8:00 PM)"
);
const eveningNotifCron = cron.schedule("0 20 * * *", async () => {
  console.log("🌙 Sending evening notifications...");
  try {
    const result = await notificationService.sendEveningReminders();
    console.log(
      `✅ Evening notifications: ${result.successCount} sent, ${result.failureCount} failed`
    );
  } catch (error) {
    console.error("❌ Evening notifications failed:", error);
  }
});

// Schedule weekly summary every Monday at 9 AM
console.log(
  "⏰ Setting up cron job for weekly summary (Mondays at 9:00 AM)"
);
const weeklySummaryCron = cron.schedule("0 9 * * 1", async () => {
  console.log("📊 Sending weekly summary...");
  try {
    const result = await notificationService.sendWeeklySummary();
    console.log(
      `✅ Weekly summary: ${result.successCount} sent, ${result.failureCount} failed`
    );
  } catch (error) {
    console.error("❌ Weekly summary failed:", error);
  }
});

// Log cron job status
console.log("🔔 Notification cron jobs scheduled successfully");

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(
    "🔗 Test batch processing endpoint: http://localhost:${port}/api/test-batch"
  );
});
