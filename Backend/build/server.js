"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const AiRouter_1 = __importDefault(require("./Routes/AiRouter"));
const app = (0, express_1.default)();
const port = process.env.PORT || 1234;
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Welcome to CoinSafe!");
});
app.use(AiRouter_1.default);
app.listen(port, () => {
    console.log(`My Server is running on port ${port}.... keep off!`);
});
//# sourceMappingURL=server.js.map