"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AiController_1 = require("../controllers/AiController");
const AiRouter = express_1.default.Router();
AiRouter.get('/getClaudeSavingsPlan', AiController_1.getClaudeSavingsPlan);
AiRouter.get('/main/:address', AiController_1.main);
exports.default = AiRouter;
