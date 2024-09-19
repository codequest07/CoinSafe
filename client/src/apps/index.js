require("dotenv").config();
const { Network, Alchemy, AssetTransfersCategory } = require("alchemy-sdk");
const fs = require("fs");
const axios = require("axios");

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

async function getClaudeSavingsPlan(transfersData) {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  const API_URL = "https://api.anthropic.com/v1/messages";

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
            )}You are a financial  savings platform, someone wants to save some money with you now advice your user  on how to save properly. 
               You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
               how often they spend and craft a proper savings plan based on their past transactions. 
               There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
               the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
               The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
               Give this In a concise readable way that a lay man will understand and be able to implement.`,
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
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

async function main() {
  const getTransfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    toAddress: "0x28482B1279E442f49eE76351801232D58f341CB9",
    excludeZeroValue: true,
    category: [AssetTransfersCategory.ERC20],
  });

  const getInternalTransfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    toAddress: "0xd79Fcf066430D4c29847b69735b15d54551f4de9",
    excludeZeroValue: true,
    category: [AssetTransfersCategory.INTERNAL],
  });

  const selectFields = (transfer) => ({
    value: transfer.value,
    erc721TokenId: transfer.erc721TokenId,
    erc1155Metadata: transfer.erc1155Metadata,
    tokenId: transfer.tokenId,
    asset: transfer.asset,
    category: transfer.category,
  });

  const filteredERC20Transfers = getTransfers.transfers.map(selectFields);
  const filteredInternalTransfers =
    getInternalTransfers.transfers.map(selectFields);

  const transfersData = {
    erc20Transfers: filteredERC20Transfers,
    internalTransfers: filteredInternalTransfers,
  };

  //   fs.writeFileSync("transfers1.json", JSON.stringify(transfersData, null, 2));
  //   console.log("Transfers have been written to transfers.json");

  const savingsPlan = await getClaudeSavingsPlan(transfersData);
  if (savingsPlan) {
    fs.writeFileSync("savings_plan2.txt", savingsPlan);
    console.log("Savings plan has been written to savings_plan2.txt");
  } else {
    console.log("Failed to generate savings plan");
  }
}

main().catch(console.error);