import { Request, Response } from "express";
import { TransactionModel } from "../Models/TransactionModel";
import { GeminiService } from "../services/GeminiService"; 
import { TransfersData } from "../types/ai";

export class SavingsPlanController {
  constructor(
    private readonly transactionModel: TransactionModel,
    private readonly geminiService: GeminiService 
  ) {}

  public async getSavingsPlan(req: Request, res: Response): Promise<void> {
    console.log("Received request body:", req.body); 
    const { address } = req.body;

    // Input validation
    if (!address) {
      this.sendErrorResponse(res, 400, "Wallet address is required");
      return;
    }

    try {
      const normalizedAddress = this.validateAndNormalizeAddress(address);
      const transfers = await this.fetchTransactions(normalizedAddress);
      const savingsPlan = await this.generatePlan(transfers);

      this.sendSuccessResponse(res, {
        address: normalizedAddress,
        savingsPlan,
        transactionCount: transfers.length,
      });
    } catch (error) {
      this.handleControllerError(res, error);
    }
  }

  private validateAndNormalizeAddress(address: string): string {
    const normalizedAddress = address.trim().toLowerCase();

    // Basic validation
    if (typeof address !== "string") {
      throw new Error("Address must be a string");
    }

    if (normalizedAddress.length === 0) {
      throw new Error("Address cannot be empty");
    }

    // Ethereum address validation
    const ethAddressRegex = /^0x[a-f0-9]{40}$/;
    if (!ethAddressRegex.test(normalizedAddress)) {
      throw new Error(
        `Invalid Ethereum address format. Expected 42 characters (0x prefix + 40 hex chars), got ${normalizedAddress.length} chars.`
      );
    }

    return normalizedAddress;
  }

  private async fetchTransactions(address: string): Promise<any[]> {
    console.log(`Fetching transactions for address: ${address}`);
    try {
      const transfers = await this.transactionModel.getTransactions(address);

      if (!Array.isArray(transfers)) {
        throw new Error("Invalid transactions data format");
      }

      console.log(`Found ${transfers.length} transactions`);
      return transfers;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      throw new Error("Could not retrieve transaction history");
    }
  }

  private async generatePlan(transfers: any[]): Promise<string> {
    const transfersData: TransfersData = {
      erc20Transfers: transfers.filter((t) => t.category === "erc20"),
      nativeTransfers: transfers.filter((t) => t.category === "native"),
      internalTransfers: [],
    };

    console.log(
      `Processing ${transfersData.erc20Transfers.length} ERC20 transfers`
    );

    try {
      const savingsPlan = await this.geminiService.getSavingsPlan(
        transfersData
      );
      if (!savingsPlan) {
        throw new Error("Failed to generate savings plan: result is null");
      }
      return savingsPlan;
    } catch (error) {
      console.error("AI service error:", error);
      throw new Error("Failed to generate savings plan");
    }
  }

  private sendSuccessResponse(
    res: Response,
    data: {
      address: string;
      savingsPlan: string;
      transactionCount: number;
    }
  ): void {
    res.status(200).json({
      success: true,
      data: {
        ...data,
        generatedAt: new Date().toISOString(),
      },
    });
  }

  private sendErrorResponse(
    res: Response,
    code: number,
    message: string
  ): void {
    console.error(`Error ${code}: ${message}`);
    res.status(code).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  private handleControllerError(res: Response, error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    this.sendErrorResponse(
      res,
      error instanceof Error && error.message.includes("Invalid") ? 400 : 500,
      errorMessage
    );
  }
}
