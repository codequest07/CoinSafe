import express, { Request, Response } from "express";
import cors from "cors";
import AiRouter from "./Routes/AiRouter";
import CoinGeckoApiRouter from "./Routes/CoinGeckoApiRouter";
import BaseRouter from "./Routes/BaseRouter";
import mongoose from "mongoose";
import { ConnectOptions } from "mongoose";
import WaitlistRouter from "./Routes/WaitlistRouter";
import dotenv from "dotenv";
import faucetRouter from "./Routes/FaucetClaimRoute";

import { TransactionModel } from "./Models/TransactionModel";
import { AnthropicService } from "./services/AnthropicService";
import { SavingsPlanController } from "./controllers/SavingsPlanController";
import { savingsPlanRoutes } from "./Routes/savingsPlanRoutes";

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 1234;

app.use(cors());

// Get API keys from environment variables
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to CoinSafe!");
});

// Mount other routers
app.use(AiRouter);

// Initialize model, service, and controller for savings plan
const transactionModel = new TransactionModel(etherscanApiKey);
const anthropicService = new AnthropicService(anthropicApiKey);
const savingsPlanController = new SavingsPlanController(
  transactionModel,
  anthropicService
);

// Mount savings plan routes under /api/ai
app.use("/api/ai", savingsPlanRoutes(savingsPlanController));

// Mount other routers
app.use("/", BaseRouter);
app.use("/api/waitlist", WaitlistRouter);
app.use("/faucet", faucetRouter);
app.use(CoinGeckoApiRouter);

// Connect to MongoDB
const mongodb =
  process.env.MONGO_URI ||
  "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";
mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Start the server
app.listen(port, () => {
  console.log(`My Server is running on port ${port}.... keep off!`);
});
