"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savingsPlanRoutes = void 0;
const express_1 = require("express");
const savingsPlanRoutes = (controller) => {
    const router = (0, express_1.Router)();
    /**
     * @route POST /api/ai/savings-plan
     * @desc Generate personalized savings plan
     * @access Public
     */
    router.post("/savings-plan", controller.getSavingsPlan.bind(controller));
    return router;
};
exports.savingsPlanRoutes = savingsPlanRoutes;
//# sourceMappingURL=SavingsAiRoutes.js.map