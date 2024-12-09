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
exports.getTransactions = getTransactions;
const Base_1 = require("../Base");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getTransactions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { address } = req.query;
        const apiKey = process.env.BASESCAN_API_KEY || 'H4TPWFCD9FCZIVSPRVF3RBZFYASMBBSQ6Y';
        console.log('API Key:', apiKey);
        if (!address || !apiKey) {
            return res.status(400).json({ error: 'Address or API key is missing' });
        }
        try {
            const count = yield (0, Base_1.getFilteredTransactions)(address, apiKey);
            return res.json({ success: true, transactionCount: count });
        }
        catch (error) {
            const errorMessage = error.message;
            return res.status(500).json({ success: false, message: errorMessage });
        }
    });
}
//# sourceMappingURL=BaseController.js.map