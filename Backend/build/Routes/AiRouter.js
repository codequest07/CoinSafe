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
const AiController_1 = require("../controllers/AiController");
const AiRouter = express_1.default.Router();
AiRouter.get("/main/:address", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.params;
    const { network, chain } = req.query;
    if (typeof network !== 'string' || typeof chain !== 'string') {
        return res.status(400).json({ error: 'Invalid network or chain' });
    }
    const result = yield (0, AiController_1.main)(address, network, chain);
    res.json(result);
}));
exports.default = AiRouter;
//# sourceMappingURL=AiRouter.js.map