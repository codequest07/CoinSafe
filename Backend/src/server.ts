import express, { Request, Response } from "express";
import cors from "cors";
import AiRouter from "./Routes/AiRouter";
import CoinGeckoApiRouter from "./Routes/CoinGeckoApiRouter";
import BaseRouter from "./Routes/BaseRouter";
import mongoose from "mongoose";
import { ConnectOptions } from "mongoose";
import WaitlistRouter from "./Routes/WaitlistRouter";
import dotenv from "dotenv";
import faucetRouter from "./Routes/FaucetClaimRoute";
dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 1234;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to CoinSafe!");
});

app.use(AiRouter);

app.use("/", BaseRouter);

app.use("/api/waitlist", WaitlistRouter);

app.use("/faucet", faucetRouter);

app.use(CoinGeckoApiRouter);
const mongodb =
  process.env.MONGO_URI ||
  "mongodb+srv://agbakwuruoluchicoinsafe:SDYRnmD6FrVp09fo@cluster0.g6csr.mongodb.net";
mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
app.listen(port, () => {
  console.log(`My Server is running on port ${port}.... keep off!`);
});
