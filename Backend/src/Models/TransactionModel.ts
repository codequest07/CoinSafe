import axios from "axios";
import { Transfer } from "../types/ai";

interface EtherscanResponse {
  status: string;
  message: string;
  result: any[];
}

export class TransactionModel {
  private readonly apiBaseUrl = "https://api-sepolia.etherscan.io/api";
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private readonly etherscanApiKey: string) {}

  async getTransactions(address: string): Promise<Transfer[]> {
    try {
      const [externalTransfers, erc20Transfers] = await Promise.all([
        this.fetchExternalTransactions(address),
        this.fetchERC20Transfers(address),
      ]);

      return [...externalTransfers, ...erc20Transfers];
    } catch (error) {
      console.error(`Failed to get transactions for ${address}:`, error);
      return [];
    }
  }

  private async fetchExternalTransactions(
    address: string
  ): Promise<Transfer[]> {
    return this.fetchWithRetry<EtherscanResponse>(
      {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: "latest",
        apikey: this.etherscanApiKey,
      },
      "External transactions"
    ).then((response) => this.processExternalTransfers(response));
  }

  private async fetchERC20Transfers(address: string): Promise<Transfer[]> {
    return this.fetchWithRetry<EtherscanResponse>(
      {
        module: "account",
        action: "tokentx",
        address,
        startblock: 0,
        endblock: "latest",
        apikey: this.etherscanApiKey,
      },
      "ERC-20 transfers"
    ).then((response) => this.processERC20Transfers(response));
  }

  private async fetchWithRetry<T>(
    params: Record<string, any>,
    logPrefix: string,
    attempt = 1
  ): Promise<T> {
    try {
      console.log(`${logPrefix} - Attempt ${attempt}: Fetching...`);
      const response = await axios.get<T>(this.apiBaseUrl, { params });

      const data = response.data as EtherscanResponse;
      if (data.status !== "1") {
        if (
          (response.data as EtherscanResponse).message ===
          "No transactions found"
        ) {
          console.log(`${logPrefix}: No transactions found`);
          return response.data;
        }
        throw new Error(
          `API error: ${(response.data as EtherscanResponse).message}`
        );
      }

      return response.data;
    } catch (error) {
      if (attempt >= this.maxRetries) {
        console.error(`${logPrefix} - Max retries exceeded`);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      return this.fetchWithRetry<T>(params, logPrefix, attempt + 1);
    }
  }

  private processExternalTransfers(response: EtherscanResponse): Transfer[] {
    if (response.status !== "1" || !response.result) return [];

    return response.result
      .filter((tx) => Number(tx.value) > 0)
      .map((tx) => ({
        value: Number(tx.value) / 1e18,
        erc721TokenId: null,
        erc1155Metadata: null,
        tokenId: null,
        asset: "ETH",
        category: "external",
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
      }));
  }

  private processERC20Transfers(response: EtherscanResponse): Transfer[] {
    if (response.status !== "1" || !response.result) return [];

    return response.result
      .filter((tx) => Number(tx.value) > 0)
      .map((tx) => ({
        value: Number(tx.value) / 10 ** Number(tx.tokenDecimal),
        erc721TokenId: null,
        erc1155Metadata: null,
        tokenId: tx.tokenID || null,
        asset: tx.tokenSymbol,
        category: "erc20",
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        contractAddress: tx.contractAddress,
      }));
  }
}
