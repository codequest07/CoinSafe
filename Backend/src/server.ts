import express, { Request, Response } from 'express';
import cors from 'cors'; 

const app = express();
const port = process.env.PORT || 1234;

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CoinSafe!');
});

//app.use('/api/v1');

app.listen(port, () => {
  console.log(`My Server is running on port ${port}.... keep off!`);
});
