import axios from "axios";
import { Transfer } from "../types/ai";

export class TransactionModel {
  private etherscanApiKey: string;

  constructor(etherscanApiKey: string) {
    this.etherscanApiKey = etherscanApiKey;
  }

  async getTransactions(address: string): Promise<Transfer[]> {
    const url = "https://api-sepolia.etherscan.io/api";

    try {
      console.log("Fetching external transactions from Etherscan...");
      const txResponse = await axios.get(url, {
        params: {
          module: "account",
          action: "txlist",
          address,
          startblock: 0,
          endblock: "latest",
          apikey: this.etherscanApiKey,
        },
      });

      console.log("Etherscan txlist response:", txResponse.data);
      if (txResponse.data.status !== "1") {
        if (txResponse.data.message === "No transactions found") {
          console.log("No external transactions found for this address.");
        } else {
          throw new Error(`Etherscan error: ${txResponse.data.message}`);
        }
      }

      console.log("Fetching ERC-20 token transfers from Etherscan...");
      const tokenResponse = await axios.get(url, {
        params: {
          module: "account",
          action: "tokentx",
          address,
          startblock: 0,
          endblock: "latest",
          apikey: this.etherscanApiKey,
        },
      });

      console.log("Etherscan tokentx response:", tokenResponse.data);
      if (tokenResponse.data.status !== "1") {
        if (tokenResponse.data.message === "No transactions found") {
          console.log("No ERC-20 token transfers found for this address.");
        } else {
          throw new Error(`Etherscan error: ${tokenResponse.data.message}`);
        }
      }

      const externalTransfers: Transfer[] =
        txResponse.data.status === "1"
          ? txResponse.data.result
              .filter((tx: any) => Number(tx.value) > 0)
              .map((tx: any) => ({
                value: Number(tx.value) / 1e18,
                erc721TokenId: null,
                erc1155Metadata: null,
                tokenId: null,
                asset: "ETH",
                category: "external",
              }))
          : [];

      const erc20Transfers: Transfer[] =
        tokenResponse.data.status === "1"
          ? tokenResponse.data.result
              .filter((tx: any) => Number(tx.value) > 0)
              .map((tx: any) => ({
                value: Number(tx.value) / 10 ** Number(tx.tokenDecimal),
                erc721TokenId: null,
                erc1155Metadata: null,
                tokenId: tx.tokenID || null,
                asset: tx.tokenSymbol,
                category: "erc20",
              }))
          : [];

      console.log("Processed transfers:", {
        externalTransfers,
        erc20Transfers,
      });
      return [...externalTransfers, ...erc20Transfers];
    } catch (error) {
      console.error("Error fetching transactions from Etherscan:", error);
      return [];
    }
  }
}
