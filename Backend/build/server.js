"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const AiRouter_1 = __importDefault(require("./Routes/AiRouter"));
const CoinGeckoApiRouter_1 = __importDefault(require("./Routes/CoinGeckoApiRouter"));
const BaseRouter_1 = __importDefault(require("./Routes/BaseRouter"));
const WaitlistRouter_1 = __importDefault(require("./Routes/WaitlistRouter"));
const FaucetClaimRoute_1 = __importDefault(require("./Routes/FaucetClaimRoute"));
const savingsPlanRoutes_1 = require("./Routes/savingsPlanRoutes");
// Models and Services
const TransactionModel_1 = require("./Models/TransactionModel");
const AnthropicService_1 = require("./services/AnthropicService");
const SavingsPlanController_1 = require("./controllers/SavingsPlanController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 1234;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Keys
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";
// Root route
app.get("/", (req, res) => {
    res.send("Welcome to CoinSafe!");
});
// Initialize services
const transactionModel = new TransactionModel_1.TransactionModel(etherscanApiKey);
const anthropicService = new AnthropicService_1.AnthropicService(anthropicApiKey);
const savingsPlanController = new SavingsPlanController_1.SavingsPlanController(transactionModel, anthropicService);
// Mount routes
app.use("/", BaseRouter_1.default);
app.use("/api/ai", AiRouter_1.default);
app.use("/api/ai/", (0, savingsPlanRoutes_1.savingsPlanRoutes)(savingsPlanController));
app.use("/api/waitlist", WaitlistRouter_1.default);
app.use("/faucet", FaucetClaimRoute_1.default);
app.use("/api/coingecko", CoinGeckoApiRouter_1.default);
// MongoDB Connection
const mongodbUri = process.env.MONGO_URI ||
    "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";
mongoose_1.default
    .connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map