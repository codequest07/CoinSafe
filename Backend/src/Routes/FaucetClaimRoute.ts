import express from "express";
import { claimFaucet } from "../controllers/faucetClaim";

const faucetRouter = express.Router();

faucetRouter.post("/claim", claimFaucet);

export default faucetRouter;
