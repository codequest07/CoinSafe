require("dotenv").config();
import {
  Network,
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersResponse,
} from "alchemy-sdk";
import axios, { AxiosError } from "axios";

const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

const settings = {
  apiKey: alchemyApiKey,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

interface Transfer {
  value: number;
  erc721TokenId: string | null;
  erc1155Metadata: unknown | null;
  tokenId: string | null;
  asset: string;
  category: string;
}

interface TransfersData {
  erc20Transfers: Transfer[];
  internalTransfers: Transfer[];
}

export async function getClaudeSavingsPlan(
  transfersData: TransfersData
): Promise<string | null> {
  const API_KEY = anthropicApiKey;
  const API_URL = "https://api.anthropic.com/v1/messages";

  console.log("API Key:", API_KEY ? "Set (not shown for security)" : "Not set");

  if (!API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return null;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `${JSON.stringify(
              transfersData
            )}You are a financial savings platform...`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Axios error calling Claude API:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Headers:", error.response?.headers);
    } else {
      console.error("Unexpected error calling Claude API:", String(error));
    }
    return null;
  }
}

export async function main(address: string): Promise<string | null> {
  console.log("Received address:", address, "Type:", typeof address);

  try {
    if (typeof address !== "string" || !address) {
      throw new Error("Invalid address: must be a non-empty string");
    }
    // Ensure the address is a valid Ethereum address
    if (!address.startsWith("0x") || address.length !== 42) {
      throw new Error("Invalid Ethereum address format");
    }

    console.log("Fetching asset transfers for address:", address);
    const getTransfers = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toBlock: "latest",
      toAddress: address,
      excludeZeroValue: true,
      category: [AssetTransfersCategory.ERC20],
    });
    console.log("Fetched ERC20 transfers:", getTransfers);

    const getInternalTransfers: AssetTransfersResponse =
      await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: address,
        excludeZeroValue: true,
        category: [AssetTransfersCategory.INTERNAL],
      });

    const selectFields = (
      transfer: AssetTransfersResponse["transfers"][0]
    ): Transfer => ({
      value: Number(transfer.value),
      erc721TokenId: transfer.erc721TokenId,
      erc1155Metadata: transfer.erc1155Metadata,
      tokenId: transfer.tokenId,
      asset: transfer.asset || "",
      category: transfer.category,
    });

    const filteredERC20Transfers: Transfer[] =
      getTransfers.transfers.map(selectFields);
    const filteredInternalTransfers: Transfer[] =
      getInternalTransfers.transfers.map(selectFields);

    const transfersData: TransfersData = {
      erc20Transfers: filteredERC20Transfers,
      internalTransfers: filteredInternalTransfers,
    };

    // fs.writeFileSync("transfers1.json", JSON.stringify(transfersData, null, 2));
    // console.log("Transfers have been written to transfers.json");

    const savingsPlan = await getClaudeSavingsPlan(transfersData);
    if (savingsPlan) {
      console.log("Savings plan", savingsPlan);
    } else {
      console.log("Failed to generate savings plan");
    }
    return savingsPlan || null;
  } catch (error) {
    console.error("Error generating savings plan:", error);
    return null;
  }
}
