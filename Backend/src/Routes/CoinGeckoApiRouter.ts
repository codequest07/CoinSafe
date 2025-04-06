import express from "express";

import { main } from "../controllers/CoinGeckoApiController";

const CoinGeckoApiRouter = express.Router();

CoinGeckoApiRouter.get("/api-cg/:tokenId", async (req, res) => {
  const tokenId = req.params.tokenId;
  const result = await main(tokenId);
  
  res.json(result);
});

export default CoinGeckoApiRouter;
