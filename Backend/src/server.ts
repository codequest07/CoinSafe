import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { ConnectOptions } from "mongoose";
import dotenv from "dotenv";

// Routes
import AiRouter from "./Routes/AiRouter";
import CoinGeckoApiRouter from "./Routes/CoinGeckoApiRouter";
import BaseRouter from "./Routes/BaseRouter";
import WaitlistRouter from "./Routes/WaitlistRouter";
import faucetRouter from "./Routes/FaucetClaimRoute";

// Models and Services
import { TransactionModel } from "./Models/TransactionModel";
import { GeminiService } from "./services/GeminiService";
import { SavingsPlanController } from "./controllers/SavingsPlanController";
import { savingsPlanRoutes } from "./Routes/SavingsAiRoutes";

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

// MongoDB Connection
const mongodbUri =
  process.env.MONGO_URI ||
  "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";

mongoose
  .connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
