import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";

const router = Router();
const controller = new NotificationController();

// --- User-facing endpoints ---
router.post("/save-token", (req, res) => controller.saveToken(req, res));
router.put("/preferences/:walletAddress", (req, res) =>
  controller.updatePreferences(req, res)
);
router.delete("/unsubscribe", (req, res) =>
  controller.unsubscribe(req, res)
);

// --- Admin endpoints ---
router.post("/send", (req, res) => controller.sendNotification(req, res));
router.post("/test", (req, res) =>
  controller.sendTestNotification(req, res)
);
router.get("/history", (req, res) => controller.getHistory(req, res));
router.get("/stats", (req, res) => controller.getStats(req, res));

// --- Manual trigger endpoints (admin) ---
router.post("/trigger/morning", (req, res) =>
  controller.triggerMorningReminders(req, res)
);
router.post("/trigger/evening", (req, res) =>
  controller.triggerEveningReminders(req, res)
);
router.post("/trigger/weekly", (req, res) =>
  controller.triggerWeeklySummary(req, res)
);

export default router;
