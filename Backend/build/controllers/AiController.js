"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaudeSavingsPlan = getClaudeSavingsPlan;
exports.main = main;
require("dotenv").config();
const alchemy_sdk_1 = require("alchemy-sdk");
const axios_1 = __importStar(require("axios"));
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const networks = [
    alchemy_sdk_1.Network.ETH_MAINNET,
    alchemy_sdk_1.Network.BASE_MAINNET,
    alchemy_sdk_1.Network.ARB_MAINNET,
    alchemy_sdk_1.Network.OPT_MAINNET,
];
// Create Alchemy instances for each mainnet
const alchemyInstances = networks.map((network) => new alchemy_sdk_1.Alchemy({
    apiKey: alchemyApiKey,
    network: network,
}));
function getClaudeSavingsPlan(transfersData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const API_KEY = anthropicApiKey;
        const API_URL = "https://api.anthropic.com/v1/messages";
        console.log("API Key:", API_KEY ? "Set (not shown for security)" : "Not set");
        if (!API_KEY) {
            console.error("ANTHROPIC_API_KEY is not set");
            return null;
        }
        try {
            const response = yield axios_1.default.post(API_URL, {
                model: "claude-3-5-haiku-20241022",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: `${JSON.stringify(transfersData)}You are a financial savings AI called SaveSense, someone wants to save some money with you now advice your user on how to save properly. 
               You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
               how often they spend and craft a proper savings plan based on their past transactions. 
               There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
               the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
               The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
               Give this In a concise readable way that a lay man will understand and be able to implement. Always end with best regards from SaveSense. NOTE: If the json is empty say you have no recent transaction, don't you the word json and explain the savings plan for the user.`,
                    },
                ],
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                    "anthropic-version": "2023-06-01",
                },
            });
            return response.data.content[0].text;
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                console.error("Axios error calling Claude API:");
                console.error("Status:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
                console.error("Data:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
                console.error("Headers:", (_c = error.response) === null || _c === void 0 ? void 0 : _c.headers);
            }
            else {
                console.error("Unexpected error calling Claude API:", String(error));
            }
            return null;
        }
    });
}
function main(address) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Received address:", address, "Type:", typeof address);
        try {
            if (typeof address !== "string" || !address) {
                throw new Error("Invalid address: must be a non-empty string");
            }
            // Ensure the address is a valid Ethereum address
            if (!address.startsWith("0x") || address.length !== 42) {
                throw new Error("Invalid Ethereum address format");
            }
            console.log("Fetching asset transfers for address across multiple chains:", address);
            // Fetch transfers from all mainnet chains
            const allTransfersPromises = alchemyInstances.map((alchemy, index) => __awaiter(this, void 0, void 0, function* () {
                const networkName = networks[index];
                console.log(`Fetching from ${networkName}...`);
                try {
                    const [erc20Transfers, internalTransfers] = yield Promise.all([
                        alchemy.core.getAssetTransfers({
                            fromBlock: "0x0",
                            toBlock: "latest",
                            toAddress: address,
                            excludeZeroValue: true,
                            category: [alchemy_sdk_1.AssetTransfersCategory.ERC20],
                        }),
                        alchemy.core.getAssetTransfers({
                            fromBlock: "0x0",
                            toBlock: "latest",
                            toAddress: address,
                            excludeZeroValue: true,
                            category: [alchemy_sdk_1.AssetTransfersCategory.INTERNAL],
                        }),
                    ]);
                    return {
                        network: networkName,
                        erc20: erc20Transfers.transfers,
                        internal: internalTransfers.transfers,
                    };
                }
                catch (error) {
                    console.error(`Error fetching from ${networkName}:`, error);
                    return {
                        network: networkName,
                        erc20: [],
                        internal: [],
                    };
                }
            }));
            const allTransfers = yield Promise.all(allTransfersPromises);
            // Aggregate all transfers from all chains
            const aggregatedERC20Transfers = allTransfers.flatMap((result) => result.erc20);
            const aggregatedInternalTransfers = allTransfers.flatMap((result) => result.internal);
            console.log(`Total ERC20 transfers across all chains: ${aggregatedERC20Transfers.length}`);
            console.log(`Total internal transfers across all chains: ${aggregatedInternalTransfers.length}`);
            const selectFields = (transfer) => ({
                value: Number(transfer.value),
                erc721TokenId: transfer.erc721TokenId,
                erc1155Metadata: transfer.erc1155Metadata,
                tokenId: transfer.tokenId,
                asset: transfer.asset || "",
                category: transfer.category,
            });
            const filteredERC20Transfers = aggregatedERC20Transfers.map(selectFields);
            const filteredInternalTransfers = aggregatedInternalTransfers.map(selectFields);
            const transfersData = {
                erc20Transfers: filteredERC20Transfers,
                internalTransfers: filteredInternalTransfers,
            };
            // fs.writeFileSync("transfers1.json", JSON.stringify(transfersData, null, 2));
            // console.log("Transfers have been written to transfers.json");
            const savingsPlan = yield getClaudeSavingsPlan(transfersData);
            if (savingsPlan) {
                console.log("Savings plan", savingsPlan);
            }
            else {
                console.log("Failed to generate savings plan");
            }
            return savingsPlan || null;
        }
        catch (error) {
            console.error("Error generating savings plan:", error);
            return null;
        }
    });
}
//# sourceMappingURL=AiController.js.map