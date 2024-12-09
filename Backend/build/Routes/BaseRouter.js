"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BaseController_1 = require("../controllers/BaseController");
const router = express_1.default.Router();
router.get('/transactions', BaseController_1.getTransactions);
exports.default = router;
//# sourceMappingURL=BaseRouter.js.map