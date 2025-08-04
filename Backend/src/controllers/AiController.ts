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

const networks = [
  Network.ETH_MAINNET,
  Network.BASE_MAINNET,
  Network.ARB_MAINNET,
  Network.OPT_MAINNET,
];

// Create Alchemy instances for each mainnet
const alchemyInstances = networks.map(
  (network) =>
    new Alchemy({
      apiKey: alchemyApiKey,
      network: network,
    })
);

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
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `${JSON.stringify(
              transfersData
            )}You are a financial savings AI called SaveSense, someone wants to save some money with you now advice your user on how to save properly. 
               You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
               how often they spend and craft a proper savings plan based on their past transactions. 
               There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
               the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
               The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
               Give this In a concise readable way that a lay man will understand and be able to implement. Always end with best regards from SaveSense. NOTE: If the json is empty say you have no recent transaction, don't you the word json and explain the savings plan for the user.`,
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

    console.log(
      "Fetching asset transfers for address across multiple chains:",
      address
    );

    // Fetch transfers from all mainnet chains
    const allTransfersPromises = alchemyInstances.map(
      async (alchemy, index) => {
        const networkName = networks[index];
        console.log(`Fetching from ${networkName}...`);

        try {
          const [erc20Transfers, internalTransfers] = await Promise.all([
            alchemy.core.getAssetTransfers({
              fromBlock: "0x0",
              toBlock: "latest",
              toAddress: address,
              excludeZeroValue: true,
              category: [AssetTransfersCategory.ERC20],
            }),
            alchemy.core.getAssetTransfers({
              fromBlock: "0x0",
              toBlock: "latest",
              toAddress: address,
              excludeZeroValue: true,
              category: [AssetTransfersCategory.INTERNAL],
            }),
          ]);

          return {
            network: networkName,
            erc20: erc20Transfers.transfers,
            internal: internalTransfers.transfers,
          };
        } catch (error) {
          console.error(`Error fetching from ${networkName}:`, error);
          return {
            network: networkName,
            erc20: [],
            internal: [],
          };
        }
      }
    );

    const allTransfers = await Promise.all(allTransfersPromises);

    // Aggregate all transfers from all chains
    const aggregatedERC20Transfers = allTransfers.flatMap(
      (result) => result.erc20
    );
    const aggregatedInternalTransfers = allTransfers.flatMap(
      (result) => result.internal
    );

    console.log(
      `Total ERC20 transfers across all chains: ${aggregatedERC20Transfers.length}`
    );
    console.log(
      `Total internal transfers across all chains: ${aggregatedInternalTransfers.length}`
    );

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
      aggregatedERC20Transfers.map(selectFields);
    const filteredInternalTransfers: Transfer[] =
      aggregatedInternalTransfers.map(selectFields);

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
