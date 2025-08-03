"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faucetClaim_1 = require("../controllers/faucetClaim");
const faucetRouter = express_1.default.Router();
faucetRouter.post("/claim", faucetClaim_1.claimFaucet);
faucetRouter.get("/claim-status", faucetClaim_1.claimStatus);
exports.default = faucetRouter;
//# sourceMappingURL=FaucetClaimRoute.js.map