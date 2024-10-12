import { Request, Response } from 'express';
import { getFilteredTransactions } from '../Base';
import dotenv from 'dotenv';
dotenv.config(); 

export async function getTransactions(req: Request, res: Response) {
  const { address } = req.query;
  const apiKey = process.env.BASESCAN_API_KEY || 'H4TPWFCD9FCZIVSPRVF3RBZFYASMBBSQ6Y'; 
   
  console.log('API Key:', apiKey); 

  if (!address || !apiKey) {
    return res.status(400).json({ error: 'Address or API key is missing' });
  }

  try {
    const count = await getFilteredTransactions(address as string, apiKey);
    return res.json({ success: true, transactionCount: count });
  } catch (error) {
    const errorMessage = (error as Error).message; 
    return res.status(500).json({ success: false, message: errorMessage });
  }
}
