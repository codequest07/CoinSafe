const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY;
const anthropicApiKey = import.meta.env.ANTHROPIC_API_KEY;
import {
  Network,
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersResponse,
} from "alchemy-sdk";
import fs from "fs"; // Ensure you import fs if you need file operations
import axios, { AxiosError } from "axios";

const settings = {
  apiKey: alchemyApiKey,
  network: Network.ETH_MAINNET,
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

async function getClaudeSavingsPlan(
  transfersData: TransfersData
): Promise<string | null> {
  const API_KEY = anthropicApiKey;
  const API_URL = "/api/anthropic/messages"; // Updated API URL with /api prefix

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
            )}You are a financial savings platform, someone wants to save some money with you now advice your user on how to save properly. 
               You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
               how often they spend and craft a proper savings plan based on their past transactions. 
               There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
               the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
               The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
               Give this In a concise readable way that a lay man will understand and be able to implement.`, // Rest of the content remains the same
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
    console.error(
      "Error calling Claude API:",
      error instanceof AxiosError ? error.response?.data : String(error)
    );
    return null;
  }
}

export async function main(address: string): Promise<string | null> {
  try {
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

    
    fs.writeFileSync("transfers1.json", JSON.stringify(transfersData, null, 2));
    console.log("Transfers have been written to transfers.json");

    const savingsPlan = await getClaudeSavingsPlan(transfersData);
    if (savingsPlan) {
      fs.writeFileSync("scsavings_plan2.txt", savingsPlan);
      console.log("Savings plan has been written to savings_plan2.txt");
    } else {
      console.log("Failed to generate savings plan");
    }
    return savingsPlan || null;
  } catch (error) {
    console.error("Error generating savings plan:", error);
    return null;
  }
}
