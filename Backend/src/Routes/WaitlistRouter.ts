import { Router } from "express";
import {
  addToWaitlist,
  getAllWaitlistEntries,
  getOne,
} from "../controllers/WaitlistController";

const WaitlistRouter = Router();

WaitlistRouter.post("/api/waitlist", addToWaitlist);

WaitlistRouter.get("/api/waitlist", getAllWaitlistEntries);

WaitlistRouter.get("/api/waitlist/:email", getOne);

export default WaitlistRouter;
