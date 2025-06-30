import { Router } from "express";
import express from "express";
import { Request, Response } from "express";
import {
  updateEmail,
  updateTwitter,
  updateDiscord,
  verifyEmail,
  updatePreferences,
  getProfile,
  testUserStatus,
} from "../controllers/profileController";

const router = Router();

// Define routes and link to controller functions
router.post("/update-email", updateEmail);
router.post("/update-twitter", updateTwitter);
router.post("/update-discord", updateDiscord);

router.get("/verify-email", verifyEmail);
router.post("/update-preferences", updatePreferences);
router.get("/:walletAddress", getProfile);

router.get("/test/:walletAddress", testUserStatus);

export default router;
