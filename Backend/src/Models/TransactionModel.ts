import axios from "axios";
import { Transfer } from "../types/ai";

interface EtherscanResponse {
  status: string;
  message: string;
  result: any[];
}

type Network = "base" | "optimism" | "arbitrum" | "arbitrum-nova";

export class TransactionModel {
  private readonly apiBaseUrls: Record<Network, string> = {
    base: "https://api.etherscan.io/v2/api?chainid=8453",
    optimism: "https://api.etherscan.io/v2/api?chainid=10",
    arbitrum: "https://api.etherscan.io/v2/api?chainid=42161",
    "arbitrum-nova": "https://api.etherscan.io/v2/api?chainid=42170",
  };
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private readonly etherscanApiKey: string) {}

  async getTransactions(address: string): Promise<Transfer[]> {
    try {
      // Fetch from all networks in parallel
      const results = await Promise.allSettled([
        this.fetchNetworkTransactions(address, "base"),
        this.fetchNetworkTransactions(address, "optimism"),
        this.fetchNetworkTransactions(address, "arbitrum"),
        this.fetchNetworkTransactions(address, "arbitrum-nova"),
      ]);

      const allTransfers: Transfer[] = [];
      const networks: Network[] = ["base", "optimism", "arbitrum", "arbitrum-nova"];
      results.forEach((result, index) => {
        const network = networks[index];
        if (result.status === "fulfilled") {
          console.log(
            `Successfully fetched ${result.value.length} transactions from ${network}`
          );
          allTransfers.push(...result.value);
        } else {
          console.error(
            `Failed to fetch transactions from ${network}:`,
            result.reason
          );
        }
      });

      console.log(
        `Total transactions fetched from all networks: ${allTransfers.length}`
      );
      return allTransfers;
    } catch (error) {
      console.error(`Failed to get transactions for ${address}:`, error);
      return [];
    }
  }

  // Helper to fetch all transactions for a specific network
  private async fetchNetworkTransactions(
    address: string,
    network: Network
  ): Promise<Transfer[]> {
    const [externalTransfers, erc20Transfers] = await Promise.all([
      this.fetchExternalTransactions(address, network),
      this.fetchERC20Transfers(address, network),
    ]);
    return [...externalTransfers, ...erc20Transfers];
  }

  private async fetchExternalTransactions(
    address: string,
    network: Network
  ): Promise<Transfer[]> {
    const logPrefix = `${network} External transactions`;
    return this.fetchWithRetry<EtherscanResponse>(
      network,
      {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: "latest",
        apikey: this.etherscanApiKey,
      },
      logPrefix
    ).then((response) => this.processExternalTransfers(response, network)); // Pass network
  }

  private async fetchERC20Transfers(
    address: string,
    network: Network
  ): Promise<Transfer[]> {
    const logPrefix = `${network} ERC-20 transfers`;
    return this.fetchWithRetry<EtherscanResponse>(
      network,
      {
        module: "account",
        action: "tokentx",
        address,
        startblock: 0,
        endblock: "latest",
        apikey: this.etherscanApiKey,
      },
      logPrefix
    ).then((response) => this.processERC20Transfers(response, network)); // Pass network
  }

  private async fetchWithRetry<T>(
    network: Network, // Added network parameter
    params: Record<string, any>,
    logPrefix: string,
    attempt = 1
  ): Promise<T> {
    const apiUrl = this.apiBaseUrls[network]; // Use network-specific URL
    try {
      console.log(
        `${logPrefix} - Attempt ${attempt}: Fetching from ${apiUrl}...`
      );
      const response = await axios.get<T>(apiUrl, { params });

      // Handle potential rate limits or empty results gracefully
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
      return this.fetchWithRetry<T>(network, params, logPrefix, attempt + 1); // Pass network recursively
    }
  }

  private processExternalTransfers(
    response: EtherscanResponse,
    network: Network
  ): Transfer[] {
    // Added network parameter
    if (response.status !== "1" || !Array.isArray(response.result)) return [];

    return response.result
      .filter((tx) => Number(tx.value) > 0)
      .map((tx) => ({
        value: Number(tx.value) / 1e18,
        erc721TokenId: null,
        erc1155Metadata: null,
        tokenId: null,
        asset: "ETH", // ETH for all networks
        category: "external",
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        network: network, // Add network field
      }));
  }

  private processERC20Transfers(
    response: EtherscanResponse,
    network: Network
  ): Transfer[] {
    // Added network parameter
    if (response.status !== "1" || !Array.isArray(response.result)) return [];

    return response.result
      .filter((tx) => Number(tx.value) > 0)
      .map((tx) => ({
        value: Number(tx.value) / 10 ** Number(tx.tokenDecimal || 18), // Added default decimal
        erc721TokenId: null,
        erc1155Metadata: null,
        tokenId: tx.tokenID || null,
        asset: tx.tokenSymbol || "Unknown ERC20", // Added default symbol
        category: "erc20",
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        contractAddress: tx.contractAddress,
        network: network, // Add network field
      }));
  }
}
