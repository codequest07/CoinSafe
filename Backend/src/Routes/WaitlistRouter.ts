import { Router } from "express";
import {
  addToWaitlist,
  getAllWaitlistEntries,
  getOne,
  getWaitlistCount,
} from "../controllers/WaitlistController";

const WaitlistRouter = Router();

WaitlistRouter.post("/", addToWaitlist);

WaitlistRouter.get("/count", getWaitlistCount);

WaitlistRouter.get("/", getAllWaitlistEntries);

WaitlistRouter.get("/:email", getOne);

export default WaitlistRouter;
