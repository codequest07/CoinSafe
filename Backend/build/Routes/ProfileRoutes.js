"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const router = (0, express_1.Router)();
// Define routes and link to controller functions
router.post("/update-email", profileController_1.updateEmail);
router.post("/update-twitter", profileController_1.updateTwitter);
router.post("/update-discord", profileController_1.updateDiscord);
router.get("/verify-email", profileController_1.verifyEmail);
router.post("/update-preferences", profileController_1.updatePreferences);
router.get("/:walletAddress", profileController_1.getProfile);
router.get("/test/:walletAddress", profileController_1.testUserStatus);
exports.default = router;
//# sourceMappingURL=ProfileRoutes.js.map