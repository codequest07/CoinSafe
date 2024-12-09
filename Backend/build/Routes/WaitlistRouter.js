"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WaitlistController_1 = require("../controllers/WaitlistController");
const WaitlistRouter = (0, express_1.Router)();
WaitlistRouter.post('/api/waitlist', WaitlistController_1.addToWaitlist);
WaitlistRouter.get('/api/waitlist', WaitlistController_1.getAllWaitlistEntries);
WaitlistRouter.get('/waitlist/:email', WaitlistController_1.getOne);
exports.default = WaitlistRouter;
//# sourceMappingURL=WaitlistRouter.js.map