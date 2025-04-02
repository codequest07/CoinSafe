import { Router } from "express";
import { SavingsPlanController } from "../controllers/SavingsPlanController";

export const savingsPlanRoutes = (controller: SavingsPlanController) => {
  const router = Router();

  /**
   * @route POST /api/ai/savings-plan
   * @desc Generate personalized savings plan
   * @access Public
   */
  router.post("/savings-plan", controller.getSavingsPlan.bind(controller));

  return router;
};
