import express from "express";
import {
  getProfile,
  connectEmail,
  connectTwitter,
  connectDiscord,
  saveProfileChanges,
} from "../controllers/profileController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").get(protect, getProfile);
router.route("/email/connect").post(protect, connectEmail);
router.route("/social/twitter/connect").post(protect, connectTwitter);
router.route("/social/discord/connect").post(protect, connectDiscord);
router.route("/").put(protect, saveProfileChanges);

export default router;
