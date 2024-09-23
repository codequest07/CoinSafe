import express from "express";

import { main } from "../controllers/CoinGeckoApiController";

const CoinGeckoApiRouter = express.Router();

CoinGeckoApiRouter.get("/api-cg/:ids", async (req, res) => {
  const ids = req.params.ids;
  const result = await main(ids);
  
  res.json(result);
});

export default CoinGeckoApiRouter;
