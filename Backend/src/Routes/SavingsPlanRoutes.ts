import { Router } from "express";
import { SavingsPlanController } from "../controllers/SavingsPlanController";

export function savingsPlanRoutes(controller: SavingsPlanController): Router {
  const router = Router();

  router.post("/savings-plan", (req, res) =>
    controller.getSavingsPlan(req, res)
  );

  return router;
}
