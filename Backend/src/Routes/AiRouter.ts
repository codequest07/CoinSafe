import express from "express";
import { alchemyInstances, main, NetworkChain } from "../controllers/AiController";

const AiRouter = express.Router();

AiRouter.get("/main/:address", async (req, res) => {
  const { address } = req.params;
  const { network, chain } = req.query;
  
  if (typeof network !== 'string' || typeof chain !== 'string') {
    return res.status(400).json({ error: 'Invalid network or chain' });
  }

  const result = await main(address, network as keyof typeof alchemyInstances, chain as NetworkChain);
  res.json(result);
});

export default AiRouter;
