"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WaitlistController_1 = require("../controllers/WaitlistController");
const WaitlistRouter = (0, express_1.Router)();
WaitlistRouter.post("/", WaitlistController_1.addToWaitlist);
WaitlistRouter.get("/count", WaitlistController_1.getWaitlistCount);
WaitlistRouter.get("/", WaitlistController_1.getAllWaitlistEntries);
WaitlistRouter.get("/:email", WaitlistController_1.getOne);
exports.default = WaitlistRouter;
//# sourceMappingURL=WaitlistRouter.js.map