import { Router } from "express";
import {
  updateEmail,
  updateTwitter,
  updateDiscord,
  verifyEmail,
  updatePreferences,
  getProfile,
} from "../controllers/profileController";

const router = Router();

// Define routes and link to controller functions
router.post("/update-email", updateEmail);
router.post("/update-twitter", updateTwitter);
router.post("/update-discord", updateDiscord);

router.get("/verify-email", verifyEmail);
router.post("/update-preferences", updatePreferences);
router.get("/:walletAddress", getProfile);

export default router;
