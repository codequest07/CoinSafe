"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const axios_1 = __importDefault(require("axios"));
class TransactionModel {
    constructor(etherscanApiKey) {
        this.etherscanApiKey = etherscanApiKey;
        this.apiBaseUrl = "https://api-sepolia.etherscan.io/api";
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }
    getTransactions(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [externalTransfers, erc20Transfers] = yield Promise.all([
                    this.fetchExternalTransactions(address),
                    this.fetchERC20Transfers(address),
                ]);
                return [...externalTransfers, ...erc20Transfers];
            }
            catch (error) {
                console.error(`Failed to get transactions for ${address}:`, error);
                return [];
            }
        });
    }
    fetchExternalTransactions(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetchWithRetry({
                module: "account",
                action: "txlist",
                address,
                startblock: 0,
                endblock: "latest",
                apikey: this.etherscanApiKey,
            }, "External transactions").then((response) => this.processExternalTransfers(response));
        });
    }
    fetchERC20Transfers(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetchWithRetry({
                module: "account",
                action: "tokentx",
                address,
                startblock: 0,
                endblock: "latest",
                apikey: this.etherscanApiKey,
            }, "ERC-20 transfers").then((response) => this.processERC20Transfers(response));
        });
    }
    fetchWithRetry(params_1, logPrefix_1) {
        return __awaiter(this, arguments, void 0, function* (params, logPrefix, attempt = 1) {
            try {
                console.log(`${logPrefix} - Attempt ${attempt}: Fetching...`);
                const response = yield axios_1.default.get(this.apiBaseUrl, { params });
                const data = response.data;
                if (data.status !== "1") {
                    if (response.data.message ===
                        "No transactions found") {
                        console.log(`${logPrefix}: No transactions found`);
                        return response.data;
                    }
                    throw new Error(`API error: ${response.data.message}`);
                }
                return response.data;
            }
            catch (error) {
                if (attempt >= this.maxRetries) {
                    console.error(`${logPrefix} - Max retries exceeded`);
                    throw error;
                }
                yield new Promise((resolve) => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(params, logPrefix, attempt + 1);
            }
        });
    }
    processExternalTransfers(response) {
        if (response.status !== "1" || !response.result)
            return [];
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
    processERC20Transfers(response) {
        if (response.status !== "1" || !response.result)
            return [];
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
exports.TransactionModel = TransactionModel;
//# sourceMappingURL=TransactionModel.js.map