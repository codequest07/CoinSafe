import express from "express";

import { main } from "../controllers/AiController";

const AiRouter = express.Router();

AiRouter.get("/main/:address", async (req, res) => {
  const address = req.params.address;
  const result = await main(address);
  res.json(result);
});

export default AiRouter;
