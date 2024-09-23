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

export type NetworkChain = "mainnet" | "sepolia" | "amoy";

type NetworkConfig = {
  [key in NetworkChain]?: Network;
};

type AlchemyInstances = {
  [key: string]: {
    [chain in NetworkChain]?: Alchemy;
  };
};

const settings: {
  apiKey: string | undefined;
  networks: {
    [key: string]: NetworkConfig;
  };
} = {
  apiKey: alchemyApiKey,
  networks: {
    ethereum: {
      mainnet: Network.ETH_MAINNET,
      sepolia: Network.ETH_SEPOLIA,
    },
    polygon: {
      mainnet: Network.MATIC_MAINNET,
      amoy: Network.MATIC_AMOY,
    },
    optimism: {
      mainnet: Network.OPT_MAINNET,
      sepolia: Network.OPT_SEPOLIA,
    },
    arbitrum: {
      mainnet: Network.ARB_MAINNET,
      sepolia: Network.ARB_SEPOLIA,
    },
    base: {
      mainnet: Network.BASE_MAINNET,
      sepolia: Network.BASE_SEPOLIA,
    },
  },
};

// Create Alchemy instances for all networks
export const alchemyInstances: AlchemyInstances = Object.entries(
  settings.networks
).reduce((acc, [network, chains]) => {
  acc[network] = Object.entries(chains).reduce(
    (chainAcc, [chain, networkType]) => {
      chainAcc[chain as NetworkChain] = new Alchemy({
        ...settings,
        network: networkType,
      });
      return chainAcc;
    },
    {} as { [key in NetworkChain]?: Alchemy }
  );
  return acc;
}, {} as AlchemyInstances);

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

async function getAssetTransfers(
  alchemy: Alchemy,
  address: string
): Promise<TransfersData> {
  const getERC20Transfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    toAddress: address,
    excludeZeroValue: true,
    category: [AssetTransfersCategory.ERC20],
  });

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
    getERC20Transfers.transfers.map(selectFields);
  const filteredInternalTransfers: Transfer[] =
    getInternalTransfers.transfers.map(selectFields);

  return {
    erc20Transfers: filteredERC20Transfers,
    internalTransfers: filteredInternalTransfers,
  };
}

async function getClaudeSavingsPlan(
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
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `${JSON.stringify(
              transfersData
            )}You are a financial savings called SaveSense, someone wants to save some money with you now advice your user on how to save properly. 
               You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
               how often they spend and craft a proper savings plan based on their past transactions. 
               There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
               the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
               The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
               Give this In a concise readable way that a lay man will understand and be able to implement NOTE: If the json is empty say you have no recent transaction, don't you the word json and explain the savings plan for the user.`,
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

export async function main(
  address: string,
  network: keyof typeof alchemyInstances,
  chain: NetworkChain
): Promise<string | null> {
  console.log(
    `Received address: ${address}, Network: ${network}, Chain: ${chain}`
  );

  try {
    if (typeof address !== "string" || !address) {
      throw new Error("Invalid address: must be a non-empty string");
    }
    if (!address.startsWith("0x") || address.length !== 42) {
      throw new Error("Invalid Ethereum address format");
    }

    const alchemy = alchemyInstances[network]?.[chain];
    if (!alchemy) {
      throw new Error(`Invalid network or chain: ${network} ${chain}`);
    }

    console.log(
      `Fetching asset transfers for address: ${address} on ${network} ${chain}`
    );
    const transfersData = await getAssetTransfers(alchemy, address);
    console.log("Fetched transfers:", transfersData);

    const savingsPlan = await getClaudeSavingsPlan(transfersData);
    if (savingsPlan) {
      console.log("Savings plan:", savingsPlan);
    } else {
      console.log("Failed to generate savings plan");
    }
    return savingsPlan || null;
  } catch (error) {
    console.error("Error generating savings plan:", error);
    return null;
  }
}

// Example usage
// main("0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "ethereum", "mainnet")
//   .then(result => console.log(result))
//   .catch(error => console.error(error));
