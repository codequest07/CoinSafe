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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const alchemy_sdk_1 = require("alchemy-sdk");
const axios_1 = __importStar(require("axios"));
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const settings = {
    apiKey: alchemyApiKey,
    network: alchemy_sdk_1.Network.ETH_SEPOLIA,
};
const alchemy = new alchemy_sdk_1.Alchemy(settings);
function getClaudeSavingsPlan(transfersData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const API_KEY = anthropicApiKey;
        const API_URL = "/api/anthropic/messages";
        try {
            const response = yield axios_1.default.post(API_URL, {
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: `${JSON.stringify(transfersData)}You are a financial savings platform, someone wants to save some money with you now advice your user on how to save properly. 
                  You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
                  how often they spend and craft a proper savings plan based on their past transactions. 
                  There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
                  the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
                  The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
                  Give this In a concise readable way that a lay man will understand and be able to implement.`,
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
            console.error("Error calling Claude API:", error instanceof axios_1.AxiosError ? (_a = error.response) === null || _a === void 0 ? void 0 : _a.data : String(error));
            return null;
        }
    });
}
function main(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure the address is a valid Ethereum address
            if (!address.startsWith("0x") || address.length !== 42) {
                throw new Error("Invalid Ethereum address format");
            }
            console.log("Fetching asset transfers for address:", address);
            const getTransfers = yield alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                toBlock: "latest",
                toAddress: address,
                excludeZeroValue: true,
                category: [alchemy_sdk_1.AssetTransfersCategory.ERC20],
            });
            console.log("Fetched ERC20 transfers:", getTransfers);
            const getInternalTransfers = yield alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                toBlock: "latest",
                toAddress: address,
                excludeZeroValue: true,
                category: [alchemy_sdk_1.AssetTransfersCategory.INTERNAL],
            });
            const selectFields = (transfer) => ({
                value: Number(transfer.value),
                erc721TokenId: transfer.erc721TokenId,
                erc1155Metadata: transfer.erc1155Metadata,
                tokenId: transfer.tokenId,
                asset: transfer.asset || "",
                category: transfer.category,
            });
            const filteredERC20Transfers = getTransfers.transfers.map(selectFields);
            const filteredInternalTransfers = getInternalTransfers.transfers.map(selectFields);
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