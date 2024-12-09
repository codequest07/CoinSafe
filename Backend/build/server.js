"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const AiRouter_1 = __importDefault(require("./Routes/AiRouter"));
const CoinGeckoApiRouter_1 = __importDefault(require("./Routes/CoinGeckoApiRouter"));
const BaseRouter_1 = __importDefault(require("./Routes/BaseRouter"));
const mongoose_1 = __importDefault(require("mongoose"));
const WaitlistRouter_1 = __importDefault(require("./Routes/WaitlistRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 1234;
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Welcome to CoinSafe!");
});
app.use(AiRouter_1.default);
app.use('/', BaseRouter_1.default);
app.use('/', WaitlistRouter_1.default);
app.use(CoinGeckoApiRouter_1.default);
const mongodb = process.env.MONGO_URI || 'mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net';
mongoose_1.default.connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
app.listen(port, () => {
    console.log(`My Server is running on port ${port}.... keep off!`);
});
//# sourceMappingURL=server.js.map