import express, { Request, Response } from "express";
import cors from "cors";
import AiRouter from "./Routes/AiRouter";

const app = express();
const port = process.env.PORT || 1234;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to CoinSafe!");
});

app.use(AiRouter);

app.listen(port, () => {
  console.log(`My Server is running on port ${port}.... keep off!`);
});
