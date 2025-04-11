import express from "express";
import { claimFaucet, claimStatus } from "../controllers/faucetClaim";

const faucetRouter = express.Router();

faucetRouter.post("/claim", claimFaucet);
faucetRouter.get("/claim-status", claimStatus);

export default faucetRouter;
