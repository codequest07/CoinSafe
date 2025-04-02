import { Request, Response } from "express";
import { TransactionModel } from "../Models/TransactionModel";
import { AnthropicService } from "../services/AnthropicService";
import { TransfersData } from "../types/ai";

export class SavingsPlanController {
  private transactionModel: TransactionModel;
  private anthropicService: AnthropicService;

  constructor(
    transactionModel: TransactionModel,
    anthropicService: AnthropicService
  ) {
    this.transactionModel = transactionModel;
    this.anthropicService = anthropicService;
  }

  async getSavingsPlan(req: Request, res: Response): Promise<void> {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    console.log("Received address:", address, "Type:", typeof address);

    try {
      // Validate the address
      if (typeof address !== "string" || !address) {
        throw new Error("Invalid address: must be a non-empty string");
      }

      // Trim whitespace and normalize case
      const normalizedAddress = address.trim().toLowerCase();
      console.log("Normalized address:", normalizedAddress);
      console.log("Address length:", normalizedAddress.length);
      console.log("Address after 0x:", normalizedAddress.slice(2));
      console.log("Length after 0x:", normalizedAddress.slice(2).length);

      // Use a regex to validate Ethereum address format
      const addressRegex = /^0x[a-f0-9]{40}$/;
      console.log("Regex test result:", addressRegex.test(normalizedAddress));
      if (!addressRegex.test(normalizedAddress)) {
        throw new Error(
          `Invalid Ethereum address format: Address must be 42 characters long (0x + 40 hexadecimal characters). Got length ${
            normalizedAddress.length
          }, with ${normalizedAddress.slice(2).length} characters after 0x.`
        );
      }

      console.log("Fetching transactions for address:", normalizedAddress);
      const transfers = await this.transactionModel.getTransactions(
        normalizedAddress
      );

      const transfersData: TransfersData = {
        erc20Transfers: transfers.filter((t) => t.category === "erc20"),
        internalTransfers: [], // Etherscan doesn't provide internal transfers
      };

      const savingsPlan = await this.anthropicService.getSavingsPlan(
        transfersData
      );
      if (savingsPlan) {
        console.log("Savings plan:", savingsPlan);
        res.status(200).json({ savingsPlan });
      } else {
        console.log("Failed to generate savings plan");
        res.status(500).json({ error: "Failed to generate savings plan" });
      }
    } catch (error) {
      console.error("Error generating savings plan:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
