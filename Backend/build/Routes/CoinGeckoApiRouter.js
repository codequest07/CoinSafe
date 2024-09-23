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
const CoinGeckoApiController_1 = require("../controllers/CoinGeckoApiController");
const CoinGeckoApiRouter = express_1.default.Router();
CoinGeckoApiRouter.get("/api-cg/:ids", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = req.params.ids;
    const result = yield (0, CoinGeckoApiController_1.main)(ids);
    res.json(result);
}));
exports.default = CoinGeckoApiRouter;
//# sourceMappingURL=CoinGeckoApiRouter.js.map