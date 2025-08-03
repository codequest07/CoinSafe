"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
// Routes
const AiRouter_1 = __importDefault(require("./Routes/AiRouter"));
const CoinGeckoApiRouter_1 = __importDefault(require("./Routes/CoinGeckoApiRouter"));
const BaseRouter_1 = __importDefault(require("./Routes/BaseRouter"));
const WaitlistRouter_1 = __importDefault(require("./Routes/WaitlistRouter"));
const FaucetClaimRoute_1 = __importDefault(require("./Routes/FaucetClaimRoute"));
const FonbnkRouter_1 = __importDefault(require("./Routes/FonbnkRouter"));
// Models and Services
const TransactionModel_1 = require("./Models/TransactionModel");
const GeminiService_1 = require("./services/GeminiService");
const SavingsPlanController_1 = require("./controllers/SavingsPlanController");
const SavingsAiRoutes_1 = require("./Routes/SavingsAiRoutes");
const ProfileRoutes_1 = __importDefault(require("./Routes/ProfileRoutes"));
const batchProcessor_1 = require("./services/batchProcessor");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 1234;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Keys
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
// Root route
app.get("/", (req, res) => {
    res.send("Welcome to CoinSafe!");
});
// Test endpoint to manually trigger batch processing
app.get("/api/test-batch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🧪 Manual batch processing triggered via API");
    try {
        yield (0, batchProcessor_1.batchAutomatedSavingsProcessor)();
        res.json({ success: true, message: "Batch processing completed" });
    }
    catch (error) {
        console.error("❌ Manual batch processing failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Initialize services
const transactionModel = new TransactionModel_1.TransactionModel(etherscanApiKey);
const geminiService = new GeminiService_1.GeminiService(geminiApiKey);
const savingsPlanController = new SavingsPlanController_1.SavingsPlanController(transactionModel, geminiService);
// Mount routes
app.use("/", BaseRouter_1.default);
app.use("/api/ai", AiRouter_1.default);
app.use("/api/ai/", (0, SavingsAiRoutes_1.savingsPlanRoutes)(savingsPlanController));
app.use("/api/waitlist", WaitlistRouter_1.default);
app.use("/api/faucet", FaucetClaimRoute_1.default);
app.use("/api/coingecko", CoinGeckoApiRouter_1.default);
app.use("/api/profile", ProfileRoutes_1.default);
app.use("/api/fonbnk", FonbnkRouter_1.default);
// MongoDB Connection
const mongodbUri = process.env.MONGO_URI || "";
// "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";
mongoose_1.default
    .connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Schedule automated savings batch processing
// Run every hour at minute 0
console.log("⏰ Setting up cron job for automated savings (every hour at minute 0)");
const cronJob = node_cron_1.default.schedule("0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🕐 Running scheduled automated savings batch processing...");
    try {
        yield (0, batchProcessor_1.batchAutomatedSavingsProcessor)();
        console.log("✅ Scheduled batch processing completed");
    }
    catch (error) {
        console.error("❌ Scheduled batch processing failed:", error);
    }
}));
// Log cron job status
console.log("�� Cron job scheduled successfully");
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("🔗 Test batch processing endpoint: http://localhost:${port}/api/test-batch");
});
//# sourceMappingURL=server.js.map